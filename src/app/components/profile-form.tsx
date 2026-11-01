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
  gravatarUrl: string;
  role: "admin" | "user";
};

type ProfileResponse = {
  user?: ProfileUser;
  error?: string;
};

type GravatarResponse = {
  available?: boolean;
  gravatarUrl?: string | null;
  error?: string;
};

export function ProfileForm() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser>();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSource, setAvatarSource] = useState<"gravatar" | "custom">(
    "gravatar",
  );
  const [hasGravatar, setHasGravatar] = useState(false);
  const [gravatarError, setGravatarError] = useState<string>();
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      let profile: ProfileUser;
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
        if (!result.user) {
          throw new Error("The current-user response did not include a user.");
        }
        profile = result.user;
        if (active) {
          setUser(profile);
          setAvatarUrl(profile.avatarUrl ?? "");
          setAvatarSource(profile.avatarUrl ? "custom" : "gravatar");
        }
      } catch (loadError) {
        console.error("Could not load your profile.", loadError);
        if (active) {
          setError("Could not load your profile. Please refresh the page.");
        }
        return;
      }

      try {
        const gravatarResponse = await fetch("/api/auth/gravatar", {
          cache: "no-store",
        });
        const gravatarResult =
          (await gravatarResponse.json()) as GravatarResponse;
        if (!gravatarResponse.ok) {
          throw new Error(
            gravatarResult.error ??
              `Could not check Gravatar availability (${gravatarResponse.status}).`,
          );
        }
        if (active) {
          setHasGravatar(gravatarResult.available === true);
          if (gravatarResult.gravatarUrl) {
            setUser({ ...profile, gravatarUrl: gravatarResult.gravatarUrl });
          }
        }
      } catch (loadError) {
        console.error("Could not check Gravatar availability.", loadError);
        if (active) {
          setGravatarError(
            "Could not check Gravatar availability. You can still use a custom image URL.",
          );
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
        body: JSON.stringify({
          avatarUrl:
            avatarSource === "custom" ? avatarUrl.trim() || null : null,
        }),
      });
      const result = (await response.json()) as ProfileResponse;

      if (!response.ok) {
        setError(result.error ?? "Could not update your profile.");
        return;
      }

      if (result.user) {
        setUser(result.user);
        setAvatarUrl(result.user.avatarUrl ?? "");
        setAvatarSource(result.user.avatarUrl ? "custom" : "gravatar");
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
    if (error) {
      return (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      );
    }

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
          gravatarUrl={user.gravatarUrl}
          size="large"
        />
        <div>
          <h2 className="font-semibold text-zinc-950 dark:text-white">
            {displayName}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {user.role === "admin" ? "Administrator" : "Standard user"}
          </p>
        </div>
      </div>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Choose an avatar
          </legend>
          <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-200">
            <input
              checked={avatarSource === "gravatar"}
              disabled={!hasGravatar}
              name="avatarSource"
              onChange={() => {
                setAvatarSource("gravatar");
                setSaved(false);
              }}
              type="radio"
              value="gravatar"
            />
            <span>
              <span className="font-medium">Use Gravatar</span>
              <span className="mt-1 block text-zinc-500">
                {hasGravatar
                  ? "A Gravatar was found for your account email."
                  : "No Gravatar was found for your account email."}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-200">
            <input
              checked={avatarSource === "custom"}
              name="avatarSource"
              onChange={() => {
                setAvatarSource("custom");
                setSaved(false);
              }}
              type="radio"
              value="custom"
            />
            <span className="w-full">
              <span className="font-medium">Use a custom image URL</span>
              <input
                autoComplete="url"
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
                maxLength={2048}
                onChange={(event) => {
                  setAvatarUrl(event.target.value);
                  setAvatarSource("custom");
                  setSaved(false);
                }}
                placeholder="https://example.com/avatar.png"
                type="url"
                value={avatarUrl}
              />
              <span className="mt-1 block font-normal text-zinc-500">
                A custom image URL takes precedence over Gravatar.
              </span>
            </span>
          </label>
          <p className="text-xs text-zinc-500">
            Checking and displaying a Gravatar shares a one-way hash of your
            email address with Gravatar.
          </p>
        </fieldset>
        {gravatarError && (
          <output className="text-sm text-amber-800 dark:text-amber-300">
            {gravatarError}
          </output>
        )}
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
          disabled={isSaving || (avatarSource === "gravatar" && !hasGravatar)}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}
