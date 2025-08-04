"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define simplified ThemeProviderProps without relying on the imported types
type ThemeProviderProps = {
  children: React.ReactNode
  // Omit explicit typing for other props to avoid type conflicts
} & React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
