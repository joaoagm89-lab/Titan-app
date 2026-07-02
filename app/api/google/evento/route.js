import { NextResponse } from "next/server";
import { obterUsuarioAutenticado, obterAccessToken } from "../../../lib/googleAuth";

export async function POST(request) {
  const user = await obterUsuarioAutenticado(request);
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const accessToken = await obterAccessToken(user.id);
  if (!accessToken) return NextResponse.json({ error: "google não conectado" }, { status: 400 });

  const { data, hora, texto, googleEventId, duracaoMinutos } = await request.json();

  let evento;
  if (hora) {
    const inicio = `${data}T${hora}:00`;
    const fimData = new Date(`${data}T${hora}:00`);
    fimData.setMinutes(fimData.getMinutes() + (parseInt(duracaoMinutos) || 30));
    evento = {
      summary: texto,
      start: { dateTime: inicio, timeZone: "America/Sao_Paulo" },
      end: { dateTime: fimData.toISOString().slice(0, 19), timeZone: "America/Sao_Paulo" },
    };
  } else {
    const fim = new Date(data + "T00:00:00");
    fim.setDate(fim.getDate() + 1);
    evento = {
      summary: texto,
      start: { date: data },
      end: { date: fim.toISOString().slice(0, 10) },
    };
  }

  const url = googleEventId
    ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`
    : `https://www.googleapis.com/calendar/v3/calendars/primary/events`;
  const method = googleEventId ? "PATCH" : "POST";

  const resp = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(evento),
  });
  const json = await resp.json();
  if (!resp.ok) return NextResponse.json({ error: json }, { status: 400 });

  return NextResponse.json({ googleEventId: json.id });
}

export async function DELETE(request) {
  const user = await obterUsuarioAutenticado(request);
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const accessToken = await obterAccessToken(user.id);
  if (!accessToken) return NextResponse.json({ error: "google não conectado" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const googleEventId = searchParams.get("id");
  if (!googleEventId) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return NextResponse.json({ ok: true });
}
