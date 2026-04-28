import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { daysUntil, statusOf, statusLabel } from '../lib/habilitations.js'
import CollabModal from './CollabModal.jsx'
import QRModal from './QRModal.jsx'

export default function CollabList() {
  const [collabs, setCollabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editCollab, setEditCollab] = useState(null)     // null = fermé, {} = nouveau, {…} = édition
  const [qrCollab, setQrCollab] = useState(null)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    const { data: collabs } = await supabase
      .from('collaborateurs')
      .select('*')
      .order('nom')
    const { data: habs } = await supabase
      .from('habilitations')
      .select('*')

    // Attacher les habilitations à chaque collab
    const habsByCollab = {}
    for (const h of habs || []) {
      if (!habsByCollab[h.collaborateur_id]) habsByCollab[h.collaborateur_id] = []
      habsByCollab[h.collaborateur_id].push(h)
    }

    const enriched = (collabs || []).map(c => ({
      ...c,
      habs: habsByCollab[c.id] || [],
    }))

    setCollabs(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(collab) {
    if (!window.confirm(`Supprimer ${collab.nom} ${collab.prenom} ? Cette action est irréversible.`)) return
    setDeleting(collab.id)
    await supabase.from('habilitations').delete().eq('collaborateur_id', collab.id)
    await supabase.from('collaborateurs').delete().eq('id', collab.id)
    setDeleting(null)
    load()
  }

  // Calcul du statut global d'un collaborateur
  function globalStatus(collab) {
    if (!collab.habs.length) return 'na'
    const statuses = collab.habs.map(h => statusOf(daysUntil(h.date_echeance)))
    if (statuses.includes('expired')) return 'expired'
    if (statuses.includes('warn')) return 'warn'
    return 'ok'
  }

  const filtered = collabs.filter(c => {
    const q = search.toLowerCase()
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      (c.poste || '').toLowerCase().includes(q) ||
      (c.agence || '').toLowerCase().includes(q)
    )
  })

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      Chargement des collaborateurs…
    </div>
  )

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Collaborateurs</div>
          <div className="page-sub">{collabs.length} personne{collabs.length > 1 ? 's' : ''} dans l'équipe</div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditCollab({})}>
          + Ajouter
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Rechercher par nom, poste, agence…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Poste</th>
                <th>Agence</th>
                <th>Habilitations</th>
                <th>Statut global</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const gs = globalStatus(c)
                const expiredCount = c.habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'expired').length
                const warnCount    = c.habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'warn').length
                const okCount      = c.habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'ok').length

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: gs === 'expired' ? 'var(--danger-bg)' : gs === 'warn' ? 'var(--warn-bg)' : 'var(--accent-bg)',
                          color: gs === 'expired' ? 'var(--danger)' : gs === 'warn' ? 'var(--warn)' : 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>
                          {c.nom[0]}{c.prenom[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.nom} {c.prenom}</div>
                          {c.email && <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{c.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{c.poste || <span style={{ color: 'var(--ink-4)' }}>–</span>}</td>
                    <td>
                      {c.agence
                        ? <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>{c.agence}</span>
                        : <span style={{ color: 'var(--ink-4)' }}>–</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.habs.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Aucune</span>}
                        {expiredCount > 0 && <span className="badge badge-expired">{expiredCount} expirée{expiredCount > 1 ? 's' : ''}</span>}
                        {warnCount    > 0 && <span className="badge badge-warn">{warnCount} à renouveler</span>}
                        {okCount      > 0 && <span className="badge badge-ok">{okCount} valide{okCount > 1 ? 's' : ''}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${gs === 'na' ? 'na' : gs}`}>
                        {gs === 'expired' ? 'Urgent' : gs === 'warn' ? 'À surveiller' : gs === 'ok' ? 'À jour' : 'Non renseigné'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setEditCollab(c)}
                        >✏ Modifier</button>
                        <button
                          className="btn btn-xs"
                          style={{ background: 'var(--topbar-bg)', color: 'white' }}
                          onClick={() => setQrCollab(c)}
                        >📱 QR</button>
                        <button
                          className="btn btn-danger-soft btn-xs"
                          onClick={() => handleDelete(c)}
                          disabled={deleting === c.id}
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <div className="empty-icon">{search ? '🔍' : '👥'}</div>
                      <div className="empty-text">
                        {search ? `Aucun résultat pour « ${search} »` : 'Aucun collaborateur — ajoutez le premier !'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editCollab !== null && (
        <CollabModal
          collab={editCollab}
          onClose={() => setEditCollab(null)}
          onSaved={() => { setEditCollab(null); load() }}
        />
      )}
      {qrCollab && (
        <QRModal collab={qrCollab} onClose={() => setQrCollab(null)} />
      )}
    </>
  )
}
