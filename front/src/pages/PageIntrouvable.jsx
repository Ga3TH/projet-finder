import { Link } from 'react-router-dom'

function PageIntrouvable() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-white">Page introuvable</h1>
      <p className="mt-4 text-slate-400">
        La page demandée n’existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400"
      >
        Retour à l’accueil
      </Link>
    </main>
  )
}

export default PageIntrouvable
