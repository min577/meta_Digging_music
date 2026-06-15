"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "./types";

// Supabase 연동 시: 온보딩/취향 변화를 users·characters 테이블에 best-effort 저장.
// (로그인 세션이 있을 때만 작동. 데모 모드/비로그인 시 no-op.)
export async function syncProfileToSupabase(p: UserProfile) {
  const supabase = createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("users").upsert({
    id: user.id,
    handle: p.handle,
    country: p.country,
    taste_vector: p.tasteVector,
    situations: p.situations,
    coins: p.coins,
    digg_points: p.diggPoints,
    level: p.level,
  });
  await supabase.from("characters").upsert({
    user_id: user.id,
    base_type: p.character.baseType,
    equipped: p.character.equipped,
    evolution_stage: p.character.evolutionStage,
  });
}

export async function signInWithGoogle() {
  const supabase = createClient();
  if (!supabase) return false;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
  });
  return !error;
}

export async function signOut() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
