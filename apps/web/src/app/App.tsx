import React from "react";

import { RootNavigator } from "./navigation/RootNavigator";
import { AppProviders } from "./providers/AppProviders";

export function App(): React.JSX.Element {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
