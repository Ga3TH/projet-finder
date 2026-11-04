import { useState } from 'react'
import FicheChambre from './composants/FicheChambre.jsx'
import FicheHotel from './composants/FicheHotel.jsx'
import ListeChambres from './composants/ListeChambres.jsx'

const hotel = {
  id: 1,
  nom: 'Amor',
  adresse: '14 quai des Pêcheurs',
  codePostal: '17000',
  ville: 'La Rochelle',
  description:
    'Hôtel de charme sur le vieux port, 12 chambres, petit-déjeuner maison, vélos prêtés aux clients.',
}

const chambres = [
  {
    id: 1,
    hotelId: 1,
    numero: 101,
    categorie: 'simple',
    capacite: 1,
    prixNuit: 69,
  },
  {
    id: 2,
    hotelId: 1,
    numero: 102,
    categorie: 'simple',
    capacite: 1,
    prixNuit: 69,
  },
  {
    id: 3,
    hotelId: 1,
    numero: 103,
    categorie: 'simple',
    capacite: 1,
    prixNuit: 69,
  },
  {
    id: 4,
    hotelId: 1,
    numero: 104,
    categorie: 'double',
    capacite: 2,
    prixNuit: 95,
  },
  {
    id: 5,
    hotelId: 1,
    numero: 105,
    categorie: 'double',
    capacite: 2,
    prixNuit: 95,
  },
  {
    id: 6,
    hotelId: 1,
    numero: 206,
    categorie: 'double',
    capacite: 2,
    prixNuit: 95,
  },
  {
    id: 7,
    hotelId: 1,
    numero: 207,
    categorie: 'double',
    capacite: 2,
    prixNuit: 95,
  },
  {
    id: 8,
    hotelId: 1,
    numero: 208,
    categorie: 'double',
    capacite: 2,
    prixNuit: 95,
  },
  {
    id: 9,
    hotelId: 1,
    numero: 209,
    categorie: 'double',
    capacite: 2,
    prixNuit: 95,
  },
  {
    id: 10,
    hotelId: 1,
    numero: 210,
    categorie: 'familiale',
    capacite: 4,
    prixNuit: 149,
  },
  {
    id: 11,
    hotelId: 1,
    numero: 211,
    categorie: 'familiale',
    capacite: 4,
    prixNuit: 149,
  },
  {
    id: 12,
    hotelId: 1,
    numero: 212,
    categorie: 'suite',
    capacite: 2,
    prixNuit: 189,
  },
]

function App() {
  const [chambreSelectionneeId, setChambreSelectionneeId] = useState(
    chambres[0]?.id ?? null,
  )
  const chambreSelectionnee = chambres.find(
    (chambre) => chambre.id === chambreSelectionneeId,
  )

  return (
    <FicheHotel hotel={hotel}>
      <ListeChambres
        chambres={chambres}
        chambreSelectionneeId={chambreSelectionneeId}
        onSelectionner={setChambreSelectionneeId}
      />
      {chambreSelectionnee && (
        <FicheChambre chambre={chambreSelectionnee} hotel={hotel} />
      )}
    </FicheHotel>
  )
}

export default App
