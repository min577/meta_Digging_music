"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// 키가 없으면 null을 반환 → 호출부는 데모 모드로 폴백한다.
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
