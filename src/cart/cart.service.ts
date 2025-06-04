import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user/user.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // create a cart on first load if it doesn't exist
  async getOrCreateCart(userId: string) {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      cart = this.cartRepo.create({ user, cartItems: [] });
      await this.cartRepo.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let item = cart.cartItems.find((item) => item.id === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartItemRepo.create({
        cart,
        product,
        quantity,
        priceAtAdded: Number(product.price),
      });
      cart.cartItems.push(item);
    }

    await this.cartRepo.save(cart);
    return cart;
  }

  async updateCartItem(userId: string, productId: string, newQuantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.cartItems.find((item) => item.product.id === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    item.quantity = newQuantity;
    await this.cartRepo.save(cart);
    return cart;
  }

  async removeCartItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.cartItems.find((item) => item.product.id === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    await this.cartItemRepo.delete(cart);
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepo.delete({ cart: { id: cart.id } });
    return this.getOrCreateCart(userId);
  }

  async getCart(userId: string) {
    return this.getOrCreateCart(userId);
  }

  async getCartWithRelations(userId: string) {
    return this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.product'],
    });
  }
}
