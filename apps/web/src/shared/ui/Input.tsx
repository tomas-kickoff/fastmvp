import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { useAppTheme } from "../hooks/useAppTheme";

type InputProps = TextInputProps & {
  label: string;
};

export function Input({ label, ...textInputProps }: InputProps): React.JSX.Element {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={{ color: theme.colors.text, fontWeight: "600" }}>{label}</Text>

      <TextInput
        {...textInputProps}
        placeholderTextColor={theme.colors.mutedText}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
        }}
      />
    </View>
  );
}
