import type { ChangeEvent, FormEventHandler } from 'react'
import type { CriteresRecherche } from '../types'

const categories = ['simple', 'double', 'familiale', 'suite']

const classeLabel = 'flex flex-col gap-1 text-sm font-medium text-slate-400'
const classeChamp =
  'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30'

interface FormulaireRechercheProps {
  criteres: CriteresRecherche
  onChanger: (criteres: CriteresRecherche) => void
  onRechercher: FormEventHandler<HTMLFormElement>
}

function FormulaireRecherche({
  criteres,
  onChanger,
  onRechercher,
}: FormulaireRechercheProps) {
  function changer(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    onChanger({ ...criteres, [name]: value })
  }

  return (
    <form
      onSubmit={onRechercher}
      className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <label className={classeLabel}>
        Hôtel
        <input
          name="hotel"
          value={criteres.hotel}
          onChange={changer}
          placeholder="Nom ou identifiant"
          className={classeChamp}
        />
      </label>
      <label className={classeLabel}>
        Arrivée
        <input
          type="date"
          name="date_debut"
          value={criteres.date_debut}
          onChange={changer}
          className={classeChamp}
        />
      </label>
      <label className={classeLabel}>
        Départ
        <input
          type="date"
          name="date_fin"
          value={criteres.date_fin}
          onChange={changer}
          className={classeChamp}
        />
      </label>
      <label className={classeLabel}>
        Personnes
        <input
          type="number"
          name="capacite"
          min="1"
          value={criteres.capacite}
          onChange={changer}
          className={classeChamp}
        />
      </label>
      <label className={classeLabel}>
        Prix max. par nuit (€)
        <input
          type="number"
          name="prix_max"
          min="0"
          value={criteres.prix_max}
          onChange={changer}
          className={classeChamp}
        />
      </label>
      <label className={classeLabel}>
        Catégorie
        <select
          name="categorie"
          value={criteres.categorie}
          onChange={changer}
          className={classeChamp}
        >
          <option value="">Toutes</option>
          {categories.map((categorie) => (
            <option key={categorie} value={categorie}>
              {categorie}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:col-span-2 lg:col-span-3"
      >
        Rechercher
      </button>
    </form>
  )
}

export default FormulaireRecherche
