export const tokens = {
  colors: {
    background: "#f5f7fb",
    surface: "#ffffff",
    primary: "#0f766e",
    primaryText: "#ffffff",
    text: "#111827",
    mutedText: "#6b7280",
    border: "#d1d5db",
    danger: "#dc2626",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
  fontSize: {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
  },
} as const;

export type AppTheme = typeof tokens;
