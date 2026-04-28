import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES_LABELS, daysUntil, statusOf, statusLabel } from '../lib/habilitations.js'

const CAT_ICONS = { csps: '🎓', secu: '🦺', elec: '⚡', caces: '🏗', risques: '☢' }

export default function FichePage() {
  const { id } = useParams()
  const [collab, setCollab] = useState(null)
  const [habs, setHabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: c, error } = await supabase.from('collaborateurs').select('*').eq('id', id).single()
      if (error || !c) { setNotFound(true); setLoading(false); return }
      const { data: h } = await supabase.from('habilitations').select('*').eq('collaborateur_id', id).order('categorie')
      setCollab(c)
      setHabs(h || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: '#F9FAFB' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ fontSize: 14, color: '#6B7280' }}>Chargement...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Fiche introuvable</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Ce collaborateur n existe pas ou a ete supprime.</div>
      </div>
    </div>
  )

  const habsByCategory = {}
  for (const h of habs) {
    if (!habsByCategory[h.categorie]) habsByCategory[h.categorie] = []
    habsByCategory[h.categorie].push(h)
  }

  const initiales = collab.nom[0] + collab.prenom[0]
  const expiredCount = habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'expired').length
  const warnCount    = habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'warn').length
  const okCount      = habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'ok').length

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* HEADER */}
      <div style={{ background: '#0F172A', color: 'white', padding: '24px 16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>
          Socotec SPS IDF — Habilitations
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0, border: '2px solid rgba(255,255,255,.15)' }}>
            {initiales}
          </div>
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.3px', lineHeight: 1.2 }}>{collab.nom} {collab.prenom}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{[collab.poste, collab.agence].filter(Boolean).join(' · ')}</div>
          </div>
        </div>

        {/* COMPTEURS 3 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { count: expiredCount, label: 'EXPIRÉE', labelPlural: 'EXPIRÉES', activeColor: '#FCA5A5', activeBg: 'rgba(220,38,38,.25)' },
            { count: warnCount,    label: 'À RENOUVELER', labelPlural: 'À RENOUVELER', activeColor: '#FCD34D', activeBg: 'rgba(217,119,6,.25)' },
            { count: okCount,      label: 'VALIDE', labelPlural: 'VALIDES', activeColor: '#6EE7B7', activeBg: 'rgba(5,150,105,.25)' },
          ].map(({ count, label, labelPlural, activeColor, activeBg }) => (
            <div key={label} style={{ background: count > 0 ? activeBg : 'rgba(255,255,255,.05)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: count > 0 ? activeColor : 'rgba(255,255,255,.2)' }}>{count}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: count > 0 ? activeColor : 'rgba(255,255,255,.2)', marginTop: 4, letterSpacing: '.5px' }}>
                {count > 1 ? labelPlural : label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CORPS */}
      <div style={{ padding: 16 }}>
        {habs.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>Aucune habilitation renseignee.</div>
          </div>
        ) : (
          Object.entries(habsByCategory).map(([cat, catHabs]) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, background: '#EFF6FF', color: '#2563EB', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {CAT_ICONS[cat] || '📌'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                  {CATEGORIES_LABELS[cat] || cat}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {catHabs.map(h => {
                  const days = daysUntil(h.date_echeance)
                  const status = statusOf(days)
                  const border  = status === 'ok' ? '#059669' : status === 'warn' ? '#D97706' : status === 'expired' ? '#DC2626' : '#D1D5DB'
                  const badgeBg = status === 'ok' ? '#ECFDF5' : status === 'warn' ? '#FFFBEB' : status === 'expired' ? '#FEF2F2' : '#F3F4F6'
                  const badgeFg = status === 'ok' ? '#059669' : status === 'warn' ? '#D97706' : status === 'expired' ? '#DC2626' : '#9CA3AF'
                  return (
                    <div key={h.id} style={{ background: 'white', border: '1px solid #E5E7EB', borderLeft: '4px solid ' + border, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{h.label}</div>
                        {h.date_echeance && (
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                            Expire le {new Date(h.date_echeance).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                      <div style={{ background: badgeBg, color: badgeFg, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {statusLabel(days)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', padding: '16px 0 24px', borderTop: '1px solid #E5E7EB', marginTop: 8 }}>
          Fiche en lecture seule · Mise a jour automatique
        </div>
      </div>
    </div>
  )
}
