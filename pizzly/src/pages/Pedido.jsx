import "../assets/css/style.css"
import { Link } from "react-router-dom"
import Header from "../components/Header" /*component de cabeçalho */
import Footer  from "../components/Footer" /*componente rodapé com informações de autoria e link para retornar */
import PedidoForm  from "../components/PedidoForm" /*componente de formulario do pedido */

function Pedido() {
  return (
    <div className="container">

    <Header titulo="🍕 Pizzly - Fazer Pedido" />


    <main>
        <section>

            <h2>📋 Dados do Pedido</h2>
            <PedidoForm />
        </section>
    </main>

    <Footer voltar={true} />

</div>
  )
}

export default Pedido