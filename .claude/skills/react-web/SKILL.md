---
name: react-web
description: Patterns for React frontends with Feature-Sliced Design. Triggers when implementing or modifying frontend code in apps/web/ or apps/mobile/.
---

# React Frontend Development (Feature-Sliced Design)

## Stack (platform-dependent)

### Web (default)
- React + Next.js (App Router) + TypeScript
- Tailwind CSS or CSS modules
- `apps/web/`

### Mobile
- React Native (Expo) + TypeScript
- React Navigation
- `apps/mobile/`

## Feature-Sliced Architecture

```
apps/web/src/
  app/           # Bootstrap, providers, navigation, theme
  pages/         # Screens composing widgets/features
  widgets/       # Large reusable UI blocks (no data fetching)
  features/      # User actions/flows (auth, search, etc.)
  entities/      # Entity types, local storage utilities
  shared/        # UI primitives, hooks, config, API client
```

### Layer Rules

| Layer | Responsibility | Can Import | CANNOT Do |
|-------|---------------|-----------|-----------|
| `app/` | Bootstrap, providers, theme | Everything below | Business logic |
| `pages/` | Compose + minimal logic | widgets, features, entities, shared | Data fetching, API calls |
| `widgets/` | Large UI composition | features, entities, shared | Data fetching |
| `features/` | User actions + API calls | entities, shared | Import from pages/widgets |
| `entities/` | Entity types + helpers | shared | Import from features/pages |
| `shared/` | Primitives, hooks, config | External libs only | Import from any layer above |

## Data Fetching Pattern

```typescript
// features/orders/model/useOrders.ts
import { apiClient } from '@/shared/lib/api/client';
import { Order } from '@/entities/order/model/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    apiClient.get('/orders')
      .then(data => setOrders(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { orders, loading, error };
}
```

```typescript
// pages/orders/OrdersPage.tsx
import { useOrders } from '@/features/orders/model/useOrders';
import { OrderList } from '@/widgets/order-list/OrderList';

export function OrdersPage() {
  const { orders, loading, error } = useOrders();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!orders.length) return <EmptyState message="No orders yet" />;

  return <OrderList orders={orders} />;
}
```

## API Client Pattern

```typescript
// shared/lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res);
    return res.json();
  }
}

export const apiClient = new ApiClient(API_URL);
```

## Theming Pattern

```typescript
// app/theme/tokens.ts
export const tokens = {
  colors: {
    primary: '#1A2B5F',
    secondary: '#FF6B35',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#666666',
    error: '#DC3545',
    success: '#28A745',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radii: { sm: 4, md: 8, lg: 16, full: 9999 },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
  },
} as const;
```

## Component States (always implement)
Every data-driven component should handle:
1. **Loading** — skeleton or spinner
2. **Error** — error message with retry option
3. **Empty** — helpful empty state message
4. **Data** — the actual content

## Dev Tooling (install during project creation)
- **LocatorJS**: Install `locatorjs` as devDependency. Add to app bootstrap (dev only):
  ```typescript
  if (process.env.NODE_ENV === 'development') {
    import('locatorjs').then(l => l.setup());
  }
  ```
  This enables click-to-source in the browser (Option+click on any element → opens in editor).

## Gotchas
- No `fetch`/`axios` in pages, widgets, or shared/ui — only in features/entities model layer
- Always use tokens — no hardcoded `#hex` or pixel values in components
- Keep pages thin — they compose and pass props, minimal logic
- API client lives in `shared/lib/api/` — single import path
- For Next.js: use `'use client'` only when needed (hooks, event handlers)
