import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../config'
import {
  messageErreurApi,
  type Reservation,
  type StatutReservation,
} from '../types'

function formaterDate(valeur: string) {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}

const libellesStatut: Record<StatutReservation, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  refusee: 'Refusée',
  annulee: 'Annulée',
}
const intervalleRafraichissement = 5000

interface MesReservationsPageProps {
  jeton: string | null
  onJetonInvalide: (jeton: string | null) => void
}

function MesReservationsPage({
  jeton,
  onJetonInvalide,
}: MesReservationsPageProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [erreurAnnulation, setErreurAnnulation] = useState('')
  const [annulationEnCoursId, setAnnulationEnCoursId] =
    useState<number | null>(null)
  const [versionListe, setVersionListe] = useState(0)
  const annulationEnCours = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()
    let chargementEnCours = false

    async function chargerReservations() {
      if (!jeton) {
        navigate('/connexion', { replace: true })
        return
      }
      if (chargementEnCours || annulationEnCours.current) {
        return
      }
      chargementEnCours = true

      try {
        const reponse = await fetch(`${API}/reservations/mine`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${jeton}`,
          },
        })

        const donnees: unknown = await reponse.json().catch(() => null)

        if (!reponse.ok) {
          if (reponse.status === 401) {
            onJetonInvalide(null)
            navigate('/connexion', { replace: true })
            return
          }
          throw new Error(
            messageErreurApi(
              donnees,
              'Impossible de charger vos réservations.',
            ),
          )
        }

        if (!Array.isArray(donnees)) {
          throw new Error("La réponse de l'API n'est pas une liste de réservations.")
        }

        if (!controller.signal.aborted) {
          setReservations(donnees as Reservation[])
          setErreur('')
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setErreur(
            cause instanceof Error ? cause.message : 'Une erreur est survenue.',
          )
        }
      } finally {
        chargementEnCours = false
        if (!controller.signal.aborted) {
          setChargement(false)
        }
      }
    }

    chargerReservations()
    const intervalle = window.setInterval(
      chargerReservations,
      intervalleRafraichissement,
    )
    return () => {
      window.clearInterval(intervalle)
      controller.abort()
    }
  }, [jeton, navigate, onJetonInvalide, versionListe])

  async function annulerReservation(reservationId: number) {
    if (annulationEnCours.current) {
      return
    }

    annulationEnCours.current = true
    setAnnulationEnCoursId(reservationId)
    setErreurAnnulation('')

    try {
      const reponse = await fetch(`${API}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${jeton}`,
        },
      })
      const donnees: unknown = await reponse.json().catch(() => null)

      if (reponse.status === 401) {
        onJetonInvalide(null)
        navigate('/connexion', { replace: true })
        return
      }
      if (!reponse.ok) {
        throw new Error(
          messageErreurApi(
            donnees,
            `L’annulation a échoué (HTTP ${reponse.status}).`,
          ),
        )
      }

      setReservations((courantes) =>
        courantes.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, statut: 'annulee' }
            : reservation,
        ),
      )
      setErreur('')
      setChargement(true)
      setVersionListe((version) => version + 1)
    } catch (cause) {
      setErreurAnnulation(
        cause instanceof TypeError
          ? `Impossible de joindre l’API à ${API}. Vérifiez que le serveur fonctionne.`
          : cause instanceof Error
            ? cause.message
            : 'Une erreur inattendue empêche l’annulation.',
      )
    } finally {
      annulationEnCours.current = false
      setAnnulationEnCoursId(null)
    }
  }

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

      {chargement && (
        <p className="text-slate-400">Chargement de vos réservations…</p>
      )}

      {!chargement && erreur && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300"
        >
          {erreur}
        </p>
      )}

      {erreurAnnulation && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300"
        >
          {erreurAnnulation}
        </p>
      )}

      {!chargement && !erreur && reservations.length === 0 ? (
        <p className="text-slate-400">Aucune réservation pour le moment.</p>
      ) : null}

      {!chargement && reservations.length > 0 && (
        <ul className="space-y-4">
          {reservations.map((reservation) => (
            <li
              key={reservation.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    {reservation.chambre?.hotel?.nom ?? 'Hôtel inconnu'}
                  </p>
                  <p className="text-sm text-slate-400">
                    Chambre {reservation.chambre?.numero ?? 'inconnue'}
                    {' · '}
                    du {formaterDate(reservation.dateDebut)} au{' '}
                    {formaterDate(reservation.dateFin)}
                  </p>
                </div>
                <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs font-medium uppercase tracking-wide text-indigo-300">
                  {libellesStatut[reservation.statut] ?? reservation.statut ?? 'Inconnu'}
                </span>
              </div>
              {['en_attente', 'confirmee'].includes(reservation.statut) && (
                <button
                  type="button"
                  disabled={annulationEnCoursId !== null}
                  onClick={() => annulerReservation(reservation.id)}
                  className="mt-4 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {annulationEnCoursId === reservation.id
                    ? 'Annulation…'
                    : 'Annuler la réservation'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default MesReservationsPage
