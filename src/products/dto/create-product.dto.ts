import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  priceAfterDiscount: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  sold?: number;

  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  category: string;
}
