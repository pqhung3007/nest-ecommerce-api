import { BaseEntity } from '../../common/entities/base.entity';
import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user/user.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  cartItems: CartItem[];
}
