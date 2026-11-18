import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import AccueilPage from './pages/AccueilPage'
import ConnexionPage from './pages/ConnexionPage'
import MesReservationsPage from './pages/MesReservationsPage'
import PageIntrouvable from './pages/PageIntrouvable'

interface RouteProtegeeProps {
  jeton: string | null
  children: ReactNode
}

function RouteProtegee({ jeton, children }: RouteProtegeeProps) {
  if (!jeton) {
    return <Navigate to="/connexion" replace />
  }

  return children
}

function App() {
  const navigate = useNavigate()
  const [jeton, setJeton] = useState<string | null>(null)

  function deconnecter() {
    setJeton(null)
    navigate('/', { replace: true })
  }

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-indigo-300' : 'text-slate-300 hover:text-white')}>
              Accueil
            </NavLink>
            <NavLink to="/mes-reservations" className={({ isActive }) => (isActive ? 'text-indigo-300' : 'text-slate-300 hover:text-white')}>
              Mes réservations
            </NavLink>
          </div>

          {jeton ? (
            <button
              type="button"
              onClick={deconnecter}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Déconnexion
            </button>
          ) : (
            <NavLink
              to="/connexion"
              className={({ isActive }) => (isActive ? 'text-indigo-300' : 'text-slate-300 hover:text-white')}
            >
              Connexion
            </NavLink>
          )}
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <AccueilPage jeton={jeton} onJetonInvalide={setJeton} />
          }
        />
        <Route
          path="/connexion"
          element={
            <ConnexionPage jeton={jeton} onConnexion={setJeton} />
          }
        />
        <Route
          path="/mes-reservations"
          element={
            <RouteProtegee jeton={jeton}>
              <MesReservationsPage
                jeton={jeton}
                onJetonInvalide={setJeton}
              />
            </RouteProtegee>
          }
        />
        <Route path="*" element={<PageIntrouvable />} />
      </Routes>
    </>
  )
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
