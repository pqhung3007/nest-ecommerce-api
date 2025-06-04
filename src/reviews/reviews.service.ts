import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.productRepo.findOneOrFail({
      where: { id: userId },
    });

    const review = this.reviewRepo.create({
      ...dto,
      user: { id: userId },
      product,
    });

    await this.updateProductStats(dto.productId);
    return await this.reviewRepo.save(review);
  }

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewRepo.findOneOrFail({
      where: { id },
      relations: ['user'],
    });
    if (review.user.id !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    Object.assign(review, dto);
    await this.updateProductStats(review.product.id);
    return await this.reviewRepo.save(review);
  }

  async remove(id: string, userId: string) {
    const review = await this.reviewRepo.findOneOrFail({
      where: { id },
      relations: ['user', 'product'],
    });
    if (review.user.id !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewRepo.remove(review);
    await this.updateProductStats(review.product.id);
    return { message: 'Review deleted successfully' };
  }

  async findByProduct(productId: string) {
    return this.reviewRepo.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  private async updateProductStats(productId: string) {
    const reviews = await this.reviewRepo.find({
      where: { product: { id: productId } },
    });

    const average =
      reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
    
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new BadRequestException('Product not found');

    product.averageRating = Number(average.toFixed(1));
    product.reviewCount = reviews.length;

    await this.productRepo.save(product);
  }
}
