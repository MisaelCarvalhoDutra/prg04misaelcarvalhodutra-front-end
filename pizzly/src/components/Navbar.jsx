import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger rounded mb-4">
        <div className="container-fluid">

            {/*Aqui é o nome do projeto*/}
            <a className="navbar-brand fw-bold" href="#">🍕 Pizzly</a>

            {/*Botão hambúrguer (mobile) */}
            <button 
                className="navbar-toggler" 
                type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#menuBootstrap"
                >
                    
                <span className="navbar-toggler-icon"></span>
            </button>

                    {/*Menu */}
                <div className="collapse navbar-collapse" id="menuBootstrap">
                    <ul className="navbar-nav ms-auto">

                        <li className="nav-item">
                            <Link className="nav-link" to="/login">
                                Login
                            </Link>
                            
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" to="/pedido">
                                Pedidos
                            </a>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/admin">
                                Usuários
                            </Link>
                        </li>

                    </ul>
                </div>

            </div>
        </nav>
  )
}

export default Navbar