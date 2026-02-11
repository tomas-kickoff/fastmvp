import { SafeAreaProvider } from "react-native-safe-area-context";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { clearSession, readSession, type Session } from "../../entities/user";
import { ThemeProvider } from "../theme/ThemeProvider";

type SessionContextValue = {
  session: Session | null;
  isSessionLoading: boolean;
  setSession: (nextSession: Session | null) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function SessionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const storedSession = await readSession();

        if (isMounted) {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
          setIsSessionLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isSessionLoading,
      setSession,
      logout,
    }),
    [session, isSessionLoading, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function AppProviders({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within AppProviders.");
  }

  return context;
}
