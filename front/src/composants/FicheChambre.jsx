function FicheChambre({ chambre, hotel, onFermer }) {
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
