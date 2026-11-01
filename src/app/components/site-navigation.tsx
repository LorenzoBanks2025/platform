"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserAvatar } from "./user-avatar";

type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  gravatarUrl: string;
  role: "admin" | "user";
};

type CurrentUserResponse = {
  user?: CurrentUser;
};

const linkClassName =
  "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white";

export function SiteNavigation() {
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [user, setUser] = useState<CurrentUser>();
  const [logoutError, setLogoutError] = useState<string>();

  const refreshCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (response.status === 401) {
        setUser(undefined);
        return;
      }
      if (!response.ok) {
        throw new Error(
          `Could not load the current user (${response.status}).`,
        );
      }

      const result = (await response.json()) as CurrentUserResponse;
      setUser(result.user);
    } catch (error) {
      console.error("Could not load the current user.", error);
      setUser(undefined);
    }
  }, []);

  useEffect(() => {
    void refreshCurrentUser();
    window.addEventListener("nfa-auth-changed", refreshCurrentUser);
    return () => {
      window.removeEventListener("nfa-auth-changed", refreshCurrentUser);
    };
  }, [refreshCurrentUser]);

  async function handleLogout() {
    setLogoutError(undefined);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Could not sign out (${response.status}).`);
      }

      setUser(undefined);
      menuRef.current?.removeAttribute("open");
      window.dispatchEvent(new Event("nfa-auth-changed"));
      router.refresh();
    } catch (error) {
      console.error("Could not sign out.", error);
      setLogoutError("Could not sign out. Please try again.");
    }
  }

  const displayName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3"
      >
        <Link
          className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white"
          href="/"
        >
          NFA Platform
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link className={linkClassName} href="/">
                Dashboard
              </Link>
              <details className="relative" ref={menuRef}>
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-100 dark:hover:bg-zinc-800">
                  <UserAvatar
                    name={displayName}
                    avatarUrl={user.avatarUrl}
                    gravatarUrl={user.gravatarUrl}
                  />
                  <span>{displayName}</span>
                  <span aria-hidden="true" className="text-xs">
                    ▾
                  </span>
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="truncate px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </p>
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {user.role === "admin" ? "Administrator" : "Standard user"}
                  </p>
                  <Link
                    className="block rounded-md px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    href="/profile"
                    onClick={() => menuRef.current?.removeAttribute("open")}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={handleLogout}
                    type="button"
                  >
                    Sign out
                  </button>
                  {logoutError && (
                    <p className="px-3 py-2 text-xs text-red-700" role="alert">
                      {logoutError}
                    </p>
                  )}
                </div>
              </details>
            </>
          ) : (
            <>
              <Link className={linkClassName} href="/login">
                Sign in
              </Link>
              <Link
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                href="/register"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
