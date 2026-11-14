import React, { useState, useMemo } from "react";

// ---------- Charte finale : Pastel glamour ----------
const THEME = {
  label: "Pastel glamour",
  page: "#F2F6FB",
  font: '"Karrik", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontTitle: '"Miso", "Karrik", system-ui, sans-serif',
  headerBg: "#A8D8EA",
  headerInk: "#2B3A4A",
  headerAccent: "#5B9BB7",
  heroChipBg: "rgba(255,255,255,0.82)", heroChipInk: "#2B3A4A",
  nav: "pills",
  // Typo : Miso (titres) + Karrik (corps), chargées en webfont avec repli
  globalCss:
    "*{border-radius:16px!important}" +
    "@font-face{font-family:'Miso';font-style:normal;font-weight:400;font-display:swap;" +
    "src:url('https://cdn.jsdelivr.net/gh/elvisdetona/politica@master/css/fonts/miso-regular-webfont.woff') format('woff');}" +
    "@font-face{font-family:'Miso';font-style:normal;font-weight:700;font-display:swap;" +
    "src:url('https://cdn.jsdelivr.net/gh/elvisdetona/politica@master/css/fonts/miso-bold-webfont.woff') format('woff');}" +
    "@font-face{font-family:'Miso';font-style:normal;font-weight:300;font-display:swap;" +
    "src:url('https://cdn.jsdelivr.net/gh/elvisdetona/politica@master/css/fonts/miso-light-webfont.woff') format('woff');}" +
    "@font-face{font-family:'Karrik';font-style:normal;font-weight:400;font-display:swap;" +
    "src:url('https://gitlab.com/phantomfoundry/karrik_fonts/-/raw/main/fonts/Web/WOFF2/Karrik-Regular.woff2') format('woff2')," +
    "url('https://gitlab.com/phantomfoundry/karrik_fonts/-/raw/main/fonts/Web/WOFF/Karrik-Regular.woff') format('woff')," +
    "url('https://gitlab.com/phantomfoundry/karrik_fonts/-/raw/main/fonts/Web/TFF/Karrik-Regular.ttf') format('truetype');}" +
    "@font-face{font-family:'Karrik';font-style:italic;font-weight:400;font-display:swap;" +
    "src:url('https://gitlab.com/phantomfoundry/karrik_fonts/-/raw/main/fonts/Web/WOFF2/Karrik-Italic.woff2') format('woff2')," +
    "url('https://gitlab.com/phantomfoundry/karrik_fonts/-/raw/main/fonts/Web/WOFF/Karrik-Italic.woff') format('woff');}" +
    "h1,h2,h3,h4{font-family:'Miso','Karrik',system-ui,sans-serif;letter-spacing:0.01em;}" +
    ".hdr,.navband{border-radius:0!important}",
  colors: {
    bg: "#F7FAFE", card: "#FFFFFF", surface: "#EEF4FA", track: "#E3EBF4",
    ink: "#2B3A4A", muted: "#7C8DA0", border: "#E4EBF5", inputBorder: "#D3DFEC",
    blue: "#A8D8EA", blueDeep: "#5B9BB7", yellow: "#FDF3B0", rose: "#FFD6E0", roseDeep: "#E08BA8", roseLight: "#F7B8D0",
  },
};
let C = THEME.colors;
let TH = THEME;

// Contraste automatique : texte clair ou sombre selon le fond
function readable(hex) {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "#111111";
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111111" : "#FFFFFF";
}

// ---------- Types de prestations ----------
const TYPES = {
  monte:         { key: "monte",         label: "Monte",            icon: "🐴", units: { euros: 25, heures: 1, unites: 1 } },
  longe:         { key: "longe",         label: "Longe",            icon: "🌀", units: { euros: 15, heures: 0.5, unites: 1 } },
  soins_criniere:{ key: "soins_criniere", label: "Soin crinière",          icon: "💇", units: { euros: 20, heures: 0.5, unites: 1 } },
  soins_tonte:   { key: "soins_tonte",   label: "Tonte",            icon: "✂️", units: { euros: 35, heures: 1, unites: 2 } },
  soins_pieds:   { key: "soins_pieds",   label: "Soin des pieds & pansage", icon: "🧽", units: { euros: 15, heures: 0.75, unites: 1 } },
  collectif:     { key: "collectif",     label: "Cours collectif",  icon: "👥", units: { euros: 30, heures: 1, unites: 1 }, max: 3 },
  prive:         { key: "prive",         label: "Cours particulier", icon: "🎓", units: { euros: 45, heures: 1, unites: 1 }, max: 1 },
};

const ORG = { nom: "Écuries de la Loire – Nantes", activeUnits: ["unites", "heures", "euros"] };
const UNIT_LABEL = { euros: "€", heures: "h", unites: "u" };
const UNIT_NAME = { euros: "Euros", heures: "Heures", unites: "Unités" };
const JOUR_LABEL = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi", 0: "Dimanche" };

// ---------- Semaines types (modèles récurrents du gérant) ----------
// jour : 1 = lundi … 6 = samedi, 0 = dimanche
const WEEK_MODELS = {
  normal: {
    key: "normal", label: "Semaine normale", icon: "🐴",
    desc: "Semaine classique : monte et soins le matin, cours en fin de journée.",
    slots: [
      { jour: 1, heure: "09:00", type: "monte", capacity: 2 },
      { jour: 1, heure: "17:00", type: "collectif", capacity: 3 },
      { jour: 2, heure: "10:00", type: "longe", capacity: 2 },
      { jour: 2, heure: "18:00", type: "prive", capacity: 1 },
      { jour: 3, heure: "09:30", type: "monte", capacity: 2 },
      { jour: 3, heure: "17:00", type: "collectif", capacity: 3 },
      { jour: 4, heure: "14:00", type: "soins_criniere", capacity: 2 },
      { jour: 4, heure: "18:30", type: "prive", capacity: 1 },
      { jour: 5, heure: "17:00", type: "collectif", capacity: 3 },
      { jour: 5, heure: "19:00", type: "monte", capacity: 2 },
      { jour: 6, heure: "10:00", type: "monte", capacity: 2 },
      { jour: 6, heure: "14:00", type: "collectif", capacity: 3 },
      { jour: 6, heure: "16:00", type: "soins_tonte", capacity: 2 },
      { jour: 0, heure: "10:00", type: "longe", capacity: 2 },
      { jour: 0, heure: "11:00", type: "soins_pieds", capacity: 2 },
    ],
  },
  vacances: {
    key: "vacances", label: "Semaine vacances", icon: "🏖️",
    desc: "Vacances scolaires : collectifs en matinée, soins et séances à la carte.",
    slots: [
      { jour: 1, heure: "10:00", type: "collectif", capacity: 3 },
      { jour: 1, heure: "14:00", type: "monte", capacity: 2 },
      { jour: 2, heure: "10:00", type: "collectif", capacity: 3 },
      { jour: 2, heure: "15:00", type: "soins_pieds", capacity: 2 },
      { jour: 3, heure: "10:30", type: "collectif", capacity: 3 },
      { jour: 3, heure: "14:00", type: "monte", capacity: 2 },
      { jour: 4, heure: "10:00", type: "collectif", capacity: 3 },
      { jour: 4, heure: "15:00", type: "soins_tonte", capacity: 2 },
      { jour: 5, heure: "10:00", type: "collectif", capacity: 3 },
      { jour: 5, heure: "14:00", type: "longe", capacity: 2 },
      { jour: 6, heure: "09:30", type: "prive", capacity: 1 },
      { jour: 6, heure: "11:00", type: "collectif", capacity: 3 },
    ],
  },
};

// ---------- Utilisateurs (mock) ----------
const USERS = [
  { id: "sophie", nom: "Sophie Martin", role: "gerant", credits: { unites: Infinity, heures: Infinity, euros: Infinity } },
  { id: "justine", nom: "Justine Dewilde", role: "client", owner: true, credits: { unites: 12, heures: 8.5, euros: 0 }, chevaux: ["Ulysse"] },
  { id: "lea", nom: "Léa Bernard", role: "client", owner: true, demi: true, credits: { unites: 5, heures: 3, euros: 0 }, chevaux: ["Ulysse"], demiSur: ["Ulysse"] },
  { id: "marc", nom: "Marc Dubois", role: "client", owner: true, credits: { unites: 9, heures: 6, euros: 40 }, chevaux: ["Jazz"] },
  { id: "camille", nom: "Camille Roger", role: "client", owner: true, credits: { unites: 7, heures: 4, euros: 25 }, chevaux: ["Vanille"] },
];

// ---------- Pensions mensuelles (prix fictifs) ----------
const PENSIONS = {
  base: { label: "Pension de base", prix: 280, desc: "Box, foin, eau, sortie quotidienne au pré" },
  accompagnement: { label: "Pension d'accompagnement", prix: 390, desc: "Base + suivi alimentaire, vermifuge et entretien des pieds coordonnés" },
  travail: { label: "Pension de travail", prix: 520, desc: "Base + 4 séances de travail par semaine par l'équipe de l'écurie" },
};
const OPTIONS = {
  enrubanne: { label: "Enrubanné", prix: 45 },
  copeaux: { label: "Copeaux", prix: 30 },
  oxygen: { label: "Oxygène", prix: 60 },
};

// Pensions actuelles par cheval
const HORSE_DATA = {
  Ulysse: { pension: "base", options: ["copeaux"] },
  Jazz: { pension: "travail", options: [] },
  Vanille: { pension: "accompagnement", options: ["enrubanne"] },
};

// ---------- Historique des prestations passées (mock) ----------
const HISTORY = [
  { user: "justine", date: "2026-11-03", type: "monte", horse: "Ulysse" },
  { user: "justine", date: "2026-11-05", type: "collectif", horse: "Ulysse" },
  { user: "justine", date: "2026-11-07", type: "soins_criniere", horse: "Ulysse" },
  { user: "justine", date: "2026-10-28", type: "soins_tonte", horse: "Ulysse" },
  { user: "lea", date: "2026-11-04", type: "monte", horse: "Ulysse" },
  { user: "lea", date: "2026-11-06", type: "prive", horse: "Ulysse" },
  { user: "marc", date: "2026-11-02", type: "longe", horse: "Jazz" },
  { user: "marc", date: "2026-11-08", type: "monte", horse: "Jazz" },
];

// ---------- Dates ----------
const TODAY = D("2026-11-14"); // samedi 14 novembre 2026
function D(s) { return new Date(s + "T12:00:00"); }
function toKey(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
function fmt(d) { return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); }
function fmtShort(d) { return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }); }

// ---------- Planning par défaut ----------
const DEFAULT_PLAN = [
  { jour: 1, heure: "09:00", type: "monte" },
  { jour: 1, heure: "17:00", type: "collectif" },
  { jour: 2, heure: "10:00", type: "longe" },
  { jour: 2, heure: "18:00", type: "prive" },
  { jour: 3, heure: "09:30", type: "monte" },
  { jour: 3, heure: "17:00", type: "collectif" },
  { jour: 4, heure: "14:00", type: "soins_criniere" },
  { jour: 4, heure: "18:30", type: "prive" },
  { jour: 5, heure: "17:00", type: "collectif" },
  { jour: 5, heure: "19:00", type: "monte" },
  { jour: 6, heure: "10:00", type: "monte" },
  { jour: 6, heure: "14:00", type: "collectif" },
  { jour: 0, heure: "10:00", type: "longe" },
  { jour: 6, heure: "16:00", type: "soins_tonte" },
  { jour: 0, heure: "11:00", type: "soins_pieds" },
];

function buildWeek(monday) {
  const slots = [];
  let id = 0;
  for (const p of DEFAULT_PLAN) {
    const date = addDays(monday, p.jour === 0 ? 6 : p.jour - 1);
    const cap = p.type === "collectif" ? 3 : p.type === "prive" ? 1 : 2;
    slots.push({ id: "s" + (id++), date: toKey(date), heure: p.heure, type: p.type, capacity: cap, bookings: [] });
  }
  return slots;
}

// ---------- Composants de base ----------
function Btn({ children, onClick, disabled, variant, small }) {
  const base = small ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const look = variant === "outline"
    ? { background: C.card, color: C.ink, border: "1px solid " + C.border }
    : { background: C.blueDeep, color: readable(C.blueDeep), border: "none" };
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-xl font-semibold ${base} transition active:scale-95 disabled:opacity-50`}
      style={{ ...look, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(20,30,40,0.45)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-2xl" style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full px-2.5 py-1 text-lg" style={{ background: C.bg }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FillBar({ value, color }) {
  return (
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: C.track }}>
      <div className="h-full rounded-full transition-all" style={{ width: Math.min(100, value) + "%", background: color }} />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm"
      style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Mini-formulaire : ajout d'un créneau récurrent à un modèle de semaine
function ModelSlotForm({ value, onChange, onAdd }) {
  const lbl = "mb-0.5 text-[10px] font-semibold uppercase";
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5">
      <div>
        <div className={lbl} style={{ color: C.muted }}>Jour</div>
        <Select value={value.jour} onChange={(v) => onChange(Object.assign({}, value, { jour: Number(v) }))}
          options={Object.keys(JOUR_LABEL).map((j) => ({ value: j, label: JOUR_LABEL[j] }))} />
      </div>
      <div>
        <div className={lbl} style={{ color: C.muted }}>Heure</div>
        <input type="time" value={value.heure} onChange={(e) => onChange(Object.assign({}, value, { heure: e.target.value }))}
          className="w-full rounded-xl border px-2 py-2 text-xs" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
      </div>
      <div>
        <div className={lbl} style={{ color: C.muted }}>Prestation</div>
        <Select value={value.type}
          onChange={(v) => onChange(Object.assign({}, value, { type: v, capacity: v === "collectif" ? 3 : v === "prive" ? 1 : 2 }))}
          options={Object.values(TYPES).map((t) => ({ value: t.key, label: t.icon + " " + t.label }))} />
      </div>
      <div className="flex items-end gap-1.5">
        <div className="flex-1">
          <div className={lbl} style={{ color: C.muted }}>Places</div>
          <input type="number" min="1" max="6" value={value.capacity}
            onChange={(e) => onChange(Object.assign({}, value, { capacity: e.target.value }))}
            className="w-full rounded-xl border px-2 py-2 text-xs" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
        </div>
        <Btn small onClick={onAdd}>➕</Btn>
      </div>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const monday = D("2026-11-16");
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => toKey(addDays(monday, i))), [monday]);

  const [currentUserId, setCurrentUserId] = useState("justine");
  const [tab, setTab] = useState("planning");
  const [userMenu, setUserMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState(USERS);
  const [horsesData, setHorsesData] = useState(HORSE_DATA);
  const [requests, setRequests] = useState([]);
  const [announces, setAnnounces] = useState([
    { id: "a1", date: "2026-11-10", titre: "🏆 Concours de saut d'obstacles", texte: "Le concours interne se déroulera le dimanche 29 novembre. Inscriptions au bureau jusqu'au 22 novembre.", readBy: [] },
    { id: "a2", date: "2026-11-13", titre: "✨ Nouveauté : tonte le samedi", texte: "Des créneaux de tonte sont désormais proposés le samedi après-midi. Demande-les depuis le planning !", readBy: [] },
  ]);
  const [decalages, setDecalages] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [slots, setSlots] = useState(() => {
    const s = buildWeek(monday);
    const seed = [
      ["s1", "lea", "Ulysse"],
      ["s1", "marc", "Jazz"],
      ["s1", "camille", "Vanille"],   // collectif lundi : 3/3, complet
      ["s2", "marc", "Jazz"],
      ["s3", "camille", "Vanille"],   // particulier mardi : 1/1, complet
      ["s8", "lea", "Ulysse"],
      ["s10", "lea", "Ulysse"],
      ["s10", "marc", "Jazz"],        // monte samedi : 2/2, complet
    ];
    for (const [id, user, horse] of seed) {
      const slot = s.find((x) => x.id === id);
      if (slot) slot.bookings.push({ user, horse });
    }
    return s;
  });

  const me = users.find((u) => u.id === currentUserId);
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  // Configuration gérant : unités de vente + tarifs (mutation + re-rendu global)
  const [, bumpCfg] = useState(0);
  const toggleUnit = (u) => {
    const next = ORG.activeUnits.includes(u) ? ORG.activeUnits.filter((x) => x !== u) : [...ORG.activeUnits, u];
    ORG.activeUnits = next.length > 0 ? next : [u];
    bumpCfg((t) => t + 1);
    notify("Prestations vendues en : " + ORG.activeUnits.map((x) => UNIT_NAME[x].toLowerCase()).join(", ") + ".");
  };
  const setPrice = (type, v) => {
    TYPES[type].units.euros = Math.max(0, Number(v) || 0);
    bumpCfg((t) => t + 1);
  };

  // Règle de fermeture : sans aucune inscription, fermeture la veille (jour complet précédent).
  const slotOpen = (slot) => {
    if (slot.bookings.length >= slot.capacity) return false;
    if (slot.bookings.length > 0) return true;
    return D(slot.date) > addDays(TODAY, 1);
  };

  const canAfford = (u, type) => ORG.activeUnits.every((unit) => (u.credits[unit] ?? 0) >= TYPES[type].units[unit]);

  const book = (slot, horse) => {
    if (!slotOpen(slot)) return notify("Ce créneau est fermé aux inscriptions.");
    if (slot.bookings.some((b) => b.user === me.id)) return notify("Tu es déjà inscrit·e sur ce créneau.");
    if (!canAfford(me, slot.type)) return notify("Crédits insuffisants pour cette prestation.");
    setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, bookings: [...s.bookings, { user: me.id, horse }] } : s));
    setUsers((prev) => prev.map((u) => u.id === me.id ? { ...u, credits: applyUnits(u.credits, TYPES[slot.type].units, -1) } : u));
    notify("Inscription confirmée : " + TYPES[slot.type].label + " le " + fmtShort(D(slot.date)) + " à " + slot.heure + " 🎉");
  };

  const cancel = (slot) => {
    setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, bookings: s.bookings.filter((b) => b.user !== me.id) } : s));
    setUsers((prev) => prev.map((u) => u.id === me.id ? { ...u, credits: applyUnits(u.credits, TYPES[slot.type].units, 1) } : u));
    notify("Inscription annulée, crédits recrédités.");
  };

  const mySlots = slots.filter((s) => s.bookings.some((b) => b.user === me.id));

  // Demande de prestation à la demande (client -> gérant)
  const newRequest = (req) => {
    setRequests((prev) => [...prev, Object.assign({ id: "r" + Date.now(), user: me.id, status: "attente" }, req)]);
    notify("Demande envoyée : " + TYPES[req.type].label + " le " + fmtShort(D(req.date)) + " à " + req.heure + ". L'écurie va l'étudier.");
  };

  // Validation ou refus par le gérant
  const decideRequest = (r, ok) => {
    if (ok) {
      const cap = r.type === "collectif" ? 3 : r.type === "prive" ? 1 : 2;
      setSlots((prev) => [...prev, { id: "s" + Date.now(), date: r.date, heure: r.heure, type: r.type, capacity: cap, bookings: [{ user: r.user, horse: r.horse }] }]);
      setUsers((prev) => prev.map((u) => u.id === r.user ? { ...u, credits: applyUnits(u.credits, TYPES[r.type].units, -1) } : u));
      notify("Demande acceptée : créneau créé, client inscrit et décompté.");
    } else {
      notify("Demande refusée.");
    }
    setRequests((prev) => prev.map((x) => x.id === r.id ? { ...x, status: ok ? "acceptee" : "refusee" } : x));
  };

  // Notifications : annonces écurie + décalages prioritaires
  const myDecalages = decalages.filter((d) => me.role === "gerant" || d.cible.includes(me.id));
  const unread = announces.filter((a) => !a.readBy.includes(me.id)).length
    + decalages.filter((d) => !d.readBy.includes(me.id)).length;

  const openNotifs = () => {
    setNotifOpen(true);
    setAnnounces((prev) => prev.map((a) => a.readBy.includes(me.id) ? a : { ...a, readBy: [...a.readBy, me.id] }));
    setDecalages((prev) => prev.map((d) => d.readBy.includes(me.id) ? d : { ...d, readBy: [...d.readBy, me.id] }));
  };

  // Annonce publiée par l'écurie (événement, concours, nouveau service)
  const addAnnounce = (a) => {
    setAnnounces((prev) => [...prev, Object.assign({ id: "a" + Date.now(), date: toKey(TODAY), readBy: [] }, a)]);
    notify("Annonce publiée : tous les clients sont notifiés.");
  };

  // Décalage d'une prestation : avertit en priorité les inscrits
  const moveSlot = (slot, newHeure) => {
    setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, heure: newHeure } : s));
    if (slot.bookings.length > 0) {
      setDecalages((prev) => [...prev, {
        id: "d" + Date.now(), type: slot.type, date: slot.date,
        ancienneHeure: slot.heure, nouvelleHeure: newHeure,
        cible: slot.bookings.map((b) => b.user), readBy: [],
      }]);
      notify("Prestation décalée à " + newHeure + " : " + slot.bookings.length + " inscrit(s) reçoivent une notification prioritaire.");
    } else {
      notify("Créneau décalé à " + newHeure + " (aucun inscrit à avertir).");
    }
  };

  const nav = [
    { key: "accueil", label: "Accueil", icon: "🏠" },
    { key: "planning", label: "Planning", icon: "🗓️" },
    { key: "seances", label: "Séances", icon: "📋" },
    { key: "profil", label: "Compte", icon: "👤" },
  ];
  if (me.role === "gerant") nav.push({ key: "gerant", label: "Gérant", icon: "🛠️" });

  return (
    <div className="flex min-h-screen justify-center md:py-6" style={{ background: TH.page, fontFamily: TH.font, color: C.ink }}>
      <style>{TH.globalCss}</style>
      <div className="relative flex w-full max-w-md flex-col overflow-hidden bg-white min-h-screen md:min-h-[780px] md:rounded-3xl md:shadow-xl" style={{ background: C.card }}>

        {/* Header */}
        <div className="hdr px-5 pb-4 pt-5" style={{ background: TH.headerBg, borderBottom: "3px solid " + TH.headerAccent }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center text-xl" style={{ background: C.card }}>🐴</span>
                <h1 className="text-xl font-bold" style={{ color: TH.headerInk, fontFamily: TH.fontTitle }}>{ORG.nom}</h1>
              </div>
              <p className="mt-1.5 text-xs" style={{ color: TH.headerInk, opacity: 0.72 }}>Semaines du 16 au 29 novembre 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openNotifs} className="relative rounded-full px-3 py-2 text-base"
                style={{ background: C.card, border: "1px solid " + C.border, boxShadow: "none" }}
                title="Notifications">
                🔔
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: C.roseDeep, color: "#FFFFFF" }}>
                    {unread}
                  </span>
                )}
              </button>
              <button onClick={() => setUserMenu(true)}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
                style={{ background: C.card, color: C.ink, border: "1px solid " + C.border, boxShadow: "none" }}>
                <span>👤</span> {me.nom.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {TH.nav === "pills" && (
          <div className="navband flex gap-1 overflow-x-auto border-b px-3 py-2" style={{ background: C.surface, borderColor: C.border }}>
            {nav.map((it) => (
              <button key={it.key} onClick={() => setTab(it.key)}
                className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold"
                style={{
                  background: tab === it.key ? C.blue : C.card,
                  color: tab === it.key ? readable(C.blue) : C.ink,
                  border: "1px solid " + (tab === it.key ? C.blueDeep : C.border),
                  boxShadow: "none",
                }}>
                <span>{it.icon}</span>{it.label}
              </button>
            ))}
          </div>
        )}
        {TH.nav === "underline" && (
          <div className="flex overflow-x-auto border-b" style={{ background: C.card, borderColor: C.border }}>
            {nav.map((it) => (
              <button key={it.key} onClick={() => setTab(it.key)}
                className="whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest"
                style={{
                  color: tab === it.key ? C.ink : C.muted,
                  borderBottom: "3px solid " + (tab === it.key ? C.roseDeep : "transparent"),
                  boxShadow: "none",
                }}>
                {it.icon} {it.label}
              </button>
            ))}
          </div>
        )}

        {/* Corps */}
        <div className={"flex-1 overflow-y-auto px-4 pt-4 " + (TH.nav === "dock" ? "pb-24" : "pb-6")}>
          {tab === "accueil" && <Dashboard me={me} mySlots={mySlots} slots={slots} requests={requests} setTab={setTab} />}
          {tab === "planning" && <Planning slots={slots} days={days} me={me} slotOpen={slotOpen} onBook={book} users={users} onRequest={newRequest} />}
          {tab === "seances" && <MesSeances mySlots={mySlots} onCancel={cancel} myRequests={requests.filter((r) => r.user === me.id)} />}
          {tab === "profil" && <Profil me={me} horsesData={horsesData} setHorsesData={setHorsesData} mySlots={mySlots} />}
          {tab === "gerant" && <Gerant slots={slots} days={days} slotOpen={slotOpen} users={users} setSlots={setSlots} notify={notify} requests={requests} onDecide={decideRequest} onAnnounce={addAnnounce} onMove={moveSlot} onUnitsToggle={toggleUnit} onPrice={setPrice} />}
        </div>

        {/* Dock flottant (rendu Nuit) */}
        {TH.nav === "dock" && (
          <div className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full px-2 py-1.5"
            style={{ background: C.card, border: "1px solid " + C.border, boxShadow: "0 10px 30px rgba(0,0,0,0.55)" }}>
            {nav.map((it) => (
              <button key={it.key} onClick={() => setTab(it.key)}
                className="flex flex-col items-center rounded-full px-3 py-1 text-[10px] font-semibold"
                style={{ background: tab === it.key ? C.blue : "transparent", color: tab === it.key ? readable(C.blue) : C.muted, boxShadow: "none" }}>
                <span className="text-base">{it.icon}</span>{it.label}
              </button>
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-24 left-4 right-4 z-40 rounded-2xl px-4 py-3 text-sm text-white shadow-lg"
            style={{ background: C.roseDeep }}>
            {toast}
          </div>
        )}

        {/* Notifications */}
        {notifOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(20,30,40,0.45)" }} onClick={() => setNotifOpen(false)}>
            <div className="m-4 flex max-h-[70vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-3xl p-5 shadow-2xl"
              style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">🔔 Notifications</h3>
                <button onClick={() => setNotifOpen(false)} className="rounded-full px-2.5 py-1 text-lg" style={{ background: C.surface, boxShadow: "none" }}>✕</button>
              </div>

              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>⚠️ Prioritaires · prestations décalées</div>
                {myDecalages.length === 0 && (
                  <div className="rounded-2xl border p-3 text-xs" style={{ borderColor: C.border, color: C.muted }}>
                    Aucun changement de prestation pour l'instant.
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {myDecalages.map((d) => (
                    <div key={d.id} className="rounded-2xl border p-3" style={{ borderColor: C.roseDeep, background: C.rose }}>
                      <div className="text-sm font-bold" style={{ color: C.ink }}>⚠️ {TYPES[d.type].label} décalé</div>
                      <div className="mt-0.5 text-xs" style={{ color: C.ink }}>
                        {fmtShort(D(d.date))} : de <b>{d.ancienneHeure}</b> à <b>{d.nouvelleHeure}</b>
                      </div>
                      <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                        {me.role === "gerant"
                          ? d.cible.length + " inscrit(s) averti(s) en priorité."
                          : "Ton créneau a été modifié par l'écurie."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>📣 Annonces de l'écurie</div>
                {announces.length === 0 && (
                  <div className="rounded-2xl border p-3 text-xs" style={{ borderColor: C.border, color: C.muted }}>
                    Aucune annonce pour l'instant.
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {announces.map((a) => (
                    <div key={a.id} className="rounded-2xl border p-3" style={{ borderColor: C.border }}>
                      <div className="text-sm font-bold" style={{ color: C.ink }}>{a.titre}</div>
                      <div className="mt-0.5 text-xs" style={{ color: C.muted }}>{a.texte}</div>
                      <div className="mt-1 text-[10px] uppercase" style={{ color: C.muted }}>Publié le {fmtShort(D(a.date))}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sélecteur d'utilisateur */}
        {userMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(20,30,40,0.45)" }} onClick={() => setUserMenu(false)}>
            <div className="m-4 w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl" style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-3 font-bold">Basculer d'utilisateur (démo)</h3>
              <div className="flex flex-col gap-2">
                {users.map((u) => (
                  <button key={u.id} onClick={() => { setCurrentUserId(u.id); setUserMenu(false); setTab(u.role === "gerant" ? "gerant" : "planning"); }}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold"
                    style={{ background: u.id === currentUserId ? C.blue : C.bg }}>
                    <span>{u.role === "gerant" ? "🛠️" : "🏇"}</span>
                    <span>{u.nom}<br />
                      <span className="text-xs font-normal" style={{ color: C.muted }}>
                        {u.role === "gerant" ? "Gérante"
                          : "Client" + (u.owner ? " · propriétaire" : "") + (u.demi ? " · demi-pensionnaire" : "")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Décompte des unités (euros non décomptés automatiquement)
function applyUnits(credits, units, sign) {
  const out = {};
  for (const [k, v] of Object.entries(credits)) {
    out[k] = (k !== "euros" && ORG.activeUnits.includes(k)) ? Math.round((v + sign * units[k]) * 100) / 100 : v;
  }
  return out;
}

function TYPE_COLORS() {
  return {
    monte: C.blue,
    longe: C.yellow,
    soins_criniere: C.rose,
    soins_tonte: C.roseDeep,
    soins_pieds: C.roseLight,
    collectif: C.blueDeep,
    prive: C.roseDeep,
  };
}

function Planning({ slots, days, me, slotOpen, onBook, users, onRequest, defaultView, defaultMode }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState(defaultView || "liste");
  const [agendaMode, setAgendaMode] = useState(defaultMode || "jour");
  const [selDay, setSelDay] = useState(days[1]);
  const [sel, setSel] = useState(null);
  const [horse, setHorse] = useState((me.chevaux || ["Ulysse"])[0]);
  const [reqOpen, setReqOpen] = useState(false);
  const [req, setReq] = useState({ type: "monte", date: days[1], heure: "18:00", comment: "" });

  const name = (id) => { const u = users.find((x) => x.id === id); return u ? u.nom.split(" ")[0] : "?"; };
  const TC = TYPE_COLORS();
  const horses = (me.chevaux || []).concat(me.demiSur || []).filter((v, i, a) => a.indexOf(v) === i);
  const filtered = slots.filter((s) => typeFilter === "all" || s.type === typeFilter);
  const daySlots = (d) => filtered.filter((s) => s.date === d).sort((a, b) => (a.heure < b.heure ? -1 : 1));
  const openBooking = (s) => { setSel(s); setHorse(horses[0] || "Ulysse"); };
  const weekday = (d) => D(d).toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
  const dayNum = (d) => D(d).getDate();
  // Jour où l'utilisateur courant est inscrit à au moins 1 prestation (indépendant des filtres)
  const myDay = (d) => slots.some((s) => s.date === d && s.bookings.some((b) => b.user === me.id));
  // Découpage en semaines pour la vue Agenda Semaine
  const weekChunks = []; for (let i = 0; i < days.length; i += 7) weekChunks.push(days.slice(i, i + 7));

  return (
    <div>
      {/* Sélecteur de rendu */}
      <div className="mb-2 flex justify-between items-center">
        <div className="flex gap-1 rounded-full p-1" style={{ background: C.surface }}>
          <ViewTab active={view === "liste"} onClick={() => setView("liste")}>🗂️ Liste</ViewTab>
          <ViewTab active={view === "agenda"} onClick={() => setView("agenda")}>📆 Agenda</ViewTab>
        </div>
        {view === "agenda" && (
          <div className="flex gap-1 rounded-full p-1" style={{ background: C.surface }}>
            <ViewTab active={agendaMode === "jour"} onClick={() => setAgendaMode("jour")}>Jour</ViewTab>
            <ViewTab active={agendaMode === "semaine"} onClick={() => setAgendaMode("semaine")}>Semaine</ViewTab>
          </div>
        )}
      </div>

      {/* Filtres par prestation */}
      <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-2">
        <Chip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>Toutes</Chip>
        {Object.values(TYPES).map((t) => (
          <Chip key={t.key} active={typeFilter === t.key} onClick={() => setTypeFilter(t.key)}>{t.icon} {t.label}</Chip>
        ))}
      </div>

      {/* Demande de prestation à la demande */}
      {me.role === "client" && (
        <div className="mb-3">
          <Btn small variant="outline" onClick={() => setReqOpen(true)}>➕ Demander une prestation</Btn>
        </div>
      )}

      {/* Rendu liste */}
      {view === "liste" && days.map((d) => {
        const ds = daySlots(d);
        if (ds.length === 0) return null;
        return (
          <div key={d} className="mb-4">
            <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>
              {fmtShort(D(d))}
            </h3>
            <div className="flex flex-col gap-2">
              {ds.map((s) => (
                <ListSlot key={s.id} s={s} me={me} slotOpen={slotOpen} name={name} onBook={openBooking} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Rendu agenda jour */}
      {view === "agenda" && agendaMode === "jour" && (
        <div>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {days.map((d) => {
              const nb = daySlots(d).length;
              const on = d === selDay;
              return (
                <button key={d} onClick={() => setSelDay(d)}
                  className="flex min-w-[52px] flex-col items-center rounded-2xl px-2 py-1.5 text-[11px] font-semibold"
                  style={{ background: on ? C.blue : C.card, border: "1px solid " + (on ? C.blueDeep : C.border) }}>
                  <span style={{ color: on ? readable(C.blue) : C.muted }}>{weekday(d)}</span>
                  <span className="text-base font-extrabold" style={{ color: on ? readable(C.blue) : C.ink }}>{dayNum(d)}</span>
                  <span className="text-[9px] font-normal" style={{ color: on ? readable(C.blue) : C.muted }}>{nb} cr.</span>
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full" style={{ background: myDay(d) ? C.roseDeep : "transparent" }} />
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: C.border }}>
            <div className="px-4 py-2 text-xs font-semibold capitalize" style={{ background: C.surface, color: C.muted }}>
              {fmt(D(selDay))}
            </div>
            {daySlots(selDay).length === 0 && (
              <div className="p-6 text-center text-xs" style={{ color: C.muted }}>Aucune prestation ce jour-là.</div>
            )}
            {daySlots(selDay).map((s) => (
              <AgendaSlot key={s.id} s={s} me={me} slotOpen={slotOpen} name={name} onBook={openBooking} />
            ))}
          </div>
        </div>
      )}

      {/* Rendu agenda semaine */}
      {view === "agenda" && agendaMode === "semaine" && (
        <div>
          {weekChunks.map((wk) => (
            <div key={wk[0]} className="mb-4">
              <div className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
                Semaine du {fmtShort(D(wk[0]))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {wk.map((d) => (
                  <button key={d} onClick={() => { setSelDay(d); setAgendaMode("jour"); }}
                    className="flex flex-col items-center rounded-xl py-1.5 text-[10px] font-semibold"
                    style={{ background: d === selDay ? C.blue : C.surface, color: C.ink }}>
                    <span style={{ color: C.muted }}>{weekday(d)}</span>
                    <span className="font-extrabold">{dayNum(d)}</span>
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full" style={{ background: myDay(d) ? C.roseDeep : "transparent" }} />
                  </button>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {wk.map((d) => (
                  <div key={d} className="flex min-h-[110px] flex-col gap-1 rounded-lg bg-white p-0.5" style={{ background: C.card }}>
                    {daySlots(d).map((s) => (
                      <button key={s.id} onClick={() => openBooking(s)}
                        className="rounded-lg p-1 text-left text-[9px] leading-tight"
                        style={{ background: TC[s.type] + "55", borderLeft: "3px solid " + TC[s.type] }}>
                        <div className="font-bold" style={{ color: C.ink }}>{s.heure}</div>
                        <div style={{ color: C.ink }}>{TYPES[s.type].icon}</div>
                        <div style={{ color: C.muted }}>{s.bookings.length}/{s.capacity}</div>
                      </button>
                    ))}
                    {daySlots(d).length === 0 && (
                      <div className="pt-4 text-center text-[9px]" style={{ color: C.muted }}>—</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="mt-2 text-center text-[10px]" style={{ color: C.muted }}>
            Touche un créneau pour voir le détail, ou un jour pour l'agenda du jour.
            <span className="ml-1">Le point <span className="inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: C.roseDeep }} /> signale un jour où tu es inscrit·e.</span>
          </p>
        </div>
      )}

      {/* Modale de demande à la demande */}
      {reqOpen && (
        <Modal title="Demander une prestation" onClose={() => setReqOpen(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Type de prestation</label>
              <Select value={req.type} onChange={(v) => setReq(Object.assign({}, req, { type: v }))}
                options={Object.values(TYPES).map((t) => ({ value: t.key, label: t.icon + " " + t.label }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Jour souhaité</label>
                <Select value={req.date} onChange={(v) => setReq(Object.assign({}, req, { date: v }))}
                  options={days.map((d) => ({ value: d, label: fmtShort(D(d)) }))} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Heure souhaitée</label>
                <input type="time" value={req.heure} onChange={(e) => setReq(Object.assign({}, req, { heure: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Cheval</label>
              <Select value={horse} onChange={setHorse} options={horses.map((h) => ({ value: h, label: h }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Commentaire (facultatif)</label>
              <textarea value={req.comment} rows={3} placeholder="Objectif de la séance, remarque pour l'écurie…"
                onChange={(e) => setReq(Object.assign({}, req, { comment: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
            </div>
            <div className="rounded-xl p-3 text-xs" style={{ background: C.yellow, color: readable(C.yellow) }}>
              Ta demande sera étudiée par l'écurie. Le créneau n'est confirmé qu'après acceptation.
            </div>
            <Btn onClick={() => { onRequest({ type: req.type, date: req.date, heure: req.heure, horse, comment: req.comment }); setReqOpen(false); }}>
              Envoyer la demande
            </Btn>
          </div>
        </Modal>
      )}

      {/* Modale d'inscription partagée */}
      {sel && (
        <Modal title={TYPES[sel.type].label + " · " + fmtShort(D(sel.date)) + " · " + sel.heure} onClose={() => setSel(null)}>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-3 text-xs" style={{ background: TC[sel.type] + "33" }}>
              <div className="flex items-center gap-2 font-bold" style={{ color: C.ink }}>
                <span className="text-lg">{TYPES[sel.type].icon}</span> {sel.bookings.length}/{sel.capacity} places
                {sel.bookings.length > 0 && <span className="font-normal" style={{ color: C.muted }}>
                  · {sel.bookings.map((b) => name(b.user)).join(", ")}
                </span>}
              </div>
              <div className="mt-1" style={{ color: C.muted }}>
                Décompte : {ORG.activeUnits.map((u) => TYPES[sel.type].units[u] + " " + UNIT_LABEL[u]).join(" + ")} par inscription
              </div>
            </div>
            {me.role === "client" && horses.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Quel cheval ?</label>
                <Select value={horse} onChange={setHorse} options={horses.map((h) => ({ value: h, label: h }))} />
              </div>
            )}
            {me.role === "client"
              ? <Btn onClick={() => { onBook(sel, horse); setSel(null); }}>Confirmer l'inscription</Btn>
              : <Btn variant="outline" onClick={() => setSel(null)}>Fermer</Btn>}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ViewTab({ active, children, onClick }) {
  return (
    <button onClick={onClick} className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
      style={{ background: active ? C.card : "transparent", color: active ? C.ink : C.muted, boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>
      {children}
    </button>
  );
}

// Carte prestation (rendu liste)
function ListSlot({ s, me, slotOpen, name, onBook }) {
  const open = slotOpen(s);
  const full = s.bookings.length >= s.capacity;
  const mine = s.bookings.some((b) => b.user === me.id);
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-3"
      style={{ background: open ? C.card : C.surface, borderColor: full ? C.border : C.blue }}>
      <div className="text-2xl">{TYPES[s.type].icon}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">{s.heure}</span>
          <span className="text-sm">{TYPES[s.type].label}</span>
          {mine && <Tag bg={C.yellow}>Inscrit·e</Tag>}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: C.muted }}>
          {s.bookings.length}/{s.capacity} inscrit{s.capacity > 1 ? "s" : ""}
          {s.bookings.length > 0 ? " · " + s.bookings.map((b) => name(b.user)).join(", ") : ""}
        </div>
        <FillBar value={(s.bookings.length / s.capacity) * 100} color={full ? C.roseDeep : C.blueDeep} />
      </div>
      {me.role === "client" && !mine && (
        <Btn small disabled={!open} onClick={() => onBook(s)}>
          {full ? "Complet" : open ? "S'inscrire" : "Fermé"}
        </Btn>
      )}
    </div>
  );
}

// Ligne agenda avec règle de temps (rendu agenda jour)
function AgendaSlot({ s, me, slotOpen, name, onBook }) {
  const TC = TYPE_COLORS();
  const open = slotOpen(s);
  const full = s.bookings.length >= s.capacity;
  const mine = s.bookings.some((b) => b.user === me.id);
  return (
    <div className="flex gap-3 border-t p-3" style={{ borderColor: C.surface }}>
      <div className="w-12 shrink-0 text-right">
        <div className="text-sm font-extrabold" style={{ color: C.ink }}>{s.heure}</div>
        <div className="text-[10px]" style={{ color: C.muted }}>{TYPES[s.type].units.heures}h</div>
      </div>
      <div className="flex-1 rounded-xl p-2.5" style={{ background: TC[s.type] + "33", borderLeft: "4px solid " + TC[s.type] }}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold" style={{ color: C.ink }}>{TYPES[s.type].icon} {TYPES[s.type].label}</span>
          {mine && <Tag bg={C.yellow}>Inscrit·e</Tag>}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: C.muted }}>
          {s.bookings.length}/{s.capacity} inscrit{s.capacity > 1 ? "s" : ""}
          {s.bookings.length > 0 ? " · " + s.bookings.map((b) => name(b.user)).join(", ") : ""}
        </div>
        {me.role === "client" && !mine && (
          <div className="mt-2">
            <Btn small disabled={!open} onClick={() => onBook(s)}>
              {full ? "Complet" : open ? "S'inscrire" : "Fermé"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick} className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={{ background: active ? C.blue : C.card, borderColor: active ? C.blueDeep : C.border }}>
      {children}
    </button>
  );
}

function Tag({ bg, children }) {
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: bg, color: readable(bg) }}>{children}</span>;
}

// ---------- Mes séances ----------
function MesSeances({ mySlots, onCancel, myRequests }) {
  const sorted = [...mySlots].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.heure < b.heure ? -1 : 1));
  return (
    <div>
      <h2 className="mb-3 font-bold">Mes séances de la semaine</h2>

      {myRequests && myRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold">Mes demandes</h3>
          <div className="flex flex-col gap-2">
            {myRequests.map((r) => (
              <div key={r.id} className="rounded-2xl border p-3" style={{ borderColor: C.yellow }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{TYPES[r.type].icon} {TYPES[r.type].label}</span>
                  <Tag bg={r.status === "attente" ? C.yellow : r.status === "acceptee" ? C.blue : C.surface}>
                    {r.status === "attente" ? "En attente" : r.status === "acceptee" ? "Acceptée" : "Refusée"}
                  </Tag>
                </div>
                <div className="mt-0.5 text-xs" style={{ color: C.muted }}>
                  {fmtShort(D(r.date))} · {r.heure} · 🐴 {r.horse}
                </div>
                {r.comment && <div className="mt-1 text-xs italic" style={{ color: C.muted }}>« {r.comment} »</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="rounded-2xl border p-8 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
          Aucune inscription pour l'instant.<br />Rendez-vous au planning 🗓️
        </div>
      )}
      <div className="flex flex-col gap-2">
        {sorted.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: C.rose }}>
            <div className="text-2xl">{TYPES[s.type].icon}</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{TYPES[s.type].label}</div>
              <div className="text-xs" style={{ color: C.muted }}>{fmtShort(D(s.date))} · {s.heure}</div>
            </div>
            <Btn small variant="outline" onClick={() => onCancel(s)}>Annuler</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Crédits ----------
function Credits({ me, mySlots }) {
  return (
    <div>
      <h2 className="mb-3 font-bold">Mes crédits</h2>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {ORG.activeUnits.map((u) => {
          const bg = u === "unites" ? C.blue : u === "heures" ? C.yellow : C.rose;
          const fg = readable(bg);
          return (
            <div key={u} className="rounded-2xl p-4 text-center" style={{ background: bg }}>
              <div className="text-2xl font-extrabold" style={{ color: fg }}>
                {me.credits[u] === Infinity ? "∞" : me.credits[u]}
              </div>
              <div className="text-[11px] font-semibold uppercase" style={{ color: fg, opacity: 0.8 }}>{UNIT_NAME[u]}</div>
            </div>
          );
        })}
      </div>
      <h3 className="mb-2 text-sm font-semibold">
        Consommation en cours ({mySlots.length} séance{mySlots.length > 1 ? "s" : ""})
      </h3>
      <div className="rounded-2xl p-3 text-sm" style={{ background: C.surface }}>
        {ORG.activeUnits.map((u) => {
          const total = mySlots.reduce((acc, s) => acc + TYPES[s.type].units[u], 0);
          return (
            <div key={u} className="flex justify-between py-1">
              <span>{UNIT_NAME[u]}</span>
              <span className="font-bold">−{total} {UNIT_LABEL[u]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Profil ----------
// ---------- Profil ----------
function Profil({ me, horsesData, setHorsesData, mySlots }) {
  const [ptab, setPtab] = useState("infos");
  const [nom, setNom] = useState(me.nom);
  const [tel, setTel] = useState("06 12 34 56 78");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h2 className="mb-3 font-bold">Mon compte</h2>

      <div className="mb-3 flex gap-1 rounded-full p-1" style={{ background: C.surface }}>
        <ViewTab active={ptab === "infos"} onClick={() => setPtab("infos")}>👤 Infos</ViewTab>
        <ViewTab active={ptab === "chevaux"} onClick={() => setPtab("chevaux")}>🐴 Chevaux</ViewTab>
        <ViewTab active={ptab === "credits"} onClick={() => setPtab("credits")}>🎟️ Crédits</ViewTab>
        <ViewTab active={ptab === "historique"} onClick={() => setPtab("historique")}>🕓 Historique</ViewTab>
      </div>

      {ptab === "infos" && (
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: C.border }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: C.rose }}>
              {me.role === "gerant" ? "🛠️" : "🏇"}
            </div>
            <div>
              <div className="font-bold">{me.nom}</div>
              <div className="text-xs" style={{ color: C.muted }}>
                {me.role === "gerant"
                  ? "Compte gérant — tous droits"
                  : "Client" + (me.owner ? " · propriétaire" : "") + (me.demi ? " · demi-pensionnaire" : "")}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border p-4" style={{ borderColor: C.border }}>
            <Champ label="Nom" value={nom} onChange={(v) => { setNom(v); setSaved(false); }} />
            <Champ label="Téléphone" value={tel} onChange={(v) => { setTel(v); setSaved(false); }} />
            <Btn onClick={() => setSaved(true)}>{saved ? "Enregistré ✓" : "Enregistrer"}</Btn>
          </div>
        </div>
      )}

      {ptab === "chevaux" && <PensionsView me={me} horsesData={horsesData} setHorsesData={setHorsesData} />}
      {ptab === "credits" && <Credits me={me} mySlots={mySlots} />}
      {ptab === "historique" && <HistoriqueView me={me} />}
    </div>
  );
}

// ---------- Gestion des pensions par cheval ----------
function PensionsView({ me, horsesData, setHorsesData }) {
  const [pending, setPending] = useState({});
  const myHorses = (me.chevaux || []).concat(me.demiSur || []).filter((v, i, a) => a.indexOf(v) === i);
  if (myHorses.length === 0) {
    return <div className="p-6 text-center text-sm" style={{ color: C.muted }}>Aucun cheval lié à ton compte.</div>;
  }
  return (
    <div className="flex flex-col gap-3">
      {myHorses.map((h) => {
        const hd = horsesData[h] || { pension: "base", options: [] };
        const total = PENSIONS[hd.pension].prix + hd.options.reduce((a, o) => a + OPTIONS[o].prix, 0);
        const markPending = () => setPending(Object.assign({}, pending, { [h]: true }));
        const setPension = (p) => {
          setHorsesData(Object.assign({}, horsesData, { [h]: { pension: p, options: hd.options } }));
          markPending();
        };
        const toggleOpt = (o) => {
          const opts = hd.options.includes(o) ? hd.options.filter((x) => x !== o) : [...hd.options, o];
          setHorsesData(Object.assign({}, horsesData, { [h]: { pension: hd.pension, options: opts } }));
          markPending();
        };
        return (
          <div key={h} className="flex flex-col gap-3 rounded-2xl border p-4" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">🐴 {h}</span>
              <Tag bg={C.blue}>{total} € / mois</Tag>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Type de pension (au mois)</label>
              <Select value={hd.pension} onChange={me.owner ? setPension : function () {}}
                options={Object.keys(PENSIONS).map((k) => ({ value: k, label: PENSIONS[k].label + " — " + PENSIONS[k].prix + " €/mois" }))} />
              <div className="mt-1 text-[11px]" style={{ color: C.muted }}>{PENSIONS[hd.pension].desc}</div>
              <div className="mt-1 text-[11px] font-semibold" style={{ color: C.roseDeep }}>
                ℹ️ Toute modification ne sera effective qu'après validation de l'écurie, au 1er jour du mois suivant.
              </div>
              {pending[h] && (
                <div className="mt-2 rounded-xl p-2 text-[11px] font-semibold" style={{ background: C.yellow, color: readable(C.yellow) }}>
                  ⏳ Modification en attente de validation par l'écurie — effective au 1er du mois suivant.
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Options (au mois)</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(OPTIONS).map((k) => (
                  <button key={k} onClick={() => me.owner && toggleOpt(k)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: hd.options.includes(k) ? C.yellow : C.surface,
                      color: hd.options.includes(k) ? readable(C.yellow) : C.ink,
                      border: "1px solid " + C.border,
                    }}>
                    {hd.options.includes(k) ? "✓ " : ""}{OPTIONS[k].label} +{OPTIONS[k].prix} €
                  </button>
                ))}
              </div>
              {!me.owner && (
                <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                  Seul le propriétaire peut modifier la pension de {h}.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Historique des prestations ----------
function HistoriqueView({ me }) {
  const items = HISTORY.filter((x) => x.user === me.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const totals = {};
  for (const u of ORG.activeUnits) {
    totals[u] = items.reduce((acc, x) => acc + TYPES[x.type].units[u], 0);
  }
  return (
    <div>
      <div className="mb-3 rounded-2xl p-3 text-xs" style={{ background: C.surface }}>
        {ORG.activeUnits.map((u) => (
          <div key={u} className="flex justify-between py-0.5">
            <span>{UNIT_NAME[u]} consommées (historique)</span>
            <span className="font-bold">{totals[u]} {UNIT_LABEL[u]}</span>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="p-6 text-center text-sm" style={{ color: C.muted }}>Aucune prestation passée pour l'instant.</div>
      )}
      <div className="flex flex-col gap-2">
        {items.map((x, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: C.border }}>
            <div className="text-2xl">{TYPES[x.type].icon}</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{TYPES[x.type].label}</div>
              <div className="text-xs" style={{ color: C.muted }}>{fmtShort(D(x.date))} · 🐴 {x.horse}</div>
            </div>
            <div className="text-right text-xs" style={{ color: C.muted }}>
              {ORG.activeUnits.map((u) => (
                <div key={u}>−{TYPES[x.type].units[u]} {UNIT_LABEL[u]}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function Champ({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2.5 text-sm"
        style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
    </div>
  );
}

// ---------- Espace gérant ----------
function Gerant({ slots, days, slotOpen, users, setSlots, notify, requests, onDecide, onAnnounce, onMove, onUnitsToggle, onPrice }) {
  const [newSlot, setNewSlot] = useState({ date: days[0], heure: "17:00", type: "monte", capacity: 2 });
  const [anTitre, setAnTitre] = useState("");
  const [anTexte, setAnTexte] = useState("");
  const [mv, setMv] = useState(null);
  const [mvHeure, setMvHeure] = useState("18:00");
  const [models, setModels] = useState(WEEK_MODELS);
  const [mAdd, setMAdd] = useState({
    normal: { jour: 1, heure: "17:00", type: "monte", capacity: 2 },
    vacances: { jour: 1, heure: "10:00", type: "collectif", capacity: 3 },
  });
  const name = (id) => { const u = users.find((x) => x.id === id); return u ? u.nom.split(" ")[0] : "?"; };
  const sorted = [...slots].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.heure < b.heure ? -1 : 1));

  // Semaines affichées (blocs de 7 jours)
  const weeks = []; for (let i = 0; i < days.length; i += 7) weeks.push({ start: days[i], days: days.slice(i, i + 7) });
  const [wkTarget, setWkTarget] = useState(weeks[weeks.length - 1].start);

  const addModelSlot = (k) => {
    const a = mAdd[k];
    setModels((prev) => Object.assign({}, prev, {
      [k]: Object.assign({}, prev[k], { slots: [...prev[k].slots, { jour: Number(a.jour), heure: a.heure, type: a.type, capacity: Number(a.capacity) }] }),
    }));
    notify("Créneau récurrent ajouté au modèle « " + models[k].label + " ».");
  };
  const rmModelSlot = (k, i) => setModels((prev) => Object.assign({}, prev, {
    [k]: Object.assign({}, prev[k], { slots: prev[k].slots.filter((_, x) => x !== i) }),
  }));

  // Initialiser une semaine : depuis un modèle, ou semaine vide. Les inscriptions déjà prises sont conservées.
  const initWeek = (modelKey) => {
    const wk = weeks.find((w) => w.start === wkTarget) || weeks[0];
    const model = modelKey ? models[modelKey] : null;
    const created = (model ? model.slots : []).map((p, i) => ({
      id: "w-" + (modelKey || "vide") + "-" + wk.start + "-" + i + "-" + Date.now(),
      date: wk.days[p.jour === 0 ? 6 : p.jour - 1],
      heure: p.heure,
      type: p.type,
      capacity: Number(p.capacity) || (p.type === "collectif" ? 3 : p.type === "prive" ? 1 : 2),
      bookings: [],
    }));
    setSlots(() => [
      ...slots.filter((s) => !wk.days.includes(s.date) || s.bookings.length > 0),
      ...created,
    ]);
    notify(model
      ? "Semaine du " + fmtShort(D(wk.start)) + " initialisée sur « " + model.label + " » : " + created.length + " créneaux, inscriptions conservées."
      : "Semaine du " + fmtShort(D(wk.start)) + " vidée : seuls les créneaux avec inscriptions sont conservés.");
  };

  const addSlot = () => {
    const id = "n" + Date.now();
    setSlots((prev) => [...prev, { id, date: newSlot.date, heure: newSlot.heure, type: newSlot.type, capacity: Number(newSlot.capacity), bookings: [] }]);
    notify("Créneau ajouté au planning.");
  };
  const delSlot = (s) => {
    if (s.bookings.length > 0) return notify("Impossible de supprimer un créneau avec des inscriptions.");
    setSlots((prev) => prev.filter((x) => x.id !== s.id));
    notify("Créneau supprimé du planning.");
  };

  return (
    <div>
      <h2 className="mb-1 font-bold">Espace gérant</h2>
      <p className="mb-3 text-xs" style={{ color: C.muted }}>
        Semaines types, tarifs et unités de vente, ajout de créneaux et suivi des inscriptions en direct.
      </p>

      {/* Demandes clients à la demande */}
      {requests.length > 0 && (
        <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: C.roseDeep }}>
          <div className="mb-2 text-sm font-bold">📨 Demandes clients ({requests.filter((r) => r.status === "attente").length} en attente)</div>
          <div className="flex flex-col gap-2">
            {requests.map((r) => {
              const u = users.find((x) => x.id === r.user);
              return (
                <div key={r.id} className="rounded-xl p-3 text-xs"
                  style={{ background: r.status === "attente" ? C.rose : C.surface }}>
                  <div className="font-bold" style={{ color: C.ink }}>
                    {TYPES[r.type].icon} {TYPES[r.type].label} — {fmtShort(D(r.date))} à {r.heure}
                  </div>
                  <div style={{ color: C.muted }}>{u ? u.nom : "?"} · 🐴 {r.horse}</div>
                  {r.comment && <div className="mt-1 italic" style={{ color: C.muted }}>« {r.comment} »</div>}
                  {r.status === "attente" ? (
                    <div className="mt-2 flex gap-2">
                      <Btn small onClick={() => onDecide(r, true)}>Accepter</Btn>
                      <Btn small variant="outline" onClick={() => onDecide(r, false)}>Refuser</Btn>
                    </div>
                  ) : (
                    <div className="mt-1 font-semibold" style={{ color: C.muted }}>
                      {r.status === "acceptee" ? "✓ Acceptée — créneau créé et client inscrit" : "✕ Refusée"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Semaines types & initialisation */}
      <div className="mb-4 flex flex-col gap-2 rounded-2xl border p-4" style={{ borderColor: C.border }}>
        <div className="text-sm font-bold">📚 Semaines types</div>
        <p className="text-xs" style={{ color: C.muted }}>
          Décris tes créneaux récurrents, puis initialise n'importe quelle semaine sur ce modèle.
        </p>
        {Object.values(models).map((m) => (
          <div key={m.key} className="rounded-xl p-3" style={{ background: C.surface }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold">{m.icon} {m.label}</div>
              <span className="text-[10px]" style={{ color: C.muted }}>{m.slots.length} créneau{m.slots.length > 1 ? "x" : ""}</span>
            </div>
            <div className="mt-0.5 text-[10px]" style={{ color: C.muted }}>{m.desc}</div>
            <div className="mt-2 flex flex-col gap-1">
              {m.slots.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-[11px]">
                  <span style={{ color: C.ink }}>
                    {JOUR_LABEL[p.jour].slice(0, 3)} {p.heure} · {TYPES[p.type].icon} {TYPES[p.type].label}
                    <span style={{ color: C.muted }}> ({p.capacity} pl.)</span>
                  </span>
                  <button onClick={() => rmModelSlot(m.key, i)} className="text-[11px]"
                    style={{ color: C.roseDeep }}>✕</button>
                </div>
              ))}
              {m.slots.length === 0 && <div className="text-[11px] italic" style={{ color: C.muted }}>Modèle vide.</div>}
            </div>
            <ModelSlotForm value={mAdd[m.key]}
              onChange={(v) => setMAdd(Object.assign({}, mAdd, { [m.key]: v }))}
              onAdd={() => addModelSlot(m.key)} />
          </div>
        ))}

        <div className="mt-1 rounded-xl p-3" style={{ background: C.yellow }}>
          <div className="text-xs font-bold" style={{ color: readable(C.yellow) }}>🚀 Initialiser une semaine</div>
          <div className="mt-1.5">
            <Select value={wkTarget} onChange={setWkTarget}
              options={weeks.map((w) => ({
                value: w.start,
                label: "Semaine du " + fmtShort(D(w.start)) + " · " + slots.filter((s) => w.days.includes(s.date)).length + " créneau(x)",
              }))} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Btn small onClick={() => initWeek("normal")}>{models.normal.icon} Modèle normal</Btn>
            <Btn small onClick={() => initWeek("vacances")}>{models.vacances.icon} Modèle vacances</Btn>
            <Btn small variant="outline" onClick={() => initWeek(null)}>Semaine vide</Btn>
          </div>
          <div className="mt-1.5 text-[10px]" style={{ color: readable(C.yellow) }}>
            Les créneaux avec inscriptions sont conservés. Ajuste ensuite à la main si besoin.
          </div>
        </div>
      </div>

      {/* Unités de vente & tarifs */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1 rounded-2xl border p-4" style={{ borderColor: C.border }}>
          <div className="mb-1 text-sm font-bold">⚙️ Unités de vente</div>
          {Object.keys(UNIT_NAME).map((u) => (
            <label key={u} className="flex items-center gap-2 py-1 text-xs" style={{ color: C.ink }}>
              <input type="checkbox" checked={ORG.activeUnits.includes(u)} onChange={() => onUnitsToggle(u)} />
              <span>{UNIT_NAME[u]} <span style={{ color: C.muted }}>({UNIT_LABEL[u]})</span></span>
            </label>
          ))}
          <div className="mt-1 text-[10px]" style={{ color: C.muted }}>
            Au moins une unité doit rester active.
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border p-4" style={{ borderColor: C.border }}>
          <div className="mb-1 text-sm font-bold">💶 Tarifs</div>
          {Object.values(TYPES).map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-2 py-0.5">
              <span className="text-xs">{t.icon} {t.label}</span>
              <div className="flex items-center gap-1">
                <input type="number" min="0" value={t.units.euros} onChange={(e) => onPrice(t.key, e.target.value)}
                  className="w-16 rounded-xl border px-2 py-1.5 text-right text-xs"
                  style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
                <span className="text-xs font-semibold" style={{ color: C.muted }}>€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 rounded-2xl border p-4" style={{ borderColor: C.border }}>
        <div className="text-sm font-bold">Ajouter un créneau</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase" style={{ color: C.muted }}>Jour</div>
            <Select value={newSlot.date} onChange={(v) => setNewSlot(Object.assign({}, newSlot, { date: v }))}
              options={days.map((d) => ({ value: d, label: fmtShort(D(d)) }))} />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase" style={{ color: C.muted }}>Heure</div>
            <input type="time" value={newSlot.heure} onChange={(e) => setNewSlot(Object.assign({}, newSlot, { heure: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase" style={{ color: C.muted }}>Prestation</div>
            <Select value={newSlot.type}
              onChange={(v) => setNewSlot(Object.assign({}, newSlot, { type: v, capacity: v === "collectif" ? 3 : v === "prive" ? 1 : 2 }))}
              options={Object.values(TYPES).map((t) => ({ value: t.key, label: t.icon + " " + t.label }))} />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase" style={{ color: C.muted }}>Places max</div>
            <input type="number" min="1" max="3" value={newSlot.capacity}
              onChange={(e) => setNewSlot(Object.assign({}, newSlot, { capacity: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
          </div>
        </div>
        <Btn onClick={addSlot}>Ajouter au planning</Btn>
      </div>

      {/* Publication d'annonces écurie */}
      <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: C.border }}>
        <div className="mb-2 text-sm font-bold">📣 Publier une annonce</div>
        <div className="flex flex-col gap-2">
          <Champ label="Titre" value={anTitre} onChange={setAnTitre} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: C.muted }}>Message (événement, concours, nouveau service…)</label>
            <textarea value={anTexte} rows={2} placeholder="Ex : soirée de l'écurie le samedi 12 décembre…"
              onChange={(e) => setAnTexte(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
          </div>
          <Btn small onClick={() => {
            if (anTitre.trim()) { onAnnounce({ titre: anTitre, texte: anTexte }); setAnTitre(""); setAnTexte(""); }
          }}>Publier l'annonce</Btn>
        </div>
      </div>

      <h3 className="mb-2 text-sm font-semibold">Planning & inscriptions</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((s) => {
          const open = slotOpen(s);
          const status = open ? "Ouverte" : (s.bookings.length > 0 ? "Ouverte (partielle)" : "Fermée (veille)");
          const bg = open ? C.blue : (s.bookings.length > 0 ? C.yellow : C.surface);
          return (
            <div key={s.id} className="rounded-2xl border" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-3 p-3">
                <div className="text-2xl">{TYPES[s.type].icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{s.heure} · {TYPES[s.type].label}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{fmtShort(D(s.date))} — {s.bookings.length}/{s.capacity}</div>
                  {s.bookings.length > 0 && (
                    <div className="mt-0.5 text-xs">{s.bookings.map((b) => name(b.user) + " (" + b.horse + ")").join(", ")}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Tag bg={bg}>{status}</Tag>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setMv(mv === s.id ? null : s.id); setMvHeure(s.heure); }}
                      className="text-[11px] font-semibold" style={{ color: C.blueDeep, background: "transparent", boxShadow: "none" }}>
                      ⏰ Décaler
                    </button>
                    <button onClick={() => delSlot(s)} title="Supprimer"
                      className="text-[11px] font-semibold" style={{ color: C.roseDeep, background: "transparent", boxShadow: "none" }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
              {mv === s.id && (
                <div className="flex items-center gap-2 border-t px-3 py-2" style={{ borderColor: C.border }}>
                  <span className="text-[11px]" style={{ color: C.muted }}>Nouvelle heure</span>
                  <input type="time" value={mvHeure} onChange={(e) => setMvHeure(e.target.value)}
                    className="rounded-xl border px-2 py-1.5 text-sm" style={{ background: C.card, borderColor: C.inputBorder, color: C.ink }} />
                  <Btn small onClick={() => { onMove(s, mvHeure); setMv(null); }}>Avertir les inscrits</Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Accueil tableau de bord (disposition 3) ----------
function Dashboard({ me, mySlots, slots, requests, setTab }) {
  const myReqs = requests.filter((r) => r.user === me.id && r.status === "attente");
  const openCount = slots.filter((s) => s.bookings.length < s.capacity).length;
  const sorted = [...mySlots].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.heure < b.heure ? -1 : 1));
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl p-5" style={{ background: "linear-gradient(120deg," + C.blue + " 0%," + C.rose + " 100%)" }}>
        <div className="text-lg font-bold" style={{ color: C.ink, fontFamily: TH.fontTitle }}>Bonjour {me.nom.split(" ")[0]} 👋</div>
        <div className="mt-0.5 text-xs" style={{ color: C.muted }}>{ORG.nom}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ORG.activeUnits.map((u) => (
            <span key={u} className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: TH.heroChipBg, color: TH.heroChipInk }}>
              {me.credits[u] === Infinity ? "∞" : me.credits[u]} {UNIT_LABEL[u]}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: C.border }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold">📋 Mes séances à venir</span>
          <button className="text-xs font-semibold" style={{ color: C.blueDeep }} onClick={() => setTab("seances")}>Tout voir</button>
        </div>
        {sorted.length === 0 && <div className="text-xs" style={{ color: C.muted }}>Aucune séance cette semaine.</div>}
        {sorted.slice(0, 3).map((s) => (
          <div key={s.id} className="flex items-center gap-2 py-1.5">
            <span className="text-lg">{TYPES[s.type].icon}</span>
            <span className="flex-1 text-xs" style={{ color: C.ink }}>
              <b>{TYPES[s.type].label}</b><br />
              <span style={{ color: C.muted }}>{fmtShort(D(s.date))} · {s.heure}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: C.border }}>
        <div className="mb-1 text-sm font-bold">🗓️ Planning de la semaine</div>
        <div className="text-xs" style={{ color: C.muted }}>{openCount} créneaux encore ouverts à l'inscription</div>
        {myReqs.length > 0 && (
          <div className="text-xs" style={{ color: C.roseDeep }}>📨 {myReqs.length} demande(s) en attente de validation</div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn small onClick={() => setTab("planning")}>Ouvrir le planning</Btn>
          <Btn small variant="outline" onClick={() => setTab("profil")}>Mon compte</Btn>
        </div>
      </div>
    </div>
  );
}
