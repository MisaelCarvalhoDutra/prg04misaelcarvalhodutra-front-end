import "../assets/css/style.css"

/*hook do React Router para navegação entre páginas*/
import { useNavigate } from "react-router-dom"

import LoginForm from "../components/LoginForm" /*componente do formulario de autenticação */

function Login() {
   
    const navigate = useNavigate()

    function entrar(event) {
        event.preventDefault()
        navigate("/admin")
    }

  return (
    <div className="login-container">

        <div className="login-left">
            <h1>Pizzly</h1>
            <p>Sabores que conquistam 🔥</p>
        </div>

        <div className="login-right">
            <div className="login-card">
                <h2>Bem-vindo</h2>
                <LoginForm entrar={entrar} /> {/*componente de formulário*/}
            </div>
        </div>

    </div>
  )
}

export default Login