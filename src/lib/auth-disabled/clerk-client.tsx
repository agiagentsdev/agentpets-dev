"use client";

import type { ReactNode } from "react";

const DISABLED_USER = null;
type AnyPropsWithChildren = Record<string, unknown> & { children?: ReactNode };

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    signOut: async () => undefined,
    getToken: async () => null,
  };
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: false,
    user: DISABLED_USER,
  };
}

export function useClerk() {
  return {
    user: DISABLED_USER,
    session: null,
    signOut: async () => undefined,
    openSignIn: () => undefined,
    openSignUp: () => undefined,
    redirectToSignIn: () => undefined,
    openUserProfile: () => undefined,
  };
}

export function SignInButton({ children }: AnyPropsWithChildren) {
  return <>{children ?? null}</>;
}

export function SignUpButton({ children }: AnyPropsWithChildren) {
  return <>{children ?? null}</>;
}

export function UserButton() {
  return null;
}

export function SignedIn(_: AnyPropsWithChildren) {
  return null;
}

export function SignedOut({ children }: AnyPropsWithChildren) {
  return <>{children}</>;
}
