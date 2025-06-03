import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../users/entities/user/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.productRepo.find();
  }

  findOne(id: string) {
    return this.productRepo.findOne({ where: { id } });
  }

  async create(createDto: CreateProductDto, user: User): Promise<Product> {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create products');
    }

    const product = this.productRepo.create({
      ...createDto,
      createdAt: new Date(),
    });

    return this.productRepo.save(product);
  }

  async update(
    id: string,
    updateDto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) throw new NotFoundException('Product not found');
    if (user.role !== 'admin')
      throw new ForbiddenException('Only admins can update products');

    const updatedProduct = {
      ...product,
      ...updateDto,
      updatedAt: new Date(),
    };

    return this.productRepo.save(updatedProduct);
  }

  async remove(id: string, user: User): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) throw new NotFoundException('Product not found');
    if (user.role !== 'admin')
      throw new ForbiddenException('Only admins can update products');

    await this.productRepo.delete(id);
  }
}
