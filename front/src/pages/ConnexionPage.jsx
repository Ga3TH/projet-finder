import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { API } from '../config.js'

function ConnexionPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('a.morel@mail.example')
  const [motDePasse, setMotDePasse] = useState('Voyage-2026!')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const estConnecte = Boolean(localStorage.getItem('token'))
  if (estConnecte) {
    return <Navigate to="/mes-reservations" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur('')

    if (!email.trim() || !motDePasse.trim()) {
      setErreur('Renseignez un email et un mot de passe.')
      return
    }

    setChargement(true)

    try {
      const reponse = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          motDePasse,
        }),
      })

      const donnees = await reponse.json().catch(() => ({}))

      if (!reponse.ok) {
        throw new Error(donnees.erreur || 'Identifiants invalides.')
      }

      localStorage.setItem('token', donnees.token)
      navigate('/mes-reservations', { replace: true })
    } catch (erreurRecue) {
      setErreur(
        erreurRecue instanceof Error
          ? erreurRecue.message
          : 'La connexion a échoué.',
      )
    } finally {
      setChargement(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">Connexion</h1>

        <p className="mb-4 text-sm text-slate-400">
          Exemple voyageur : <strong>a.morel@mail.example</strong> /{' '}
          <strong>Voyage-2026!</strong>
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400"
              placeholder="a.morel@mail.example"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Mot de passe
            <input
              type="password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400"
              placeholder="Voyage-2026!"
            />
          </label>

          {erreur && (
            <p role="alert" className="text-sm text-red-300">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {chargement ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default ConnexionPage
