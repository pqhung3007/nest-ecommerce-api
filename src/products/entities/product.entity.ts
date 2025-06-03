import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAfterDiscount: number;

  @Column()
  quantity: number;

  @Column({ default: 0 })
  sold: number;

  @Column('text', { array: true })
  colors: string[];

  @Column({ nullable: true })
  image: string;

  @Column()
  category: string;
}
