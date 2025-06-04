import { AddToCartDto } from './add-to-cart.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCartItemDto extends PartialType(AddToCartDto) {}
