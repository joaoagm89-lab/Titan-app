import { supabaseAdmin } from "./supabaseAdmin";

export async function obterUsuarioAutenticado(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function obterAccessToken(userId) {
  const { data, error } = await supabaseAdmin
    .from("google_tokens")
    .select("refresh_token")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("obterAccessToken: erro ao buscar no Supabase", error);
    return null;
  }
  if (!data) {
    console.error("obterAccessToken: nenhum refresh_token encontrado para", userId);
    return null;
  }

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const json = await resp.json();
  if (!resp.ok) {
    console.error("obterAccessToken: falhou renovar token junto ao Google", json);
    return null;
  }
  return json.access_token;
}
