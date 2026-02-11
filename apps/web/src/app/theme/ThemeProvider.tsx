import React, { createContext, useContext } from "react";

import { tokens, type AppTheme } from "./tokens";

const ThemeContext = createContext<AppTheme>(tokens);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
