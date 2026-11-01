"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

type AuthResponse = {
  error?: string;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setError(result.error ?? "Unable to authenticate. Please try again.");
        return;
      }

      window.dispatchEvent(new Event("nfa-auth-changed"));
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {isRegister && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            First name
            <input
              autoComplete="given-name"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
              maxLength={100}
              name="firstName"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Last name
            <input
              autoComplete="family-name"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
              maxLength={100}
              name="lastName"
              required
            />
          </label>
        </div>
      )}
      {isRegister && (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Avatar image URL{" "}
          <span className="font-normal text-zinc-500">(optional)</span>
          <input
            autoComplete="url"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
            maxLength={2048}
            name="avatarUrl"
            placeholder="https://example.com/avatar.png"
            type="url"
          />
          <span className="font-normal text-zinc-500">
            Use an HTTPS image URL. You can add or change it later on your
            profile.
          </span>
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        Email
        <input
          autoComplete="email"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        Password
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-700"
          minLength={isRegister ? 12 : undefined}
          name="password"
          required
          type="password"
        />
        {isRegister && (
          <span className="font-normal text-zinc-500">
            Use at least 12 characters.
          </span>
        )}
      </label>
      {error && (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? "Please wait..."
          : isRegister
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}
