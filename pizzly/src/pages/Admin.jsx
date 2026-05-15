import "../assets/css/style.css"
import { Link } from "react-router-dom"
import Header from "../components/Header" /*component de cabeçalho */
import Footer  from "../components/Footer" /*componente rodapé com informações de autoria e link para retornar */
import UserTable from "../components/UserTable" /*componente de tabela */


function Admin() {
  return (
    <div className="container">
        
        <Header titulo="📊 Painel Administrativo" />

        <main>

            <section>

                <h2>Usuários Cadastrados</h2>

                <UserTable />

            </section>
        </main>

        <Footer voltar={true} />


    </div>
  )
}

export default Admin

