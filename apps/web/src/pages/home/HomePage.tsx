import React, { useState } from "react";
import { Text, View } from "react-native";

import { useSession } from "../../app/providers/AppProviders";
import { useAppTheme } from "../../shared/hooks/useAppTheme";
import { Button } from "../../shared/ui/Button";
import { Screen } from "../../shared/ui/Screen";

export function HomePage(): React.JSX.Element {
  const { session, logout } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const theme = useAppTheme();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: theme.spacing.lg }}>
        <Text style={{ fontSize: theme.fontSize.xl, color: theme.colors.text, fontWeight: "700" }}>
          You are logged in
        </Text>

        <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.mutedText }}>
          {session?.user.email}
        </Text>

        <Button
          title={isLoggingOut ? "Logging out..." : "Logout"}
          onPress={() => {
            void handleLogout();
          }}
          disabled={isLoggingOut}
        />
      </View>
    </Screen>
  );
}
