import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly cartService: CartService,
    private readonly config: ConfigService,
  ) {}

  async placeOrder(userId: string): Promise<Order> {
    const cart = await this.cartService.getCartWithRelations(userId);
    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orderItems = cart.cartItems.map((item) =>
      this.orderItemRepo.create({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtAdded,
      }),
    );

    const totalPrice = cart.cartItems.reduce((sum, item) => sum + item.priceAtAdded * item.quantity, 0);

    const order = this.orderRepo.create({
      user: { id: userId },
      items: orderItems,
      totalPrice,
    });

    await this.orderRepo.save(order);
    await this.cartService.clearCart(userId); // Clear the cart after placing the order

    return order;
  }

  async getUserOrders(userId: string) {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderDetails(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'cartItems'],
    });
    if (!order || order.user.id !== userId) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  async createCheckoutSession(userId: string): Promise<Stripe.Checkout.Session> {
    const cart = await this.cartService.getCartWithRelations(userId);
    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const lineItems = cart.cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description,
        },
        unit_amount: Math.round(item.priceAtAdded * 100), // Stripe expects amount in cents
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        userId,
        cartId: cart.id,
      },
    });

    return session;
  }

  async handleStripeWebhook(req: any) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.finalizeOrder(session.metadata!.userId);
    }
  }

  private async finalizeOrder(userId: string) {
    const cart = await this.cartService.getCartWithRelations(userId);
    if (!cart || cart.cartItems.length === 0) return;

    const order = this.orderRepo.create({
      user: { id: userId },
      items: cart.cartItems.map((item) =>
        this.orderItemRepo.create({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtAdded,
        }),
      ),
      totalPrice: cart.cartItems.reduce((sum, item) => sum + item.priceAtAdded * item.quantity, 0),
    });

    await this.orderRepo.save(order);
    await this.cartService.clearCart(userId);
  }
}
