function FicheChambre({ chambre, hotel, onFermer }) {
  return (
    <section aria-label={`Fiche de la chambre ${chambre.numero}`}>
      <h2>Chambre {chambre.numero}</h2>
      <p>Catégorie : {chambre.categorie}</p>
      <p>
        Capacité : {chambre.capacite}{' '}
        {chambre.capacite === 1 ? 'personne' : 'personnes'}
      </p>
      <p>Prix par nuit : {chambre.prixNuit} €</p>
      <p>{chambre.description}</p>
      <p>Hôtel : {hotel.nom}</p>
      <button type="button" onClick={onFermer}>
        Fermer
      </button>
    </section>
  )
}

export default FicheChambre
