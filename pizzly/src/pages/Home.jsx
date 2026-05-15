import "../assets/css/style.css"

import CardHome from "../components/CardHome" /*importando component de card */

import Navbar from "../components/Navbar" /*componente de Menu de navegação entre as páginas */


function Home() {
  return (
        <div className="container-lg py-5"> 

        <header className="text-center mb-4">

            <h1 className="text-danger">Nascimento do Projeto</h1>
            <hr className="w-50 mx-auto opacity-25" />

            {/*Navbar*/}
            <Navbar />

        </header>

        <div className="bg-white p-4 rounded shadow ">
            <main className="row   mb-4  justify-content-center ">
                <CardHome
                    titulo="Login"
                    texto="Acesse sua conta."
                    botao="Entrar"
                    rota="/login"
                />

                <CardHome 
                    titulo="Pedidos" 
                    texto="Faça seu pedido online." 
                    botao="Pedir" 
                    rota="/pedido" 
                /> 
                
                <CardHome 
                    titulo="Admin" 
                    texto="Gerencie usuários cadastrados." 
                    botao="Acessar" 
                    rota="/admin" 
                />
            </main>
        </div>

        {/*Footer*/}
        <footer className="text-center py-3 border-top mt-auto">
            <p>© 2026 Pizzly</p>
        </footer>

        </div>
  )
}

export default Home