"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type PublicAuthUser = Omit<AuthUser, "password">;

type AuthContextValue = {
  currentUser: PublicAuthUser | null;
  isGuestMode: boolean;
  isLoading: boolean;
  signUp: (input: { name: string; email: string; password: string }) => {
    success: boolean;
    error?: string;
  };
  logIn: (input: { email: string; password: string }) => {
    success: boolean;
    error?: string;
  };
  logOut: () => void;
};

const usersStorageKey = "networking-crm-users";
const sessionStorageKey = "networking-crm-session-user-id";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toPublicUser(user: AuthUser): PublicAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsers = window.localStorage.getItem(usersStorageKey);
    const storedSession = window.localStorage.getItem(sessionStorageKey);

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers) as AuthUser[]);
    }

    if (storedSession) {
      setCurrentUserId(storedSession);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
  }, [users, isLoading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (currentUserId) {
      window.localStorage.setItem(sessionStorageKey, currentUserId);
      return;
    }

    window.localStorage.removeItem(sessionStorageKey);
  }, [currentUserId, isLoading]);

  const value = useMemo<AuthContextValue>(() => {
    const currentUser = users.find((user) => user.id === currentUserId) ?? null;

    return {
      currentUser: currentUser ? toPublicUser(currentUser) : null,
      isGuestMode: !currentUser,
      isLoading,
      signUp: ({ name, email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
          return {
            success: false,
            error: "An account with this email already exists.",
          };
        }

        const newUser: AuthUser = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: normalizedEmail,
          password,
        };

        setUsers((current) => [...current, newUser]);
        setCurrentUserId(newUser.id);

        return { success: true };
      },
      logIn: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const matchingUser = users.find(
          (user) =>
            user.email.toLowerCase() === normalizedEmail && user.password === password,
        );

        if (!matchingUser) {
          return {
            success: false,
            error: "Email or password did not match.",
          };
        }

        setCurrentUserId(matchingUser.id);

        return { success: true };
      },
      logOut: () => {
        setCurrentUserId(null);
      },
    };
  }, [users, currentUserId, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
