function FicheHotel({ hotel }) {
  return (
    <article>
      <h1>{hotel.nom}</h1>
      <p aria-label={`${hotel.etoiles} étoiles`}>
        {'★'.repeat(hotel.etoiles)}
      </p>
      <address>
        {hotel.adresse}
        <br />
        {hotel.code_postal} {hotel.ville}
      </address>
      <p>{hotel.description}</p>
    </article>
  )
}

export default FicheHotel
