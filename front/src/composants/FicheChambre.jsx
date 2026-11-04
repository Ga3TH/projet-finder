function FicheChambre({ chambre, hotel }) {
  return (
    <section>
      <p>{chambre.numero}</p>
      <p>{chambre.categorie}</p>
      <p>{chambre.prixNuit} €</p>
      <p>{hotel.nom}</p>
    </section>
  )
}

export default FicheChambre
