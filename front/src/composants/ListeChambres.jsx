function ListeChambres({ chambres, chambreSelectionneeId, onSelectionner }) {
  return (
    <>
      <p>{chambres.length} chambres</p>
      {chambres.length === 0 ? (
        <p>Aucune chambre à afficher.</p>
      ) : (
        <ul>
          {chambres.map((chambre) => (
            <li key={chambre.id}>
              <button
                type="button"
                aria-pressed={chambre.id === chambreSelectionneeId}
                onClick={() => onSelectionner(chambre.id)}
              >
                {chambre.numero} — {chambre.categorie}, {chambre.capacite} pers.
                {' — '}
                {chambre.prixNuit} €
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ListeChambres
