import type { Chambre } from '../types'

interface ListeChambresProps {
  chambres: Chambre[]
  chambreSelectionneeId: number | null
  onSelectionner: (id: number) => void
}

function ListeChambres({
  chambres,
  chambreSelectionneeId,
  onSelectionner,
}: ListeChambresProps) {
  if (chambres.length === 0) {
    return <p className="text-slate-400">Aucune chambre à afficher.</p>
  }

  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-slate-400">
        {chambres.length} chambres
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {chambres.map((chambre) => (
          <li key={chambre.id}>
            <button
              type="button"
              aria-pressed={chambre.id === chambreSelectionneeId}
              onClick={() => onSelectionner(chambre.id)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-left transition hover:border-slate-600 hover:bg-slate-800 aria-pressed:border-indigo-400 aria-pressed:bg-indigo-500/10"
            >
              <span>
                <span className="font-semibold">{chambre.numero}</span>
                <span className="text-slate-400">
                  {' — '}
                  {chambre.categorie}, {chambre.capacite} pers.
                </span>
              </span>
              <span className="font-semibold text-indigo-300">
                {chambre.prixNuit} €
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ListeChambres
