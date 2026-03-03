---
name: react-native-mobile
description: Patterns and templates for building React Native (Expo) mobile apps with Feature-Sliced Design architecture. Use when implementing or modifying mobile frontend code in apps/mobile using React Native and Expo.
---

# React Native Mobile Development (Expo + Feature-Sliced)

This skill provides patterns, conventions, and templates for building mobile apps with React Native (Expo) following Feature-Sliced Design architecture.

## Stack

- **Framework**: React Native + Expo (Managed workflow)
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation (`@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`)
- **Styling**: `StyleSheet.create()` with tokens
- **State**: React state + context (default)
- **Persistence**: AsyncStorage
- **Data fetching**: API client in `shared/lib/api/`, hooks in features/entities

## Layer Structure (Feature-Sliced)

```
apps/mobile/
  app.json              # Expo config
  index.ts              # Entry point
  src/
    app/
      App.tsx            # Root component
      navigation/
        RootNavigator.tsx  # Stack + Tab navigators
        routes.ts          # Route name constants
      providers/
        AppProviders.tsx   # Context providers wrapper
      theme/
        ThemeProvider.tsx
        tokens.ts          # Design tokens

    pages/               # Screens (compose widgets + features)
      home/
        HomePage.tsx
      login/
        LoginPage.tsx
      profile/
        ProfilePage.tsx

    widgets/             # Large UI blocks (no data fetching)
      login-form/
        LoginForm.tsx
      profile-card/
        ProfileCard.tsx

    features/            # User actions with data fetching
      auth/
        login/
          index.ts
          model/
            useLogin.ts
          ui/
            LoginFields.tsx

    entities/            # Entity types + model hooks
      user/
        index.ts
        model/
          types.ts
          useUser.ts
        lib/
          storage.ts     # AsyncStorage for user data

    shared/
      config/
        env.ts
      hooks/
        useAppTheme.ts
      lib/
        api/
          client.ts      # Typed API client
        storage/
          asyncStorage.ts  # AsyncStorage wrapper
      types/
        navigation.ts    # Navigation param types
      ui/
        Button.tsx
        Input.tsx
        Screen.tsx       # Safe area + scroll wrapper
        Card.tsx
```

## Data Fetching Rules (non-negotiable)

| Layer | Can fetch data? | How? |
|-------|----------------|------|
| `shared/ui/` | NO | Props only |
| `widgets/` | NO | Props only |
| `pages/` | NO (compose only) | Pass data via props |
| `features/**/model/` | YES | Via `shared/lib/api/client` |
| `entities/**/model/` | YES | Via `shared/lib/api/client` |

## Navigation Setup

```typescript
// app/navigation/routes.ts
export const Routes = {
  LOGIN: 'Login',
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
} as const;

// shared/types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
```

```typescript
// app/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from './routes';
import { LoginPage } from '../../pages/login/LoginPage';
import { HomePage } from '../../pages/home/HomePage';
import type { RootStackParamList } from '../../shared/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={Routes.LOGIN}>
      <Stack.Screen name={Routes.LOGIN} component={LoginPage} />
      <Stack.Screen name={Routes.HOME} component={HomePage} />
    </Stack.Navigator>
  );
}
```

## API Client Pattern

```typescript
// shared/lib/api/client.ts
import { env } from '../../config/env';

const BASE_URL = env.API_URL;

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
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  typography: {
    fontFamily: 'System',
    fontSize: { sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24 },
  },
} as const;
```

## Screen Component Pattern

```typescript
// shared/ui/Screen.tsx
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '../../app/theme/tokens';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function Screen({ children, scroll = true, style }: ScreenProps) {
  const Container = scroll ? ScrollView : SafeAreaView;
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <Container style={styles.container}>{children}</Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  container: { flex: 1, padding: tokens.spacing.md },
});
```

## Page Composition Pattern

```typescript
// pages/home/HomePage.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { useUser } from '../../entities/user/model/useUser';
import { tokens } from '../../app/theme/tokens';

export function HomePage() {
  const { user, loading, error } = useUser();

  if (loading) return <Screen><ActivityIndicator /></Screen>;
  if (error) return <Screen><Text style={styles.error}>{error}</Text></Screen>;

  return (
    <Screen>
      <Text style={styles.title}>Welcome, {user?.name}</Text>
      {/* Compose widgets here */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: tokens.typography.fontSize['2xl'], fontWeight: 'bold', color: tokens.colors.text },
  error: { color: tokens.colors.error, textAlign: 'center' },
});
```

## AsyncStorage Pattern

```typescript
// shared/lib/storage/asyncStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
};
```

## Guidelines

- All components use React Native primitives (`View`, `Text`, `TouchableOpacity`, `FlatList`)
- No web-specific elements (`div`, `span`, `button`)
- Use `StyleSheet.create()` for all styles — no inline style objects
- Use `tokens.ts` for all styling values — no hardcoded colors/spacing/fonts
- No `fetch()` in `pages/`, `widgets/`, or `shared/ui/`
- All API calls through `shared/lib/api/client.ts`
- Use `Screen` wrapper for safe area + scroll handling
- Navigate via React Navigation — never manipulate URLs directly
- Handle loading, error, and empty states in every data-consuming component
- Test on both iOS and Android simulators
