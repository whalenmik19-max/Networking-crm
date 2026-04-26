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
import { ensureUserRecords, syncProfileRow } from "@/lib/supabase/profile";

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
  activePlan: Plan;
  isAdmin: boolean;
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

function parseCsv(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAdminAccount(user: PublicAuthUser | null) {
  if (!user) {
    return false;
  }

  const allowedUserIds = parseCsv(process.env.NEXT_PUBLIC_ADMIN_USER_IDS);
  const allowedEmails = parseCsv(process.env.NEXT_PUBLIC_ADMIN_EMAILS).map((email) =>
    email.toLowerCase(),
  );

  return (
    allowedUserIds.includes(user.id) || allowedEmails.includes(user.email.toLowerCase())
  );
}

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
  const [guestPlan, setGuestPlan] = useState<Plan>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const storedGuestPlan =
      typeof window === "undefined"
        ? "free"
        : normalizePlan(window.localStorage.getItem("keeply-guest-plan"));

    setGuestPlan(storedGuestPlan);

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          await ensureUserRecords(session.user);
        } catch (error) {
          console.error(error);
        }
      }

      setCurrentUser(session?.user ? toPublicUser(session.user) : null);
      setIsLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          void ensureUserRecords(session.user).catch((error) => {
            console.error(error);
          });
        }

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
    const activePlan = currentUser?.plan ?? guestPlan;

    return {
      currentUser,
      activePlan,
      isAdmin: isAdminAccount(currentUser),
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

        if (data.session?.user) {
          try {
            await ensureUserRecords(data.session.user);
          } catch (setupError) {
            return {
              success: false,
              error:
                setupError instanceof Error
                  ? setupError.message
                  : "We couldn't set up your account.",
            };
          }
        }

        return {
          success: true,
          requiresEmailConfirmation: !data.session,
        };
      },
      logIn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        if (data.user) {
          try {
            await ensureUserRecords(data.user);
          } catch (setupError) {
            return {
              success: false,
              error:
                setupError instanceof Error
                  ? setupError.message
                  : "We couldn't finish loading your account.",
            };
          }
        }

        return { success: true };
      },
      setPlan: async (plan) => {
        if (!currentUser) {
          setGuestPlan(plan);

          if (typeof window !== "undefined") {
            window.localStorage.setItem("keeply-guest-plan", plan);
          }

          return { success: true };
        }

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
          const { error: settingsError } = await supabase.from("user_settings").upsert(
            {
              user_id: data.user.id,
              subscription_plan: plan,
            },
            { onConflict: "user_id" },
          );

          if (settingsError) {
            console.error(settingsError);
            return {
              success: false,
              error: "We couldn't update your plan settings.",
            };
          }

          try {
            await syncProfileRow(data.user);
          } catch (profileError) {
            return {
              success: false,
              error:
                profileError instanceof Error
                  ? profileError.message
                  : "We couldn't update your profile.",
            };
          }

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
          try {
            await syncProfileRow(data.user);
          } catch (profileError) {
            return {
              success: false,
              error:
                profileError instanceof Error
                  ? profileError.message
                  : "We couldn't update your profile.",
            };
          }

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
  }, [currentUser, guestPlan, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
