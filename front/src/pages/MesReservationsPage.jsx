import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API } from '../config.js'

function MesReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    async function chargerReservations() {
      const token = localStorage.getItem('token')

      if (!token) {
        setErreur('Vous devez être connecté pour voir vos réservations.')
        setChargement(false)
        return
      }

      try {
        const reponse = await fetch(`${API}/reservations/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const donnees = await reponse.json().catch(() => [])

        if (!reponse.ok) {
          throw new Error(donnees.erreur || 'Impossible de charger vos réservations.')
        }

        setReservations(Array.isArray(donnees) ? donnees : [])
      } catch (cause) {
        setErreur(
          cause instanceof Error ? cause.message : 'Une erreur est survenue.',
        )
      } finally {
        setChargement(false)
      }
    }

    chargerReservations()
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes réservations</h1>
        <Link
          to="/"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Retour à l’accueil
        </Link>
      </div>

      {chargement && <p className="text-slate-400">Chargement de vos réservations…</p>}

      {!chargement && erreur && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
          {erreur}
        </p>
      )}

      {!chargement && !erreur && reservations.length === 0 ? (
        <p className="text-slate-400">Aucune réservation pour le moment.</p>
      ) : null}

      {!chargement && !erreur && reservations.length > 0 && (
        <ul className="space-y-4">
          {reservations.map((reservation) => (
            <li
              key={reservation.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Réservation #{reservation.id}</p>
                  <p className="text-sm text-slate-400">
                    Chambre #{reservation.chambreId ?? 'inconnue'}
                  </p>
                </div>
                <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs font-medium uppercase tracking-wide text-indigo-300">
                  {reservation.statut ?? 'inconnu'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default MesReservationsPage
