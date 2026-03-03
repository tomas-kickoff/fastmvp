---
name: react-nextjs-web
description: Patterns and templates for building React + Next.js (App Router) frontends with Feature-Sliced Design architecture. Use when implementing or modifying web frontend code in apps/web using Next.js.
---

# React + Next.js Web Development (App Router + Feature-Sliced)

This skill provides patterns, conventions, and templates for building web frontends with Next.js App Router following Feature-Sliced Design architecture.

## Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS or CSS Modules (no ad-hoc inline styles)
- **State**: React state + context (default), Zustand if complex
- **Data fetching**: API client in `shared/lib/api/`, hooks in features/entities
- **Navigation**: `next/link`, `next/navigation` (`useRouter`, `useParams`, `usePathname`)

## Layer Structure (Feature-Sliced)

```
apps/web/src/
  app/                     # Next.js App Router routes + bootstrap
    layout.tsx             # Root layout (providers, theme)
    page.tsx               # Home route (composes from pages/)
    (routes)/              # Next.js route groups
      login/page.tsx       # Composes LoginPage from pages/
      dashboard/page.tsx   # Composes DashboardPage from pages/
    providers/
      AppProviders.tsx     # Context providers wrapper
    theme/
      ThemeProvider.tsx
      tokens.ts            # Design tokens (colors, spacing, typography)

  pages/                   # Screen compositions (compose widgets + features)
    home/
      HomePage.tsx
    login/
      LoginPage.tsx
    dashboard/
      DashboardPage.tsx

  widgets/                 # Large UI blocks (no data fetching)
    login-form/
      LoginForm.tsx
    dashboard-metrics/
      MetricsGrid.tsx

  features/                # User actions with data fetching
    auth/
      login/
        index.ts
        model/
          useLogin.ts      # Hook with API call
        ui/
          LoginFields.tsx
    search/
      model/
        useSearch.ts
      ui/
        SearchBar.tsx

  entities/                # Entity types + model hooks
    user/
      index.ts
      model/
        types.ts
        useUser.ts         # Hook with API call
      lib/
        storage.ts

  shared/                  # Reusable primitives
    config/
      env.ts
    hooks/
      useAppTheme.ts
    lib/
      api/
        client.ts          # Typed API client (from OpenAPI)
      storage/
        cookies.ts         # Cookie helpers (not AsyncStorage)
    types/
      navigation.ts        # Route type constants
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      Table.tsx
      Modal.tsx
```

## Data Fetching Rules (non-negotiable)

| Layer | Can fetch data? | How? |
|-------|----------------|------|
| `shared/ui/` | NO | Props only |
| `widgets/` | NO | Props only |
| `pages/` | NO (compose only) | Pass data via props |
| `features/**/model/` | YES | Via `shared/lib/api/client` |
| `entities/**/model/` | YES | Via `shared/lib/api/client` |
| `app/` route files | YES (server components) | Via `shared/lib/api/client` (server-side) |

## Server vs Client Components

```typescript
// Server Component (default) — no 'use client' directive
// Good for: data fetching, SEO, static content
// app/(routes)/products/page.tsx
import { ProductsPage } from '@/pages/products/ProductsPage';

export default async function Page() {
  return <ProductsPage />;
}

// Client Component — needs 'use client'
// Good for: interactivity, hooks, browser APIs
// features/cart/ui/AddToCartButton.tsx
'use client';

import { useState } from 'react';
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

## API Client Pattern

```typescript
// shared/lib/api/client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

## Feature Hook Pattern

```typescript
// features/auth/login/model/useLogin.ts
'use client';

import { useState } from 'react';
import { api } from '@/shared/lib/api/client';
import type { LoginRequest, LoginResponse } from '@/shared/lib/api/types';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: LoginRequest): Promise<LoginResponse | null> {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post<LoginResponse>('/auth/login', data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
```

## Theming with Tokens

```typescript
// app/theme/tokens.ts
export const tokens = {
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    error: '#DC2626',
    success: '#16A34A',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
  },
} as const;
```

## Page Composition Pattern

```typescript
// pages/dashboard/DashboardPage.tsx
'use client';

import { useUser } from '@/entities/user/model/useUser';
import { MetricsGrid } from '@/widgets/dashboard-metrics/MetricsGrid';
import { RecentActivity } from '@/widgets/recent-activity/RecentActivity';

export function DashboardPage() {
  const { user, loading, error } = useUser();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <EmptyState message="No user data" />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <MetricsGrid metrics={user.metrics} />
      <RecentActivity items={user.recentActivity} />
    </div>
  );
}
```

## Navigation Types

```typescript
// shared/types/navigation.ts
export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];
```

## Guidelines

- Use server components by default; add `'use client'` only for interactivity
- No `fetch()` or `axios` in `pages/`, `widgets/`, or `shared/ui/`
- All API calls through `shared/lib/api/client.ts`
- Use `tokens.ts` for all styling values — no hardcoded colors/spacing
- Keep pages thin: compose widgets + features, pass data via props
- Use `<Link>` from `next/link` for all navigation
- Prefer CSS Modules or Tailwind over inline styles
- Handle loading, error, and empty states in every data-consuming component
