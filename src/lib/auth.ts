import { createSupabaseServerClient } from "@/lib/supabase/server";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return user;
}
