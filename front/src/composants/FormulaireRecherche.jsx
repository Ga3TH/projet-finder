const categories = ['simple', 'double', 'familiale', 'suite']

function FormulaireRecherche({ criteres, onChanger, onRechercher }) {
  function changer(event) {
    const { name, value } = event.target
    onChanger({ ...criteres, [name]: value })
  }

  return (
    <form onSubmit={onRechercher}>
      <label>
        Hôtel
        <input
          name="hotel"
          value={criteres.hotel}
          onChange={changer}
          placeholder="Nom ou identifiant"
        />
      </label>
      <label>
        Arrivée
        <input
          type="date"
          name="date_debut"
          value={criteres.date_debut}
          onChange={changer}
        />
      </label>
      <label>
        Départ
        <input
          type="date"
          name="date_fin"
          value={criteres.date_fin}
          onChange={changer}
        />
      </label>
      <label>
        Personnes
        <input
          type="number"
          name="capacite"
          min="1"
          value={criteres.capacite}
          onChange={changer}
        />
      </label>
      <label>
        Prix max. par nuit (€)
        <input
          type="number"
          name="prix_max"
          min="0"
          value={criteres.prix_max}
          onChange={changer}
        />
      </label>
      <label>
        Catégorie
        <select
          name="categorie"
          value={criteres.categorie}
          onChange={changer}
        >
          <option value="">Toutes</option>
          {categories.map((categorie) => (
            <option key={categorie} value={categorie}>
              {categorie}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Rechercher</button>
    </form>
  )
}

export default FormulaireRecherche
