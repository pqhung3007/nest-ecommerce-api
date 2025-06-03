import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.productRepo.find();
  }

  findOne(id: number) {
    return this.productRepo.findOne({ where: { id } });
  }

  create(createDto: CreateProductDto) {
    const product = this.productRepo.create(createDto);
    return this.productRepo.save(product);
  }

  update(id: number, updateDto: UpdateProductDto) {
    return this.productRepo.update(id, updateDto);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
