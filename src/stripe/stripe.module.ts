import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2025-05-28.basil',
          typescript: true,
        });
      }
    }
  ],
  exports: [STRIPE_CLIENT],
})
export class StripeModule {}

