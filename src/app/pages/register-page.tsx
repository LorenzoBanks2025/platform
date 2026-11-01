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
      <AuthForm mode="register" />
    </main>
  );
}
