import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../config'
import { messageErreurApi, type Chambre, type Hotel } from '../types'

const classeLabel = 'flex flex-col gap-1 text-sm font-medium text-slate-400'
const classeChamp =
  'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30'

interface FicheChambreProps {
  chambre: Chambre
  hotel: Hotel
  jeton: string | null
  onJetonInvalide: (jeton: string | null) => void
  dateDebutInitiale: string
  dateFinInitiale: string
  onFermer: () => void
}

function FicheChambre({
  chambre,
  hotel,
  jeton,
  onJetonInvalide,
  dateDebutInitiale,
  dateFinInitiale,
  onFermer,
}: FicheChambreProps) {
  const navigate = useNavigate()
  const [dateDebut, setDateDebut] = useState(dateDebutInitiale)
  const [dateFin, setDateFin] = useState(dateFinInitiale)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const envoiEnCours = useRef(false)

  async function reserver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErreur('')

    if (!dateDebut || !dateFin || dateDebut >= dateFin) {
      setErreur("La date d’arrivée doit précéder la date de départ.")
      return
    }

    if (!jeton) {
      navigate('/connexion')
      return
    }

    if (envoiEnCours.current) {
      return
    }
    envoiEnCours.current = true
    setEnvoi(true)

    try {
      const reponse = await fetch(`${API}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jeton}`,
        },
        body: JSON.stringify({
          chambreId: chambre.id,
          dateDebut,
          dateFin,
        }),
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
            `La réservation a échoué (HTTP ${reponse.status}).`,
          ),
        )
      }

      navigate('/mes-reservations')
    } catch (cause) {
      setErreur(
        cause instanceof TypeError
          ? `Impossible de joindre l’API à ${API}. Vérifiez que le serveur fonctionne.`
          : cause instanceof Error
            ? cause.message
            : 'Une erreur inattendue empêche la réservation.',
      )
    } finally {
      envoiEnCours.current = false
      setEnvoi(false)
    }
  }

  return (
    <section
      aria-label={`Fiche de la chambre ${chambre.numero}`}
      className="space-y-2 rounded-xl border border-indigo-500/40 bg-slate-900 p-5"
    >
      <h2 className="text-xl font-semibold">Chambre {chambre.numero}</h2>
      <p className="text-slate-300">Catégorie : {chambre.categorie}</p>
      <p className="text-slate-300">
        Capacité : {chambre.capacite}{' '}
        {chambre.capacite === 1 ? 'personne' : 'personnes'}
      </p>
      <p className="text-slate-300">
        Prix par nuit :{' '}
        <span className="font-semibold text-indigo-300">
          {chambre.prixNuit} €
        </span>
      </p>
      <p className="text-slate-400">{chambre.description}</p>
      <p className="text-slate-300">Hôtel : {hotel.nom}</p>

      {jeton ? (
        <form onSubmit={reserver} className="grid gap-4 pt-3 sm:grid-cols-2">
          <label className={classeLabel}>
            Arrivée
            <input
              type="date"
              required
              value={dateDebut}
              onChange={(event) => setDateDebut(event.target.value)}
              className={classeChamp}
            />
          </label>
          <label className={classeLabel}>
            Départ
            <input
              type="date"
              required
              value={dateFin}
              onChange={(event) => setDateFin(event.target.value)}
              className={classeChamp}
            />
          </label>
          {erreur && (
            <p role="alert" className="text-sm text-red-300 sm:col-span-2">
              {erreur}
            </p>
          )}
          <button
            type="submit"
            disabled={envoi}
            className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {envoi ? 'Réservation en cours…' : 'Réserver cette chambre'}
          </button>
        </form>
      ) : (
        <p className="pt-3 text-sm text-slate-400">
          <Link to="/connexion" className="text-indigo-300 hover:text-indigo-200">
            Connectez-vous
          </Link>{' '}
          pour réserver cette chambre.
        </p>
      )}

      <button
        type="button"
        onClick={onFermer}
        className="mt-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
      >
        Fermer
      </button>
    </section>
  )
}

export default FicheChambre
