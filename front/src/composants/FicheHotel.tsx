import type { ReactNode } from 'react'
import type { Hotel } from '../types'

interface FicheHotelProps {
  hotel: Hotel
  children?: ReactNode
}

function FicheHotel({ hotel, children }: FicheHotelProps) {
  return (
    <section className="space-y-1 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-xl font-semibold">{hotel.nom}</h2>
      <p className="text-slate-300">{hotel.adresse}</p>
      <p className="text-slate-300">
        {hotel.codePostal} {hotel.ville}
      </p>
      <p className="text-slate-400">{hotel.description}</p>
      {children}
    </section>
  )
}

export default FicheHotel
