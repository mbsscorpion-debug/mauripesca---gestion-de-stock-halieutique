export function formatMRU(amount: number): string {
  return new Intl.NumberFormat("fr-MR", {
    style: "currency",
    currency: "MRU",
    maximumFractionDigits: 0,
  }).format(amount).replace("MRU", "MRU ");
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTonnes(tonnes: number): string {
  return `${tonnes.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} T`;
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} kg`;
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Céphalopodes":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/10";
    case "Pélagiques":
      return "bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10";
    case "Démersaux / Poissons Nobles":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10";
    case "Farine & Huile de Poisson":
      return "bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/10";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "DISPONIBLE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "RESERVE_EXPORT":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "EN_CONTROLE_ONISPA":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "EN_QUARANTAINE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "EPUISE":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "DISPONIBLE":
      return "Disponible en Stock";
    case "RESERVE_EXPORT":
      return "Réservé Export";
    case "EN_CONTROLE_ONISPA":
      return "Contrôle Qualité ONISPA";
    case "EN_QUARANTAINE":
      return "En Quarantaine";
    case "EPUISE":
      return "Épuisé / Expédié";
    default:
      return status;
  }
}

export function generateLotNumber(category: string, speciesCode: string): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  const catCode = category.substring(0, 3).toUpperCase();
  return `LOT-${year}-NDB-${catCode}-${randomNum}`;
}

export function generateMovementRef(type?: string): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const prefix = type === "SORTIE_EXPORT" ? "EXP" : type === "ENTREE_DEBARQUEMENT" ? "REC" : "MVT";
  return `MVT-${new Date().getFullYear()}-NDB-${prefix}-${random}`;
}
