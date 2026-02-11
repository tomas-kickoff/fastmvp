# fastmvp Web App (apps/web)

React Native app built with Expo + TypeScript using Feature-Sliced architecture.

## Run locally

From repository root:

```bash
npm install
npm run dev:web
```

From `apps/web`:

```bash
npm install
npm run start
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

## Current scope

- Mocked local authentication (no backend calls)
- Session persistence in AsyncStorage
- Root navigation between Login and Home
