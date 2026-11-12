function FicheHotel({ hotel, children }) {
  return (
    <>
      <h2>{hotel.nom}</h2>
      <p>{hotel.adresse}</p>
      <p>
        {hotel.codePostal} {hotel.ville}
      </p>
      <p>{hotel.description}</p>
      {children}
    </>
  )
}

export default FicheHotel
