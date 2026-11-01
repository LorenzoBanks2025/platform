import { AuthForm } from "../components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        Sign in
      </h1>
      <p className="mt-2 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        Sign in to your NFA Platform account.
      </p>
      <AuthForm mode="login" />
    </main>
  );
}
