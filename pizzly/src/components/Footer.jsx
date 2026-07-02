import { Link } from "react-router-dom"

import BackButton from "./BackButton"

 // componente responsável pelo rodapé das páginas da aplicação
function Footer({ voltar }) {
  return (
    <footer>


      {/* exibe o botão voltar apenas quando solicitado */} 
      {voltar && <BackButton />} {/*ou seja, se "voltar" for verdadeiro, renderize o BackButton */}

      {/* informações de direitos autorais */}
      <p>© 2026 Pizzly</p>

      

    </footer>
  )
}

export default Footer