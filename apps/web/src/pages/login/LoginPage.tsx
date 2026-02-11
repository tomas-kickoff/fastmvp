import React from "react";
import { Text, View } from "react-native";

import { env } from "../../shared/config/env";
import { useAppTheme } from "../../shared/hooks/useAppTheme";
import { Screen } from "../../shared/ui/Screen";
import { LoginForm } from "../../widgets/login-form/LoginForm";

export function LoginPage(): React.JSX.Element {
  const theme = useAppTheme();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              color: theme.colors.text,
              fontWeight: "700",
            }}
          >
            {env.appName}
          </Text>
          <Text style={{ fontSize: theme.fontSize.md, color: theme.colors.mutedText }}>
            Sign in with any email and password.
          </Text>
        </View>

        <LoginForm />
      </View>
    </Screen>
  );
}
