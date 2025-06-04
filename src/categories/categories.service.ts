import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: string) {
    const category = this.categoryRepository.findOne({
      where: { id },
    });
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepository.create({
      ...dto,
      createdAt: new Date(),
    });
    return this.categoryRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);

    const updatedCategory = {
      ...category,
      ...dto,
      updatedAt: new Date(),
    };

    return this.categoryRepository.save(updatedCategory);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    if (!category)
      throw new NotFoundException(`Category with id ${id} not found`);

    return this.categoryRepository.remove(category);
  }
}
