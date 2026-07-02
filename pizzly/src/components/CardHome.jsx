import { Link } from "react-router-dom"

// componente reutilizável responsável por exibir um card na página inicial
//representa os cards exibidos na página inicial
function CardHome({ titulo, texto, rota, botao }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">

      <div className="card shadow text-center">

        <div className="card-body">

          <h5 className="card-title">
            {titulo}
          </h5>

          <p className="card-text">
            {texto}
          </p>

          // botão que direciona para a funcionalidade correspondente
          <Link
            to={rota}
            className="btn btn-danger rounded-pill px-4"
          >
            {botao}
          </Link>

        </div>

      </div>

    </div>
  )
}

export default CardHome

