---
name: react-native-mobile
description: Patterns for React Native (Expo) mobile apps with Feature-Sliced Design. Triggers when implementing mobile frontend code in apps/mobile/.
---

# React Native Mobile Development (Expo + Feature-Sliced)

## Stack
- **Framework**: React Native + Expo (Managed workflow)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation (`@react-navigation/native`, stack, bottom-tabs)
- **Styling**: `StyleSheet.create()` with tokens
- **Persistence**: AsyncStorage
- **Data fetching**: API client in `shared/lib/api/`, hooks in features/entities

## Layer Structure

```
apps/mobile/src/
  app/
    App.tsx              # Root component
    navigation/
      RootNavigator.tsx  # Stack + Tab navigators
      routes.ts          # Route name constants
    providers/AppProviders.tsx
    theme/(ThemeProvider.tsx  tokens.ts)
  pages/                 # Screens (compose widgets + features)
  widgets/               # Large UI blocks (no data fetching)
  features/              # User actions with data fetching
  entities/              # Entity types + model hooks
  shared/
    config/env.ts
    hooks/useAppTheme.ts
    lib/api/client.ts    # Typed API client
    lib/storage/asyncStorage.ts
    types/navigation.ts  # RootStackParamList
    ui/(Button.tsx  Input.tsx  Screen.tsx  Card.tsx)
```

## Navigation Setup

```typescript
// app/navigation/routes.ts
export const Routes = {
  LOGIN: 'Login',
  HOME: 'Home',
  PROFILE: 'Profile',
} as const;

// shared/types/navigation.ts
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: { userId: string };
};
```

## API Client

```typescript
// shared/lib/api/client.ts
import { env } from '../../config/env';

const BASE_URL = env.API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new ApiError(await res.json());
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
```

## Screen Component (safe area wrapper)

```typescript
// shared/ui/Screen.tsx
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { tokens } from '../../app/theme/tokens';

export function Screen({ children, scroll = true }) {
  const Content = scroll ? ScrollView : SafeAreaView;
  return (
    <SafeAreaView style={styles.safe}>
      <Content style={styles.container}>{children}</Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  container: { flex: 1, padding: tokens.spacing.md },
});
```

## Dev Tooling (install during project creation)
- **LocatorJS** not applicable for React Native — skip for mobile-only projects.
- For universal (web+mobile): install LocatorJS only in the web target.

## Gotchas
- Use React Native primitives (`View`, `Text`, `TouchableOpacity`) — no web elements
- `StyleSheet.create()` for all styles — no inline objects
- All styling from `tokens.ts` — no hardcoded colors/spacing
- No `fetch` in pages, widgets, or shared/ui
- Navigate via React Navigation — never manipulate URLs
- Handle loading/error/empty states in every data component
- AsyncStorage for persistence (not localStorage)
