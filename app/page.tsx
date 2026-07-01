"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";

const TIPOS_ATIVIDADE = [
  "Musculação", "Corrida", "Caminhada", "Ciclismo", "Natação", "Yoga",
  "Pilates", "Funcional", "Crossfit", "HIIT", "Futebol", "Vôlei",
  "Basquete", "Tênis", "Jiu-jitsu", "Muay Thai", "Boxe", "Dança",
  "Alongamento", "Escalada", "Outro",
];

const MET_POR_ATIVIDADE = {
  "Musculação": 5.0, "Corrida": 9.8, "Caminhada": 3.5, "Ciclismo": 7.5,
  "Natação": 6.0, "Yoga": 2.5, "Pilates": 3.0, "Funcional": 5.0,
  "Crossfit": 8.0, "HIIT": 8.0, "Futebol": 7.0, "Vôlei": 4.0,
  "Basquete": 6.5, "Tênis": 7.3, "Jiu-jitsu": 10.0, "Muay Thai": 10.0,
  "Boxe": 9.0, "Dança": 4.8, "Alongamento": 2.3, "Escalada": 8.0, "Outro": 5.0,
};

const CORES_GRAFICO = ["#534AB7", "#0F6E56", "#993C1D", "#993556", "#5F5E5A", "#185FA5", "#3B6D11", "#854F0B"];

const NIVEIS = [
  { nivel: 1, nome: "Iniciante", xpNecessario: 0 },
  { nivel: 2, nome: "Disciplinado", xpNecessario: 200 },
  { nivel: 3, nome: "Consistente", xpNecessario: 500 },
  { nivel: 4, nome: "Forte", xpNecessario: 900 },
  { nivel: 5, nome: "Titan", xpNecessario: 1400 },
];

const XP_NAO_FUMAR = 40;
const XP_ATIVIDADE = 30;
const XP_SONO_META = 15;

const REGISTRO_PADRAO = {
  fumei: null,
  atividadeFisica: { feita: false, tipo: "", minutos: "" },
  horaDormiu: "",
  gastos: [],
  investimentos: [],
  humorPercent: 70,
  notaHumor: "",
  peso: "",
  aguaCopos: 0,
  refeicoes: [],
  saudeFisicaPercent: 70,
  trabalho: { aprendeu: false, leu: false, produtivo: false },
  notaAprendizado: "",
  notaRelacionamento: "",
};

const METAS_PADRAO = {
  gastoDiario: "",
  investimentoMensal: "",
  horaDormirMeta: "22:00",
  pesoMeta: "",
};

function hojeISO() { return new Date().toISOString().slice(0, 10); }
function somarDias(iso, delta) {
  const dt = new Date(iso + "T00:00:00");
  dt.setDate(dt.getDate() + delta);
  return dt.toISOString().slice(0, 10);
}
function formatarData(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function mesDoIso(iso) { return iso.slice(0, 7); }
function nomeMes(mesIso) {
  const [y, m] = mesIso.split("-");
  const nomes = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  return `${nomes[parseInt(m) - 1]}/${y.slice(2)}`;
}
function nomeMesCompleto(mesIso) {
  const [y, m] = mesIso.split("-");
  const nomes = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${nomes[parseInt(m) - 1]} de ${y}`;
}
function calcularNivel(xp) {
  let atual = NIVEIS[0];
  for (const n of NIVEIS) if (xp >= n.xpNecessario) atual = n;
  const proximo = NIVEIS.find((n) => n.xpNecessario > xp);
  return { atual, proximo };
}
function dormiuNaMeta(horaDormiu, meta) {
  if (!horaDormiu || !meta) return false;
  return horaDormiu <= meta;
}
function calcularCalorias(tipo, minutos, pesoKg) {
  const met = MET_POR_ATIVIDADE[tipo] || MET_POR_ATIVIDADE["Outro"];
  const peso = pesoKg || 75;
  const horas = (parseFloat(minutos) || 0) / 60;
  return Math.round(met * peso * horas);
}
function calcularMelhorStreak(dadosPorDia) {
  const datas = Object.keys(dadosPorDia).sort();
  let melhor = 0, atual = 0, anterior = null;
  for (const iso of datas) {
    const reg = dadosPorDia[iso];
    if (reg.fumei === false) {
      atual = (anterior && somarDias(anterior, 1) === iso) ? atual + 1 : 1;
      melhor = Math.max(melhor, atual);
      anterior = iso;
    } else {
      atual = 0;
      anterior = null;
    }
  }
  return melhor;
}

export default function Home() {
  const [perfil, setPerfil] = useState(null);
  const [dadosPorDia, setDadosPorDia] = useState({});
  const [metas, setMetas] = useState(METAS_PADRAO);
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [aba, setAba] = useState("hoje");
  const [carregado, setCarregado] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("titan-data-v3");
    if (salvo) {
      const d = JSON.parse(salvo);
      setPerfil(d.perfil ?? null);
      setDadosPorDia(d.dadosPorDia ?? {});
      setMetas({ ...METAS_PADRAO, ...(d.metas ?? {}) });
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    localStorage.setItem("titan-data-v3", JSON.stringify({ perfil, dadosPorDia, metas }));
  }, [perfil, dadosPorDia, metas, carregado]);

  if (!carregado) return null;
  if (!perfil) return <Onboarding onSalvar={setPerfil} />;

  function mesclarRegistro(bruto) {
    return {
      ...REGISTRO_PADRAO,
      ...bruto,
      atividadeFisica: { ...REGISTRO_PADRAO.atividadeFisica, ...(bruto?.atividadeFisica) },
      trabalho: { ...REGISTRO_PADRAO.trabalho, ...(bruto?.trabalho) },
    };
  }

  const registro = mesclarRegistro(dadosPorDia[dataSelecionada]);

  function atualizarRegistro(atualizador) {
    setDadosPorDia((prev) => ({
      ...prev,
      [dataSelecionada]: atualizador(mesclarRegistro(prev[dataSelecionada])),
    }));
  }
  function atualizarMetas(atualizador) { setMetas((prev) => atualizador(prev)); }

  const datasExistentes = Object.keys(dadosPorDia).sort();
  const dataLimite = perfil.dataCadastro || datasExistentes[0] || hojeISO();

  const streak = calcularStreak(dadosPorDia, hojeISO());
  const xpTotal = calcularXpTotal(dadosPorDia, metas);
  const { atual: nivelAtual, proximo: proximoNivel } = calcularNivel(xpTotal);

  const TABS = [
    { id: "hoje", label: "Hoje", icone: "🏠" },
    { id: "financas", label: "Finanças", icone: "💰" },
    { id: "saude", label: "Saúde", icone: "❤️" },
    { id: "vida", label: "Vida", icone: "🧭" },
    { id: "metas", label: "Metas", icone: "🎯" },
    { id: "relatorios", label: "Relatórios", icone: "📊" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-24">
      <div className="max-w-md mx-auto px-5 py-8">
        <SeletorData dataSelecionada={dataSelecionada} setDataSelecionada={setDataSelecionada} dataLimite={dataLimite} />

        {aba === "hoje" && (
          <TabHoje
            perfil={perfil}
            registro={registro}
            atualizarRegistro={atualizarRegistro}
            metas={metas}
            streak={streak}
            xpTotal={xpTotal}
            nivelAtual={nivelAtual}
            proximoNivel={proximoNivel}
            onEditarPerfil={() => setEditandoPerfil(true)}
          />
        )}
        {aba === "financas" && (
          <TabFinancas registro={registro} atualizarRegistro={atualizarRegistro} metas={metas} atualizarMetas={atualizarMetas} />
        )}
        {aba === "saude" && (
          <TabSaude registro={registro} atualizarRegistro={atualizarRegistro} metas={metas} atualizarMetas={atualizarMetas} />
        )}
        {aba === "vida" && <TabVida registro={registro} atualizarRegistro={atualizarRegistro} />}
        {aba === "metas" && (
          <TabMetas dadosPorDia={dadosPorDia} metas={metas} atualizarMetas={atualizarMetas} registro={registro} />
        )}
        {aba === "relatorios" && <TabRelatorios dadosPorDia={dadosPorDia} metas={metas} xpTotal={xpTotal} />}
      </div>

      {editandoPerfil && (
        <EditarPerfilModal perfil={perfil} onSalvar={(p) => { setPerfil(p); setEditandoPerfil(false); }} onCancelar={() => setEditandoPerfil(false)} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto grid grid-cols-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] transition ${
                aba === tab.id ? "text-neutral-900 font-semibold" : "text-neutral-400"
              }`}
            >
              <span className={`text-base ${aba === tab.id ? "scale-110" : ""}`}>{tab.icone}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

function calcularStreak(dadosPorDia, hojeIso) {
  const datas = Object.keys(dadosPorDia).sort();
  if (datas.length === 0) return 0;
  const primeiroDia = datas[0];
  let streak = 0;
  let cursor = hojeIso;
  while (cursor >= primeiroDia) {
    const reg = dadosPorDia[cursor];
    if (!reg || reg.fumei !== false) break;
    streak++;
    cursor = somarDias(cursor, -1);
  }
  return streak;
}

function calcularXpTotal(dadosPorDia, metas) {
  let total = 0;
  for (const iso in dadosPorDia) {
    const reg = dadosPorDia[iso];
    if (reg.fumei === false) total += XP_NAO_FUMAR;
    if (reg.atividadeFisica?.feita) total += XP_ATIVIDADE;
    if (dormiuNaMeta(reg.horaDormiu, metas.horaDormirMeta)) total += XP_SONO_META;
  }
  return total;
}

function Onboarding({ onSalvar }) {
  const [form, setForm] = useState({ nome: "", idade: "", peso: "", sexo: "" });
  function salvar() {
    if (!form.nome || !form.idade || !form.peso || !form.sexo) return;
    onSalvar({ ...form, dataCadastro: hojeISO() });
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Bem-vindo ao Titan</h1>
        <p className="text-sm text-neutral-500 mb-6">Antes de começar, conta um pouco sobre você.</p>
        <div className="space-y-3">
          <input placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Idade" type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Peso inicial (kg)" type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <select value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-700">
            <option value="">Sexo</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <button onClick={salvar} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 text-sm font-semibold mt-6">Começar</button>
      </div>
    </main>
  );
}

function EditarPerfilModal({ perfil, onSalvar, onCancelar }) {
  const [form, setForm] = useState(perfil);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-lg text-neutral-900 mb-4">Editar perfil</h3>
        <div className="space-y-3">
          <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Idade" type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Peso (kg)" type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <select value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-700">
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancelar} className="flex-1 border border-neutral-200 rounded-xl py-2 text-sm">Cancelar</button>
          <button onClick={() => onSalvar(form)} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-2 text-sm font-medium">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function SeletorData({ dataSelecionada, setDataSelecionada, dataLimite }) {
  const ehHoje = dataSelecionada === hojeISO();
  const ehLimite = dataSelecionada <= dataLimite;
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => !ehLimite && setDataSelecionada(somarDias(dataSelecionada, -1))}
        disabled={ehLimite}
        className={`w-9 h-9 rounded-full border bg-white shadow-sm ${ehLimite ? "border-neutral-100 text-neutral-200" : "border-neutral-200 text-neutral-500"}`}
      >
        ←
      </button>
      <div className="text-center">
        <p className="font-semibold text-neutral-900">{formatarData(dataSelecionada)}</p>
        {!ehHoje && <p className="text-xs text-amber-600">editando dia passado</p>}
      </div>
      <button onClick={() => !ehHoje && setDataSelecionada(somarDias(dataSelecionada, 1))} disabled={ehHoje} className={`w-9 h-9 rounded-full border bg-white shadow-sm ${ehHoje ? "border-neutral-100 text-neutral-200" : "border-neutral-200 text-neutral-500"}`}>→</button>
    </div>
  );
}

function Cartao({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 ${className}`}>{children}</div>;
}
function BarraPercentual({ valor, cor = "bg-neutral-900" }) {
  return (
    <div className="w-full bg-neutral-100 rounded-full h-2">
      <div className={`${cor} h-2 rounded-full transition-all duration-300`} style={{ width: `${Math.min(100, valor)}%` }} />
    </div>
  );
}
function Hero({ children, className = "" }) {
  return <div className={`mt-6 rounded-3xl text-white p-6 shadow-lg ${className}`}>{children}</div>;
}

function TabHoje({ perfil, registro, atualizarRegistro, metas, streak, xpTotal, nivelAtual, proximoNivel, onEditarPerfil }) {
  const progresso = proximoNivel
    ? Math.round(((xpTotal - nivelAtual.xpNecessario) / (proximoNivel.xpNecessario - nivelAtual.xpNecessario)) * 100)
    : 100;
  const sonoOk = dormiuNaMeta(registro.horaDormiu, metas.horaDormirMeta);
  const rotinaPercent = Math.round((((registro.atividadeFisica.feita ? 1 : 0) + (sonoOk ? 1 : 0)) / 2) * 100);
  const trabalhoChecks = Object.values(registro.trabalho).filter(Boolean).length;
  const trabalhoPercent = Math.round((trabalhoChecks / 3) * 100);
  const relacionamentoPercent = registro.notaRelacionamento.trim() ? 100 : 0;
  const pesoRef = parseFloat(registro.peso) || parseFloat(perfil.peso) || 75;
  const calorias = registro.atividadeFisica.feita ? calcularCalorias(registro.atividadeFisica.tipo, registro.atividadeFisica.minutos, pesoRef) : 0;

  const dadosResumo = [
    { nome: "Rotina", valor: rotinaPercent },
    { nome: "Mental", valor: registro.humorPercent },
    { nome: "Física", valor: registro.saudeFisicaPercent },
    { nome: "Trabalho", valor: trabalhoPercent },
    { nome: "Relação", valor: relacionamentoPercent },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400">Olá</p>
          <h1 className="text-2xl font-bold mt-1 text-neutral-900">{perfil.nome}</h1>
        </div>
        <button onClick={onEditarPerfil} className="w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-sm text-neutral-400">✏️</button>
      </div>

      <Hero className="bg-gradient-to-br from-orange-500 to-red-500">
        <p className="text-sm font-medium opacity-90 mb-3">🚭 Cigarro</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => atualizarRegistro((r) => ({ ...r, fumei: false }))} className={`rounded-xl py-3 text-sm font-semibold border-2 ${registro.fumei === false ? "bg-white text-orange-600 border-white" : "border-white/40 text-white"}`}>Não fumei</button>
          <button onClick={() => atualizarRegistro((r) => ({ ...r, fumei: true }))} className={`rounded-xl py-3 text-sm font-semibold border-2 ${registro.fumei === true ? "bg-white text-red-600 border-white" : "border-white/40 text-white"}`}>Fumei</button>
        </div>
        <p className="text-xs opacity-90 mt-3">🔥 Sequência sem fumar: {streak} dias</p>
      </Hero>

      <Hero className="bg-gradient-to-br from-neutral-900 to-neutral-700">
        <p className="text-sm opacity-60">Nível {nivelAtual.nivel}</p>
        <p className="text-xl font-bold">{nivelAtual.nome}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>{xpTotal} XP</span>
            <span>{proximoNivel ? `próximo: ${proximoNivel.xpNecessario}` : "nível máximo"}</span>
          </div>
          <div className="w-full bg-white/15 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </Hero>

      <div className="mt-8">
        <h2 className="font-bold text-neutral-900 mb-3">Rotina do dia</h2>

        <Cartao>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">🏋️ Atividade física</span>
            <button onClick={() => atualizarRegistro((r) => ({ ...r, atividadeFisica: { ...r.atividadeFisica, feita: !r.atividadeFisica.feita } }))} className={`text-xs px-3 py-1.5 rounded-full font-medium ${registro.atividadeFisica.feita ? "bg-emerald-500 text-white" : "border border-neutral-200 text-neutral-500"}`}>
              {registro.atividadeFisica.feita ? "Feita ✓" : "Marcar"}
            </button>
          </div>
          {registro.atividadeFisica.feita && (
            <div className="mt-3 space-y-2">
              <select value={registro.atividadeFisica.tipo} onChange={(e) => atualizarRegistro((r) => ({ ...r, atividadeFisica: { ...r.atividadeFisica, tipo: e.target.value } }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm">
                <option value="">Qual atividade?</option>
                {TIPOS_ATIVIDADE.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" placeholder="Duração (minutos)" value={registro.atividadeFisica.minutos} onChange={(e) => atualizarRegistro((r) => ({ ...r, atividadeFisica: { ...r.atividadeFisica, minutos: e.target.value } }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
              {registro.atividadeFisica.tipo && registro.atividadeFisica.minutos && (
                <p className="text-xs text-emerald-600 font-medium">🔥 ~{calorias} kcal estimadas (baseado em tabela MET padrão)</p>
              )}
            </div>
          )}
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">😴 Horário que dormiu</span>
            <span className={`text-xs font-semibold ${sonoOk ? "text-emerald-600" : "text-neutral-400"}`}>
              {registro.horaDormiu ? (sonoOk ? "dentro da meta" : "fora da meta") : ""}
            </span>
          </div>
          <input type="time" value={registro.horaDormiu} onChange={(e) => atualizarRegistro((r) => ({ ...r, horaDormiu: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          <p className="text-xs text-neutral-400 mt-2">Meta: {metas.horaDormirMeta || "não definida"}</p>
        </Cartao>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-neutral-900 mb-3">Resumo do dia</h2>
        <Cartao className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosResumo} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 12, fill: "#525252" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip />
              <Bar dataKey="valor" fill="#534AB7" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Cartao>
        <div className="flex justify-between text-xs text-neutral-500 mt-3 px-1">
          <span>💧 {(registro.aguaCopos * 0.25).toFixed(2)} L</span>
          <span>💰 R$ {registro.gastos.reduce((s, g) => s + g.valor, 0).toFixed(2).replace(".", ",")}</span>
          <span>🍽 {registro.refeicoes.reduce((s, r) => s + r.kcal, 0)} kcal</span>
          <span>🔥 {calorias} kcal</span>
        </div>
      </div>
    </>
  );
}

function TabFinancas({ registro, atualizarRegistro, metas, atualizarMetas }) {
  const [novoGasto, setNovoGasto] = useState({ desc: "", valor: "" });
  const [novoInvest, setNovoInvest] = useState({ valor: "" });
  const totalGasto = registro.gastos.reduce((s, g) => s + g.valor, 0);
  const totalInvestido = registro.investimentos.reduce((s, i) => s + i.valor, 0);
  const meta = parseFloat(metas.gastoDiario) || 0;
  const dentroDaMeta = meta > 0 ? totalGasto <= meta : null;

  function adicionarGasto() {
    if (!novoGasto.desc || !novoGasto.valor) return;
    atualizarRegistro((r) => ({ ...r, gastos: [...r.gastos, { id: Date.now(), desc: novoGasto.desc, valor: parseFloat(novoGasto.valor) }] }));
    setNovoGasto({ desc: "", valor: "" });
  }
  function removerGasto(id) { atualizarRegistro((r) => ({ ...r, gastos: r.gastos.filter((g) => g.id !== id) })); }
  function adicionarInvestimento() {
    if (!novoInvest.valor) return;
    atualizarRegistro((r) => ({ ...r, investimentos: [...r.investimentos, { id: Date.now(), valor: parseFloat(novoInvest.valor) }] }));
    setNovoInvest({ valor: "" });
  }
  function removerInvestimento(id) { atualizarRegistro((r) => ({ ...r, investimentos: r.investimentos.filter((i) => i.id !== id) })); }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Finanças</h1>

      <Hero className="bg-gradient-to-br from-emerald-600 to-teal-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Total gasto neste dia</p>
            <p className="text-3xl font-bold mt-1">R$ {totalGasto.toFixed(2).replace(".", ",")}</p>
          </div>
          {dentroDaMeta !== null && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${dentroDaMeta ? "bg-white/20" : "bg-red-900/30"}`}>
              {dentroDaMeta ? "dentro da meta" : "acima da meta"}
            </span>
          )}
        </div>
        <p className="text-xs opacity-70 mt-2">Meta diária: R$ {meta ? meta.toFixed(2).replace(".", ",") : "não definida"}</p>
      </Hero>

      <Cartao className="mt-4">
        <p className="text-xs font-medium text-neutral-700 mb-2">Definir meta de gasto diário</p>
        <input type="number" placeholder="ex: 50.00" value={metas.gastoDiario} onChange={(e) => atualizarMetas((m) => ({ ...m, gastoDiario: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
      </Cartao>

      <Cartao className="mt-6">
        <p className="text-sm font-medium text-neutral-700 mb-3">Adicionar gasto</p>
        <input placeholder="Com o que? (ex: almoço)" value={novoGasto.desc} onChange={(e) => setNovoGasto({ ...novoGasto, desc: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mb-2" />
        <input placeholder="Valor (ex: 35.90)" type="number" value={novoGasto.valor} onChange={(e) => setNovoGasto({ ...novoGasto, valor: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mb-3" />
        <button onClick={adicionarGasto} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl py-2 text-sm font-semibold">Adicionar</button>
      </Cartao>

      <div className="mt-4 space-y-2">
        {registro.gastos.map((g) => (
          <div key={g.id} className="flex items-center justify-between bg-white rounded-xl border border-neutral-100 p-3 shadow-sm">
            <span className="text-sm text-neutral-700">{g.desc}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">R$ {g.valor.toFixed(2).replace(".", ",")}</span>
              <button onClick={() => removerGasto(g.id)} className="text-neutral-300 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-neutral-900 mb-3">Investimento do dia</h2>
        <Cartao>
          <p className="text-2xl font-bold text-emerald-600 mb-3">R$ {totalInvestido.toFixed(2).replace(".", ",")}</p>
          <div className="flex gap-2">
            <input placeholder="Quanto investiu?" type="number" value={novoInvest.valor} onChange={(e) => setNovoInvest({ valor: e.target.value })} className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
            <button onClick={adicionarInvestimento} className="bg-emerald-600 text-white rounded-xl px-4 text-sm font-medium">Add</button>
          </div>
          <div className="space-y-2 mt-3">
            {registro.investimentos.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Aporte</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-medium">R$ {i.valor.toFixed(2).replace(".", ",")}</span>
                  <button onClick={() => removerInvestimento(i.id)} className="text-neutral-300">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </>
  );
}

function TabSaude({ registro, atualizarRegistro, metas, atualizarMetas }) {
  const [novaRefeicao, setNovaRefeicao] = useState({ nome: "", kcal: "" });
  const totalCalorias = registro.refeicoes.reduce((s, r) => s + r.kcal, 0);
  const pesoAtual = parseFloat(registro.peso) || null;
  const pesoMeta = parseFloat(metas.pesoMeta) || null;
  const diferenca = pesoAtual !== null && pesoMeta !== null ? (pesoAtual - pesoMeta) : null;

  function adicionarRefeicao() {
    if (!novaRefeicao.nome || !novaRefeicao.kcal) return;
    atualizarRegistro((r) => ({ ...r, refeicoes: [...r.refeicoes, { id: Date.now(), nome: novaRefeicao.nome, kcal: parseFloat(novaRefeicao.kcal) }] }));
    setNovaRefeicao({ nome: "", kcal: "" });
  }
  function removerRefeicao(id) { atualizarRegistro((r) => ({ ...r, refeicoes: r.refeicoes.filter((x) => x.id !== id) })); }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Saúde</h1>

      <Hero className="bg-gradient-to-br from-rose-500 to-pink-500">
        <p className="text-sm opacity-90">Mental & física</p>
        <p className="text-xl font-bold mt-1">Como você está hoje?</p>
      </Hero>

      <div className="mt-6">
        <h2 className="font-bold text-neutral-900 mb-3">Mental</h2>
        <Cartao>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">Como você está se sentindo</span>
            <span className="text-sm font-semibold text-rose-600">{registro.humorPercent}%</span>
          </div>
          <input type="range" min="0" max="100" value={registro.humorPercent} onChange={(e) => atualizarRegistro((r) => ({ ...r, humorPercent: parseInt(e.target.value) }))} className="w-full" />
          <textarea placeholder="Escreva livremente sobre o seu dia..." value={registro.notaHumor} onChange={(e) => atualizarRegistro((r) => ({ ...r, notaHumor: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mt-3 h-24 resize-none" />
        </Cartao>
      </div>

      <div className="mt-6">
        <h2 className="font-bold text-neutral-900 mb-3">Física</h2>
        <Cartao>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">Como está sua saúde física</span>
            <span className="text-sm font-semibold text-pink-600">{registro.saudeFisicaPercent}%</span>
          </div>
          <input type="range" min="0" max="100" value={registro.saudeFisicaPercent} onChange={(e) => atualizarRegistro((r) => ({ ...r, saudeFisicaPercent: parseInt(e.target.value) }))} className="w-full" />
        </Cartao>

        <Cartao className="mt-3">
          <p className="text-sm font-medium text-neutral-700 mb-2">Peso</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Atual (kg)</p>
              <input type="number" placeholder="ex: 78.5" value={registro.peso} onChange={(e) => atualizarRegistro((r) => ({ ...r, peso: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Meta (kg)</p>
              <input type="number" placeholder="ex: 75" value={metas.pesoMeta} onChange={(e) => atualizarMetas((m) => ({ ...m, pesoMeta: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
          {diferenca !== null && (
            <p className={`text-xs mt-1 font-medium ${diferenca <= 0 ? "text-emerald-600" : "text-neutral-500"}`}>
              {diferenca <= 0 ? "Meta atingida!" : `Faltam ${diferenca.toFixed(1)} kg para a meta`}
            </p>
          )}
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-neutral-700">💧 Água</p>
            <span className="text-sm text-neutral-500">{(registro.aguaCopos * 0.25).toFixed(2)} L</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => atualizarRegistro((r) => ({ ...r, aguaCopos: Math.max(0, r.aguaCopos - 1) }))} className="w-10 h-10 rounded-full border border-neutral-200 text-neutral-500">−</button>
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-600">{registro.aguaCopos} copos (250ml)</div>
            <button onClick={() => atualizarRegistro((r) => ({ ...r, aguaCopos: r.aguaCopos + 1 }))} className="w-10 h-10 rounded-full border border-neutral-200 text-neutral-500">+</button>
          </div>
        </Cartao>

        <Cartao className="mt-3">
          <p className="text-sm font-medium text-neutral-700 mb-2">🍽 Alimentação</p>
          <p className="text-2xl font-bold text-neutral-900 mb-3">{totalCalorias} kcal</p>
          <div className="flex gap-2 mb-3">
            <input placeholder="Alimento" value={novaRefeicao.nome} onChange={(e) => setNovaRefeicao({ ...novaRefeicao, nome: e.target.value })} className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
            <input placeholder="kcal" type="number" value={novaRefeicao.kcal} onChange={(e) => setNovaRefeicao({ ...novaRefeicao, kcal: e.target.value })} className="w-20 border border-neutral-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <button onClick={adicionarRefeicao} className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl py-2 text-sm font-semibold mb-3">Adicionar</button>
          <div className="space-y-2">
            {registro.refeicoes.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">{r.nome}</span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500">{r.kcal} kcal</span>
                  <button onClick={() => removerRefeicao(r.id)} className="text-neutral-300">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </>
  );
}

function TabVida({ registro, atualizarRegistro }) {
  const trabalhoChecks = Object.values(registro.trabalho).filter(Boolean).length;
  const trabalhoPercent = Math.round((trabalhoChecks / 3) * 100);
  function toggleTrabalho(campo) { atualizarRegistro((r) => ({ ...r, trabalho: { ...r.trabalho, [campo]: !r.trabalho[campo] } })); }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Vida</h1>

      <Hero className="bg-gradient-to-br from-indigo-600 to-blue-500">
        <p className="text-sm opacity-90">Trabalho & relacionamento</p>
        <p className="text-xl font-bold mt-1">O que construiu hoje?</p>
      </Hero>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-neutral-900">💼 Trabalho</h2>
          <span className="text-sm font-semibold text-blue-600">{trabalhoPercent}%</span>
        </div>
        <BarraPercentual valor={trabalhoPercent} cor="bg-blue-500" />
        <div className="space-y-2 mt-3">
          <ChecklistItem label="Aprendi algo novo" checado={registro.trabalho.aprendeu} onClick={() => toggleTrabalho("aprendeu")} cor="bg-blue-600" />
          <ChecklistItem label="Li algum livro" checado={registro.trabalho.leu} onClick={() => toggleTrabalho("leu")} cor="bg-blue-600" />
          <ChecklistItem label="Fui produtivo" checado={registro.trabalho.produtivo} onClick={() => toggleTrabalho("produtivo")} cor="bg-blue-600" />
        </div>
        <Cartao className="mt-3">
          <p className="text-sm font-medium text-neutral-700 mb-2">O que você aprendeu hoje?</p>
          <textarea placeholder="Compartilhe algo novo que aprendeu..." value={registro.notaAprendizado} onChange={(e) => atualizarRegistro((r) => ({ ...r, notaAprendizado: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm h-24 resize-none" />
        </Cartao>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-neutral-900 mb-3">💜 Relacionamento</h2>
        <Cartao>
          <p className="text-sm font-medium text-neutral-700 mb-2">Como foi seu dia com sua esposa?</p>
          <textarea placeholder="Escreva livremente..." value={registro.notaRelacionamento} onChange={(e) => atualizarRegistro((r) => ({ ...r, notaRelacionamento: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm h-28 resize-none" />
        </Cartao>
      </div>
    </>
  );
}

function ChecklistItem({ label, checado, onClick, cor = "bg-neutral-900" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${checado ? `${cor} text-white border-transparent` : "border-neutral-100 bg-white hover:border-neutral-300"}`}>
      <span className="flex items-center gap-3">
        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${checado ? "border-white" : "border-neutral-300"}`}>{checado ? "✓" : ""}</span>
        {label}
      </span>
    </button>
  );
}

function TabMetas({ dadosPorDia, metas, atualizarMetas, registro }) {
  const mesAtual = mesDoIso(hojeISO());
  const registrosDoMes = Object.entries(dadosPorDia).filter(([iso]) => mesDoIso(iso) === mesAtual).map(([, r]) => r);
  const totalInvestidoMes = registrosDoMes.reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
  const metaInvest = parseFloat(metas.investimentoMensal) || 0;
  const progressoInvest = metaInvest > 0 ? Math.round((totalInvestidoMes / metaInvest) * 100) : 0;
  const diasComSonoOk = registrosDoMes.filter((r) => dormiuNaMeta(r.horaDormiu, metas.horaDormirMeta)).length;
  const pesoAtual = parseFloat(registro.peso) || null;
  const pesoMeta = parseFloat(metas.pesoMeta) || null;

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Metas</h1>
      <Hero className="bg-gradient-to-br from-amber-500 to-orange-500">
        <p className="text-sm opacity-90 capitalize">{nomeMesCompleto(mesAtual)}</p>
        <p className="text-xl font-bold mt-1">Acompanhe seu progresso</p>
      </Hero>

      <Cartao className="mt-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">💰 Meta de investimento mensal</p>
        <input type="number" placeholder="ex: 500.00" value={metas.investimentoMensal} onChange={(e) => atualizarMetas((m) => ({ ...m, investimentoMensal: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mb-3" />
        <div className="flex justify-between text-sm mb-1">
          <span className="text-neutral-500">R$ {totalInvestidoMes.toFixed(2).replace(".", ",")}</span>
          <span className="text-neutral-400">meta R$ {metaInvest.toFixed(2).replace(".", ",")}</span>
        </div>
        <BarraPercentual valor={progressoInvest} cor="bg-emerald-500" />
        <p className="text-xs text-neutral-400 mt-2">{progressoInvest}% da meta do mês</p>
      </Cartao>

      <Cartao className="mt-4">
        <p className="text-sm font-medium text-neutral-700 mb-2">😴 Meta de horário de sono</p>
        <input type="time" value={metas.horaDormirMeta} onChange={(e) => atualizarMetas((m) => ({ ...m, horaDormirMeta: e.target.value }))} className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mb-2" />
        <p className="text-xs text-neutral-400">Este mês: {diasComSonoOk} dia(s) dentro da meta</p>
      </Cartao>

      <Cartao className="mt-4">
        <p className="text-sm font-medium text-neutral-700 mb-2">⚖️ Meta de peso</p>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Atual: {pesoAtual ?? "—"} kg</span>
          <span className="text-neutral-400">Meta: {pesoMeta ?? "—"} kg</span>
        </div>
      </Cartao>

      <Cartao className="mt-4">
        <p className="text-sm font-medium text-neutral-700 mb-2">🎯 Meta de gasto diário</p>
        <p className="text-sm text-neutral-500">R$ {(parseFloat(metas.gastoDiario) || 0).toFixed(2).replace(".", ",")} por dia — edite na aba Finanças</p>
      </Cartao>
    </>
  );
}

function TabRelatorios({ dadosPorDia, metas, xpTotal }) {
  const [modo, setModo] = useState("mensal");
  const datasOrdenadas = Object.keys(dadosPorDia).sort().reverse();

  const meses = {};
  for (const iso of Object.keys(dadosPorDia)) {
    const chave = mesDoIso(iso);
    if (!meses[chave]) meses[chave] = [];
    meses[chave].push(dadosPorDia[iso]);
  }
  const mesesOrdenados = Object.keys(meses).sort();

  const dadosGraficoMensal = mesesOrdenados.map((chave) => {
    const registros = meses[chave];
    const n = registros.length;
    const gastoTotal = registros.reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
    const investidoTotal = registros.reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
    const humorMedio = Math.round(registros.reduce((s, r) => s + (r.humorPercent || 0), 0) / n);
    const fisicaMedia = Math.round(registros.reduce((s, r) => s + (r.saudeFisicaPercent || 0), 0) / n);
    return { mes: nomeMes(chave), Gasto: Math.round(gastoTotal), Investido: Math.round(investidoTotal), Humor: humorMedio, Fisica: fisicaMedia };
  });

  const totalGastoGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
  const totalInvestidoGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
  const melhorStreak = calcularMelhorStreak(dadosPorDia);

  const contagemAtividades = {};
  for (const r of Object.values(dadosPorDia)) {
    if (r.atividadeFisica?.feita && r.atividadeFisica.tipo) {
      contagemAtividades[r.atividadeFisica.tipo] = (contagemAtividades[r.atividadeFisica.tipo] || 0) + 1;
    }
  }
  const dadosPizza = Object.entries(contagemAtividades).map(([nome, valor]) => ({ nome, valor }));

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Relatórios</h1>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white p-4">
          <p className="text-xs opacity-80">XP total</p>
          <p className="text-2xl font-bold mt-1">{xpTotal}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white p-4">
          <p className="text-xs opacity-80">Melhor sequência</p>
          <p className="text-2xl font-bold mt-1">{melhorStreak}d</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white p-4">
          <p className="text-xs opacity-80">Investido (total)</p>
          <p className="text-lg font-bold mt-1">R$ {totalInvestidoGeral.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white p-4">
          <p className="text-xs opacity-80">Gasto (total)</p>
          <p className="text-lg font-bold mt-1">R$ {totalGastoGeral.toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => setModo("mensal")} className={`flex-1 rounded-xl py-2 text-sm font-medium ${modo === "mensal" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-500"}`}>Mensal</button>
        <button onClick={() => setModo("diario")} className={`flex-1 rounded-xl py-2 text-sm font-medium ${modo === "diario" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-500"}`}>Diário</button>
      </div>

      {modo === "mensal" && (
        <>
          {dadosGraficoMensal.length > 1 && (
            <>
              <div className="mt-6">
                <h2 className="font-bold text-neutral-900 mb-3 text-sm">Gasto x Investido por mês</h2>
                <Cartao className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoMensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Gasto" fill="#e24b4a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Investido" fill="#1d9e75" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Cartao>
              </div>

              <div className="mt-6">
                <h2 className="font-bold text-neutral-900 mb-3 text-sm">Evolução de humor e física</h2>
                <Cartao className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosGraficoMensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="Humor" stroke="#d4537e" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Fisica" stroke="#7f77dd" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Cartao>
              </div>
            </>
          )}

          {dadosPizza.length > 0 && (
            <div className="mt-6">
              <h2 className="font-bold text-neutral-900 mb-3 text-sm">Atividades mais praticadas</h2>
              <Cartao className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dadosPizza} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 11 }}>
                      {dadosPizza.map((_, i) => <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {mesesOrdenados.length === 0 && <p className="text-sm text-neutral-400">Ainda sem dados suficientes.</p>}
            {[...mesesOrdenados].reverse().map((chave) => {
              const registros = meses[chave];
              const n = registros.length;
              const gastoTotal = registros.reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
              const investidoTotal = registros.reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
              const humorMedio = Math.round(registros.reduce((s, r) => s + (r.humorPercent || 0), 0) / n);
              const fisicaMedia = Math.round(registros.reduce((s, r) => s + (r.saudeFisicaPercent || 0), 0) / n);
              const diasSemFumar = registros.filter((r) => r.fumei === false).length;
              const diasAtividade = registros.filter((r) => r.atividadeFisica?.feita).length;
              const diasSonoOk = registros.filter((r) => dormiuNaMeta(r.horaDormiu, metas.horaDormirMeta)).length;
              const pesos = registros.map((r) => parseFloat(r.peso)).filter((p) => !isNaN(p));
              const pesoMedio = pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : "—";
              const metaGasto = parseFloat(metas.gastoDiario) || 0;
              const diasDentroOrcamento = metaGasto > 0 ? registros.filter((r) => (r.gastos || []).reduce((a, g) => a + g.valor, 0) <= metaGasto).length : null;
              return (
                <Cartao key={chave} className="border-l-4 border-l-violet-500">
                  <p className="font-bold text-neutral-900 text-sm capitalize mb-2">{nomeMesCompleto(chave)}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-neutral-500">
                    <span>Dias registrados: {n}</span>
                    <span>Dias sem fumar: {diasSemFumar}</span>
                    <span>Atividade física: {diasAtividade}</span>
                    <span>Sono dentro da meta: {diasSonoOk}</span>
                    <span>Humor médio: {humorMedio}%</span>
                    <span>Física média: {fisicaMedia}%</span>
                    <span>Peso médio: {pesoMedio} kg</span>
                    <span>Gasto total: R$ {gastoTotal.toFixed(2).replace(".", ",")}</span>
                    <span>Investido total: R$ {investidoTotal.toFixed(2).replace(".", ",")}</span>
                    {diasDentroOrcamento !== null && <span>Dentro do orçamento: {diasDentroOrcamento}</span>}
                  </div>
                </Cartao>
              );
            })}
          </div>
        </>
      )}

      {modo === "diario" && (
        <div className="mt-6 space-y-3">
          {datasOrdenadas.length === 0 && <p className="text-sm text-neutral-400">Ainda sem dias registrados.</p>}
          {datasOrdenadas.map((iso) => {
            const r = dadosPorDia[iso];
            const gastoTotal = (r.gastos || []).reduce((s, g) => s + g.valor, 0);
            const investidoTotal = (r.investimentos || []).reduce((s, i) => s + i.valor, 0);
            const kcalTotal = (r.refeicoes || []).reduce((s, x) => s + x.kcal, 0);
            return (
              <Cartao key={iso} className="border-l-4 border-l-neutral-300">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-neutral-900 text-sm">{formatarData(iso)}</p>
                  <span className="text-xs">{r.fumei === false ? "🚭 não fumou" : r.fumei === true ? "🚬 fumou" : "— sem resposta"}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs text-neutral-500">
                  <span>Mental: {r.humorPercent}%</span>
                  <span>Física: {r.saudeFisicaPercent}%</span>
                  <span>Atividade: {r.atividadeFisica?.feita ? r.atividadeFisica.tipo || "sim" : "não"}</span>
                  <span>Sono: {r.horaDormiu || "—"}</span>
                  <span>Gasto: R$ {gastoTotal.toFixed(2).replace(".", ",")}</span>
                  <span>Investido: R$ {investidoTotal.toFixed(2).replace(".", ",")}</span>
                  <span>Calorias: {kcalTotal} kcal</span>
                  <span>Água: {((r.aguaCopos || 0) * 0.25).toFixed(2)} L</span>
                </div>
              </Cartao>
            );
          })}
        </div>
      )}
    </>
  );
}