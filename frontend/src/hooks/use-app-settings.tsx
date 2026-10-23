import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ThemeMode = "light" | "dark";

type AppUser = {
  name: string;
  email: string;
};

type AppSettingsContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  user: AppUser | null;
  login: (user: AppUser) => void;
  logout: () => void;
};

const THEME_KEY = "namma-mysuru-theme";
const USER_KEY = "namma-mysuru-user";

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function readStoredUser(): AppUser | null {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = window.localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme);
  const [user, setUser] = useState<AppUser | null>(readStoredUser);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      user,
      login: (nextUser) => {
        setUser(nextUser);
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(USER_KEY);
      },
    }),
    [theme, user],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }
  return context;
}
