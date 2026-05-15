import { Link } from "react-router-dom"

import BackButton from "./BackButton"

function Footer({ voltar }) {
  return (
    <footer>


      {voltar && <BackButton />}

      <p>© 2026 Pizzly</p>

      

    </footer>
  )
}

export default Footer