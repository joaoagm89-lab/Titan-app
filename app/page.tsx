"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { supabase } from "./supabaseClient";
import {
  Activity, Brain, Wallet, Compass, Target, BarChart3,
  Sun, Moon, ChevronLeft, ChevronRight, Pencil, Cigarette, CigaretteOff, CalendarDays, Plus,
  Dumbbell, Droplets, Scale, UtensilsCrossed, TrendingUp, Briefcase,
  BookOpen, Heart, Users, Flame, Timer, Zap, PiggyBank, Award, LogOut, Wine, Receipt,
} from "lucide-react";

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

const CORES_GRAFICO = ["#6366f1", "#0d9488", "#e11d48", "#d97706", "#64748b", "#0284c7", "#65a30d", "#7c3aed"];

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

const NIVEL_TRABALHO = ["Improdutivo", "Pouco produtivo", "Neutro", "Produtivo", "Muito produtivo"];
const NIVEL_DISPOSICAO = ["Muito indisposto", "Indisposto", "Neutro", "Disposto", "Muito disposto"];
const CARINHAS_HUMOR = [
  { emoji: "😢", valor: 10 },
  { emoji: "😕", valor: 35 },
  { emoji: "😐", valor: 55 },
  { emoji: "🙂", valor: 80 },
  { emoji: "😄", valor: 100 },
];

const REGISTRO_PADRAO = {
  fumei: null,
  quantidadeCigarros: "",
  bebeu: null,
  bebida: { tipo: "", quantidade: "" },
  atividadeFisica: { feita: false, tipo: "", minutos: "" },
  horaDormiu: "",
  gastos: [],
  investimentos: [],
  humorPercent: 70,
  humorEmoji: "",
  notasHumor: [],
  peso: "",
  aguaEntradas: [],
  refeicoes: [],
  saudeFisicaPercent: 50,
  trabalhoClassificacao: 2,
  notasAprendizado: [],
  leituraLivro: "",
  leituraPaginas: "",
  notasRelacionamento: [],
  notasFamilia: [],
  tarefas: [],
};

const TIPOS_BEBIDA = ["Cerveja", "Vinho", "Whisky/Destilado", "Vodka", "Cachaça", "Drink", "Outro"];
const CATEGORIAS_GASTO = ["Alimentação", "Transporte", "Lazer", "Saúde", "Outro"];

const METAS_PADRAO = {
  gastoDiario: "",
  investimentoMensal: "",
  horaDormirMeta: "22:00",
  pesoMeta: "",
  metaPessoal: "",
  atividadeFisicaMetaMes: "",
  aguaMetaLitros: "",
  gastosFixos: [],
};

const GASTOS_FIXOS_PADRAO = [
  "Aluguel", "Condomínio", "Luz", "Água", "Internet", "Telefone/Celular",
  "Pensão", "Plano de saúde", "Streaming/Assinaturas", "Seguro",
  "Financiamento/Prestação", "IPTU/IPVA", "Escola/Faculdade", "Outro",
];

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
function somarMes(mesIso, delta) {
  const [y, m] = mesIso.split("-").map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
function celulasDoMes(mesIso) {
  const [y, m] = mesIso.split("-").map(Number);
  const ultimoDia = new Date(y, m, 0).getDate();
  const diaSemanaInicio = new Date(y, m - 1, 1).getDay();
  const celulas = [];
  for (let i = 0; i < diaSemanaInicio; i++) celulas.push(null);
  for (let d = 1; d <= ultimoDia; d++) celulas.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  return celulas;
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

// ===== TEMA =====
const TemaContext = createContext({ escuro: false, alternar: () => {} });
function useTema() { return useContext(TemaContext); }

function BotaoTema() {
  const { escuro, alternar } = useTema();
  return (
    <button onClick={alternar} className={`w-9 h-9 rounded-lg flex items-center justify-center transition active:opacity-70 ${escuro ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-500"}`}>
      {escuro ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function horaAgora() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function CampoDiario({ entradas, onAdicionar, onRemover, placeholder, className = "" }) {
  const { escuro } = useTema();
  const [texto, setTexto] = useState("");

  function salvar() {
    if (!texto.trim()) return;
    onAdicionar(texto.trim());
    setTexto("");
  }

  return (
    <div>
      <CampoArea
        placeholder={placeholder}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className={className}
      />
      <button onClick={salvar} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium transition active:opacity-80 bg-indigo-600 hover:bg-indigo-700 text-white">
        Salvar
      </button>

      {entradas.length > 0 && (
        <div className="mt-4 space-y-2">
          {[...entradas].reverse().map((e) => (
            <div key={e.id} className={`flex items-start justify-between gap-2 rounded-lg border p-3 ${escuro ? "bg-slate-800/60 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5">{e.hora}</p>
                <p className={`text-sm break-words ${escuro ? "text-slate-200" : "text-slate-700"}`}>{e.texto}</p>
              </div>
              <button onClick={() => onRemover(e.id)} className="text-slate-400 shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CampoMetaPessoal({ valor, onSalvar }) {
  const [rascunho, setRascunho] = useState(valor);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => { setRascunho(valor); }, [valor]);

  function salvar() {
    onSalvar(rascunho);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  return (
    <div>
      <CampoArea
        placeholder="Escreva uma meta pessoal para você..."
        value={rascunho}
        onChange={(e) => { setRascunho(e.target.value); setSalvo(false); }}
        className="h-20"
      />
      <button onClick={salvar} className={`mt-2 px-4 py-1.5 rounded-lg text-xs font-medium transition active:opacity-80 ${salvo ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
        {salvo ? "Salvo ✓" : "Salvar"}
      </button>
    </div>
  );
}

function Cartao({ children, className = "" }) {
  const { escuro } = useTema();
  return (
    <div className={`rounded-xl border p-4 ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} ${className}`}>
      {children}
    </div>
  );
}
function Titulo({ children }) {
  const { escuro } = useTema();
  return <h1 className={`text-2xl font-semibold tracking-tight ${escuro ? "text-white" : "text-slate-900"}`}>{children}</h1>;
}
function TituloSecao({ Icone, children }) {
  const { escuro } = useTema();
  return (
    <h2 className={`font-semibold mb-3 flex items-center gap-2 text-[15px] uppercase tracking-wide text-xs ${escuro ? "text-slate-400" : "text-slate-500"}`}>
      <Icone size={14} strokeWidth={2} />
      {children}
    </h2>
  );
}
function Rotulo({ children, className = "" }) {
  const { escuro } = useTema();
  return <p className={`text-sm font-medium ${escuro ? "text-slate-200" : "text-slate-700"} ${className}`}>{children}</p>;
}
function Sutil({ children, className = "" }) {
  const { escuro } = useTema();
  return <span className={`${escuro ? "text-slate-500" : "text-slate-400"} ${className}`}>{children}</span>;
}
function Campo(props) {
  const { escuro } = useTema();
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-lg px-3 py-2.5 text-sm border outline-none focus:ring-1 focus:ring-indigo-500 ${
        escuro ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      } ${className}`}
    />
  );
}
function CampoArea(props) {
  const { escuro } = useTema();
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-lg px-3 py-2.5 text-sm border outline-none resize-none focus:ring-1 focus:ring-indigo-500 ${
        escuro ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      } ${className}`}
    />
  );
}
function CampoSelect(props) {
  const { escuro } = useTema();
  const { className = "", children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full rounded-lg px-3 py-2.5 text-sm border outline-none ${
        escuro ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-700"
      } ${className}`}
    >
      {children}
    </select>
  );
}
function BarraPercentual({ valor, cor = "bg-indigo-600" }) {
  const { escuro } = useTema();
  return (
    <div className={`w-full rounded-full h-1.5 ${escuro ? "bg-slate-800" : "bg-slate-100"}`}>
      <div className={`${cor} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} />
    </div>
  );
}
function Painel({ Icone, corIcone = "text-indigo-400", children, className = "" }) {
  return (
    <div className={`relative mt-6 rounded-xl bg-slate-900 text-white p-6 border border-slate-800 overflow-hidden ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-brilhoPainel absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      {Icone && (
        <div className="relative w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
          <Icone size={16} className={corIcone} />
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
function BotaoToggle({ ativo, onClick, children, corAtiva }) {
  const { escuro } = useTema();
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-md font-medium transition active:opacity-70 ${
        ativo ? corAtiva : escuro ? "border border-slate-700 text-slate-400" : "border border-slate-200 text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function NumeroAnimado({ valor, className = "" }) {
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);

  useEffect(() => {
    const de = anterior.current;
    const ate = valor;
    if (de === ate) return;
    const inicio = performance.now();
    const duracao = 500;
    function passo(agora) {
      const progresso = Math.min(1, (agora - inicio) / duracao);
      setExibido(Math.round(de + (ate - de) * progresso));
      if (progresso < 1) requestAnimationFrame(passo);
      else anterior.current = ate;
    }
    requestAnimationFrame(passo);
  }, [valor]);

  return <span className={className}>{exibido}</span>;
}

function Confete() {
  const cores = ["#6366f1", "#f472b6", "#fbbf24", "#34d399", "#60a5fa"];
  const [particulas] = useState(() =>
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      esquerda: Math.random() * 100,
      atraso: Math.random() * 0.6,
      duracao: 1.6 + Math.random() * 0.8,
      cor: cores[i % cores.length],
      tamanho: 5 + Math.random() * 5,
      rotacao: Math.random() * 360,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
      {particulas.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-10px] rounded-sm animate-confeteCair"
          style={{
            left: `${p.esquerda}%`,
            width: p.tamanho,
            height: p.tamanho * 1.6,
            backgroundColor: p.cor,
            animationDelay: `${p.atraso}s`,
            animationDuration: `${p.duracao}s`,
            transform: `rotate(${p.rotacao}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [perfil, setPerfil] = useState(null);
  const touchStartX = useRef(null);
  const [dadosPorDia, setDadosPorDia] = useState({});
  const [metas, setMetas] = useState(METAS_PADRAO);
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [aba, setAba] = useState("saude");
  const [carregado, setCarregado] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [escuro, setEscuro] = useState(false);
  const [verificouAcesso, setVerificouAcesso] = useState(false);
  const [popupDia, setPopupDia] = useState(null);
  const [popupMes, setPopupMes] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [googleConectado, setGoogleConectado] = useState(false);
  const [dadosLocaisDetectados, setDadosLocaisDetectados] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregandoAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session);
      if (!session) {
        setCarregado(false);
        setPerfil(null);
        setDadosPorDia({});
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessao || carregado) return;
    (async () => {
      const { data } = await supabase
        .from("titan_dados")
        .select("dados")
        .eq("user_id", sessao.user.id)
        .maybeSingle();
      if (data?.dados) {
        const d = data.dados;
        setPerfil(d.perfil ?? null);
        setDadosPorDia(d.dadosPorDia ?? {});
        setMetas({ ...METAS_PADRAO, ...(d.metas ?? {}) });
        setEscuro(d.escuro ?? false);
      } else {
        const legado = localStorage.getItem("titan-data-v3");
        if (legado) {
          try { setDadosLocaisDetectados(JSON.parse(legado)); } catch {}
        }
      }
      setCarregado(true);
    })();
  }, [sessao, carregado]);

  useEffect(() => {
    if (!carregado || !sessao) return;
    supabase
      .from("titan_dados")
      .upsert({ user_id: sessao.user.id, dados: { perfil, dadosPorDia, metas, escuro }, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error("Erro ao salvar no Supabase:", error); });
  }, [perfil, dadosPorDia, metas, escuro, carregado, sessao]);

  useEffect(() => {
    if (carregado && perfil && !perfil.dataInicioApp) {
      setPerfil((p) => ({ ...p, dataInicioApp: hojeISO() }));
    }
  }, [carregado, perfil]);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const intervalo = setInterval(() => {
      const hoje = hojeISO();
      const tarefas = dadosPorDia[hoje]?.tarefas || [];
      const agora = new Date();
      const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      tarefas.forEach((t) => {
        if (t.horario && t.horario === horaAtual && !t.feita) {
          const chave = `titan-notif-${hoje}-${t.id}`;
          if (!sessionStorage.getItem(chave)) {
            sessionStorage.setItem(chave, "1");
            if (Notification.permission === "granted") {
              new Notification("Titan — hora da tarefa", { body: t.texto });
            }
          }
        }
      });
    }, 20000);
    return () => clearInterval(intervalo);
  }, [dadosPorDia]);

  useEffect(() => {
    if (!carregado || !perfil || verificouAcesso) return;
    setVerificouAcesso(true);
    const hoje = hojeISO();
    const ultimo = perfil.ultimoAcesso;
    if (ultimo && ultimo !== hoje) {
      const regAnterior = dadosPorDia[ultimo];
      if (regAnterior) setPopupDia({ data: ultimo, registro: regAnterior });
      if (mesDoIso(ultimo) !== mesDoIso(hoje)) setPopupMes({ mesIso: mesDoIso(ultimo) });
    }
    if (ultimo !== hoje) setPerfil((p) => ({ ...p, ultimoAcesso: hoje }));
  }, [carregado, perfil, verificouAcesso, dadosPorDia]);

  useEffect(() => {
    if (!sessao) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      try {
        const resp = await fetch("/api/google/status", { headers: { Authorization: `Bearer ${token}` } });
        const json = await resp.json();
        setGoogleConectado(!!json.conectado);
      } catch {}
    })();
  }, [sessao]);

  const temaValue = { escuro, alternar: () => setEscuro((e) => !e) };

  if (carregandoAuth) return null;

  if (!sessao) {
    return (
      <TemaContext.Provider value={temaValue}>
        <TelaLogin />
      </TemaContext.Provider>
    );
  }

  if (!carregado) return null;

  if (!perfil && dadosLocaisDetectados) {
    return (
      <TemaContext.Provider value={temaValue}>
        <ImportarDadosLegado
          onImportar={() => {
            const d = dadosLocaisDetectados;
            setPerfil(d.perfil ?? null);
            setDadosPorDia(d.dadosPorDia ?? {});
            setMetas({ ...METAS_PADRAO, ...(d.metas ?? {}) });
            setEscuro(d.escuro ?? false);
            setDadosLocaisDetectados(null);
          }}
          onIgnorar={() => setDadosLocaisDetectados(null)}
        />
      </TemaContext.Provider>
    );
  }

  if (!perfil) {
    return (
      <TemaContext.Provider value={temaValue}>
        <Onboarding
          onConcluir={(p, m) => {
            setPerfil(p);
            setMetas({ ...METAS_PADRAO, ...m });
          }}
        />
      </TemaContext.Provider>
    );
  }

  function mesclarRegistro(bruto) {
    return {
      ...REGISTRO_PADRAO,
      ...bruto,
      atividadeFisica: { ...REGISTRO_PADRAO.atividadeFisica, ...(bruto?.atividadeFisica) },
      bebida: { ...REGISTRO_PADRAO.bebida, ...(bruto?.bebida) },
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

  const dataLimite = perfil.dataInicioApp || perfil.dataCadastro || hojeISO();

  const streak = calcularStreak(dadosPorDia, hojeISO());
  const xpTotal = calcularXpTotal(dadosPorDia, metas);
  const { atual: nivelAtual, proximo: proximoNivel } = calcularNivel(xpTotal);

  function mudarData(novaData) {
    setDataSelecionada(novaData);
    setAba("saude");
  }

  function atualizarDia(iso, atualizador) {
    setDadosPorDia((prev) => ({
      ...prev,
      [iso]: atualizador(mesclarRegistro(prev[iso])),
    }));
  }

  async function googleFetch(caminho, opcoes = {}) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return fetch(caminho, {
      ...opcoes,
      headers: { ...(opcoes.headers || {}), Authorization: `Bearer ${token}` },
    });
  }

  function conectarGoogle() {
    window.location.href = `/api/google/connect?uid=${sessao.user.id}`;
  }

  async function desconectarGoogle() {
    await googleFetch("/api/google/disconnect", { method: "POST" });
    setGoogleConectado(false);
  }

  const TABS = [
    { id: "saude", label: "Saúde", Icone: Activity },
    { id: "mental", label: "Mental", Icone: Brain },
    { id: "financas", label: "Finanças", Icone: Wallet },
    { id: "vida", label: "Vida", Icone: Compass },
    { id: "tarefas", label: "Tarefas", Icone: CalendarDays },
    { id: "metas", label: "Metas", Icone: Target },
    { id: "relatorios", label: "Relatórios", Icone: BarChart3 },
  ];

  function aoTocarInicio(e) {
    if (e.touches.length > 1) { touchStartX.current = null; return; }
    touchStartX.current = e.touches[0].clientX;
  }
  function aoTocarMover(e) {
    if (e.touches.length > 1) touchStartX.current = null;
  }
  function aoTocarFim(e) {
    if (touchStartX.current === null) return;
    if (e.touches.length > 0) { touchStartX.current = null; return; }
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const ehHoje = dataSelecionada === hojeISO();
    const ehLimite = dataSelecionada <= dataLimite;
    if (deltaX < -60 && !ehHoje) mudarData(somarDias(dataSelecionada, 1));
    else if (deltaX > 60 && !ehLimite) mudarData(somarDias(dataSelecionada, -1));
    touchStartX.current = null;
  }

  return (
    <TemaContext.Provider value={temaValue}>
      <style jsx global>{`
        @keyframes tabIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tabIn { animation: tabIn 0.28s ease-out; }
        @keyframes confeteCair {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-confeteCair { animation-name: confeteCair; animation-timing-function: ease-in; animation-fill-mode: forwards; }
        @keyframes brilhoPainel {
          0% { transform: translateX(-120%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
        .animate-brilhoPainel { animation: brilhoPainel 3.5s ease-in-out infinite; }
      `}</style>
      <main className={`min-h-screen pb-28 transition-colors duration-300 ${escuro ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="max-w-md mx-auto px-5 py-8" onTouchStart={aoTocarInicio} onTouchMove={aoTocarMover} onTouchEnd={aoTocarFim}>
          <div className="flex items-center justify-between mb-6">
            <div className="w-9 h-9" />
            <SeletorData dataSelecionada={dataSelecionada} setDataSelecionada={mudarData} dataLimite={dataLimite} />
            <BotaoTema />
          </div>

          <div key={aba} className="animate-tabIn">
            {aba === "saude" && (
              <TabSaude
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
            {aba === "mental" && <TabMental registro={registro} atualizarRegistro={atualizarRegistro} />}
            {aba === "financas" && (
              <TabFinancas registro={registro} atualizarRegistro={atualizarRegistro} metas={metas} atualizarMetas={atualizarMetas} />
            )}
            {aba === "vida" && <TabVida registro={registro} atualizarRegistro={atualizarRegistro} perfil={perfil} />}
            {aba === "tarefas" && (
              <TabTarefas
                dadosPorDia={dadosPorDia}
                atualizarDia={atualizarDia}
                googleConectado={googleConectado}
                googleFetch={googleFetch}
                conectarGoogle={conectarGoogle}
                desconectarGoogle={desconectarGoogle}
              />
            )}
            {aba === "metas" && (
              <TabMetas dadosPorDia={dadosPorDia} metas={metas} atualizarMetas={atualizarMetas} registro={registro} />
            )}
            {aba === "relatorios" && <TabRelatorios dadosPorDia={dadosPorDia} metas={metas} xpTotal={xpTotal} perfil={perfil} />}
          </div>
        </div>

        {editandoPerfil && (
          <EditarPerfilModal perfil={perfil} onSalvar={(p) => { setPerfil(p); setEditandoPerfil(false); }} onCancelar={() => setEditandoPerfil(false)} />
        )}

        {popupDia && (
          <PopupResumoDia
            data={popupDia.data}
            registro={popupDia.registro}
            metas={metas}
            onFechar={() => setPopupDia(null)}
          />
        )}
        {!popupDia && popupMes && (
          <PopupResumoMes
            mesIso={popupMes.mesIso}
            dadosPorDia={dadosPorDia}
            metas={metas}
            onFechar={() => setPopupMes(null)}
          />
        )}

        <nav className={`fixed bottom-0 left-0 right-0 border-t ${escuro ? "bg-slate-950/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-md`}>
          <div className="max-w-md mx-auto grid grid-cols-7">
            {TABS.map((tab) => {
              const ativo = aba === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { navigator.vibrate?.(8); setAba(tab.id); }}
                  className="flex flex-col items-center gap-1 py-3 transition active:opacity-70"
                >
                  <tab.Icone size={16} strokeWidth={2} className={ativo ? "text-indigo-500" : escuro ? "text-slate-500" : "text-slate-400"} />
                  <span className={`text-[9px] leading-none ${ativo ? (escuro ? "text-white font-medium" : "text-slate-900 font-medium") : escuro ? "text-slate-500" : "text-slate-400"}`}>{tab.label}</span>
                  <div className={`h-0.5 w-4 rounded-full ${ativo ? "bg-indigo-500" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </TemaContext.Provider>
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

function Onboarding({ onConcluir }) {
  const { escuro, alternar } = useTema();
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({ nome: "", idade: "", peso: "", sexo: "", acompanharCigarro: true, acompanharBebida: true, acompanharRelacionamento: true, acompanharLeitura: true });
  const [metasForm, setMetasForm] = useState({ ...METAS_PADRAO });

  function avancar() {
    if (!form.nome || !form.idade || !form.peso || !form.sexo) return;
    setEtapa(2);
  }
  function concluir() {
    onConcluir({ ...form, dataCadastro: hojeISO(), dataInicioApp: hojeISO() }, metasForm);
  }

  return (
    <main className={`min-h-screen flex items-center justify-center px-6 ${escuro ? "bg-slate-950" : "bg-slate-100"}`}>
      <button onClick={alternar} className={`absolute top-6 right-6 w-9 h-9 rounded-lg flex items-center justify-center ${escuro ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500 border border-slate-200"}`}>
        {escuro ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className={`max-w-sm w-full rounded-xl p-6 border ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        {etapa === 1 && (
          <>
            <p className="text-xs font-medium text-indigo-500 mb-1 uppercase tracking-wide">Passo 1 de 3</p>
            <Titulo>Bem-vindo ao Titan</Titulo>
            <Sutil className="text-sm mb-6 block mt-1">Antes de começar, conta um pouco sobre você.</Sutil>
            <div className="space-y-3">
              <Campo placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Campo placeholder="Idade" type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
              <Campo placeholder="Peso inicial (kg)" type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
              <CampoSelect value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
                <option value="">Sexo</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </CampoSelect>
            </div>
            <button onClick={avancar} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 text-sm font-medium mt-6 transition active:opacity-80">Continuar</button>
          </>
        )}

        {etapa === 2 && (
          <>
            <p className="text-xs font-medium text-indigo-500 mb-1 uppercase tracking-wide">Passo 2 de 3</p>
            <Titulo>Monte o seu app</Titulo>
            <Sutil className="text-sm mb-6 block mt-1">Escolha quais controles você quer acompanhar. Pode mudar depois, quando quiser.</Sutil>
            <div className="space-y-3">
              <label className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <input type="checkbox" checked={form.acompanharCigarro} onChange={(e) => setForm({ ...form, acompanharCigarro: e.target.checked })} />
                Acompanhar hábito de fumar
              </label>
              <label className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <input type="checkbox" checked={form.acompanharBebida} onChange={(e) => setForm({ ...form, acompanharBebida: e.target.checked })} />
                Acompanhar bebida alcoólica
              </label>
              <label className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <input type="checkbox" checked={form.acompanharRelacionamento} onChange={(e) => setForm({ ...form, acompanharRelacionamento: e.target.checked })} />
                Acompanhar relacionamento (esposa/família)
              </label>
              <label className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <input type="checkbox" checked={form.acompanharLeitura} onChange={(e) => setForm({ ...form, acompanharLeitura: e.target.checked })} />
                Acompanhar leitura
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEtapa(1)} className={`flex-1 rounded-lg py-3 text-sm font-medium transition active:opacity-70 border ${escuro ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"}`}>Voltar</button>
              <button onClick={() => setEtapa(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 text-sm font-medium transition active:opacity-80">Continuar</button>
            </div>
          </>
        )}

        {etapa === 3 && (
          <>
            <p className="text-xs font-medium text-indigo-500 mb-1 uppercase tracking-wide">Passo 3 de 3</p>
            <Titulo>Suas metas</Titulo>
            <Sutil className="text-sm mb-6 block mt-1">Isso ajuda o app a te mostrar seu progresso. Pode editar depois, quando quiser.</Sutil>
            <div className="space-y-3">
              <div>
                <Sutil className="text-xs mb-1 block">Meta pessoal</Sutil>
                <CampoArea placeholder="Uma meta pessoal para você..." value={metasForm.metaPessoal} onChange={(e) => setMetasForm({ ...metasForm, metaPessoal: e.target.value })} className="h-16" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Sutil className="text-xs mb-1 block">Meta gasto diário (R$)</Sutil>
                  <Campo type="number" placeholder="50" value={metasForm.gastoDiario} onChange={(e) => setMetasForm({ ...metasForm, gastoDiario: e.target.value })} />
                </div>
                <div>
                  <Sutil className="text-xs mb-1 block">Meta invest. mês (R$)</Sutil>
                  <Campo type="number" placeholder="500" value={metasForm.investimentoMensal} onChange={(e) => setMetasForm({ ...metasForm, investimentoMensal: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Sutil className="text-xs mb-1 block">Meta de peso (kg)</Sutil>
                  <Campo type="number" placeholder="75" value={metasForm.pesoMeta} onChange={(e) => setMetasForm({ ...metasForm, pesoMeta: e.target.value })} />
                </div>
                <div>
                  <Sutil className="text-xs mb-1 block">Meta água/dia (L)</Sutil>
                  <Campo type="number" placeholder="2.5" value={metasForm.aguaMetaLitros} onChange={(e) => setMetasForm({ ...metasForm, aguaMetaLitros: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Sutil className="text-xs mb-1 block">Meta horário de dormir</Sutil>
                  <Campo type="time" value={metasForm.horaDormirMeta} onChange={(e) => setMetasForm({ ...metasForm, horaDormirMeta: e.target.value })} />
                </div>
                <div>
                  <Sutil className="text-xs mb-1 block">Atividade física (dias/mês)</Sutil>
                  <Campo type="number" placeholder="12" value={metasForm.atividadeFisicaMetaMes} onChange={(e) => setMetasForm({ ...metasForm, atividadeFisicaMetaMes: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEtapa(2)} className={`flex-1 rounded-lg py-3 text-sm font-medium transition active:opacity-70 border ${escuro ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"}`}>Voltar</button>
              <button onClick={concluir} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 text-sm font-medium transition active:opacity-80">Concluir</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function LinhaResultado({ Icone, label, ok }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icone size={15} className={ok ? "text-emerald-400" : "text-slate-500"} />
        <span className={`text-sm ${ok ? "text-slate-200" : "text-slate-500"}`}>{label}</span>
      </div>
      <span className={`text-xs font-medium ${ok ? "text-emerald-400" : "text-slate-500"}`}>{ok ? "Feito" : "Não"}</span>
    </div>
  );
}

function PopupResumoDia({ data, registro, metas, onFechar }) {
  const naoFumou = registro.fumei === false;
  const atividade = !!registro.atividadeFisica?.feita;
  const sono = dormiuNaMeta(registro.horaDormiu, metas.horaDormirMeta);
  const metaGasto = parseFloat(metas.gastoDiario) || 0;
  const gastoTotal = (registro.gastos || []).reduce((s, g) => s + g.valor, 0);
  const dentroOrcamento = metaGasto > 0 ? gastoTotal <= metaGasto : null;

  const itens = [naoFumou, atividade, sono, dentroOrcamento === true].filter((v) => v === true).length;
  const totalItens = [true, true, true, dentroOrcamento !== null].filter(Boolean).length;
  const boa = totalItens > 0 && itens / totalItens >= 0.5;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
      {boa && <Confete />}
      <div className="max-w-sm w-full rounded-xl p-6 border bg-slate-900 border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
          <Award size={18} className={boa ? "text-emerald-400" : "text-indigo-400"} />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Resumo do dia {formatarData(data)}</p>
        <h3 className="text-lg font-semibold text-white mb-4">
          {boa ? "Parabéns pelo seu dia" : "Vamos com tudo hoje"}
        </h3>

        <div className="divide-y divide-slate-800">
          <LinhaResultado Icone={Cigarette} label="Não fumou" ok={naoFumou} />
          <LinhaResultado Icone={Dumbbell} label="Atividade física" ok={atividade} />
          <LinhaResultado Icone={Moon} label="Sono dentro da meta" ok={sono} />
          {dentroOrcamento !== null && <LinhaResultado Icone={Wallet} label="Dentro do orçamento" ok={dentroOrcamento} />}
        </div>

        <p className="text-sm text-slate-400 mt-4">
          {boa
            ? "Você fechou o dia bem. Continue nesse ritmo."
            : "Nem todo dia é perfeito — o que importa é seguir tentando amanhã."}
        </p>

        <button onClick={onFechar} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium mt-5 transition active:opacity-80">
          Fechar
        </button>
      </div>
    </div>
  );
}

function PopupResumoMes({ mesIso, dadosPorDia, metas, onFechar }) {
  const registros = Object.entries(dadosPorDia).filter(([iso]) => mesDoIso(iso) === mesIso).map(([, r]) => r);
  const n = registros.length;
  const investidoTotal = registros.reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
  const metaInvest = parseFloat(metas.investimentoMensal) || 0;
  const bateuInvest = metaInvest > 0 ? investidoTotal >= metaInvest : null;
  const diasAtividade = registros.filter((r) => r.atividadeFisica?.feita).length;
  const metaAtividade = parseFloat(metas.atividadeFisicaMetaMes) || 0;
  const bateuAtividade = metaAtividade > 0 ? diasAtividade >= metaAtividade : null;
  const diasSemFumar = registros.filter((r) => r.fumei === false).length;

  const metasAvaliadas = [bateuInvest, bateuAtividade].filter((v) => v !== null);
  const bateuAlguma = metasAvaliadas.filter(Boolean).length;
  const boa = metasAvaliadas.length === 0 || bateuAlguma / metasAvaliadas.length >= 0.5;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
      <div className="max-w-sm w-full rounded-xl p-6 border bg-slate-900 border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
          <TrendingUp size={18} className={boa ? "text-emerald-400" : "text-indigo-400"} />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1 capitalize">Resumo de {nomeMesCompleto(mesIso)}</p>
        <h3 className="text-lg font-semibold text-white mb-4">
          {boa ? "Bom mês! Continue assim" : "Mês desafiador — o próximo é uma nova chance"}
        </h3>

        <div className="divide-y divide-slate-800">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Dias registrados</span>
            <span className="text-sm font-medium text-white">{n}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Dias sem fumar</span>
            <span className="text-sm font-medium text-white">{diasSemFumar}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Investido no mês</span>
            <span className={`text-sm font-medium ${bateuInvest ? "text-emerald-400" : "text-white"}`}>R$ {investidoTotal.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Dias com atividade física</span>
            <span className={`text-sm font-medium ${bateuAtividade ? "text-emerald-400" : "text-white"}`}>{diasAtividade}</span>
          </div>
        </div>

        <button onClick={onFechar} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium mt-5 transition active:opacity-80">
          Fechar
        </button>
      </div>
    </div>
  );
}

function traduzErro(msg) {
  if (!msg) return "Algo deu errado. Tenta de novo.";
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("User already registered")) return "Já existe uma conta com esse e-mail. Tenta entrar.";
  if (msg.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("Unable to validate email")) return "Digite um e-mail válido.";
  return msg;
}

function TelaLogin() {
  const { escuro, alternar } = useTema();
  const [modo, setModo] = useState("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function enviar() {
    setErro("");
    setMensagem("");
    if (!email || !senha) { setErro("Preenche e-mail e senha."); return; }
    setCarregando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setErro(traduzErro(error.message));
    } else {
      const { error } = await supabase.auth.signUp({ email, password: senha });
      if (error) setErro(traduzErro(error.message));
      else setMensagem("Conta criada! Já pode entrar normalmente.");
    }
    setCarregando(false);
  }

  return (
    <main className={`min-h-screen flex items-center justify-center px-6 ${escuro ? "bg-slate-950" : "bg-slate-100"}`}>
      <button onClick={alternar} className={`absolute top-6 right-6 w-9 h-9 rounded-lg flex items-center justify-center ${escuro ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500 border border-slate-200"}`}>
        {escuro ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className={`max-w-sm w-full rounded-xl p-6 border ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <Titulo>Titan</Titulo>
        <Sutil className="text-sm block mt-1 mb-6">Entre para acessar seus dados, de qualquer aparelho.</Sutil>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setModo("entrar")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${modo === "entrar" ? "bg-indigo-600 text-white" : escuro ? "border border-slate-700 text-slate-400" : "border border-slate-200 text-slate-500"}`}>Entrar</button>
          <button onClick={() => setModo("cadastro")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${modo === "cadastro" ? "bg-indigo-600 text-white" : escuro ? "border border-slate-700 text-slate-400" : "border border-slate-200 text-slate-500"}`}>Criar conta</button>
        </div>

        <div className="space-y-3">
          <Campo placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Campo placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>

        {erro && <p className="text-xs text-rose-500 mt-2">{erro}</p>}
        {mensagem && <p className="text-xs text-emerald-500 mt-2">{mensagem}</p>}

        <button onClick={enviar} disabled={carregando} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 text-sm font-medium mt-5 transition active:opacity-80 disabled:opacity-60">
          {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </div>
    </main>
  );
}

function ImportarDadosLegado({ onImportar, onIgnorar }) {
  const { escuro } = useTema();
  return (
    <main className={`min-h-screen flex items-center justify-center px-6 ${escuro ? "bg-slate-950" : "bg-slate-100"}`}>
      <div className={`max-w-sm w-full rounded-xl p-6 border ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <Titulo>Encontramos dados neste navegador</Titulo>
        <Sutil className="text-sm block mt-2 mb-5">
          Antes de usar login, você já tinha registros salvos aqui. Quer importar esses dados pra sua conta agora, ou começar do zero?
        </Sutil>
        <div className="flex flex-col gap-2">
          <button onClick={onImportar} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 text-sm font-medium transition active:opacity-80">Importar meus dados</button>
          <button onClick={onIgnorar} className={`w-full rounded-lg py-3 text-sm font-medium transition border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>Começar do zero</button>
        </div>
      </div>
    </main>
  );
}

function EditarPerfilModal({ perfil, onSalvar, onCancelar }) {
  const { escuro } = useTema();
  const [form, setForm] = useState({ acompanharCigarro: true, acompanharBebida: true, acompanharRelacionamento: true, acompanharLeitura: true, ...perfil });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
      <div className={`rounded-xl p-6 max-w-sm w-full border max-h-[85vh] overflow-y-auto ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <h3 className={`font-semibold text-lg mb-4 ${escuro ? "text-white" : "text-slate-900"}`}>Editar perfil</h3>
        <div className="space-y-3">
          <Campo placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Campo placeholder="Idade" type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
          <Campo placeholder="Peso (kg)" type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
          <CampoSelect value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </CampoSelect>
        </div>

        <Sutil className="text-xs block mt-5 mb-2">Módulos ativos</Sutil>
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <input type="checkbox" checked={form.acompanharCigarro} onChange={(e) => setForm({ ...form, acompanharCigarro: e.target.checked })} />
            Hábito de fumar
          </label>
          <label className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <input type="checkbox" checked={form.acompanharBebida} onChange={(e) => setForm({ ...form, acompanharBebida: e.target.checked })} />
            Bebida alcoólica
          </label>
          <label className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <input type="checkbox" checked={form.acompanharRelacionamento} onChange={(e) => setForm({ ...form, acompanharRelacionamento: e.target.checked })} />
            Relacionamento
          </label>
          <label className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            <input type="checkbox" checked={form.acompanharLeitura} onChange={(e) => setForm({ ...form, acompanharLeitura: e.target.checked })} />
            Leitura
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancelar} className={`flex-1 rounded-lg py-2 text-sm transition active:opacity-70 border ${escuro ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"}`}>Cancelar</button>
          <button onClick={() => onSalvar(form)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition active:opacity-80">Salvar</button>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-sm text-rose-500 mt-4 py-2">
          <LogOut size={14} /> Sair da conta
        </button>
      </div>
    </div>
  );
}

function SeletorData({ dataSelecionada, setDataSelecionada, dataLimite }) {
  const { escuro } = useTema();
  const ehHoje = dataSelecionada === hojeISO();
  const ehLimite = dataSelecionada <= dataLimite;
  const botaoBase = `w-9 h-9 rounded-lg border flex items-center justify-center transition active:opacity-70 ${escuro ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`;
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => !ehLimite && setDataSelecionada(somarDias(dataSelecionada, -1))} disabled={ehLimite} className={`${botaoBase} ${ehLimite ? "opacity-30" : ""}`}><ChevronLeft size={16} /></button>
      <div className="text-center min-w-[100px]">
        <p className={`font-medium text-sm ${escuro ? "text-white" : "text-slate-900"}`}>{formatarData(dataSelecionada)}</p>
        {!ehHoje && <p className="text-[11px] text-amber-500">dia passado</p>}
      </div>
      <button onClick={() => !ehHoje && setDataSelecionada(somarDias(dataSelecionada, 1))} disabled={ehHoje} className={`${botaoBase} ${ehHoje ? "opacity-30" : ""}`}><ChevronRight size={16} /></button>
    </div>
  );
}

function TabSaude({ perfil, registro, atualizarRegistro, metas, streak, xpTotal, nivelAtual, proximoNivel, onEditarPerfil }) {
  const { escuro } = useTema();
  const [novaRefeicao, setNovaRefeicao] = useState({ nome: "", kcal: "" });
  const [novaAgua, setNovaAgua] = useState("");
  const progresso = proximoNivel
    ? Math.round(((xpTotal - nivelAtual.xpNecessario) / (proximoNivel.xpNecessario - nivelAtual.xpNecessario)) * 100)
    : 100;
  const sonoOk = dormiuNaMeta(registro.horaDormiu, metas.horaDormirMeta);
  const pesoRef = parseFloat(registro.peso) || parseFloat(perfil.peso) || 75;
  const calorias = registro.atividadeFisica.feita ? calcularCalorias(registro.atividadeFisica.tipo, registro.atividadeFisica.minutos, pesoRef) : 0;
  const totalCalorias = registro.refeicoes.reduce((s, r) => s + r.kcal, 0);
  const totalAguaMl = registro.aguaEntradas.reduce((s, a) => s + a.ml, 0);
  const acompanhaCigarro = perfil.acompanharCigarro !== false;
  const nivelDisposicao = Math.round(registro.saudeFisicaPercent / 25);

  function adicionarRefeicao() {
    if (!novaRefeicao.nome || !novaRefeicao.kcal) return;
    atualizarRegistro((r) => ({ ...r, refeicoes: [...r.refeicoes, { id: Date.now(), nome: novaRefeicao.nome, kcal: parseFloat(novaRefeicao.kcal) }] }));
    setNovaRefeicao({ nome: "", kcal: "" });
  }
  function adicionarAgua() {
    if (!novaAgua) return;
    atualizarRegistro((r) => ({ ...r, aguaEntradas: [...r.aguaEntradas, { id: Date.now(), ml: parseFloat(novaAgua) }] }));
    setNovaAgua("");
  }
  function adicionarAguaRapido(ml) {
    atualizarRegistro((r) => ({ ...r, aguaEntradas: [...r.aguaEntradas, { id: Date.now(), ml }] }));
  }
  function removerAgua(id) {
    atualizarRegistro((r) => ({ ...r, aguaEntradas: r.aguaEntradas.filter((a) => a.id !== id) }));
  }
  function removerRefeicao(id) { atualizarRegistro((r) => ({ ...r, refeicoes: r.refeicoes.filter((x) => x.id !== id) })); }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Sutil className="text-sm">Olá</Sutil>
          <h1 className={`text-2xl font-semibold tracking-tight mt-1 ${escuro ? "text-white" : "text-slate-900"}`}>{perfil.nome}</h1>
        </div>
        <button onClick={onEditarPerfil} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition active:opacity-70 ${escuro ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}><Pencil size={15} /></button>
      </div>

      {acompanhaCigarro && (
        <Painel Icone={registro.fumei === false ? CigaretteOff : Cigarette} corIcone={registro.fumei === false ? "text-emerald-400" : registro.fumei === true ? "text-rose-400" : "text-slate-400"}>
          <Rotulo className="!text-slate-300 mb-3">Cigarro</Rotulo>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => atualizarRegistro((r) => ({ ...r, fumei: r.fumei === false ? null : false, quantidadeCigarros: r.fumei === false ? r.quantidadeCigarros : "" }))}
              className={`rounded-lg py-3 text-sm font-medium border transition active:opacity-80 ${registro.fumei === false ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-700 text-slate-300"}`}
            >
              Não fumei
            </button>
            <button
              onClick={() => atualizarRegistro((r) => ({ ...r, fumei: r.fumei === true ? null : true }))}
              className={`rounded-lg py-3 text-sm font-medium border transition active:opacity-80 ${registro.fumei === true ? "bg-rose-500 text-white border-rose-500" : "border-slate-700 text-slate-300"}`}
            >
              Fumei
            </button>
          </div>

          {registro.fumei === true && (
            <div className="flex items-center justify-between mt-3 bg-slate-800/60 rounded-lg p-2">
              <span className="text-xs text-slate-300">Quantos cigarros?</span>
              <div className="flex items-center gap-2">
                <button onClick={() => atualizarRegistro((r) => ({ ...r, quantidadeCigarros: String(Math.max(0, (parseInt(r.quantidadeCigarros) || 0) - 1)) }))} className="w-7 h-7 rounded-md border border-slate-700 text-slate-300 flex items-center justify-center active:opacity-70">−</button>
                <span className="text-sm font-medium text-white w-6 text-center">{registro.quantidadeCigarros || 0}</span>
                <button onClick={() => atualizarRegistro((r) => ({ ...r, quantidadeCigarros: String((parseInt(r.quantidadeCigarros) || 0) + 1) }))} className="w-7 h-7 rounded-md border border-slate-700 text-slate-300 flex items-center justify-center active:opacity-70">+</button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-3">
            <Flame size={13} className="text-amber-400" />
            <p className="text-xs text-slate-400">Sequência sem fumar: <NumeroAnimado valor={streak} /> dias · toque de novo pra desmarcar</p>
          </div>
        </Painel>
      )}

      {perfil.acompanharBebida !== false && (
        <Painel Icone={Wine} corIcone={registro.bebeu === false ? "text-emerald-400" : registro.bebeu === true ? "text-rose-400" : "text-slate-400"}>
          <Rotulo className="!text-slate-300 mb-3">Bebida alcoólica</Rotulo>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => atualizarRegistro((r) => ({ ...r, bebeu: r.bebeu === false ? null : false }))}
              className={`rounded-lg py-3 text-sm font-medium border transition active:opacity-80 ${registro.bebeu === false ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-700 text-slate-300"}`}
            >
              Não bebi
            </button>
            <button
              onClick={() => atualizarRegistro((r) => ({ ...r, bebeu: r.bebeu === true ? null : true }))}
              className={`rounded-lg py-3 text-sm font-medium border transition active:opacity-80 ${registro.bebeu === true ? "bg-rose-500 text-white border-rose-500" : "border-slate-700 text-slate-300"}`}
            >
              Bebi
            </button>
          </div>
          {registro.bebeu === true && (
            <div className="mt-3 space-y-2">
              <CampoSelect value={registro.bebida.tipo} onChange={(e) => atualizarRegistro((r) => ({ ...r, bebida: { ...r.bebida, tipo: e.target.value } }))}>
                <option value="">Qual bebida?</option>
                {TIPOS_BEBIDA.map((t) => <option key={t} value={t}>{t}</option>)}
              </CampoSelect>
              <Campo placeholder="Quantidade (ex: 2 latas, 3 doses)" value={registro.bebida.quantidade} onChange={(e) => atualizarRegistro((r) => ({ ...r, bebida: { ...r.bebida, quantidade: e.target.value } }))} />
            </div>
          )}
        </Painel>
      )}



      <Painel Icone={Award} corIcone="text-indigo-400">
        <Sutil className="!text-slate-400 text-sm">Nível {nivelAtual.nivel}</Sutil>
        <p className="text-lg font-semibold">{nivelAtual.nome}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span><NumeroAnimado valor={xpTotal} /> XP</span>
            <span>{proximoNivel ? `próximo: ${proximoNivel.xpNecessario}` : "nível máximo"}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </Painel>

      <div className="mt-8">
        <TituloSecao Icone={Activity}>Rotina do dia</TituloSecao>

        <Cartao>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={15} className="text-indigo-500" />
              <Rotulo>Atividade física</Rotulo>
            </div>
            <BotaoToggle
              ativo={registro.atividadeFisica.feita}
              corAtiva="bg-emerald-500 text-white"
              onClick={() =>
                atualizarRegistro((r) =>
                  r.atividadeFisica.feita
                    ? { ...r, atividadeFisica: { feita: false, tipo: "", minutos: "" } }
                    : { ...r, atividadeFisica: { ...r.atividadeFisica, feita: true } }
                )
              }
            >
              {registro.atividadeFisica.feita ? "Feita" : "Marcar"}
            </BotaoToggle>
          </div>
          {registro.atividadeFisica.feita && (
            <div className="mt-3 space-y-2">
              <CampoSelect value={registro.atividadeFisica.tipo} onChange={(e) => atualizarRegistro((r) => ({ ...r, atividadeFisica: { ...r.atividadeFisica, tipo: e.target.value } }))}>
                <option value="">Qual atividade?</option>
                {TIPOS_ATIVIDADE.map((t) => <option key={t} value={t}>{t}</option>)}
              </CampoSelect>
              <Campo type="number" placeholder="Duração (minutos)" value={registro.atividadeFisica.minutos} onChange={(e) => atualizarRegistro((r) => ({ ...r, atividadeFisica: { ...r.atividadeFisica, minutos: e.target.value } }))} />
              {registro.atividadeFisica.tipo && registro.atividadeFisica.minutos && (
                <p className="text-xs text-emerald-500">~{calorias} kcal estimadas (tabela MET padrão)</p>
              )}
            </div>
          )}
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Moon size={15} className="text-indigo-500" />
              <Rotulo>Horário que dormiu</Rotulo>
            </div>
            <span className={`text-xs font-medium ${sonoOk ? "text-emerald-500" : "text-slate-400"}`}>
              {registro.horaDormiu ? (sonoOk ? "dentro da meta" : "fora da meta") : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <Campo type="time" value={registro.horaDormiu} onChange={(e) => atualizarRegistro((r) => ({ ...r, horaDormiu: e.target.value }))} className="flex-1 min-w-0" />
            {registro.horaDormiu && (
              <button onClick={() => atualizarRegistro((r) => ({ ...r, horaDormiu: "" }))} className={`px-3 rounded-lg border text-xs transition active:opacity-70 ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-500"}`}>
                Limpar
              </button>
            )}
          </div>
          <Sutil className="text-xs mt-2 block">Meta: {metas.horaDormirMeta || "não definida"}</Sutil>
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex justify-between items-center mb-2">
            <Rotulo>Como você está se sentindo hoje</Rotulo>
            <span className="text-sm font-medium text-indigo-500">{NIVEL_DISPOSICAO[nivelDisposicao]}</span>
          </div>
          <input type="range" min="0" max="4" step="1" value={nivelDisposicao} onChange={(e) => atualizarRegistro((r) => ({ ...r, saudeFisicaPercent: parseInt(e.target.value) * 25 }))} className="w-full accent-indigo-600" />
          <div className="flex justify-between text-[10px] mt-1">
            <Sutil>Muito indisposto</Sutil>
            <Sutil>Muito disposto</Sutil>
          </div>
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={15} className="text-indigo-500" />
            <Rotulo>Peso (kg)</Rotulo>
          </div>
          <Campo type="number" placeholder="ex: 78.5" value={registro.peso} onChange={(e) => atualizarRegistro((r) => ({ ...r, peso: e.target.value }))} />
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={15} className="text-indigo-500" />
              <Rotulo>Água</Rotulo>
            </div>
            <span className="text-sm text-blue-500 font-medium">{(totalAguaMl / 1000).toFixed(2)} L</span>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <Campo placeholder="ml (ex: 300)" type="number" value={novaAgua} onChange={(e) => setNovaAgua(e.target.value)} />
            </div>
            <button onClick={adicionarAgua} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 text-sm font-medium transition active:opacity-80">Adicionar</button>
          </div>
          <div className="flex gap-2 mb-3">
            {[200, 300, 500].map((ml) => (
              <button key={ml} onClick={() => adicionarAguaRapido(ml)} className={`text-xs px-3 py-1.5 rounded-md border transition active:opacity-70 ${escuro ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>+{ml}ml</button>
            ))}
          </div>
          <div className="space-y-2">
            {registro.aguaEntradas.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className={escuro ? "text-slate-200" : "text-slate-700"}>{a.ml} ml</span>
                <button onClick={() => removerAgua(a.id)} className="text-slate-400">✕</button>
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed size={15} className="text-indigo-500" />
            <Rotulo>Alimentação</Rotulo>
          </div>
          <p className={`text-2xl font-semibold mb-3 ${escuro ? "text-white" : "text-slate-900"}`}>{totalCalorias} kcal</p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <Campo placeholder="Alimento" value={novaRefeicao.nome} onChange={(e) => setNovaRefeicao({ ...novaRefeicao, nome: e.target.value })} />
            </div>
            <div className="w-20 shrink-0">
              <Campo placeholder="kcal" type="number" value={novaRefeicao.kcal} onChange={(e) => setNovaRefeicao({ ...novaRefeicao, kcal: e.target.value })} />
            </div>
          </div>
          <button onClick={adicionarRefeicao} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium mb-3 transition active:opacity-80">Adicionar</button>
          <div className="space-y-2">
            {registro.refeicoes.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className={escuro ? "text-slate-200" : "text-slate-700"}>{r.nome}</span>
                <div className="flex items-center gap-3">
                  <Sutil>{r.kcal} kcal</Sutil>
                  <button onClick={() => removerRefeicao(r.id)} className="text-slate-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </>
  );
}

function TabMental({ registro, atualizarRegistro }) {
  const { escuro } = useTema();
  return (
    <>
      <Titulo>Mental</Titulo>
      <Painel Icone={Brain} corIcone="text-indigo-400">
        <Sutil className="!text-slate-400 text-sm">Saúde mental</Sutil>
        <p className="text-lg font-semibold">Como você está hoje?</p>
      </Painel>

      <Cartao className="mt-6">
        <Rotulo className="mb-3">Como está sua saúde mental</Rotulo>
        <div className="flex justify-between gap-2 mb-4">
          {CARINHAS_HUMOR.map((c) => (
            <button
              key={c.emoji}
              onClick={() => atualizarRegistro((r) => ({ ...r, humorPercent: c.valor, humorEmoji: c.emoji }))}
              className={`text-xl w-11 h-11 rounded-lg flex items-center justify-center transition active:opacity-70 ${
                registro.humorEmoji === c.emoji ? "bg-indigo-500/15 ring-1 ring-indigo-500" : escuro ? "bg-slate-800" : "bg-slate-50"
              }`}
            >
              {c.emoji}
            </button>
          ))}
        </div>
        <CampoDiario
          placeholder="Escreva livremente sobre o seu dia..."
          entradas={registro.notasHumor}
          onAdicionar={(texto) => atualizarRegistro((r) => ({ ...r, notasHumor: [...r.notasHumor, { id: Date.now(), texto, hora: horaAgora() }] }))}
          onRemover={(id) => atualizarRegistro((r) => ({ ...r, notasHumor: r.notasHumor.filter((n) => n.id !== id) }))}
          className="mt-3 h-28"
        />
      </Cartao>
    </>
  );
}

function TabFinancas({ registro, atualizarRegistro, metas, atualizarMetas }) {
  const { escuro } = useTema();
  const [novoGasto, setNovoGasto] = useState({ desc: "", valor: "", categoria: "" });
  const [novoInvest, setNovoInvest] = useState({ valor: "" });
  const [novoFixo, setNovoFixo] = useState({ nome: "", valor: "" });
  const totalGasto = registro.gastos.reduce((s, g) => s + g.valor, 0);
  const totalInvestido = registro.investimentos.reduce((s, i) => s + i.valor, 0);
  const meta = parseFloat(metas.gastoDiario) || 0;
  const dentroDaMeta = meta > 0 ? totalGasto <= meta : null;
  const gastosFixos = Array.isArray(metas.gastosFixos) ? metas.gastosFixos : [];
  const totalFixos = gastosFixos.reduce((s, g) => s + (parseFloat(g.valor) || 0), 0);

  function adicionarGastoFixo() {
    if (!novoFixo.nome || !novoFixo.valor) return;
    atualizarMetas((m) => ({
      ...m,
      gastosFixos: [...(Array.isArray(m.gastosFixos) ? m.gastosFixos : []), { id: Date.now(), nome: novoFixo.nome, valor: novoFixo.valor }],
    }));
    setNovoFixo({ nome: "", valor: "" });
  }
  function removerGastoFixo(id) {
    atualizarMetas((m) => ({ ...m, gastosFixos: (Array.isArray(m.gastosFixos) ? m.gastosFixos : []).filter((g) => g.id !== id) }));
  }

  function adicionarGasto() {
    if (!novoGasto.desc || !novoGasto.valor) return;
    atualizarRegistro((r) => ({ ...r, gastos: [...r.gastos, { id: Date.now(), desc: novoGasto.desc, valor: parseFloat(novoGasto.valor), categoria: novoGasto.categoria }] }));
    setNovoGasto({ desc: "", valor: "", categoria: novoGasto.categoria });
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
      <Titulo>Finanças</Titulo>

      <Painel Icone={Wallet} corIcone="text-emerald-400">
        <div className="flex justify-between items-start">
          <div>
            <Sutil className="!text-slate-400 text-sm">Total gasto neste dia</Sutil>
            <p className="text-2xl font-semibold mt-1">R$ {totalGasto.toFixed(2).replace(".", ",")}</p>
          </div>
          {dentroDaMeta !== null && (
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${dentroDaMeta ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
              {dentroDaMeta ? "dentro da meta" : "acima da meta"}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">Meta diária: R$ {meta ? meta.toFixed(2).replace(".", ",") : "não definida"}</p>
      </Painel>

      <Cartao className="mt-4">
        <Sutil className="text-xs mb-2 block">Definir meta de gasto diário</Sutil>
        <Campo type="number" placeholder="ex: 50.00" value={metas.gastoDiario} onChange={(e) => atualizarMetas((m) => ({ ...m, gastoDiario: e.target.value }))} />
      </Cartao>

      <Cartao className="mt-6">
        <Rotulo className="mb-3">Adicionar gasto</Rotulo>
        <Campo placeholder="Com o que? (ex: almoço)" value={novoGasto.desc} onChange={(e) => setNovoGasto({ ...novoGasto, desc: e.target.value })} className="mb-2" />
        <div className="flex gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Campo placeholder="Valor (ex: 35.90)" type="number" value={novoGasto.valor} onChange={(e) => setNovoGasto({ ...novoGasto, valor: e.target.value })} />
          </div>
          <div className="w-36 shrink-0">
            <CampoSelect value={novoGasto.categoria} onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}>
              <option value="">Sem categoria</option>
              {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{c}</option>)}
            </CampoSelect>
          </div>
        </div>
        <button onClick={adicionarGasto} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition active:opacity-80">Adicionar</button>
      </Cartao>

      <div className="mt-4 space-y-2">
        {registro.gastos.map((g) => (
          <div key={g.id} className={`flex items-center justify-between rounded-lg border p-3 ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <span className={`text-sm ${escuro ? "text-slate-200" : "text-slate-700"}`}>{g.desc}</span>
              <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded ${escuro ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{g.categoria || "Outro"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${escuro ? "text-white" : "text-slate-900"}`}>R$ {g.valor.toFixed(2).replace(".", ",")}</span>
              <button onClick={() => removerGasto(g.id)} className="text-slate-400 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <TituloSecao Icone={PiggyBank}>Investimento do dia</TituloSecao>
        <Cartao>
          <p className="text-2xl font-semibold text-emerald-500 mb-3">R$ {totalInvestido.toFixed(2).replace(".", ",")}</p>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <Campo placeholder="Quanto investiu?" type="number" value={novoInvest.valor} onChange={(e) => setNovoInvest({ valor: e.target.value })} />
            </div>
            <button onClick={adicionarInvestimento} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 text-sm font-medium transition active:opacity-80">Add</button>
          </div>
          <div className="space-y-2 mt-3">
            {registro.investimentos.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <Sutil>Aporte</Sutil>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 font-medium">R$ {i.valor.toFixed(2).replace(".", ",")}</span>
                  <button onClick={() => removerInvestimento(i.id)} className="text-slate-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>

      <div className="mt-8">
        <TituloSecao Icone={Receipt}>Gastos fixos</TituloSecao>
        <Sutil className="text-xs block mb-3">Não entra na meta de gasto diário — é só pra acompanhar o total fixo do mês.</Sutil>
        <Cartao>
          <p className="mb-4">
            <span className={`text-2xl font-semibold ${escuro ? "text-white" : "text-slate-900"}`}>R$ {totalFixos.toFixed(2).replace(".", ",")}</span>
            <span className="text-sm text-slate-400"> /mês</span>
          </p>

          <div className="flex gap-2 mb-2">
            <div className="flex-[1.4] min-w-0">
              <CampoSelect value={novoFixo.nome} onChange={(e) => setNovoFixo({ ...novoFixo, nome: e.target.value })}>
                <option value="">Qual gasto?</option>
                {GASTOS_FIXOS_PADRAO.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
              </CampoSelect>
            </div>
            <div className="flex-1 min-w-0">
              <Campo type="number" placeholder="Valor" value={novoFixo.valor} onChange={(e) => setNovoFixo({ ...novoFixo, valor: e.target.value })} />
            </div>
          </div>
          <button onClick={adicionarGastoFixo} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium mb-3 transition active:opacity-80">Adicionar</button>

          {gastosFixos.length === 0 && <Sutil className="text-sm">Nenhum gasto fixo cadastrado ainda.</Sutil>}
          <div className="space-y-2">
            {gastosFixos.map((g) => (
              <div key={g.id} className="flex items-center justify-between text-sm">
                <span className={escuro ? "text-slate-200" : "text-slate-700"}>{g.nome}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${escuro ? "text-white" : "text-slate-900"}`}>R$ {parseFloat(g.valor || 0).toFixed(2).replace(".", ",")}</span>
                  <button onClick={() => removerGastoFixo(g.id)} className="text-slate-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </>
  );
}

function TabVida({ registro, atualizarRegistro, perfil }) {
  const trabalhoPercent = Math.round((registro.trabalhoClassificacao / (NIVEL_TRABALHO.length - 1)) * 100);

  return (
    <>
      <Titulo>Vida</Titulo>

      <Painel Icone={Compass} corIcone="text-indigo-400">
        <Sutil className="!text-slate-400 text-sm">Trabalho & relacionamento</Sutil>
        <p className="text-lg font-semibold">O que construiu hoje?</p>
      </Painel>

      <div className="mt-6">
        <TituloSecao Icone={Briefcase}>Trabalho</TituloSecao>
        <Cartao>
          <div className="flex justify-between items-center mb-2">
            <Rotulo>Como foi seu dia de trabalho?</Rotulo>
            <span className="text-sm font-medium text-indigo-500">{NIVEL_TRABALHO[registro.trabalhoClassificacao]}</span>
          </div>
          <input
            type="range" min="0" max="4" step="1"
            value={registro.trabalhoClassificacao}
            onChange={(e) => atualizarRegistro((r) => ({ ...r, trabalhoClassificacao: parseInt(e.target.value) }))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] mt-1 mb-2">
            <Sutil>Improdutivo</Sutil>
            <Sutil>Muito produtivo</Sutil>
          </div>
          <BarraPercentual valor={trabalhoPercent} />
        </Cartao>

        <Cartao className="mt-3">
          <Rotulo className="mb-2">O que você aprendeu hoje?</Rotulo>
          <CampoDiario
            placeholder="Compartilhe algo novo que aprendeu..."
            entradas={registro.notasAprendizado}
            onAdicionar={(texto) => atualizarRegistro((r) => ({ ...r, notasAprendizado: [...r.notasAprendizado, { id: Date.now(), texto, hora: horaAgora() }] }))}
            onRemover={(id) => atualizarRegistro((r) => ({ ...r, notasAprendizado: r.notasAprendizado.filter((n) => n.id !== id) }))}
            className="h-24"
          />
        </Cartao>

        {perfil.acompanharLeitura !== false && (
          <Cartao className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={15} className="text-indigo-500" />
              <Rotulo>Leitura</Rotulo>
            </div>
            <Campo placeholder="Qual livro?" value={registro.leituraLivro} onChange={(e) => atualizarRegistro((r) => ({ ...r, leituraLivro: e.target.value }))} className="mb-2" />
            <Campo placeholder="Quantas páginas leu hoje?" type="number" value={registro.leituraPaginas} onChange={(e) => atualizarRegistro((r) => ({ ...r, leituraPaginas: e.target.value }))} />
          </Cartao>
        )}
      </div>

      {perfil.acompanharRelacionamento !== false && (
        <div className="mt-8">
          <TituloSecao Icone={Heart}>Relacionamento</TituloSecao>
          <Cartao>
            <Rotulo className="mb-2">Esposa — como foi seu dia com ela?</Rotulo>
            <CampoDiario
              placeholder="Escreva livremente..."
              entradas={registro.notasRelacionamento}
              onAdicionar={(texto) => atualizarRegistro((r) => ({ ...r, notasRelacionamento: [...r.notasRelacionamento, { id: Date.now(), texto, hora: horaAgora() }] }))}
              onRemover={(id) => atualizarRegistro((r) => ({ ...r, notasRelacionamento: r.notasRelacionamento.filter((n) => n.id !== id) }))}
              className="h-24"
            />
          </Cartao>
          <Cartao className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Users size={15} className="text-indigo-500" />
              <Rotulo>Família — como foi com a família em geral?</Rotulo>
            </div>
            <CampoDiario
              placeholder="Escreva livremente..."
              entradas={registro.notasFamilia}
              onAdicionar={(texto) => atualizarRegistro((r) => ({ ...r, notasFamilia: [...r.notasFamilia, { id: Date.now(), texto, hora: horaAgora() }] }))}
              onRemover={(id) => atualizarRegistro((r) => ({ ...r, notasFamilia: r.notasFamilia.filter((n) => n.id !== id) }))}
              className="h-24"
            />
          </Cartao>
        </div>
      )}
    </>
  );
}

function TabMetas({ dadosPorDia, metas, atualizarMetas, registro }) {
  const mesAtual = mesDoIso(hojeISO());
  const registrosDoMes = Object.entries(dadosPorDia).filter(([iso]) => mesDoIso(iso) === mesAtual).map(([, r]) => r);
  const totalInvestidoMes = registrosDoMes.reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
  const metaInvest = parseFloat(metas.investimentoMensal) || 0;
  const progressoInvest = metaInvest > 0 ? Math.round((totalInvestidoMes / metaInvest) * 100) : 0;
  const diasComSonoOk = registrosDoMes.filter((r) => dormiuNaMeta(r.horaDormiu, metas.horaDormirMeta)).length;
  const diasComAtividadeMes = registrosDoMes.filter((r) => r.atividadeFisica?.feita).length;
  const metaAtividade = parseFloat(metas.atividadeFisicaMetaMes) || 0;
  const progressoAtividade = metaAtividade > 0 ? Math.round((diasComAtividadeMes / metaAtividade) * 100) : 0;
  const pesoAtual = parseFloat(registro.peso) || null;
  const pesoMeta = parseFloat(metas.pesoMeta) || null;
  const aguaHojeLitros = (registro.aguaEntradas || []).reduce((s, a) => s + a.ml, 0) / 1000;
  const metaAgua = parseFloat(metas.aguaMetaLitros) || 0;

  return (
    <>
      <Titulo>Metas</Titulo>
      <Painel Icone={Target} corIcone="text-indigo-400">
        <Sutil className="!text-slate-400 text-sm capitalize">{nomeMesCompleto(mesAtual)}</Sutil>
        <p className="text-lg font-semibold">Acompanhe seu progresso</p>
      </Painel>

      <Cartao className="mt-6">
        <Rotulo className="mb-2">Meta pessoal</Rotulo>
        <CampoMetaPessoal valor={metas.metaPessoal} onSalvar={(v) => atualizarMetas((m) => ({ ...m, metaPessoal: v }))} />
      </Cartao>

      <Cartao className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={15} className="text-emerald-500" />
          <Rotulo>Meta de investimento mensal</Rotulo>
        </div>
        <Campo type="number" placeholder="ex: 500.00" value={metas.investimentoMensal} onChange={(e) => atualizarMetas((m) => ({ ...m, investimentoMensal: e.target.value }))} className="mb-3" />
        <div className="flex justify-between text-sm mb-1">
          <Sutil>R$ {totalInvestidoMes.toFixed(2).replace(".", ",")}</Sutil>
          <Sutil>meta R$ {metaInvest.toFixed(2).replace(".", ",")}</Sutil>
        </div>
        <BarraPercentual valor={progressoInvest} cor="bg-emerald-500" />
        <Sutil className="text-xs mt-2 block">{progressoInvest}% da meta do mês</Sutil>
      </Cartao>

      <Cartao className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell size={15} className="text-indigo-500" />
          <Rotulo>Meta de atividade física no mês</Rotulo>
        </div>
        <Campo type="number" placeholder="ex: 12 (dias no mês)" value={metas.atividadeFisicaMetaMes} onChange={(e) => atualizarMetas((m) => ({ ...m, atividadeFisicaMetaMes: e.target.value }))} className="mb-3" />
        <div className="flex justify-between text-sm mb-1">
          <Sutil>{diasComAtividadeMes} dias</Sutil>
          <Sutil>meta {metaAtividade || "—"} dias</Sutil>
        </div>
        <BarraPercentual valor={progressoAtividade} />
      </Cartao>

      <Cartao className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={15} className="text-indigo-500" />
          <Rotulo>Meta de água por dia</Rotulo>
        </div>
        <Campo type="number" placeholder="ex: 2.5 (litros)" value={metas.aguaMetaLitros} onChange={(e) => atualizarMetas((m) => ({ ...m, aguaMetaLitros: e.target.value }))} className="mb-3" />
        <div className="flex justify-between text-sm">
          <Sutil>Hoje: {aguaHojeLitros.toFixed(2)} L</Sutil>
          <Sutil>meta {metaAgua || "—"} L</Sutil>
        </div>
      </Cartao>

      <Cartao className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Moon size={15} className="text-indigo-500" />
          <Rotulo>Meta de horário de sono</Rotulo>
        </div>
        <Campo type="time" value={metas.horaDormirMeta} onChange={(e) => atualizarMetas((m) => ({ ...m, horaDormirMeta: e.target.value }))} className="mb-2" />
        <Sutil className="text-xs">Este mês: {diasComSonoOk} dia(s) dentro da meta</Sutil>
      </Cartao>

      <Cartao className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Scale size={15} className="text-indigo-500" />
          <Rotulo>Meta de peso</Rotulo>
        </div>
        <Campo type="number" placeholder="ex: 75" value={metas.pesoMeta} onChange={(e) => atualizarMetas((m) => ({ ...m, pesoMeta: e.target.value }))} className="mb-2" />
        <div className="flex justify-between text-sm">
          <Sutil>Atual: {pesoAtual ?? "—"} kg</Sutil>
          <Sutil>Meta: {pesoMeta ?? "—"} kg</Sutil>
        </div>
      </Cartao>

      <Cartao className="mt-4">
        <Rotulo className="mb-2">Meta de gasto diário</Rotulo>
        <Sutil className="text-sm">R$ {(parseFloat(metas.gastoDiario) || 0).toFixed(2).replace(".", ",")} por dia — edite na aba Finanças</Sutil>
      </Cartao>
    </>
  );
}

function TabTarefas({ dadosPorDia, atualizarDia, googleConectado, googleFetch, conectarGoogle, desconectarGoogle }) {
  const { escuro } = useTema();
  const [mesVisivel, setMesVisivel] = useState(mesDoIso(hojeISO()));
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO());
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [novaDuracao, setNovaDuracao] = useState("30");
  const [permissao, setPermissao] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [sincronizando, setSincronizando] = useState(false);
  const [erroSync, setErroSync] = useState("");

  const celulas = celulasDoMes(mesVisivel);
  const tarefasDoDia = dadosPorDia[diaSelecionado]?.tarefas || [];
  const nomesDias = ["D", "S", "T", "Q", "Q", "S", "S"];

  function temTarefas(iso) {
    return (dadosPorDia[iso]?.tarefas || []).length > 0;
  }

  async function adicionarTarefa() {
    if (!novaTarefa.trim()) return;
    const id = Date.now();
    const nova = { id, texto: novaTarefa.trim(), feita: false, horario: novoHorario, duracaoMinutos: novoHorario ? (parseInt(novaDuracao) || 30) : null, googleEventId: null };
    atualizarDia(diaSelecionado, (r) => ({ ...r, tarefas: [...r.tarefas, nova] }));
    setNovaTarefa("");
    setNovoHorario("");

    if (googleConectado) {
      try {
        const resp = await googleFetch("/api/google/evento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: diaSelecionado, hora: nova.horario, texto: nova.texto, duracaoMinutos: nova.duracaoMinutos }),
        });
        const json = await resp.json();
        if (json.googleEventId) {
          atualizarDia(diaSelecionado, (r) => ({ ...r, tarefas: r.tarefas.map((t) => (t.id === id ? { ...t, googleEventId: json.googleEventId } : t)) }));
          setErroSync("");
        } else {
          setErroSync("A tarefa foi salva no app, mas não conseguiu sincronizar com o Google agora.");
        }
      } catch (e) {
        setErroSync("A tarefa foi salva no app, mas não conseguiu sincronizar com o Google agora.");
      }
    }
  }

  function toggleTarefa(id) {
    atualizarDia(diaSelecionado, (r) => ({ ...r, tarefas: r.tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)) }));
  }

  function removerTarefa(tarefa) {
    atualizarDia(diaSelecionado, (r) => ({ ...r, tarefas: r.tarefas.filter((t) => t.id !== tarefa.id) }));
    if (googleConectado && tarefa.googleEventId) {
      googleFetch(`/api/google/evento?id=${tarefa.googleEventId}`, { method: "DELETE" }).catch(() => {});
    }
  }

  function ativarLembretes() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then((p) => setPermissao(p));
  }

  async function sincronizarComGoogle(mostrarCarregando = true) {
    if (mostrarCarregando) setSincronizando(true);
    const diasDoMes = celulas.filter(Boolean);
    const inicio = diasDoMes[0];
    const fim = diasDoMes[diasDoMes.length - 1];
    try {
      const resp = await googleFetch(`/api/google/importar?inicio=${inicio}&fim=${fim}`);
      const json = await resp.json();
      (json.eventos || []).forEach((ev) => {
        atualizarDia(ev.data, (r) => {
          const jaExiste = r.tarefas.some((t) => t.googleEventId === ev.googleEventId);
          if (jaExiste) return r;
          return { ...r, tarefas: [...r.tarefas, { id: Date.now() + Math.random(), texto: ev.texto, feita: false, horario: ev.horario, googleEventId: ev.googleEventId }] };
        });
      });
    } catch {}
    if (mostrarCarregando) setSincronizando(false);
  }

  useEffect(() => {
    if (!googleConectado) return;
    sincronizarComGoogle(false);
    const intervalo = setInterval(() => sincronizarComGoogle(false), 60000);
    return () => clearInterval(intervalo);
  }, [googleConectado, mesVisivel]);

  return (
    <>
      <Titulo>Tarefas</Titulo>
      <Painel Icone={CalendarDays} corIcone="text-indigo-400">
        <Sutil className="!text-slate-400 text-sm">Calendário</Sutil>
        <p className="text-lg font-semibold">Organize seus dias</p>
      </Painel>

      <Cartao className="mt-4">
        {googleConectado ? (
          <div className="flex items-center justify-between gap-2">
            <Sutil className="text-xs">Conectado à Google Agenda</Sutil>
            <div className="flex gap-2 shrink-0">
              <button onClick={sincronizarComGoogle} disabled={sincronizando} className={`text-xs px-3 py-1.5 rounded-md border transition active:opacity-70 ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                {sincronizando ? "..." : "Sincronizar"}
              </button>
              <button onClick={desconectarGoogle} className="text-xs px-3 py-1.5 rounded-md text-rose-500">Desconectar</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Sutil className="text-xs">Conecte pra sincronizar com sua Google Agenda</Sutil>
            <button onClick={conectarGoogle} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-md font-medium shrink-0 transition active:opacity-80">Conectar</button>
          </div>
        )}
      </Cartao>

      {permissao !== "granted" && permissao !== "unsupported" && (
        <Cartao className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <Sutil className="text-xs">Ative os lembretes pra ser avisado no horário da tarefa (funciona enquanto o app estiver aberto)</Sutil>
            <button onClick={ativarLembretes} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium shrink-0 transition active:opacity-80">Ativar</button>
          </div>
        </Cartao>
      )}

      <Cartao className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMesVisivel(somarMes(mesVisivel, -1))} className={`w-8 h-8 rounded-lg border flex items-center justify-center ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-500"}`}><ChevronLeft size={14} /></button>
          <p className={`text-sm font-medium capitalize ${escuro ? "text-white" : "text-slate-900"}`}>{nomeMesCompleto(mesVisivel)}</p>
          <button onClick={() => setMesVisivel(somarMes(mesVisivel, 1))} className={`w-8 h-8 rounded-lg border flex items-center justify-center ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-500"}`}><ChevronRight size={14} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {nomesDias.map((d, i) => <Sutil key={i} className="text-[10px] text-center block">{d}</Sutil>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {celulas.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const selecionado = iso === diaSelecionado;
            const hoje = iso === hojeISO();
            return (
              <button
                key={iso}
                onClick={() => setDiaSelecionado(iso)}
                className={`aspect-square rounded-lg text-xs relative flex items-center justify-center transition ${
                  selecionado ? "bg-indigo-600 text-white font-medium" : hoje ? "border border-indigo-500 text-indigo-500" : escuro ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {parseInt(iso.slice(8), 10)}
                {temTarefas(iso) && !selecionado && <span className="w-1 h-1 rounded-full bg-amber-400 absolute bottom-1" />}
              </button>
            );
          })}
        </div>
      </Cartao>

      <div className="mt-6">
        <TituloSecao Icone={CalendarDays}>{formatarData(diaSelecionado)}</TituloSecao>
        <Cartao>
          <div className="flex gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <Campo placeholder="Nova tarefa..." value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()} />
            </div>
            <div className="w-28 shrink-0">
              <div className="relative">
                <Campo type="time" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} />
                {novoHorario && (
                  <button onClick={() => setNovoHorario("")} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-500 text-white text-[9px] flex items-center justify-center">✕</button>
                )}
              </div>
            </div>
            <button onClick={adicionarTarefa} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-12 shrink-0 flex items-center justify-center transition active:opacity-80">
              <Plus size={22} />
            </button>
          </div>

          {novoHorario && (
            <div className="flex items-center gap-2 mb-3">
              <Sutil className="text-xs">Duração:</Sutil>
              <CampoSelect value={novaDuracao} onChange={(e) => setNovaDuracao(e.target.value)} className="w-32">
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1h30</option>
                <option value="120">2 horas</option>
              </CampoSelect>
            </div>
          )}

          {erroSync && (
            <div className="flex items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-3">
              <p className="text-xs text-amber-500">{erroSync}</p>
              <button onClick={() => setErroSync("")} className="text-amber-500 shrink-0">✕</button>
            </div>
          )}

          {tarefasDoDia.length === 0 && <Sutil className="text-sm">Nenhuma tarefa pra esse dia.</Sutil>}

          <div className="space-y-2">
            {tarefasDoDia.map((t) => (
              <div key={t.id} className={`flex items-center justify-between gap-2 rounded-lg border p-3 ${escuro ? "bg-slate-800/60 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                <button onClick={() => toggleTarefa(t.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 ${t.feita ? "bg-indigo-600 border-indigo-600 text-white" : escuro ? "border-slate-600" : "border-slate-300"}`}>
                    {t.feita ? "✓" : ""}
                  </span>
                  <span className="min-w-0">
                    {t.horario && (
                      <span className="text-[11px] text-indigo-500 font-medium block">
                        {t.horario}{t.duracaoMinutos ? ` · ${t.duracaoMinutos >= 60 ? `${Math.floor(t.duracaoMinutos / 60)}h${t.duracaoMinutos % 60 ? t.duracaoMinutos % 60 : ""}` : `${t.duracaoMinutos}min`}` : ""}
                      </span>
                    )}
                    <span className={`text-sm break-words ${t.feita ? "line-through text-slate-400" : escuro ? "text-slate-200" : "text-slate-700"}`}>{t.texto}</span>
                  </span>
                </button>
                <button onClick={() => removerTarefa(t)} className="text-slate-400 shrink-0">✕</button>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </>
  );
}

function TabRelatorios({ dadosPorDia, metas, xpTotal, perfil }) {
  const { escuro } = useTema();
  const [modo, setModo] = useState("mensal");
  const datasOrdenadas = Object.keys(dadosPorDia).sort().reverse();

  const meses = {};
  for (const iso of Object.keys(dadosPorDia)) {
    const chave = mesDoIso(iso);
    if (!meses[chave]) meses[chave] = [];
    meses[chave].push(dadosPorDia[iso]);
  }
  const mesesOrdenados = Object.keys(meses).sort();

  function caloriasDoDia(r) {
    if (!r.atividadeFisica?.feita) return 0;
    const peso = parseFloat(r.peso) || parseFloat(perfil.peso) || 75;
    return calcularCalorias(r.atividadeFisica.tipo, r.atividadeFisica.minutos, peso);
  }
  function minutosDoDia(r) {
    return r.atividadeFisica?.feita ? (parseFloat(r.atividadeFisica.minutos) || 0) : 0;
  }

  const dadosGraficoMensal = mesesOrdenados.map((chave) => {
    const registros = meses[chave];
    const n = registros.length;
    const gastoTotal = registros.reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
    const investidoTotal = registros.reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
    const humorMedio = Math.round(registros.reduce((s, r) => s + (r.humorPercent || 0), 0) / n);
    const fisicaMedia = Math.round(registros.reduce((s, r) => s + (r.saudeFisicaPercent || 0), 0) / n);
    const minutosTotal = registros.reduce((s, r) => s + minutosDoDia(r), 0);
    const caloriasTotal = registros.reduce((s, r) => s + caloriasDoDia(r), 0);
    return { mes: nomeMes(chave), Gasto: Math.round(gastoTotal), Investido: Math.round(investidoTotal), Humor: humorMedio, Fisica: fisicaMedia, Minutos: minutosTotal, Calorias: caloriasTotal };
  });

  const dadosPeso = Object.keys(dadosPorDia).sort().map((iso) => ({ data: formatarData(iso).slice(0, 5), peso: parseFloat(dadosPorDia[iso].peso) || null })).filter((d) => d.peso);

  const totalGastoGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
  const totalInvestidoGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.investimentos || []).reduce((a, i) => a + i.valor, 0), 0);
  const totalMinutosGeral = Object.values(dadosPorDia).reduce((s, r) => s + minutosDoDia(r), 0);
  const totalCaloriasGeral = Object.values(dadosPorDia).reduce((s, r) => s + caloriasDoDia(r), 0);
  const melhorStreak = calcularMelhorStreak(dadosPorDia);
  const pesoRecente = dadosPeso.length ? dadosPeso[dadosPeso.length - 1].peso : null;

  const contagemAtividades = {};
  for (const r of Object.values(dadosPorDia)) {
    if (r.atividadeFisica?.feita && r.atividadeFisica.tipo) {
      contagemAtividades[r.atividadeFisica.tipo] = (contagemAtividades[r.atividadeFisica.tipo] || 0) + 1;
    }
  }
  const dadosPizza = Object.entries(contagemAtividades).map(([nome, valor]) => ({ nome, valor }));

  const gastosPorCategoria = {};
  for (const r of Object.values(dadosPorDia)) {
    for (const g of r.gastos || []) {
      const cat = g.categoria || "Outro";
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + g.valor;
    }
  }
  const dadosPizzaGastos = Object.entries(gastosPorCategoria).map(([nome, valor]) => ({ nome, valor: Math.round(valor) }));

  const corGrade = escuro ? "#1e293b" : "#f1f5f9";
  const corTexto = escuro ? "#64748b" : "#94a3b8";

  const CARDS = [
    { label: "XP total", valor: xpTotal, Icone: Award },
    { label: "Melhor sequência", valor: `${melhorStreak}d`, Icone: Flame },
    { label: "Tempo de atividade", valor: `${totalMinutosGeral} min`, Icone: Timer },
    { label: "Calorias queimadas", valor: `${totalCaloriasGeral} kcal`, Icone: Zap },
    { label: "Investido (total)", valor: `R$ ${totalInvestidoGeral.toFixed(0)}`, Icone: TrendingUp },
    { label: "Gasto (total)", valor: `R$ ${totalGastoGeral.toFixed(0)}`, Icone: Wallet },
  ];

  return (
    <>
      <Titulo>Relatórios</Titulo>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {CARDS.map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <c.Icone size={15} className="text-indigo-500 mb-2" />
            <Sutil className="text-xs">{c.label}</Sutil>
            <p className={`text-lg font-semibold mt-0.5 ${escuro ? "text-white" : "text-slate-900"}`}>{c.valor}</p>
          </div>
        ))}
        <div className={`rounded-xl border p-4 col-span-2 ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <Scale size={15} className="text-indigo-500 mb-2" />
          <Sutil className="text-xs">Peso atual</Sutil>
          <p className={`text-lg font-semibold mt-0.5 ${escuro ? "text-white" : "text-slate-900"}`}>{pesoRecente ?? "—"} kg</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => setModo("mensal")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition active:opacity-80 ${modo === "mensal" ? "bg-indigo-600 text-white" : escuro ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-500"}`}>Mensal</button>
        <button onClick={() => setModo("diario")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition active:opacity-80 ${modo === "diario" ? "bg-indigo-600 text-white" : escuro ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-500"}`}>Diário</button>
      </div>

      {modo === "mensal" && (
        <>
          {dadosPeso.length > 1 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Evolução do peso</h2>
              <Cartao className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosPeso}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                    <XAxis dataKey="data" tick={{ fontSize: 10, fill: corTexto }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          {dadosGraficoMensal.length > 1 && (
            <>
              <div className="mt-6">
                <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Gasto x Investido por mês</h2>
                <Cartao className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoMensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Gasto" fill="#e11d48" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Investido" fill="#0d9488" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Cartao>
              </div>

              <div className="mt-6">
                <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Atividade física: minutos x calorias</h2>
                <Cartao className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoMensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Minutos" fill="#d97706" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Calorias" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Cartao>
              </div>

              <div className="mt-6">
                <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Evolução de humor e disposição</h2>
                <Cartao className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosGraficoMensal}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="Humor" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Fisica" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Cartao>
              </div>
            </>
          )}

          {dadosPizzaGastos.length > 0 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Gastos por categoria</h2>
              <Cartao className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dadosPizzaGastos} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 11, fill: corTexto }}>
                      {dadosPizzaGastos.map((_, i) => <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `R$ ${v}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          {dadosPizza.length > 0 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Atividades mais praticadas</h2>
              <Cartao className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dadosPizza} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 11, fill: corTexto }}>
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
            {mesesOrdenados.length === 0 && <Sutil className="text-sm">Ainda sem dados suficientes.</Sutil>}
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
              const minutosTotal = registros.reduce((s, r) => s + minutosDoDia(r), 0);
              const caloriasTotal = registros.reduce((s, r) => s + caloriasDoDia(r), 0);
              const metaGasto = parseFloat(metas.gastoDiario) || 0;
              const diasDentroOrcamento = metaGasto > 0 ? registros.filter((r) => (r.gastos || []).reduce((a, g) => a + g.valor, 0) <= metaGasto).length : null;
              return (
                <Cartao key={chave} className="border-l-2 border-l-indigo-500">
                  <p className={`font-semibold text-sm capitalize mb-2 ${escuro ? "text-white" : "text-slate-900"}`}>{nomeMesCompleto(chave)}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <Sutil>Dias registrados: {n}</Sutil>
                    <Sutil>Dias sem fumar: {diasSemFumar}</Sutil>
                    <Sutil>Atividade física: {diasAtividade} dias</Sutil>
                    <Sutil>Minutos totais: {minutosTotal}</Sutil>
                    <Sutil>Calorias: {caloriasTotal} kcal</Sutil>
                    <Sutil>Sono dentro da meta: {diasSonoOk}</Sutil>
                    <Sutil>Humor médio: {humorMedio}%</Sutil>
                    <Sutil>Disposição média: {fisicaMedia}%</Sutil>
                    <Sutil>Peso médio: {pesoMedio} kg</Sutil>
                    <Sutil>Gasto total: R$ {gastoTotal.toFixed(2).replace(".", ",")}</Sutil>
                    <Sutil>Investido total: R$ {investidoTotal.toFixed(2).replace(".", ",")}</Sutil>
                    {diasDentroOrcamento !== null && <Sutil>Dentro do orçamento: {diasDentroOrcamento}</Sutil>}
                  </div>
                </Cartao>
              );
            })}
          </div>
        </>
      )}

      {modo === "diario" && (
        <div className="mt-6 space-y-3">
          {datasOrdenadas.length === 0 && <Sutil className="text-sm">Ainda sem dias registrados.</Sutil>}
          {datasOrdenadas.map((iso) => {
            const r = dadosPorDia[iso];
            const gastoTotal = (r.gastos || []).reduce((s, g) => s + g.valor, 0);
            const investidoTotal = (r.investimentos || []).reduce((s, i) => s + i.valor, 0);
            const kcalTotal = (r.refeicoes || []).reduce((s, x) => s + x.kcal, 0);
            return (
              <Cartao key={iso} className={`border-l-2 ${escuro ? "border-l-slate-700" : "border-l-slate-300"}`}>
                <div className="flex justify-between items-center mb-2">
                  <p className={`font-semibold text-sm ${escuro ? "text-white" : "text-slate-900"}`}>{formatarData(iso)}</p>
                  <span className="text-xs">{r.fumei === false ? "não fumou" : r.fumei === true ? "fumou" : "sem resposta"}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <Sutil>Mental: {r.humorPercent}%</Sutil>
                  <Sutil>Disposição: {r.saudeFisicaPercent}%</Sutil>
                  <Sutil>Atividade: {r.atividadeFisica?.feita ? `${r.atividadeFisica.tipo || "sim"} (${r.atividadeFisica.minutos || 0}min)` : "não"}</Sutil>
                  <Sutil>Calorias: {caloriasDoDia(r)} kcal</Sutil>
                  <Sutil>Sono: {r.horaDormiu || "—"}</Sutil>
                  <Sutil>Peso: {r.peso || "—"} kg</Sutil>
                  <Sutil>Gasto: R$ {gastoTotal.toFixed(2).replace(".", ",")}</Sutil>
                  <Sutil>Investido: R$ {investidoTotal.toFixed(2).replace(".", ",")}</Sutil>
                  <Sutil>Alimentação: {kcalTotal} kcal</Sutil>
                  <Sutil>Água: {(((r.aguaEntradas || []).reduce((s, a) => s + a.ml, 0)) / 1000).toFixed(2)} L</Sutil>
                </div>
              </Cartao>
            );
          })}
        </div>
      )}
    </>
  );
}