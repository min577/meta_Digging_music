import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

// 서버 컴포넌트/route handler용 Supabase 클라이언트.
// 키가 없으면 null → 데모 모드.
export function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서 set 호출 시 — middleware가 세션 갱신을 담당하므로 무시 가능
        }
      },
    },
  });
}
