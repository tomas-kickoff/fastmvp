import React from "react";
import { View } from "react-native";

import { useAppTheme } from "../../shared/hooks/useAppTheme";
import { useLogin } from "../../features/auth/login";
import { LoginFields } from "../../features/auth/login";

export function LoginForm(): React.JSX.Element {
  const {
    email,
    password,
    error,
    isSubmitting,
    setEmail,
    setPassword,
    submit,
  } = useLogin();
  const theme = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
      }}
    >
      <LoginFields
        email={email}
        password={password}
        error={error}
        isSubmitting={isSubmitting}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={submit}
      />
    </View>
  );
}
