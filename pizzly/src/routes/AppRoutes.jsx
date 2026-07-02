import { BrowserRouter, Routes, Route } from "react-router-dom"

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "../pages/Home"
import Login from "../pages/Login"
import Pedido from "../pages/Pedido"
import Admin from "../pages/Admin"
import CriarConta from "../pages/CriarConta";
import MeusPedidos from "../pages/MeusPedidos";
import AcompanharPedido from "../pages/AcompanharPedido";
import Promocoes from "../pages/Promocoes";
import PedidoConfirmado from "../pages/PedidoConfirmado";
import Perfil from "../pages/Perfil";
import RecuperarSenha from "../pages/RecuperarSenha";

// define todas as rotas da aplicação
function AppRoutes() {
  return (
    <BrowserRouter>

      {/* rotas principais do sistema */}
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/pedido" element={<Pedido />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/criar-conta" element={<CriarConta />} />

        <Route path="/meus-pedidos" element={<MeusPedidos />} />

        <Route path="/acompanhar-pedido" element={<AcompanharPedido />} />

        <Route path="/promocoes" element={<Promocoes />} />

        <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />

        <Route path="/perfil" element={<Perfil />} />

        <Route path="/recuperar-senha" element={<RecuperarSenha />} />


      </Routes>

      {/*trocando alerts() por toast, mais bonito visualmente */}
      {/* componente global responsável por exibir mensagens de sucesso e erro */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

    </BrowserRouter>
  )
}

export default AppRoutes