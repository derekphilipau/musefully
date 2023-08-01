'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

// import { OtherProvider } from "./context/OtherContext";

// * Because layout.tsx is only rendered on the server-side, we can use the
// * ThemeProvider and OtherProvider components directly in the RootLayout
// * component.

// * This is not possible in the app.tsx file because it is rendered
// * on both the server-side and the client-side.

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/*<OtherProvider>*/}
      {children}
      {/*</OtherProvider>*/}
    </ThemeProvider>
  );
}
