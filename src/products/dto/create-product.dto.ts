export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  quantity: number;
  colors: string[];
  sold?: number;
}
