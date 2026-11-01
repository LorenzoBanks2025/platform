import { ProfileForm } from "../components/profile-form";

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        Your profile
      </h1>
      <ProfileForm />
    </main>
  );
}
