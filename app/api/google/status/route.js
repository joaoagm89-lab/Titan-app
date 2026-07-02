import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { obterUsuarioAutenticado } from "../../../lib/googleAuth";

export async function GET(request) {
  const user = await obterUsuarioAutenticado(request);
  if (!user) {
    console.error("Status Google: usuário não autenticado (token ausente ou inválido)");
    return NextResponse.json({ conectado: false }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.from("google_tokens").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) console.error("Status Google: erro ao consultar Supabase", error);
  console.log("Status Google: user.id =", user.id, "encontrado =", !!data);

  return NextResponse.json({ conectado: !!data });
}
