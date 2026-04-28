export const HABILITATIONS_DEF = {
  csps: [
    { code: 'csps1',    label: 'CSPS Niveau 1',    recyclage: 36 },
    { code: 'csps2',    label: 'CSPS Niveau 2',    recyclage: 36 },
    { code: 'csps3',    label: 'CSPS Niveau 3',    recyclage: 36 },
    { code: 'csps_rec', label: 'Recyclage CSPS',   recyclage: 36 },
  ],
  secu: [
    { code: 'sst',      label: 'SST',               recyclage: 24 },
    { code: 'incendie', label: 'Securite Incendie',  recyclage: 24 },
    { code: 'hauteur',  label: 'Travail en Hauteur', recyclage: 36 },
    { code: 'aipr',     label: 'AIPR',               recyclage: 60 },
    { code: 'tms',      label: 'TMS Pro',            recyclage: 36 },
    { code: 'rps',      label: 'RPS',                recyclage: 36 },
    { code: 'cmr',      label: 'CMR',                recyclage: 36 },
    { code: 'mase',     label: 'MASE',               recyclage: 36 },
    { code: 'secours',  label: 'Premiers Secours',   recyclage: 24 },
  ],
  elec: [
    { code: 'h0b0',     label: 'H0B0',               recyclage: 36 },
    { code: 'b1',       label: 'B1 / B1V',           recyclage: 36 },
    { code: 'elec_gen', label: 'Habilitation Elec.',  recyclage: 36 },
  ],
  caces: [
    { code: 'caces_r489_1', label: 'CACES R489 Cat.1', recyclage: 60 },
    { code: 'caces_r489_3', label: 'CACES R489 Cat.3', recyclage: 60 },
    { code: 'caces_r489_4', label: 'CACES R489 Cat.4', recyclage: 60 },
    { code: 'caces_r486',   label: 'CACES R486 (NAC)', recyclage: 60 },
    { code: 'caces_r490',   label: 'CACES R490 Grues', recyclage: 60 },
  ],
  risques: [
    { code: 'ss4',   label: 'SS4 Amiante', recyclage: 36 },
    { code: 'ss3',   label: 'SS3 Amiante', recyclage: 36 },
    { code: 'bsda',  label: 'BSDA',        recyclage: 36 },
    { code: 'plomb', label: 'Plomb',       recyclage: 36 },
    { code: 'atex',  label: 'ATEX',        recyclage: 36 },
  ],
}
 
export const CATEGORIES_LABELS = {
  csps:    'CSPS & Coordination',
  secu:    'Securite generale',
  elec:    'Habilitations electriques',
  caces:   'CACES & Engins',
  risques: 'Risques speciaux',
}
 
export function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((d - today) / 86400000)
}
 
export function statusOf(days) {
  if (days === null || days === undefined) return 'na'
  if (days < 0) return 'expired'
  if (days <= 90) return 'warn'
  return 'ok'
}
 
export function statusLabel(days) {
  const s = statusOf(days)
  if (s === 'na')      return 'Non renseigne'
  if (s === 'expired') return 'Expire (' + Math.abs(days) + 'j)'
  if (s === 'warn')    return 'Dans ' + days + ' j'
  return 'Valide (' + days + ' j)'
}
 
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin2024'
