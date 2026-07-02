import { Link } from "react-router-dom"

// componente reutilizável responsável por retornar o usuário para a página inicial
function BackButton() {
  return (

    // botão que redireciona para a rota inicial da aplicação
    <Link to="/" className="btn">
      Voltar
    </Link>
  )
}

export default BackButton

