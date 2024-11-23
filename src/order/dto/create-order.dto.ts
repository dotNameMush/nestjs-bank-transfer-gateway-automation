import { IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  total: number;
}
