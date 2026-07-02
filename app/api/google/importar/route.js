import { NextResponse } from "next/server";
import { obterUsuarioAutenticado, obterAccessToken } from "../../../lib/googleAuth";

export async function GET(request) {
  const user = await obterUsuarioAutenticado(request);
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const accessToken = await obterAccessToken(user.id);
  if (!accessToken) return NextResponse.json({ error: "google não conectado" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", `${inicio}T00:00:00Z`);
  url.searchParams.set("timeMax", `${fim}T23:59:59Z`);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await resp.json();
  if (!resp.ok) return NextResponse.json({ error: json }, { status: 400 });

  const eventos = (json.items || []).map((e) => ({
    googleEventId: e.id,
    texto: e.summary || "(sem título)",
    data: (e.start.dateTime || e.start.date).slice(0, 10),
    horario: e.start.dateTime ? e.start.dateTime.slice(11, 16) : "",
  }));

  return NextResponse.json({ eventos });
}
