import FicheHotel from './composants/FicheHotel.jsx'

const hotel = {
  id: 1,
  nom: 'Amor',
  etoiles: 3,
  adresse: '14 quai des Pêcheurs',
  code_postal: '17000',
  ville: 'La Rochelle',
  telephone: '05 46 00 11 22',
  email: 'contact@amor.example',
  gerant: 'M. Ravel',
  description:
    'Hôtel de charme sur le vieux port, 12 chambres, petit-déjeuner maison, vélos prêtés aux clients.',
}

function App() {
  return <FicheHotel hotel={hotel} />
}

export default App
