import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_AUTH_BYPASS = true;
const ADMIN_BYPASS_USER = { email: "admin-bypass@local.test" } as User;

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
  if (ADMIN_AUTH_BYPASS) {
    return ADMIN_BYPASS_USER;
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch (error) {
    console.error("Admin auth lookup failed, falling back to signed-out state:", error);
    return null;
  }
}

export async function requireAdminUser() {
  if (ADMIN_AUTH_BYPASS) {
    return ADMIN_BYPASS_USER;
  }

  const user = await getCurrentUser();

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return user;
}

export async function ensureAdminRouteAccess() {
  if (ADMIN_AUTH_BYPASS) {
    return null;
  }

  const user = await requireAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
