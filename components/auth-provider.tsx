"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type PublicAuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResult = Promise<{
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}>;

type AuthContextValue = {
  currentUser: PublicAuthUser | null;
  isGuestMode: boolean;
  isLoading: boolean;
  signUp: (input: { name: string; email: string; password: string }) => AuthResult;
  logIn: (input: { email: string; password: string }) => AuthResult;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toPublicUser(user: User): PublicAuthUser {
  const metadataName = user.user_metadata.name;

  return {
    id: user.id,
    name:
      typeof metadataName === "string" && metadataName.trim().length > 0
        ? metadataName.trim()
        : user.email?.split("@")[0] ?? "Keeply user",
    email: user.email ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PublicAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setCurrentUser(session?.user ? toPublicUser(session.user) : null);
      setIsLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      setCurrentUser(session?.user ? toPublicUser(session.user) : null);
      setIsLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const supabase = getSupabaseBrowserClient();

    return {
      currentUser,
      isGuestMode: !currentUser,
      isLoading,
      signUp: async ({ name, email, password }) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        return {
          success: true,
          requiresEmailConfirmation: !data.session,
        };
      },
      logIn: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        return { success: true };
      },
      logOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [currentUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
