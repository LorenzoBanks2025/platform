"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { UserAvatar } from "./user-avatar";

type ProfileUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

type ProfileResponse = {
  user?: ProfileUser;
  error?: string;
};

export function ProfileForm() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser>();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) {
          throw new Error(`Could not load your profile (${response.status}).`);
        }

        const result = (await response.json()) as ProfileResponse;
        if (active && result.user) {
          setUser(result.user);
          setAvatarUrl(result.user.avatarUrl ?? "");
        }
      } catch (loadError) {
        console.error("Could not load your profile.", loadError);
        if (active) {
          setError("Could not load your profile. Please refresh the page.");
        }
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSaved(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatarUrl.trim() || null }),
      });
      const result = (await response.json()) as ProfileResponse;

      if (!response.ok) {
        setError(result.error ?? "Could not update your profile.");
        return;
      }

      if (result.user) {
        setUser(result.user);
        setAvatarUrl(result.user.avatarUrl ?? "");
      }
      setSaved(true);
      window.dispatchEvent(new Event("nfa-auth-changed"));
      router.refresh();
    } catch (saveError) {
      console.error("Could not update your profile.", saveError);
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Loading your profile...
      </p>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={displayName}
          avatarUrl={user.avatarUrl}
          size="large"
        />
        <div>
          <h2 className="font-semibold text-zinc-950 dark:text-white">
            {displayName}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
      </div>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Avatar image URL
          <input
            autoComplete="url"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
            maxLength={2048}
            onChange={(event) => {
              setAvatarUrl(event.target.value);
              setSaved(false);
            }}
            placeholder="https://example.com/avatar.png"
            type="url"
            value={avatarUrl}
          />
          <span className="font-normal text-zinc-500">
            Use an HTTPS image URL, or clear the field to use your initials.
          </span>
        </label>
        {error && (
          <p className="text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <output className="text-sm text-green-700 dark:text-green-400">
            Profile updated.
          </output>
        )}
        <button
          className="self-start rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}
