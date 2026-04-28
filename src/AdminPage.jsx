import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Dashboard from '../components/Dashboard.jsx'
import CollabList from '../components/CollabList.jsx'
import ConfigPanel from '../components/ConfigPanel.jsx'

const NAV = [
  { id: 'dashboard',      label: 'Tableau de bord', icon: '📊' },
  { id: 'collaborateurs', label: 'Collaborateurs',  icon: '👥' },
  { id: 'config',         label: 'Configuration',   icon: '⚙️' },
]

export default function AdminPage() {
  const { logout } = useAuth()
  const [page, setPage] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">S</div>
          <div>
            Socotec SPS IDF
            <div className="topbar-sub">Gestion des habilitations</div>
          </div>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Admin</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="admin-layout">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-section">Navigation</div>
          {NAV.map(item => (
            <div
              key={item.id}
              className={`sidebar-item${page === item.id ? ' active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Contenu principal */}
        <main className="main-content">
          {page === 'dashboard'      && <Dashboard onNavigate={setPage} />}
          {page === 'collaborateurs' && <CollabList />}
          {page === 'config'         && <ConfigPanel />}
        </main>
      </div>
    </div>
  )
}
