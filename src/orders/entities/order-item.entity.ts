import { BaseEntity } from '../../common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity()
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @Column() // snapshot, not relation
  productId: string;

  @Column()
  productName: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal' })
  priceAtPurchase: number;
}
