import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Review } from '../../reviews/entities/review.entity';

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

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn()
  category: Category;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @Column('decimal', { default: 0, precision: 2, scale: 1 })
  averageRating: number;

  @Column('int', { default: 0 })
  reviewCount: number;
}
