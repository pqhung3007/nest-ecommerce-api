import { Controller, Get, Header, Param, Post, RawBody, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async placeOrder(@CurrentUser('id') userId: string) {
    return this.ordersService.placeOrder(userId);
  }

  @Get()
  async getMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getUserOrders(userId);
  }

  @Get(':id')
  async getOrderDetails(@CurrentUser('id') userId: string, @Param('id') orderId: string) {
    return this.ordersService.getOrderDetails(userId, orderId);
  }

  @Post('checkout')
  async checkout(@CurrentUser() user: User) {
    const session = await this.ordersService.createCheckoutSession(user.id);
    return { url: session.url };
  }

  @Post('webhook')
  @Header('Content-Type', 'application/json')
  async handleWebhook(@Req() req: any) {
    await this.ordersService.handleStripeWebhook(req);
    return { received: true };
  }
}
