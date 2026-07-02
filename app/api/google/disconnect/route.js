import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { obterUsuarioAutenticado } from "../../../lib/googleAuth";

export async function POST(request) {
  const user = await obterUsuarioAutenticado(request);
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  await supabaseAdmin.from("google_tokens").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
