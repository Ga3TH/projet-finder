function ListeChambres({ chambres, chambreSelectionneeId, onSelectionner }) {
  if (chambres.length === 0) {
    return <p>Aucune chambre à afficher.</p>;
  }

  return (
    <ul>
      {chambres.map((chambre) => (
        <li
          key={chambre.id}
          role="button"
          tabIndex={0}
          aria-pressed={chambre.id === chambreSelectionneeId}
          onClick={() => onSelectionner(chambre.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectionner(chambre.id);
            }
          }}
        >
          {chambre.numero} — {chambre.categorie}, {chambre.capacite} pers. —{" "}
          {chambre.prixNuit} €
        </li>
      ))}
    </ul>
  );
}

export default ListeChambres;
