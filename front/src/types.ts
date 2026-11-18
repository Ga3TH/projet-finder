export interface Hotel {
  id: number
  nom: string
  etoiles: number
  adresse: string
  codePostal: string
  ville: string
  telephone: string
  email: string
  gerant: string
  description: string
}

export interface Chambre {
  id: number
  hotelId: number
  numero: number
  categorie: string
  capacite: number
  prixNuit: number
  description: string
  disponible: boolean
  hotel: Hotel
}

export type StatutReservation =
  | 'en_attente'
  | 'confirmee'
  | 'refusee'
  | 'annulee'

export interface Reservation {
  id: number
  chambreId: number
  compteId: number
  dateDebut: string
  dateFin: string
  statut: StatutReservation
  chambre: Chambre
}

export interface CriteresRecherche {
  hotel: string
  date_debut: string
  date_fin: string
  capacite: string
  prix_max: string
  categorie: string
}

export interface ComptePublic {
  id: number
  email: string
  role: 'voyageur' | 'hotelier' | 'admin'
}

export interface ReponseConnexion {
  token: string
  compte: ComptePublic
}

export function estReponseConnexion(
  valeur: unknown,
): valeur is ReponseConnexion {
  if (
    typeof valeur !== 'object' ||
    valeur === null ||
    !('token' in valeur) ||
    typeof valeur.token !== 'string' ||
    !('compte' in valeur) ||
    typeof valeur.compte !== 'object' ||
    valeur.compte === null
  ) {
    return false
  }

  return (
    'id' in valeur.compte &&
    typeof valeur.compte.id === 'number' &&
    'email' in valeur.compte &&
    typeof valeur.compte.email === 'string' &&
    'role' in valeur.compte &&
    (valeur.compte.role === 'voyageur' ||
      valeur.compte.role === 'hotelier' ||
      valeur.compte.role === 'admin')
  )
}

export function messageErreurApi(
  donnees: unknown,
  messageParDefaut: string,
): string {
  if (
    typeof donnees === 'object' &&
    donnees !== null &&
    'erreur' in donnees &&
    typeof donnees.erreur === 'string'
  ) {
    return donnees.erreur
  }

  return messageParDefaut
}
