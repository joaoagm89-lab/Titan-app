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
  BookOpen, Heart, Users, Flame, Timer, Zap, PiggyBank, Award, LogOut, Wine, Receipt, Landmark, TrendingDown, Baby, Menu, Check, User, Camera,
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

function gerarNiveis() {
  const niveis = [{ nivel: 1, xpNecessario: 0 }];
  let acumulado = 0;
  for (let n = 2; n <= 80; n++) {
    const custoDesteNivel = 100 + (n - 2) * 12;
    acumulado += custoDesteNivel;
    niveis.push({ nivel: n, xpNecessario: acumulado });
  }
  return niveis;
}
const NIVEIS = gerarNiveis();

const RECOMPENSAS_PADRAO = [
  { nivelMinimo: 1, texto: "Algo pequeno que você goste, até R$ 15 (um lanche, um docinho...)" },
  { nivelMinimo: 6, texto: "Até R$ 30 — um livro, um streaming, uma comidinha melhor" },
  { nivelMinimo: 16, texto: "Até R$ 60 — uma roupa, um acessório, um jantar fora" },
  { nivelMinimo: 31, texto: "Até R$ 120 — algo que você vem adiando comprar" },
  { nivelMinimo: 51, texto: "Uma recompensa grande — uma viagem curta, um equipamento, aquele item especial" },
];

function obterRecompensaPorNivel(nivel, recompensas) {
  const lista = Array.isArray(recompensas) && recompensas.length > 0 ? recompensas : RECOMPENSAS_PADRAO;
  const ordenadas = [...lista].sort((a, b) => a.nivelMinimo - b.nivelMinimo);
  let atual = ordenadas[0];
  for (const r of ordenadas) if (nivel >= r.nivelMinimo) atual = r;
  return atual?.texto || "";
}

const XP_NAO_FUMAR = 40;
const XP_NAO_BEBER = 30;
const XP_ATIVIDADE = 30;
const XP_SONO_META = 15;
const XP_META_AGUA = 15;
const XP_META_GASTO = 20;
const XP_MARCO_PATRIMONIO = 50;
const XP_DIVIDA_ZERADA = 40;
const MARCOS_PATRIMONIO = [10000, 30000, 50000, 100000];

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
  atividadesFisicas: [],
  horaDormiu: "",
  gastos: [],
  investimentos: [],
  humorPercent: 70,
  humorEmoji: "",
  notasHumor: [],
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
const CATEGORIAS_GASTO = [
  "Alimentação", "Mercado/Supermercado", "Transporte", "Combustível", "Lazer",
  "Saúde", "Educação", "Aluguel", "Condomínio", "Luz", "Água", "Internet",
  "Telefone/Celular", "Cartão de crédito", "Empréstimo", "Financiamento",
  "Seguro", "IPTU/IPVA", "Streaming/Assinaturas", "Vestuário", "Presentes",
  "Pets", "Beleza/Cuidados pessoais", "Manutenção/Casa", "Outro",
];

const METAS_PADRAO = {
  gastoDiario: "",
  investimentoMensal: "",
  horaDormirMeta: "22:00",
  pesoMeta: "",
  metaPessoal: "",
  atividadeFisicaMetaMes: "",
  aguaMetaLitros: "",
  gastosFixosPorMes: {},
  recompensasPorNivel: RECOMPENSAS_PADRAO,
  dividasLancamentos: [],
  outrosAtivosManual: "",
  custoDiarioCigarroAntes: "",
  dataPrevistaBebe: "",
  investimentosDetalhados: [],
};

const MODULOS_PRINCIPAIS = [
  { chave: "saude", label: "Saúde (cigarro, atividade física, sono, água...)" },
  { chave: "mental", label: "Mental" },
  { chave: "financas", label: "Finanças" },
  { chave: "vida", label: "Vida (trabalho, leitura, relacionamento)" },
  { chave: "tarefas", label: "Tarefas e calendário" },
  { chave: "metas", label: "Metas" },
  { chave: "patrimonio", label: "Patrimônio" },
];

const SUB_MODULOS_PADRAO = {
  atividadeFisica: true, sono: true, agua: true, alimentacao: true,
  peso: true, disposicao: true, percentualGordura: true,
  gastosDiarios: true, investimento: true, gastosFixos: true,
  trabalho: true,
  investimentosDetalhados: true, marcosPatrimonio: true, economiaCigarro: true, projecaoBebe: true, dividas: true,
};

const TIPOS_INVESTIMENTO = [
  "CDB", "CDI", "LCI/LCA", "Tesouro Direto", "Ações", "Fundos Imobiliários (FIIs)",
  "Fundos de Investimento", "Poupança", "Criptomoeda", "Previdência Privada", "Outro",
];
const LIQUIDEZ_INVESTIMENTO = ["Diária", "No vencimento", "D+30", "D+90", "D+180", "Outro"];

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
function contarDiasEntre(inicio, fim) {
  const d1 = new Date(inicio + "T00:00:00");
  const d2 = new Date(fim + "T00:00:00");
  return Math.round((d2 - d1) / 86400000) + 1;
}
function projetarPatrimonio(historico, dataAlvo) {
  const lista = (Array.isArray(historico) ? historico : []).filter((h) => !isNaN(parseFloat(h.valor))).sort((a, b) => a.data.localeCompare(b.data));
  if (lista.length < 2 || !dataAlvo) return null;
  const primeiro = lista[0];
  const ultimo = lista[lista.length - 1];
  const diasEntre = contarDiasEntre(primeiro.data, ultimo.data);
  if (diasEntre <= 0) return null;
  const crescimentoDiario = (parseFloat(ultimo.valor) - parseFloat(primeiro.valor)) / diasEntre;
  const diasAteAlvo = contarDiasEntre(ultimo.data, dataAlvo);
  if (diasAteAlvo <= 0) return null;
  return parseFloat(ultimo.valor) + crescimentoDiario * diasAteAlvo;
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
function registrarHistorico(historico, valor) {
  const hoje = hojeISO();
  const semHoje = (Array.isArray(historico) ? historico : []).filter((h) => h.data !== hoje);
  return [...semHoje, { data: hoje, valor }].sort((a, b) => a.data.localeCompare(b.data));
}

function calcularCalorias(tipo, minutos, pesoKg) {
  const met = MET_POR_ATIVIDADE[tipo] || MET_POR_ATIVIDADE["Outro"];
  const peso = pesoKg || 75;
  const horas = (parseFloat(minutos) || 0) / 60;
  return Math.round(met * peso * horas);
}
function calcularMelhorStreak(dadosPorDia, campo = "fumei") {
  const datas = Object.keys(dadosPorDia).sort();
  let melhor = 0, atual = 0, anterior = null;
  for (const iso of datas) {
    const reg = dadosPorDia[iso];
    if (reg[campo] === false) {
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

function CampoMetaPessoal({ valor, onSalvar, placeholder = "Escreva uma meta pessoal para você..." }) {
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
        placeholder={placeholder}
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
  const [popupNivel, setPopupNivel] = useState(null);
  const [menuAbaAberto, setMenuAbaAberto] = useState(false);
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

  useEffect(() => {
    if (!perfil) return;
    const modulosAtivos = { saude: true, mental: true, financas: true, vida: true, tarefas: true, metas: true, patrimonio: true, ...(perfil.modulosAtivos || {}) };
    if (aba !== "relatorios" && !modulosAtivos[aba]) {
      const primeiraDisponivel = ["saude", "mental", "financas", "vida", "tarefas", "metas", "patrimonio"].find((m) => modulosAtivos[m]);
      setAba(primeiraDisponivel || "relatorios");
    }
  }, [perfil, aba]);

  useEffect(() => {
    if (!carregado || !perfil) return;
    const xp = calcularXpTotal(dadosPorDia, metas);
    const { atual } = calcularNivel(xp);
    const nivelVisto = perfil.nivelVisto || 1;
    if (atual.nivel > nivelVisto) {
      setPopupNivel(atual.nivel);
      setPerfil((p) => ({ ...p, nivelVisto: atual.nivel }));
    }
  }, [carregado, perfil, dadosPorDia, metas]);

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

  const modulos = { saude: true, mental: true, financas: true, vida: true, tarefas: true, metas: true, patrimonio: true, ...(perfil.modulosAtivos || {}) };
  const subModulos = { ...SUB_MODULOS_PADRAO, ...(perfil.subModulos || {}) };

  const TABS = [
    { id: "saude", label: "Saúde", Icone: Activity },
    { id: "mental", label: "Mental", Icone: Brain },
    { id: "financas", label: "Finanças", Icone: Wallet },
    { id: "vida", label: "Vida", Icone: Compass },
    { id: "tarefas", label: "Tarefas", Icone: CalendarDays },
    { id: "metas", label: "Metas", Icone: Target },
    { id: "patrimonio", label: "Patrimônio", Icone: Landmark },
    { id: "relatorios", label: "Relatórios", Icone: BarChart3 },
  ].filter((tab) => tab.id === "relatorios" || modulos[tab.id]);

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
        <div className="max-w-md mx-auto px-5 py-8">
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
                onAtualizarPerfil={setPerfil}
                subModulos={subModulos}
              />
            )}
            {aba === "mental" && <TabMental registro={registro} atualizarRegistro={atualizarRegistro} />}
            {aba === "financas" && (
              <TabFinancas registro={registro} atualizarRegistro={atualizarRegistro} metas={metas} atualizarMetas={atualizarMetas} mesSelecionado={mesDoIso(dataSelecionada)} diaSelecionado={dataSelecionada} subModulos={subModulos} />
            )}
            {aba === "vida" && <TabVida registro={registro} atualizarRegistro={atualizarRegistro} perfil={perfil} subModulos={subModulos} />}
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
              <TabMetas dadosPorDia={dadosPorDia} metas={metas} atualizarMetas={atualizarMetas} registro={registro} perfil={perfil} />
            )}
            {aba === "patrimonio" && (
              <TabPatrimonio metas={metas} atualizarMetas={atualizarMetas} dadosPorDia={dadosPorDia} subModulos={subModulos} registro={registro} atualizarRegistro={atualizarRegistro} atualizarDia={atualizarDia} diaSelecionado={dataSelecionada} />
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
        {!popupDia && !popupMes && popupNivel && (
          <PopupNivel nivel={popupNivel} recompensa={obterRecompensaPorNivel(popupNivel, metas.recompensasPorNivel)} onFechar={() => setPopupNivel(null)} />
        )}

        <nav className={`fixed bottom-0 left-0 right-0 border-t ${escuro ? "bg-slate-950/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-md`}>
          <div className="max-w-md mx-auto px-4 py-2.5">
            <button
              onClick={() => { navigator.vibrate?.(8); setMenuAbaAberto(true); }}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition active:opacity-70 ${escuro ? "text-white" : "text-slate-900"}`}
            >
              <Menu size={16} className="text-indigo-500" />
              {(() => {
                const atual = TABS.find((t) => t.id === aba);
                return atual ? (
                  <>
                    <atual.Icone size={15} className="text-indigo-500" />
                    <span className="text-sm font-medium">{atual.label}</span>
                  </>
                ) : null;
              })()}
            </button>
          </div>
        </nav>

        {menuAbaAberto && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setMenuAbaAberto(false)}>
            <div
              className={`w-full max-w-md mx-auto rounded-t-2xl p-3 max-h-[75vh] overflow-y-auto ${escuro ? "bg-slate-900" : "bg-white"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-10 h-1 rounded-full mx-auto mb-3 ${escuro ? "bg-slate-700" : "bg-slate-300"}`} />
              <button
                onClick={() => { navigator.vibrate?.(8); setEditandoPerfil(true); setMenuAbaAberto(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition active:opacity-70"
              >
                {perfil.fotoUrl ? (
                  <img src={perfil.fotoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${escuro ? "bg-slate-800" : "bg-slate-200"}`}>
                    <User size={14} className={escuro ? "text-slate-400" : "text-slate-500"} />
                  </div>
                )}
                <span className={`text-sm flex-1 text-left ${escuro ? "text-slate-300" : "text-slate-600"}`}>Perfil</span>
              </button>
              <div className={`h-px my-1 ${escuro ? "bg-slate-800" : "bg-slate-100"}`} />
              {TABS.map((tab) => {
                const ativo = aba === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { navigator.vibrate?.(8); setAba(tab.id); setMenuAbaAberto(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition active:opacity-70 ${ativo ? (escuro ? "bg-slate-800" : "bg-slate-100") : ""}`}
                  >
                    <tab.Icone size={18} className={ativo ? "text-indigo-500" : escuro ? "text-slate-400" : "text-slate-500"} />
                    <span className={`text-sm flex-1 text-left ${ativo ? "font-semibold " + (escuro ? "text-white" : "text-slate-900") : escuro ? "text-slate-300" : "text-slate-600"}`}>
                      {tab.label}
                    </span>
                    {ativo && <Check size={16} className="text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
  const regHoje = dadosPorDia[hojeIso];
  if (!regHoje || regHoje.fumei !== false) {
    if (regHoje && regHoje.fumei === true) return 0;
    cursor = somarDias(hojeIso, -1);
  }
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
  const metaAgua = parseFloat(metas.aguaMetaLitros) || 0;
  const metaGastoDiario = parseFloat(metas.gastoDiario) || 0;
  for (const iso in dadosPorDia) {
    const reg = dadosPorDia[iso];
    if (reg.fumei === false) total += XP_NAO_FUMAR;
    if (reg.bebeu === false) total += XP_NAO_BEBER;
    if ((reg.atividadesFisicas || []).length > 0) total += XP_ATIVIDADE;
    if (dormiuNaMeta(reg.horaDormiu, metas.horaDormirMeta)) total += XP_SONO_META;
    if (metaAgua > 0) {
      const aguaDia = (reg.aguaEntradas || []).reduce((s, a) => s + a.ml, 0) / 1000;
      if (aguaDia >= metaAgua) total += XP_META_AGUA;
    }
    if (metaGastoDiario > 0) {
      const gastoVariavelDia = (reg.gastos || []).filter((g) => !g.fixo).reduce((s, g) => s + g.valor, 0);
      if (gastoVariavelDia <= metaGastoDiario) total += XP_META_GASTO;
    }
  }

  const investimentosDet = Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : [];
  const dividasLanc = Array.isArray(metas.dividasLancamentos) ? metas.dividasLancamentos : [];
  if (investimentosDet.length > 0) {
    const patAtual = investimentosDet.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0) + (parseFloat(metas.outrosAtivosManual) || 0);
    const divAtual = dividasLanc.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
    const liquido = patAtual - divAtual;
    for (const marco of MARCOS_PATRIMONIO) {
      if (liquido >= marco) total += XP_MARCO_PATRIMONIO;
    }
    if (dividasLanc.length > 0 && divAtual <= 0) total += XP_DIVIDA_ZERADA;
  }

  return total;
}

function Onboarding({ onConcluir }) {
  const { escuro, alternar } = useTema();
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({
    nome: "", idade: "", peso: "", sexo: "",
    acompanharCigarro: true, acompanharBebida: true, acompanharRelacionamento: true, acompanharLeitura: true,
    modulosAtivos: { saude: true, mental: true, financas: true, vida: true, tarefas: true, metas: true, patrimonio: true },
  });
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
            <Sutil className="text-sm mb-4 block mt-1">Escolha quais partes do app você quer usar. Pode mudar depois, quando quiser.</Sutil>
            <div className="space-y-2 mb-5">
              {MODULOS_PRINCIPAIS.map((mod) => (
                <label key={mod.chave} className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={form.modulosAtivos[mod.chave]}
                    onChange={(e) => setForm({ ...form, modulosAtivos: { ...form.modulosAtivos, [mod.chave]: e.target.checked } })}
                  />
                  {mod.label}
                </label>
              ))}
            </div>
            <Sutil className="text-xs mb-3 block">Dentro de Saúde e Vida, o que você quer acompanhar:</Sutil>
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
  const atividade = (registro.atividadesFisicas || []).length > 0;
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

function PopupNivel({ nivel, recompensa, onFechar }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
      <Confete />
      <div className="max-w-sm w-full rounded-xl p-6 border bg-slate-900 border-slate-800 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
          <Award size={28} className="text-white" />
        </div>
        <p className="text-xs text-indigo-400 uppercase tracking-wide mb-1">Subiu de nível</p>
        <h3 className="text-2xl font-bold text-white mb-4">Nível {nivel}!</h3>
        {recompensa && (
          <div className="bg-slate-800/60 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-300">🎁 {recompensa}</p>
          </div>
        )}
        <button onClick={onFechar} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium transition active:opacity-80">
          Bora continuar
        </button>
      </div>
    </div>
  );
}

function PopupResumoMes({ mesIso, dadosPorDia, metas, onFechar }) {
  const registros = Object.entries(dadosPorDia).filter(([iso]) => mesDoIso(iso) === mesIso).map(([, r]) => r);
  const n = registros.length;
  const investidoTotal = (Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).filter((i) => mesDoIso(i.data) === mesIso).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
  const metaInvest = parseFloat(metas.investimentoMensal) || 0;
  const bateuInvest = metaInvest > 0 ? investidoTotal >= metaInvest : null;
  const diasAtividade = registros.filter((r) => (r.atividadesFisicas || []).length > 0).length;
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

function ToggleLinha({ label, checked, onChange, escuro }) {
  return (
    <label className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function processarFoto(arquivo, callback) {
  const leitor = new FileReader();
  leitor.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const tamanho = 300;
      const canvas = document.createElement("canvas");
      canvas.width = tamanho;
      canvas.height = tamanho;
      const ctx = canvas.getContext("2d");
      const lado = Math.min(img.width, img.height);
      const sx = (img.width - lado) / 2;
      const sy = (img.height - lado) / 2;
      ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tamanho, tamanho);
      callback(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = e.target.result;
  };
  leitor.readAsDataURL(arquivo);
}

function EditarPerfilModal({ perfil, onSalvar, onCancelar }) {
  const { escuro } = useTema();
  const [form, setForm] = useState({
    acompanharCigarro: true, acompanharBebida: true, acompanharRelacionamento: true, acompanharLeitura: true,
    altura: "", percentualGordura: "", fotoUrl: "", salarioLiquido: "",
    modulosAtivos: { saude: true, mental: true, financas: true, vida: true, tarefas: true, metas: true, patrimonio: true },
    ...perfil,
    modulosAtivos: { saude: true, mental: true, financas: true, vida: true, tarefas: true, metas: true, patrimonio: true, ...(perfil.modulosAtivos || {}) },
    subModulos: { ...SUB_MODULOS_PADRAO, ...(perfil.subModulos || {}) },
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
      <div className={`rounded-xl p-6 max-w-sm w-full border max-h-[85vh] overflow-y-auto ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <h3 className={`font-semibold text-lg mb-4 ${escuro ? "text-white" : "text-slate-900"}`}>Editar perfil</h3>

        <div className="flex justify-center mb-5">
          <label className="relative cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                if (arquivo) processarFoto(arquivo, (url) => setForm((f) => ({ ...f, fotoUrl: url })));
              }}
            />
            {form.fotoUrl ? (
              <img src={form.fotoUrl} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/30" />
            ) : (
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-indigo-500/30 ${escuro ? "bg-slate-800" : "bg-slate-100"}`}>
                <User size={36} className={escuro ? "text-slate-500" : "text-slate-400"} />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-slate-900">
              <Camera size={14} className="text-white" />
            </div>
          </label>
        </div>

        <div className="space-y-3">
          <Campo placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Campo placeholder="Idade" type="number" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} />
          <Campo placeholder="Peso (kg)" type="number" value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
          <Campo placeholder="Altura (cm)" type="number" value={form.altura} onChange={(e) => setForm({ ...form, altura: e.target.value })} />
          <Campo placeholder="% de gordura (opcional)" type="number" value={form.percentualGordura} onChange={(e) => setForm({ ...form, percentualGordura: e.target.value })} />
          <Campo placeholder="Salário líquido (opcional)" type="number" value={form.salarioLiquido} onChange={(e) => setForm({ ...form, salarioLiquido: e.target.value })} />
          <CampoSelect value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </CampoSelect>
        </div>

        <Sutil className="text-xs block mt-5 mb-2">Abas ativas do app</Sutil>
        <div className="space-y-2 mb-5">
          {MODULOS_PRINCIPAIS.map((mod) => (
            <label key={mod.chave} className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border ${escuro ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
              <input
                type="checkbox"
                checked={form.modulosAtivos[mod.chave]}
                onChange={(e) => setForm({ ...form, modulosAtivos: { ...form.modulosAtivos, [mod.chave]: e.target.checked } })}
              />
              {mod.label}
            </label>
          ))}
        </div>

        <Sutil className="text-xs block mb-2 font-medium">🏃 Saúde</Sutil>
        <div className="space-y-2 mb-4">
          <ToggleLinha escuro={escuro} label="Hábito de fumar" checked={form.acompanharCigarro} onChange={(v) => setForm({ ...form, acompanharCigarro: v })} />
          <ToggleLinha escuro={escuro} label="Bebida alcoólica" checked={form.acompanharBebida} onChange={(v) => setForm({ ...form, acompanharBebida: v })} />
          <ToggleLinha escuro={escuro} label="Atividade física" checked={form.subModulos.atividadeFisica} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, atividadeFisica: v } })} />
          <ToggleLinha escuro={escuro} label="Horário de sono" checked={form.subModulos.sono} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, sono: v } })} />
          <ToggleLinha escuro={escuro} label="Disposição" checked={form.subModulos.disposicao} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, disposicao: v } })} />
          <ToggleLinha escuro={escuro} label="Peso" checked={form.subModulos.peso} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, peso: v } })} />
          <ToggleLinha escuro={escuro} label="% de gordura" checked={form.subModulos.percentualGordura} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, percentualGordura: v } })} />
          <ToggleLinha escuro={escuro} label="Água" checked={form.subModulos.agua} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, agua: v } })} />
          <ToggleLinha escuro={escuro} label="Alimentação" checked={form.subModulos.alimentacao} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, alimentacao: v } })} />
        </div>

        <Sutil className="text-xs block mb-2 font-medium">💰 Finanças</Sutil>
        <div className="space-y-2 mb-4">
          <ToggleLinha escuro={escuro} label="Gastos do dia" checked={form.subModulos.gastosDiarios} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, gastosDiarios: v } })} />
          <ToggleLinha escuro={escuro} label="Gastos fixos" checked={form.subModulos.gastosFixos} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, gastosFixos: v } })} />
        </div>

        <Sutil className="text-xs block mb-2 font-medium">🧭 Vida</Sutil>
        <div className="space-y-2 mb-4">
          <ToggleLinha escuro={escuro} label="Trabalho" checked={form.subModulos.trabalho} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, trabalho: v } })} />
          <ToggleLinha escuro={escuro} label="Leitura" checked={form.acompanharLeitura} onChange={(v) => setForm({ ...form, acompanharLeitura: v })} />
          <ToggleLinha escuro={escuro} label="Relacionamento" checked={form.acompanharRelacionamento} onChange={(v) => setForm({ ...form, acompanharRelacionamento: v })} />
        </div>

        <Sutil className="text-xs block mb-2 font-medium">🏛️ Patrimônio</Sutil>
        <div className="space-y-2">
          <ToggleLinha escuro={escuro} label="Meus investimentos" checked={form.subModulos.investimentosDetalhados} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, investimentosDetalhados: v } })} />
          <ToggleLinha escuro={escuro} label="Dívidas" checked={form.subModulos.dividas} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, dividas: v } })} />
          <ToggleLinha escuro={escuro} label="Marcos de patrimônio" checked={form.subModulos.marcosPatrimonio} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, marcosPatrimonio: v } })} />
          <ToggleLinha escuro={escuro} label="Economia por não fumar" checked={form.subModulos.economiaCigarro} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, economiaCigarro: v } })} />
          <ToggleLinha escuro={escuro} label="Projeção até o bebê" checked={form.subModulos.projecaoBebe} onChange={(v) => setForm({ ...form, subModulos: { ...form.subModulos, projecaoBebe: v } })} />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancelar} className={`flex-1 rounded-lg py-2 text-sm transition active:opacity-70 border ${escuro ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"}`}>Cancelar</button>
          <button
            onClick={() => onSalvar({ ...form, historicoPeso: registrarHistorico(form.historicoPeso, form.peso), historicoGordura: registrarHistorico(form.historicoGordura, form.percentualGordura), historicoSalario: registrarHistorico(form.historicoSalario, form.salarioLiquido) })}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition active:opacity-80"
          >
            Salvar
          </button>
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

function TabSaude({ perfil, registro, atualizarRegistro, metas, streak, xpTotal, nivelAtual, proximoNivel, onEditarPerfil, onAtualizarPerfil, subModulos }) {
  const { escuro } = useTema();
  const [novaRefeicao, setNovaRefeicao] = useState({ nome: "", kcal: "" });
  const [novaAgua, setNovaAgua] = useState("");
  const [novaAtividade, setNovaAtividade] = useState({ tipo: "", minutos: "" });
  const progresso = proximoNivel
    ? Math.round(((xpTotal - nivelAtual.xpNecessario) / (proximoNivel.xpNecessario - nivelAtual.xpNecessario)) * 100)
    : 100;
  const sonoOk = dormiuNaMeta(registro.horaDormiu, metas.horaDormirMeta);
  const pesoRef = parseFloat(perfil.peso) || 75;
  const calorias = (registro.atividadesFisicas || []).reduce((s, a) => s + calcularCalorias(a.tipo, a.minutos, pesoRef), 0);
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
  function adicionarAtividade() {
    if (!novaAtividade.tipo || !novaAtividade.minutos) return;
    atualizarRegistro((r) => ({ ...r, atividadesFisicas: [...(r.atividadesFisicas || []), { id: Date.now(), tipo: novaAtividade.tipo, minutos: novaAtividade.minutos }] }));
    setNovaAtividade({ tipo: "", minutos: "" });
  }
  function removerAtividade(id) {
    atualizarRegistro((r) => ({ ...r, atividadesFisicas: (r.atividadesFisicas || []).filter((a) => a.id !== id) }));
  }

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
            <p className="text-xs text-slate-400">Sequência sem fumar: <NumeroAnimado valor={streak} /> dias</p>
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
        <Sutil className="!text-slate-400 text-sm">Seu nível</Sutil>
        <p className="text-3xl font-bold">Nível {nivelAtual.nivel}</p>
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

        {subModulos.atividadeFisica && (
        <Cartao>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={15} className="text-indigo-500" />
            <Rotulo>Atividade física</Rotulo>
            {calorias > 0 && <span className="text-xs text-emerald-500 ml-auto">~{calorias} kcal no dia</span>}
          </div>
          <div className="flex gap-2 mb-2">
            <div className="flex-[1.3] min-w-0">
              <CampoSelect value={novaAtividade.tipo} onChange={(e) => setNovaAtividade({ ...novaAtividade, tipo: e.target.value })}>
                <option value="">Qual atividade?</option>
                {TIPOS_ATIVIDADE.map((t) => <option key={t} value={t}>{t}</option>)}
              </CampoSelect>
            </div>
            <div className="flex-1 min-w-0">
              <Campo type="number" placeholder="Minutos" value={novaAtividade.minutos} onChange={(e) => setNovaAtividade({ ...novaAtividade, minutos: e.target.value })} />
            </div>
          </div>
          <button onClick={adicionarAtividade} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium mb-3 transition active:opacity-80">Adicionar</button>

          {(registro.atividadesFisicas || []).length === 0 && <Sutil className="text-sm">Nenhuma atividade registrada hoje.</Sutil>}
          <div className="space-y-2">
            {(registro.atividadesFisicas || []).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className={escuro ? "text-slate-200" : "text-slate-700"}>{a.tipo} · {a.minutos}min</span>
                <div className="flex items-center gap-3">
                  <Sutil>~{calcularCalorias(a.tipo, a.minutos, pesoRef)} kcal</Sutil>
                  <button onClick={() => removerAtividade(a.id)} className="text-slate-400">✕</button>
                </div>
              </div>
            ))}
          </div>

        </Cartao>
        )}

        {subModulos.sono && (
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
        )}

        {subModulos.disposicao && (
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
        )}

        {subModulos.peso && (
        <Cartao className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={15} className="text-indigo-500" />
            <Rotulo>Peso (kg)</Rotulo>
          </div>
          <Sutil className="text-xs block mb-2">Fica igual todo dia até você alterar — só muda a partir do dia que você atualizar aqui.</Sutil>
          <Campo
            type="number"
            placeholder="ex: 78.5"
            value={perfil.peso || ""}
            onChange={(e) => onAtualizarPerfil({ ...perfil, peso: e.target.value, historicoPeso: registrarHistorico(perfil.historicoPeso, e.target.value) })}
          />
        </Cartao>
        )}

        {subModulos.percentualGordura && (
        <Cartao className="mt-3">
          <Rotulo className="mb-2">% de gordura</Rotulo>
          <Sutil className="text-xs block mb-3">Preencha com o valor que você já sabe (bioimpedância, adipômetro, etc). Fica valendo até você atualizar de novo.</Sutil>
          <Campo
            type="number"
            placeholder="ex: 18.5"
            value={perfil.percentualGordura || ""}
            onChange={(e) => onAtualizarPerfil({ ...perfil, percentualGordura: e.target.value, historicoGordura: registrarHistorico(perfil.historicoGordura, e.target.value) })}
          />
        </Cartao>
        )}

        {subModulos.agua && (
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
        )}

        {subModulos.alimentacao && (
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
        )}
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

function TabFinancas({ registro, atualizarRegistro, metas, atualizarMetas, mesSelecionado, diaSelecionado, subModulos }) {
  const { escuro } = useTema();
  const [novoGasto, setNovoGasto] = useState({ desc: "", valor: "", categoria: "", fixo: false, pagamentoDivida: false });
  const totalGasto = registro.gastos.reduce((s, g) => s + g.valor, 0);
  const totalGastoVariavel = registro.gastos.filter((g) => !g.fixo).reduce((s, g) => s + g.valor, 0);
  const meta = parseFloat(metas.gastoDiario) || 0;
  const dentroDaMeta = meta > 0 ? totalGastoVariavel <= meta : null;

  function adicionarGasto() {
    if (!novoGasto.desc || !novoGasto.valor) return;
    const valorNum = parseFloat(novoGasto.valor);
    atualizarRegistro((r) => ({ ...r, gastos: [...r.gastos, { id: Date.now(), desc: novoGasto.desc, valor: valorNum, categoria: novoGasto.categoria, fixo: novoGasto.fixo }] }));
    if (novoGasto.pagamentoDivida) {
      atualizarMetas((m) => ({
        ...m,
        dividasLancamentos: [...(Array.isArray(m.dividasLancamentos) ? m.dividasLancamentos : []), { id: Date.now() + 1, data: diaSelecionado, descricao: `Pagamento: ${novoGasto.desc}`, valor: -valorNum }],
      }));
    }
    setNovoGasto({ desc: "", valor: "", categoria: novoGasto.categoria, fixo: false, pagamentoDivida: false });
  }
  function removerGasto(id) { atualizarRegistro((r) => ({ ...r, gastos: r.gastos.filter((g) => g.id !== id) })); }

  return (
    <>
      <Titulo>Finanças</Titulo>

      {subModulos.gastosDiarios && (
      <>
      <Painel Icone={Wallet} corIcone="text-emerald-400">
        <div className="flex justify-between items-start">
          <div>
            <Sutil className="!text-slate-400 text-sm">Total gasto neste dia</Sutil>
            <p className="text-2xl font-semibold mt-1">R$ {totalGasto.toFixed(2).replace(".", ",")}</p>
            {totalGasto !== totalGastoVariavel && (
              <Sutil className="text-xs">R$ {totalGastoVariavel.toFixed(2).replace(".", ",")} sem contar os fixos</Sutil>
            )}
          </div>
          {dentroDaMeta !== null && (
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${dentroDaMeta ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
              {dentroDaMeta ? "dentro da meta" : "acima da meta"}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">Meta diária (sem fixos): R$ {meta ? meta.toFixed(2).replace(".", ",") : "não definida"}</p>
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
        {subModulos.gastosFixos && (
          <label className={`flex items-center gap-2 text-sm mb-2 ${escuro ? "text-slate-300" : "text-slate-600"}`}>
            <input type="checkbox" checked={novoGasto.fixo} onChange={(e) => setNovoGasto({ ...novoGasto, fixo: e.target.checked })} />
            É um gasto fixo (aluguel, luz, assinatura...)
          </label>
        )}
        {subModulos.dividas && (
          <label className={`flex items-center gap-2 text-sm mb-3 ${escuro ? "text-slate-300" : "text-slate-600"}`}>
            <input type="checkbox" checked={novoGasto.pagamentoDivida} onChange={(e) => setNovoGasto({ ...novoGasto, pagamentoDivida: e.target.checked })} />
            É pagamento de uma dívida (já diminui em Patrimônio)
          </label>
        )}
        <button onClick={adicionarGasto} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition active:opacity-80">Adicionar</button>
      </Cartao>

      <div className="mt-4 space-y-2">
        {registro.gastos.map((g) => (
          <div key={g.id} className={`flex items-center justify-between rounded-lg border p-3 ${escuro ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <span className={`text-sm ${escuro ? "text-slate-200" : "text-slate-700"}`}>{g.desc}</span>
              <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded ${escuro ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{g.categoria || "Outro"}</span>
              {g.fixo && <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">Fixo</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${escuro ? "text-white" : "text-slate-900"}`}>R$ {g.valor.toFixed(2).replace(".", ",")}</span>
              <button onClick={() => removerGasto(g.id)} className="text-slate-400 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </>
  );
}

function TabVida({ registro, atualizarRegistro, perfil, subModulos }) {
  const trabalhoPercent = Math.round((registro.trabalhoClassificacao / (NIVEL_TRABALHO.length - 1)) * 100);

  return (
    <>
      <Titulo>Vida</Titulo>

      <Painel Icone={Compass} corIcone="text-indigo-400">
        <Sutil className="!text-slate-400 text-sm">Trabalho & relacionamento</Sutil>
        <p className="text-lg font-semibold">O que construiu hoje?</p>
      </Painel>

      <div className="mt-6">
      {subModulos.trabalho && (
        <>
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
        </>
      )}

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

function TabMetas({ dadosPorDia, metas, atualizarMetas, registro, perfil }) {
  const mesAtual = mesDoIso(hojeISO());
  const registrosDoMes = Object.entries(dadosPorDia).filter(([iso]) => mesDoIso(iso) === mesAtual).map(([, r]) => r);
  const totalInvestidoMes = (Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).filter((i) => mesDoIso(i.data) === mesAtual).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
  const metaInvest = parseFloat(metas.investimentoMensal) || 0;
  const progressoInvest = metaInvest > 0 ? Math.round((totalInvestidoMes / metaInvest) * 100) : 0;
  const diasComSonoOk = registrosDoMes.filter((r) => dormiuNaMeta(r.horaDormiu, metas.horaDormirMeta)).length;
  const diasComAtividadeMes = registrosDoMes.filter((r) => (r.atividadesFisicas || []).length > 0).length;
  const metaAtividade = parseFloat(metas.atividadeFisicaMetaMes) || 0;
  const progressoAtividade = metaAtividade > 0 ? Math.round((diasComAtividadeMes / metaAtividade) * 100) : 0;
  const pesoAtual = parseFloat(perfil.peso) || null;
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

      <Painel Icone={Award} corIcone="text-amber-400">
        <Sutil className="!text-slate-400 text-sm">Gamificação</Sutil>
        <p className="text-lg font-semibold">🎁 Recompensas por nível</p>
        <p className="text-xs text-slate-400 mt-1">Quanto mais alto o nível, maior a recompensa. Edite cada faixa como quiser — é isso que aparece na comemoração quando você sobe de nível.</p>
      </Painel>

      {(metas.recompensasPorNivel || RECOMPENSAS_PADRAO).map((r, i) => {
        const lista = metas.recompensasPorNivel || RECOMPENSAS_PADRAO;
        const proximaFaixa = lista[i + 1];
        const faixaTexto = proximaFaixa ? `Níveis ${r.nivelMinimo} a ${proximaFaixa.nivelMinimo - 1}` : `A partir do nível ${r.nivelMinimo}`;
        return (
          <Cartao key={r.nivelMinimo} className="mt-3">
            <Rotulo className="mb-2">{faixaTexto}</Rotulo>
            <CampoArea
              value={r.texto}
              onChange={(e) => {
                const novaLista = lista.map((item) => (item.nivelMinimo === r.nivelMinimo ? { ...item, texto: e.target.value } : item));
                atualizarMetas((m) => ({ ...m, recompensasPorNivel: novaLista }));
              }}
              placeholder="Ex: até R$ 30 em algo que você goste"
              className="h-16"
            />
          </Cartao>
        );
      })}

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

function TabPatrimonio({ metas, atualizarMetas, dadosPorDia, subModulos, registro, atualizarRegistro, atualizarDia, diaSelecionado }) {
  const { escuro } = useTema();
  const [novaDivida, setNovaDivida] = useState({ descricao: "", valor: "" });
  const [novoInvestDet, setNovoInvestDet] = useState({ banco: "", tipo: "", liquidez: "", valor: "" });
  const [novoResgate, setNovoResgate] = useState({ valor: "", banco: "" });

  const investimentosDetalhados = Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : [];
  const dividasLancamentos = Array.isArray(metas.dividasLancamentos) ? metas.dividasLancamentos : [];

  const outrosAtivos = parseFloat(metas.outrosAtivosManual) || 0;
  const patrimonioAtual = investimentosDetalhados.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0) + outrosAtivos;
  const dividasAtual = dividasLancamentos.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
  const patrimonioLiquido = patrimonioAtual - dividasAtual;

  function adicionarInvestimentoDetalhado() {
    if (!novoInvestDet.banco || !novoInvestDet.valor) return;
    const valorNum = parseFloat(novoInvestDet.valor);
    atualizarMetas((m) => ({
      ...m,
      investimentosDetalhados: [...(Array.isArray(m.investimentosDetalhados) ? m.investimentosDetalhados : []), { id: Date.now(), data: diaSelecionado, banco: novoInvestDet.banco, tipo: novoInvestDet.tipo, liquidez: novoInvestDet.liquidez, valor: valorNum }],
    }));
    setNovoInvestDet({ banco: "", tipo: "", liquidez: "", valor: "" });
  }
  function removerInvestimentoDetalhado(item) {
    atualizarMetas((m) => ({ ...m, investimentosDetalhados: (Array.isArray(m.investimentosDetalhados) ? m.investimentosDetalhados : []).filter((i) => i.id !== item.id) }));
  }
  function adicionarResgate() {
    if (!novoResgate.valor) return;
    const valorNum = parseFloat(novoResgate.valor);
    atualizarMetas((m) => ({
      ...m,
      investimentosDetalhados: [...(Array.isArray(m.investimentosDetalhados) ? m.investimentosDetalhados : []), { id: Date.now(), data: diaSelecionado, banco: novoResgate.banco || "Resgate", tipo: "Resgate", liquidez: "", valor: -valorNum }],
    }));
    setNovoResgate({ valor: "", banco: "" });
  }
  function adicionarDivida() {
    if (!novaDivida.descricao || !novaDivida.valor) return;
    atualizarMetas((m) => ({
      ...m,
      dividasLancamentos: [...(Array.isArray(m.dividasLancamentos) ? m.dividasLancamentos : []), { id: Date.now(), data: diaSelecionado, descricao: novaDivida.descricao, valor: parseFloat(novaDivida.valor) }],
    }));
    setNovaDivida({ descricao: "", valor: "" });
  }
  function removerDivida(id) {
    atualizarMetas((m) => ({ ...m, dividasLancamentos: (Array.isArray(m.dividasLancamentos) ? m.dividasLancamentos : []).filter((d) => d.id !== id) }));
  }

  function serieCumulativaISO(lancamentos) {
    const ordenados = [...(Array.isArray(lancamentos) ? lancamentos : [])].filter((l) => l.data && !isNaN(parseFloat(l.valor))).sort((a, b) => a.data.localeCompare(b.data));
    let acumulado = 0;
    const porData = {};
    for (const l of ordenados) {
      acumulado += parseFloat(l.valor);
      porData[l.data] = acumulado;
    }
    return Object.keys(porData).sort().map((data) => ({ data, valor: porData[data] }));
  }

  const serieIsoPatrimonio = serieCumulativaISO(investimentosDetalhados);
  const serieIsoDividas = serieCumulativaISO(dividasLancamentos);
  const dadosGraficoPatrimonio = serieIsoPatrimonio.map((s) => ({ data: formatarData(s.data).slice(0, 5), valor: Math.round(s.valor) }));
  const dadosGraficoDividas = serieIsoDividas.map((s) => ({ data: formatarData(s.data).slice(0, 5), valor: Math.round(s.valor) }));

  const porMesPatrimonio = {};
  for (const s of serieIsoPatrimonio) porMesPatrimonio[mesDoIso(s.data)] = s.valor;
  const dadosGraficoMensalPatrimonio = Object.keys(porMesPatrimonio).sort().map((chave) => ({ mes: nomeMes(chave), Patrimônio: Math.round(porMesPatrimonio[chave]) }));

  const diasSemFumarTotal = Object.values(dadosPorDia).filter((r) => r.fumei === false).length;
  const custoCigarro = parseFloat(metas.custoDiarioCigarroAntes) || 0;
  const economiaCigarro = custoCigarro * diasSemFumarTotal;

  const projecaoBebe = projetarPatrimonio(serieIsoPatrimonio, metas.dataPrevistaBebe);

  const corGrade = escuro ? "#1e293b" : "#f1f5f9";
  const corTexto = escuro ? "#64748b" : "#94a3b8";

  return (
    <>
      <Titulo>Patrimônio</Titulo>

      <Painel Icone={Landmark} corIcone="text-emerald-400">
        <Sutil className="!text-slate-400 text-sm">Patrimônio líquido</Sutil>
        <p className={`text-2xl font-bold mt-1 break-words ${patrimonioLiquido < 0 ? "text-rose-400" : "text-white"}`}>
          R$ {patrimonioLiquido.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-slate-400 mt-2">Ativos (R$ {patrimonioAtual.toFixed(0)}) − Dívidas (R$ {dividasAtual.toFixed(0)})</p>
      </Painel>

      <Cartao className="mt-3">
        <Rotulo className="mb-2">Outros ativos (editável)</Rotulo>
        <Sutil className="text-xs block mb-2">Pra somar coisas que não são "investimento" — imóvel, dinheiro parado, etc. Isso soma direto no Patrimônio (ativos), além do que já vem dos investimentos lançados.</Sutil>
        <Campo type="number" placeholder="ex: 50000" value={metas.outrosAtivosManual} onChange={(e) => atualizarMetas((m) => ({ ...m, outrosAtivosManual: e.target.value }))} />
      </Cartao>

      {subModulos.investimentosDetalhados && (
      <div className="mt-6">
        <TituloSecao Icone={PiggyBank}>Meus investimentos</TituloSecao>
        <Sutil className="text-xs block mb-3">Esse total vira automaticamente seu Patrimônio (ativos) — inclui o que você lançar aqui e na aba Finanças.</Sutil>
        <Cartao>
          <p className={`text-lg font-semibold mb-3 ${escuro ? "text-white" : "text-slate-900"}`}>R$ {patrimonioAtual.toFixed(2).replace(".", ",")}</p>
          <Campo placeholder="Banco/instituição (ex: Nubank)" value={novoInvestDet.banco} onChange={(e) => setNovoInvestDet({ ...novoInvestDet, banco: e.target.value })} className="mb-2" />
          <div className="flex gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <CampoSelect value={novoInvestDet.tipo} onChange={(e) => setNovoInvestDet({ ...novoInvestDet, tipo: e.target.value })}>
                <option value="">Tipo</option>
                {TIPOS_INVESTIMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </CampoSelect>
            </div>
            <div className="flex-1 min-w-0">
              <CampoSelect value={novoInvestDet.liquidez} onChange={(e) => setNovoInvestDet({ ...novoInvestDet, liquidez: e.target.value })}>
                <option value="">Liquidez</option>
                {LIQUIDEZ_INVESTIMENTO.map((l) => <option key={l} value={l}>{l}</option>)}
              </CampoSelect>
            </div>
          </div>
          <Campo type="number" placeholder="Valor" value={novoInvestDet.valor} onChange={(e) => setNovoInvestDet({ ...novoInvestDet, valor: e.target.value })} className="mb-2" />
          <button onClick={adicionarInvestimentoDetalhado} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium mb-3 transition active:opacity-80">Adicionar</button>

          {investimentosDetalhados.length === 0 && <Sutil className="text-sm">Nenhum investimento cadastrado ainda.</Sutil>}
          <div className="space-y-2">
            {[...investimentosDetalhados].reverse().map((i) => (
              <div key={i.id} className={`rounded-lg border p-3 ${escuro ? "border-slate-800" : "border-slate-100"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${escuro ? "text-slate-200" : "text-slate-700"}`}>{i.banco}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${parseFloat(i.valor) < 0 ? "text-rose-400" : escuro ? "text-white" : "text-slate-900"}`}>
                      {parseFloat(i.valor) < 0 ? "− " : ""}R$ {Math.abs(parseFloat(i.valor) || 0).toFixed(2).replace(".", ",")}
                    </span>
                    <button onClick={() => removerInvestimentoDetalhado(i)} className="text-slate-400">✕</button>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  {i.tipo && <span className={`text-[10px] px-1.5 py-0.5 rounded ${escuro ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{i.tipo}</span>}
                  {i.liquidez && <span className={`text-[10px] px-1.5 py-0.5 rounded ${escuro ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{i.liquidez}</span>}
                </div>
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao className="mt-3">
          <Rotulo className="mb-2">Resgatou algum valor?</Rotulo>
          <Sutil className="text-xs block mb-2">Isso já desconta automaticamente do seu Patrimônio (ativos).</Sutil>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <Campo placeholder="De onde? (opcional)" value={novoResgate.banco} onChange={(e) => setNovoResgate({ ...novoResgate, banco: e.target.value })} />
            </div>
            <div className="flex-1 min-w-0">
              <Campo placeholder="Valor" type="number" value={novoResgate.valor} onChange={(e) => setNovoResgate({ ...novoResgate, valor: e.target.value })} />
            </div>
            <button onClick={adicionarResgate} className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 text-sm font-medium transition active:opacity-80">Add</button>
          </div>
        </Cartao>
      </div>
      )}

      {subModulos.dividas && (
      <div className="mt-6">
        <TituloSecao Icone={TrendingDown}>Dívidas</TituloSecao>
        <Sutil className="text-xs block mb-3">Registre aqui quando assumir uma dívida nova. Pagamentos marcados na aba Finanças já vão diminuindo automaticamente.</Sutil>
        <Cartao>
          <p className={`text-lg font-semibold mb-3 ${escuro ? "text-white" : "text-slate-900"}`}>R$ {dividasAtual.toFixed(2).replace(".", ",")}</p>
          <Campo placeholder="Descrição (ex: financiamento do carro)" value={novaDivida.descricao} onChange={(e) => setNovaDivida({ ...novaDivida, descricao: e.target.value })} className="mb-2" />
          <Campo type="number" placeholder="Valor" value={novaDivida.valor} onChange={(e) => setNovaDivida({ ...novaDivida, valor: e.target.value })} className="mb-2" />
          <button onClick={adicionarDivida} className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 text-sm font-medium mb-3 transition active:opacity-80">Registrar nova dívida</button>

          {dividasLancamentos.length === 0 && <Sutil className="text-sm">Nenhuma dívida registrada.</Sutil>}
          <div className="space-y-2">
            {[...dividasLancamentos].reverse().map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className={escuro ? "text-slate-200" : "text-slate-700"}>{d.descricao}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${parseFloat(d.valor) < 0 ? "text-emerald-500" : "text-rose-400"}`}>
                    {parseFloat(d.valor) < 0 ? "− " : ""}R$ {Math.abs(parseFloat(d.valor) || 0).toFixed(2).replace(".", ",")}
                  </span>
                  <button onClick={() => removerDivida(d.id)} className="text-slate-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
      )}

      {subModulos.marcosPatrimonio && (
      <div className="mt-6">
        <TituloSecao Icone={Target}>Marcos</TituloSecao>
        <Cartao>
          <div className="space-y-4">
            {MARCOS_PATRIMONIO.map((marco) => {
              const progresso = Math.min(100, Math.max(0, (patrimonioLiquido / marco) * 100));
              const atingido = patrimonioLiquido >= marco;
              return (
                <div key={marco}>
                  <div className="flex justify-between text-xs mb-1">
                    <Sutil>R$ {marco.toLocaleString("pt-BR")}</Sutil>
                    <span className={atingido ? "text-emerald-500 font-medium" : "text-slate-400"}>{progresso.toFixed(0)}%{atingido ? " ✓" : ""}</span>
                  </div>
                  <BarraPercentual valor={progresso} cor={atingido ? "bg-emerald-500" : "bg-indigo-600"} />
                </div>
              );
            })}
          </div>
        </Cartao>
      </div>
      )}

      {dadosGraficoPatrimonio.length > 1 && (
        <div className="mt-6">
          <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Evolução do patrimônio</h2>
          <Cartao className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosGraficoPatrimonio}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: corTexto }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Cartao>
        </div>
      )}

      {subModulos.dividas && dadosGraficoDividas.length > 1 && (
        <div className="mt-6">
          <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Evolução das dívidas</h2>
          <Cartao className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosGraficoDividas}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: corTexto }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Cartao>
        </div>
      )}

      {dadosGraficoMensalPatrimonio.length > 1 && (
        <div className="mt-6">
          <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Evolução mês a mês</h2>
          <Cartao className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoMensalPatrimonio}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Patrimônio" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Cartao>
        </div>
      )}

      {subModulos.economiaCigarro && (
      <div className="mt-6">
        <TituloSecao Icone={Cigarette}>Economia por não fumar</TituloSecao>
        <Cartao>
          <Sutil className="text-xs block mb-2">Quanto você gastava por dia com cigarro antes de parar?</Sutil>
          <Campo type="number" placeholder="ex: 12.00" value={metas.custoDiarioCigarroAntes} onChange={(e) => atualizarMetas((m) => ({ ...m, custoDiarioCigarroAntes: e.target.value }))} className="mb-3" />
          <p className="text-xs text-slate-400">{diasSemFumarTotal} dia(s) sem fumar registrados</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">R$ {economiaCigarro.toFixed(2).replace(".", ",")}</p>
          <Sutil className="text-xs">economizados até agora</Sutil>
        </Cartao>
      </div>
      )}

      {subModulos.projecaoBebe && (
      <div className="mt-6">
        <TituloSecao Icone={Baby}>Projeção até o bebê</TituloSecao>
        <Cartao>
          <Sutil className="text-xs block mb-2">Data prevista do nascimento</Sutil>
          <div className="w-full overflow-hidden rounded-lg mb-3">
            <Campo type="date" value={metas.dataPrevistaBebe} onChange={(e) => atualizarMetas((m) => ({ ...m, dataPrevistaBebe: e.target.value }))} className="w-full max-w-full box-border" />
          </div>
          {!metas.dataPrevistaBebe && <Sutil className="text-xs">Defina a data pra ver a projeção.</Sutil>}
          {metas.dataPrevistaBebe && projecaoBebe === null && (
            <Sutil className="text-xs">Registre investimentos em pelo menos 2 datas diferentes pra calcular a tendência.</Sutil>
          )}
          {projecaoBebe !== null && (
            <>
              <p className={`text-xl font-bold mt-1 break-words ${projecaoBebe >= 0 ? "text-indigo-500" : "text-rose-500"}`}>
                R$ {projecaoBebe.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <Sutil className="text-xs">projeção de patrimônio (ativos) pra essa data, baseado no seu ritmo de crescimento atual</Sutil>
            </>
          )}
        </Cartao>
      </div>
      )}
    </>
  );
}

function TabRelatorios({ dadosPorDia, metas, xpTotal, perfil }) {
  const modulos = { saude: true, mental: true, financas: true, vida: true, tarefas: true, metas: true, patrimonio: true, ...(perfil.modulosAtivos || {}) };
  const acompanhaCigarroRel = perfil.acompanharCigarro !== false;
  const subModulosRel = { ...SUB_MODULOS_PADRAO, ...(perfil.subModulos || {}) };
  const acompanhaBebidaRel = perfil.acompanharBebida !== false;
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
    const peso = parseFloat(perfil.peso) || 75;
    return (r.atividadesFisicas || []).reduce((s, a) => s + calcularCalorias(a.tipo, a.minutos, peso), 0);
  }
  function minutosDoDia(r) {
    return (r.atividadesFisicas || []).reduce((s, a) => s + (parseFloat(a.minutos) || 0), 0);
  }

  function fixosDoMes(chave) {
    const registros = meses[chave] || [];
    return registros.reduce((s, r) => s + (r.gastos || []).filter((g) => g.fixo).reduce((a, g) => a + g.valor, 0), 0);
  }

  const dadosGraficoMensal = mesesOrdenados.map((chave) => {
    const registros = meses[chave] || [];
    const n = registros.length;
    const gastoTotal = registros.reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
    const investidoTotal = (Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).filter((i) => mesDoIso(i.data) === chave).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
    const humorMedio = n ? Math.round(registros.reduce((s, r) => s + (r.humorPercent || 0), 0) / n) : 0;
    const fisicaMedia = n ? Math.round(registros.reduce((s, r) => s + (r.saudeFisicaPercent || 0), 0) / n) : 0;
    const minutosTotal = registros.reduce((s, r) => s + minutosDoDia(r), 0);
    const caloriasTotal = registros.reduce((s, r) => s + caloriasDoDia(r), 0);
    return { mes: nomeMes(chave), Gasto: Math.round(gastoTotal), Investido: Math.round(investidoTotal), Fixo: Math.round(fixosDoMes(chave)), Humor: humorMedio, Fisica: fisicaMedia, Minutos: minutosTotal, Calorias: caloriasTotal };
  });

  const dadosPeso = (Array.isArray(perfil.historicoPeso) ? perfil.historicoPeso : [])
    .filter((h) => parseFloat(h.valor))
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((h) => ({ data: formatarData(h.data).slice(0, 5), peso: parseFloat(h.valor) }));

  const totalGastoGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
  const totalGastoVariavelGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.gastos || []).filter((g) => !g.fixo).reduce((a, g) => a + g.valor, 0), 0);
  const primeiroDiaGeral = perfil.dataInicioApp || perfil.dataCadastro || Object.keys(dadosPorDia).sort()[0] || hojeISO();
  const diasCorridosGeral = Math.max(1, contarDiasEntre(primeiroDiaGeral, hojeISO()));
  const gastoMedioDiarioGeral = totalGastoVariavelGeral / diasCorridosGeral;
  const totalInvestidoGeral = (Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
  const totalMinutosGeral = Object.values(dadosPorDia).reduce((s, r) => s + minutosDoDia(r), 0);
  const totalCaloriasGeral = Object.values(dadosPorDia).reduce((s, r) => s + caloriasDoDia(r), 0);
  const melhorStreak = calcularMelhorStreak(dadosPorDia, "fumei");
  const melhorStreakBebida = calcularMelhorStreak(dadosPorDia, "bebeu");
  const totalAtividadesGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.atividadesFisicas || []).length, 0);
  const pesoRecente = dadosPeso.length ? dadosPeso[dadosPeso.length - 1].peso : null;

  const contagemAtividades = {};
  for (const r of Object.values(dadosPorDia)) {
    for (const a of r.atividadesFisicas || []) {
      if (a.tipo) contagemAtividades[a.tipo] = (contagemAtividades[a.tipo] || 0) + 1;
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

  const totalFixosGeral = Object.values(dadosPorDia).reduce((s, r) => s + (r.gastos || []).filter((g) => g.fixo).reduce((a, g) => a + g.valor, 0), 0);

  const CARDS = [
    { label: "XP total", valor: xpTotal, Icone: Award, moduloReq: "saude" },
    { label: "Melhor sequência", valor: `${melhorStreak}d`, Icone: Flame, moduloReq: "saude", extra: acompanhaCigarroRel },
    { label: "Melhor sequência sem beber", valor: `${melhorStreakBebida}d`, Icone: Wine, moduloReq: "saude", extra: acompanhaBebidaRel },
    { label: "Atividades físicas feitas", valor: totalAtividadesGeral, Icone: Dumbbell, moduloReq: "saude" },
    { label: "Tempo de atividade", valor: `${totalMinutosGeral} min`, Icone: Timer, moduloReq: "saude" },
    { label: "Calorias queimadas", valor: `${totalCaloriasGeral} kcal`, Icone: Zap, moduloReq: "saude" },
    { label: "Investido (total)", valor: `R$ ${totalInvestidoGeral.toFixed(0)}`, Icone: TrendingUp, moduloReq: "financas" },
    { label: "Gasto (total)", valor: `R$ ${totalGastoGeral.toFixed(0)}`, Icone: Wallet, moduloReq: "financas" },
    { label: "Gasto médio diário", valor: `R$ ${gastoMedioDiarioGeral.toFixed(2).replace(".", ",")}`, Icone: Wallet, moduloReq: "financas" },
    { label: "Gastos fixos (total)", valor: `R$ ${totalFixosGeral.toFixed(0)}`, Icone: Receipt, moduloReq: "financas" },
    { label: "Patrimônio total", valor: `R$ ${((Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0) + (parseFloat(metas.outrosAtivosManual) || 0)).toFixed(0)}`, Icone: Landmark, moduloReq: "patrimonio" },
    { label: "Dívidas (total)", valor: `R$ ${(Array.isArray(metas.dividasLancamentos) ? metas.dividasLancamentos : []).reduce((s, d) => s + (parseFloat(d.valor) || 0), 0).toFixed(0)}`, Icone: TrendingDown, moduloReq: "patrimonio", extra: subModulosRel.dividas },
    { label: "Resgates (total)", valor: `R$ ${Math.abs((Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).filter((i) => parseFloat(i.valor) < 0).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0)).toFixed(0)}`, Icone: PiggyBank, moduloReq: "patrimonio" },
    { label: "Peso atual", valor: `${pesoRecente ?? "—"} kg`, Icone: Scale, moduloReq: "saude" },
  ].filter((c) => modulos[c.moduloReq] && c.extra !== false);

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
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => setModo("mensal")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition active:opacity-80 ${modo === "mensal" ? "bg-indigo-600 text-white" : escuro ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-500"}`}>Mensal</button>
        <button onClick={() => setModo("diario")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition active:opacity-80 ${modo === "diario" ? "bg-indigo-600 text-white" : escuro ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-500"}`}>Diário</button>
      </div>

      {modo === "mensal" && (
        <>
          {modulos.saude && dadosPeso.length > 1 && (
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

          {modulos.financas && dadosGraficoMensal.length > 1 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Gasto x Investido x Fixo por mês</h2>
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
                    <Bar dataKey="Fixo" fill="#d97706" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          {modulos.saude && dadosGraficoMensal.length > 1 && (
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
          )}

          {(modulos.mental || modulos.saude) && dadosGraficoMensal.length > 1 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Evolução de {modulos.mental && modulos.saude ? "humor e disposição" : modulos.mental ? "humor" : "disposição"}</h2>
              <Cartao className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGraficoMensal}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: corTexto }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {modulos.mental && <Line type="monotone" dataKey="Humor" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />}
                    {modulos.saude && <Line type="monotone" dataKey="Fisica" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />}
                  </LineChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          {modulos.financas && dadosPizzaGastos.length > 0 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Gastos por categoria</h2>
              <Cartao>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={dadosPizzaGastos} dataKey="valor" nameKey="nome" cx="50%" cy="45%" outerRadius={65}>
                      {dadosPizzaGastos.map((_, i) => <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `R$ ${v}`} />
                    <Legend wrapperStyle={{ fontSize: 11, lineHeight: "18px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          {modulos.saude && dadosPizza.length > 0 && (
            <div className="mt-6">
              <h2 className={`font-semibold mb-3 text-sm ${escuro ? "text-white" : "text-slate-900"}`}>Atividades mais praticadas</h2>
              <Cartao>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={dadosPizza} dataKey="valor" nameKey="nome" cx="50%" cy="45%" outerRadius={65}>
                      {dadosPizza.map((_, i) => <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, lineHeight: "18px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </Cartao>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {mesesOrdenados.length === 0 && <Sutil className="text-sm">Ainda sem dados suficientes.</Sutil>}
            {[...mesesOrdenados].reverse().map((chave) => {
              const registros = meses[chave] || [];
              const n = registros.length;
              const gastoTotal = registros.reduce((s, r) => s + (r.gastos || []).reduce((a, g) => a + g.valor, 0), 0);
              const investidoTotal = (Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).filter((i) => mesDoIso(i.data) === chave).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
              const humorMedio = n ? Math.round(registros.reduce((s, r) => s + (r.humorPercent || 0), 0) / n) : 0;
              const fisicaMedia = n ? Math.round(registros.reduce((s, r) => s + (r.saudeFisicaPercent || 0), 0) / n) : 0;
              const diasSemFumar = registros.filter((r) => r.fumei === false).length;
              const diasAtividade = registros.filter((r) => (r.atividadesFisicas || []).length > 0).length;
              const diasSonoOk = registros.filter((r) => dormiuNaMeta(r.horaDormiu, metas.horaDormirMeta)).length;
              const pesos = (Array.isArray(perfil.historicoPeso) ? perfil.historicoPeso : []).filter((h) => mesDoIso(h.data) === chave).map((h) => parseFloat(h.valor)).filter((p) => !isNaN(p));
              const pesoMedio = pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : "—";
              const minutosTotal = registros.reduce((s, r) => s + minutosDoDia(r), 0);
              const caloriasTotal = registros.reduce((s, r) => s + caloriasDoDia(r), 0);
              const metaGasto = parseFloat(metas.gastoDiario) || 0;
              const diasDentroOrcamento = metaGasto > 0 ? registros.filter((r) => (r.gastos || []).reduce((a, g) => a + g.valor, 0) <= metaGasto).length : null;
              const fixoTotal = fixosDoMes(chave);
              const gastoVariavelTotal = registros.reduce((s, r) => s + (r.gastos || []).filter((g) => !g.fixo).reduce((a, g) => a + g.valor, 0), 0);
              const ehMesAtual = chave === mesDoIso(hojeISO());
              const diasNoMesTotal = new Date(parseInt(chave.slice(0, 4)), parseInt(chave.slice(5, 7)), 0).getDate();
              const diaAtualDoMes = parseInt(hojeISO().slice(8, 10), 10);
              const diasCorridosMes = ehMesAtual ? diaAtualDoMes : diasNoMesTotal;
              const gastoMedioDiarioMes = gastoVariavelTotal / Math.max(1, diasCorridosMes);
              return (
                <Cartao key={chave} className="border-l-2 border-l-indigo-500">
                  <p className={`font-semibold text-sm capitalize mb-2 ${escuro ? "text-white" : "text-slate-900"}`}>{nomeMesCompleto(chave)}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <Sutil>Dias registrados: {n}</Sutil>
                    {modulos.saude && acompanhaCigarroRel && <Sutil>Dias sem fumar: {diasSemFumar}</Sutil>}
                    {modulos.saude && <Sutil>Atividade física: {diasAtividade} dias</Sutil>}
                    {modulos.saude && <Sutil>Minutos totais: {minutosTotal}</Sutil>}
                    {modulos.saude && <Sutil>Calorias: {caloriasTotal} kcal</Sutil>}
                    {modulos.saude && <Sutil>Sono dentro da meta: {diasSonoOk}</Sutil>}
                    {modulos.mental && <Sutil>Humor médio: {humorMedio}%</Sutil>}
                    {modulos.saude && <Sutil>Disposição média: {fisicaMedia}%</Sutil>}
                    {modulos.saude && <Sutil>Peso médio: {pesoMedio} kg</Sutil>}
                    {modulos.financas && <Sutil>Gasto total: R$ {gastoTotal.toFixed(2).replace(".", ",")}</Sutil>}
                    {modulos.financas && <Sutil>Gasto médio/dia: R$ {gastoMedioDiarioMes.toFixed(2).replace(".", ",")}</Sutil>}
                    {modulos.financas && <Sutil>Investido total: R$ {investidoTotal.toFixed(2).replace(".", ",")}</Sutil>}
                    {modulos.financas && <Sutil>Gastos fixos: R$ {fixoTotal.toFixed(2).replace(".", ",")}</Sutil>}
                    {modulos.financas && <Sutil>Total com fixos: R$ {(gastoTotal + fixoTotal).toFixed(2).replace(".", ",")}</Sutil>}
                    {modulos.financas && diasDentroOrcamento !== null && <Sutil>Dentro do orçamento: {diasDentroOrcamento}</Sutil>}
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
            const investidoTotal = (Array.isArray(metas.investimentosDetalhados) ? metas.investimentosDetalhados : []).filter((i) => i.data === iso).reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
            const kcalTotal = (r.refeicoes || []).reduce((s, x) => s + x.kcal, 0);
            return (
              <Cartao key={iso} className={`border-l-2 ${escuro ? "border-l-slate-700" : "border-l-slate-300"}`}>
                <div className="flex justify-between items-center mb-2">
                  <p className={`font-semibold text-sm ${escuro ? "text-white" : "text-slate-900"}`}>{formatarData(iso)}</p>
                  {modulos.saude && acompanhaCigarroRel && <span className="text-xs">{r.fumei === false ? "não fumou" : r.fumei === true ? "fumou" : "sem resposta"}</span>}
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  {modulos.mental && <Sutil>Mental: {r.humorPercent}%</Sutil>}
                  {modulos.saude && <Sutil>Disposição: {r.saudeFisicaPercent}%</Sutil>}
                  {modulos.saude && (
                    <Sutil>
                      Atividade: {(r.atividadesFisicas || []).length > 0 ? `${r.atividadesFisicas.length}x (${minutosDoDia(r)}min)` : "não"}
                    </Sutil>
                  )}
                  {modulos.saude && <Sutil>Calorias: {caloriasDoDia(r)} kcal</Sutil>}
                  {modulos.saude && <Sutil>Sono: {r.horaDormiu || "—"}</Sutil>}
                  {modulos.saude && <Sutil>Peso: {(perfil.historicoPeso || []).find((h) => h.data === iso)?.valor || "—"} kg</Sutil>}
                  {modulos.financas && <Sutil>Gasto: R$ {gastoTotal.toFixed(2).replace(".", ",")}</Sutil>}
                  {modulos.financas && <Sutil>Investido: R$ {investidoTotal.toFixed(2).replace(".", ",")}</Sutil>}
                  {modulos.saude && <Sutil>Alimentação: {kcalTotal} kcal</Sutil>}
                  {modulos.saude && <Sutil>Água: {(((r.aguaEntradas || []).reduce((s, a) => s + a.ml, 0)) / 1000).toFixed(2)} L</Sutil>}
                </div>
              </Cartao>
            );
          })}
        </div>
      )}
    </>
  );
}