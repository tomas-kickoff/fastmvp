import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { HomePage } from "../../pages/home/HomePage";
import { LoginPage } from "../../pages/login/LoginPage";
import { useAppTheme } from "../../shared/hooks/useAppTheme";
import type { RootStackParamList } from "../../shared/types/navigation";
import { useSession } from "../providers/AppProviders";
import { routes } from "./routes";

const Stack = createNativeStackNavigator<RootStackParamList>();

function SessionLoadingScreen(): React.JSX.Element {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.background,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ color: theme.colors.mutedText }}>Loading session...</Text>
    </View>
  );
}

export function RootNavigator(): React.JSX.Element {
  const { session, isSessionLoading } = useSession();
  const theme = useAppTheme();

  if (isSessionLoading) {
    return <SessionLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {session ? (
          <Stack.Screen name={routes.home} component={HomePage} />
        ) : (
          <Stack.Screen name={routes.login} component={LoginPage} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
