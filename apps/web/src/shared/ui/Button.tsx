import React from "react";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

import { useAppTheme } from "../hooks/useAppTheme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, disabled = false, style }: ButtonProps): React.JSX.Element {
  const theme = useAppTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius.md,
          height: 48,
          backgroundColor: theme.colors.primary,
        },
        pressed && !disabled ? { opacity: 0.85 } : null,
        disabled ? { opacity: 0.6 } : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={{
          color: theme.colors.primaryText,
          fontSize: theme.fontSize.md,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
