import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google OAuth 리다이렉트 콜백 — code를 세션으로 교환.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }
  return NextResponse.redirect(`${origin}${next}`);
}
