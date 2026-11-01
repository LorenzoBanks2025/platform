type UserAvatarProps = {
  name: string;
  avatarUrl: string | null;
  size?: "small" | "large";
};

function getSafeAvatarUrl(avatarUrl: string | null): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  try {
    const url = new URL(avatarUrl);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "small",
}: UserAvatarProps) {
  const imageUrl = getSafeAvatarUrl(avatarUrl);
  const sizeClassName =
    size === "large" ? "size-24 text-3xl" : "size-9 text-sm";

  return (
    <span
      aria-label={`${name}'s avatar`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 bg-cover bg-center font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100 ${sizeClassName}`}
      role="img"
      style={
        imageUrl
          ? { backgroundImage: `url(${JSON.stringify(imageUrl)})` }
          : undefined
      }
    >
      {!imageUrl && (name.trim().charAt(0).toUpperCase() || "?")}
    </span>
  );
}
