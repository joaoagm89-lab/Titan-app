import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const uid = searchParams.get("state");
  const host = request.headers.get("host");
  const protocolo = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocolo}://${host}`;

  if (!code || !uid) {
    console.error("Callback Google: faltou code ou uid", { code, uid });
    return NextResponse.redirect(`${baseUrl}/?google=erro`);
  }

  const redirectUri = `${baseUrl}/api/google/callback`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const json = await resp.json();

  if (!resp.ok || !json.refresh_token) {
    console.error("Callback Google: falhou troca de token", json);
    return NextResponse.redirect(`${baseUrl}/?google=erro`);
  }

  const { error } = await supabaseAdmin.from("google_tokens").upsert({
    user_id: uid,
    refresh_token: json.refresh_token,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Callback Google: falhou salvar no Supabase", error);
    return NextResponse.redirect(`${baseUrl}/?google=erro_salvar`);
  }

  console.log("Callback Google: token salvo com sucesso para", uid);
  return NextResponse.redirect(`${baseUrl}/?google=conectado`);
}
