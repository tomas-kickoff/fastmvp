# TypeScript API — Layer Templates Reference

## Entity template

```typescript
// domain/entities/order.entity.ts
import { DomainError } from '../errors/domain.error';

export interface OrderProps {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

export class Order {
  private constructor(private props: OrderProps) {}

  static create(props: Omit<OrderProps, 'status' | 'createdAt'>): Order {
    return new Order({
      ...props,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  get id() { return this.props.id; }
  get status() { return this.props.status; }

  confirm(): void {
    if (this.props.status !== 'pending') {
      throw new DomainError('ORDER_NOT_PENDING', 'Order must be pending to confirm');
    }
    this.props.status = 'confirmed';
  }
}
```

## Value Object template

```typescript
// domain/value-objects/email.vo.ts
import { DomainError } from '../errors/domain.error';

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const trimmed = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new DomainError('INVALID_EMAIL', `Invalid email: ${raw}`);
    }
    return new Email(trimmed);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

## Port interface template

```typescript
// application/ports/repositories/order.repository.ts
import { Order } from '../../../domain/entities/order.entity';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
}
```

## DTO template

```typescript
// application/dtos/order.dto.ts
export interface CreateOrderRequest {
  userId: string;
  items: { productId: string; quantity: number }[];
}

export interface CreateOrderResponse {
  id: string;
  status: string;
  createdAt: string;
}

export interface OrderListResponse {
  orders: CreateOrderResponse[];
  total: number;
}
```

## Route registration template

```typescript
// interfaces/http/routes/order.routes.ts
import { FastifyInstance } from 'fastify';
import { OrderController } from '../controllers/order.controller';

export function registerOrderRoutes(
  app: FastifyInstance,
  controller: OrderController
) {
  app.post('/orders', (req, reply) => controller.create(req, reply));
  app.get('/orders/:id', (req, reply) => controller.getById(req, reply));
  app.get('/orders', (req, reply) => controller.list(req, reply));
}
```

## Presenter template

```typescript
// interfaces/http/presenters/order.presenter.ts
import { CreateOrderResponse } from '../../../application/dtos/order.dto';

export function presentOrder(result: CreateOrderResponse) {
  return {
    id: result.id,
    status: result.status,
    createdAt: result.createdAt,
  };
}

export function presentOrderList(results: CreateOrderResponse[], total: number) {
  return {
    orders: results.map(presentOrder),
    total,
  };
}
```

## Env config template

```typescript
// infrastructure/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional(),
  PGHOST: z.string().default('localhost'),
  PGPORT: z.coerce.number().default(5432),
  PGUSER: z.string().default('postgres'),
  PGPASSWORD: z.string().default('postgres'),
  PGDATABASE: z.string().default('fastmvp'),
});

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(process.env);
```
