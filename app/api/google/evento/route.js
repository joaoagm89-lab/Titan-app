import { NextResponse } from "next/server";
import { obterUsuarioAutenticado, obterAccessToken } from "../../../lib/googleAuth";

function somarMinutosHora(horaStr, minutos) {
  const [h, m] = horaStr.split(":").map(Number);
  const totalMin = h * 60 + m + minutos;
  const diaExtra = Math.floor(totalMin / 1440);
  const minutosNoDia = ((totalMin % 1440) + 1440) % 1440;
  const hh = Math.floor(minutosNoDia / 60);
  const mm = minutosNoDia % 60;
  return { hora: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`, diaExtra };
}

function somarDiasSimples(dataIso, dias) {
  const [y, m, d] = dataIso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + dias);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export async function POST(request) {
  const user = await obterUsuarioAutenticado(request);
  if (!user) {
    console.error("Evento Google: usuário não autenticado");
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const accessToken = await obterAccessToken(user.id);
  if (!accessToken) {
    console.error("Evento Google: não conseguiu obter access token para", user.id);
    return NextResponse.json({ error: "google não conectado" }, { status: 400 });
  }

  const { data, hora, texto, googleEventId, duracaoMinutos } = await request.json();

  let evento;
  if (hora) {
    const inicio = `${data}T${hora}:00-03:00`;
    const { hora: horaFim, diaExtra } = somarMinutosHora(hora, parseInt(duracaoMinutos) || 30);
    const dataFim = diaExtra > 0 ? somarDiasSimples(data, diaExtra) : data;
    const fim = `${dataFim}T${horaFim}:00-03:00`;
    evento = {
      summary: texto,
      start: { dateTime: inicio, timeZone: "America/Sao_Paulo" },
      end: { dateTime: fim, timeZone: "America/Sao_Paulo" },
    };
  } else {
    const fim = somarDiasSimples(data, 1);
    evento = {
      summary: texto,
      start: { date: data },
      end: { date: fim },
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
  if (!resp.ok) {
    console.error("Evento Google: falhou criar/atualizar evento", json);
    return NextResponse.json({ error: json }, { status: 400 });
  }

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
