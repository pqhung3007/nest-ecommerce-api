import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly usersService: UsersService,
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
}
