import React from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "../../../../shared/hooks/useAppTheme";
import { Button } from "../../../../shared/ui/Button";
import { Input } from "../../../../shared/ui/Input";

type LoginFieldsProps = {
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function LoginFields({
  email,
  password,
  error,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFieldsProps): React.JSX.Element {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Input
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        textContentType="password"
        placeholder="Enter any password"
      />

      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}

      <Button
        title={isSubmitting ? "Logging in..." : "Login"}
        onPress={onSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
}
