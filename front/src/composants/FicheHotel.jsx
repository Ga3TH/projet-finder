function FicheHotel({ hotel, children }) {
  return (
    <>
      <h1>{hotel.nom}</h1>
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
