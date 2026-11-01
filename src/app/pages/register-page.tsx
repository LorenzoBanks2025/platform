import { AuthForm } from "../components/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        Create your account
      </h1>
      <p className="mt-2 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        Create an account to get started with NFA Platform.
      </p>
      <p className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        The first account on an installation is an administrator. Subsequent
        accounts have standard user access.
      </p>
      <AuthForm mode="register" />
    </main>
  );
}
