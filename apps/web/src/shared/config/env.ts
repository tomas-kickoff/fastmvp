type ProcessLike = {
  env?: Record<string, string | undefined>;
};

const processEnv = (globalThis as { process?: ProcessLike }).process?.env ?? {};

export const env = {
  appName: processEnv.EXPO_PUBLIC_APP_NAME ?? "fastmvp",
} as const;
