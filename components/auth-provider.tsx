"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { normalizePlan, type Plan } from "@/lib/plans";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type PublicAuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: Plan;
};

type AuthResult = Promise<{
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}>;

type AccountUpdateResult = Promise<{
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
  setPlan: (plan: Plan) => AccountUpdateResult;
  updateAccount: (input: {
    name: string;
    email: string;
    phone: string;
  }) => AccountUpdateResult;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toPublicUser(user: User): PublicAuthUser {
  const metadataName = user.user_metadata.name;
  const metadataPlan = user.user_metadata.plan;

  return {
    id: user.id,
    name:
      typeof metadataName === "string" && metadataName.trim().length > 0
        ? metadataName.trim()
        : user.email?.split("@")[0] ?? "Keeply user",
    email: user.email ?? "",
    phone: user.phone ?? "",
    plan: normalizePlan(metadataPlan),
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
              plan: "free",
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
      setPlan: async (plan) => {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            name: currentUser?.name ?? "",
            plan,
          },
        });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        if (data.user) {
          setCurrentUser(toPublicUser(data.user));
        }

        return { success: true };
      },
      updateAccount: async ({ name, email, phone }) => {
        const { data, error } = await supabase.auth.updateUser({
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          data: {
            name: name.trim(),
            plan: currentUser?.plan ?? "free",
          },
        });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        if (data.user) {
          setCurrentUser(toPublicUser(data.user));
        }

        return {
          success: true,
          requiresEmailConfirmation:
            email.trim().toLowerCase() !== currentUser?.email,
        };
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
