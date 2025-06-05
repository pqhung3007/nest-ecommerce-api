import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { UsersModule } from '../users/users.module';
import { CartModule } from '../cart/cart.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    forwardRef(() => UsersModule),
    forwardRef(() => CartModule),
    StripeModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
