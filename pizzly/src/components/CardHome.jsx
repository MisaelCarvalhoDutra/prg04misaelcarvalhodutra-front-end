import { Link } from "react-router-dom"

function CardHome(props) {
  return (
    <div className="col-12 col-md-6 col-lg-4">

      <div className="card shadow text-center">

        <div className="card-body">

          <h5 className="card-title">
            {props.titulo}
          </h5>

          <p className="card-text">
            {props.texto}
          </p>

          <Link
            to={props.rota}
            className="btn btn-danger rounded-pill px-4"
          >
            {props.botao}
          </Link>

        </div>

      </div>

    </div>
  )
}

export default CardHome

