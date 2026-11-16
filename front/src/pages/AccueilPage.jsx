import { useEffect, useState } from 'react'
import { API } from '../config.js'
import FicheChambre from '../composants/FicheChambre.jsx'
import FicheHotel from '../composants/FicheHotel.jsx'
import FormulaireRecherche from '../composants/FormulaireRecherche.jsx'
import ListeChambres from '../composants/ListeChambres.jsx'

const criteresInitiaux = {
  hotel: '',
  date_debut: '',
  date_fin: '',
  capacite: '',
  prix_max: '',
  categorie: '',
}

function AccueilPage() {
  const [criteres, setCriteres] = useState(criteresInitiaux)
  const [criteresValides, setCriteresValides] = useState(criteresInitiaux)
  const [versionRecherche, setVersionRecherche] = useState(0)
  const [chambres, setChambres] = useState([])
  const [hotelCible, setHotelCible] = useState(null)
  const [chambreSelectionneeId, setChambreSelectionneeId] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [erreurFormulaire, setErreurFormulaire] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function rechercher() {
      setChargement(true)
      setErreur(null)
      setChambres([])
      setHotelCible(null)
      setChambreSelectionneeId(null)

      try {
        const parametres = new URLSearchParams()
        for (const [cle, valeur] of Object.entries(criteresValides)) {
          if (valeur !== '') {
            parametres.set(cle, valeur)
          }
        }

        const suffixe = parametres.size > 0 ? `?${parametres}` : ''
        const reponseChambres = await fetch(`${API}/chambres${suffixe}`, {
          signal: controller.signal,
        })
        if (!reponseChambres.ok) {
          let corps
          try {
            corps = await reponseChambres.json()
          } catch {
            corps = null
          }
          throw new Error(
            corps?.erreur ??
              `La recherche a échoué (HTTP ${reponseChambres.status}).`,
          )
        }

        const resultats = await reponseChambres.json()
        if (!Array.isArray(resultats)) {
          throw new Error("La réponse de l'API n'est pas une liste de chambres.")
        }

        let hotelTrouve = null
        const rechercheHotel = criteresValides.hotel.trim()
        if (rechercheHotel !== '') {
          const reponseHotels = await fetch(`${API}/hotels`, {
            signal: controller.signal,
          })
          if (!reponseHotels.ok) {
            throw new Error(
              `Impossible de charger les hôtels (HTTP ${reponseHotels.status}).`,
            )
          }
          const hotels = await reponseHotels.json()
          if (!Array.isArray(hotels)) {
            throw new Error("La réponse de l'API n'est pas une liste d'hôtels.")
          }
          const rechercheNormalisee = rechercheHotel.toLocaleLowerCase()
          hotelTrouve =
            hotels.find((hotel) => String(hotel.id) === rechercheHotel) ??
            hotels.find((hotel) =>
              hotel.nom.toLocaleLowerCase().includes(rechercheNormalisee),
            ) ??
            null
        }

        if (!controller.signal.aborted) {
          setChambres(resultats)
          setHotelCible(hotelTrouve)
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setErreur(
            cause instanceof TypeError
              ? `Impossible de joindre l’API à ${API}. Vérifiez que le serveur fonctionne et que l’origine du front est autorisée.`
              : cause instanceof Error
                ? cause.message
                : "Une erreur inattendue empêche la recherche.",
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setChargement(false)
        }
      }
    }

    rechercher()
    return () => controller.abort()
  }, [criteresValides, versionRecherche])

  function rechercherAvecCriteres(event) {
    event.preventDefault()
    setErreurFormulaire(null)

    if (Boolean(criteres.date_debut) !== Boolean(criteres.date_fin)) {
      setErreurFormulaire("Renseignez les deux dates ou laissez-les vides.")
      return
    }
    if (criteres.date_debut && criteres.date_debut >= criteres.date_fin) {
      setErreurFormulaire("La date d’arrivée doit précéder la date de départ.")
      return
    }

    setCriteresValides({ ...criteres })
    setVersionRecherche((version) => version + 1)
  }

  const chambreSelectionnee = chambres.find(
    (chambre) => chambre.id === chambreSelectionneeId,
  )

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Rechercher une chambre</h1>
      <FormulaireRecherche
        criteres={criteres}
        onChanger={setCriteres}
        onRechercher={rechercherAvecCriteres}
      />
      {erreurFormulaire && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300"
        >
          {erreurFormulaire}
        </p>
      )}
      {chargement && (
        <p role="status" className="text-slate-400">
          Chargement des chambres…
        </p>
      )}
      {!chargement && erreur && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300"
        >
          {erreur}
        </p>
      )}
      {!chargement &&
        !erreur &&
        criteresValides.hotel.trim() !== '' &&
        (hotelCible ? (
          <FicheHotel hotel={hotelCible} />
        ) : (
          <p role="status" className="text-slate-400">
            Aucun hôtel ne correspond à « {criteresValides.hotel} ».
          </p>
        ))}
      {!chargement && !erreur && (
        <>
          <ListeChambres
            chambres={chambres}
            chambreSelectionneeId={chambreSelectionneeId}
            onSelectionner={setChambreSelectionneeId}
          />
          {chambreSelectionnee && (
            <FicheChambre
              chambre={chambreSelectionnee}
              hotel={chambreSelectionnee.hotel}
              onFermer={() => setChambreSelectionneeId(null)}
            />
          )}
        </>
      )}
    </main>
  )
}

export default AccueilPage
