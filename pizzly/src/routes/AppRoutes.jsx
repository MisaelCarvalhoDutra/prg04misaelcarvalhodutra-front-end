import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Pedido from "../pages/Pedido";
import Admin from "../pages/Admin";
import CriarConta from "../pages/CriarConta";
import MeusPedidos from "../pages/MeusPedidos";
import AcompanharPedido from "../pages/AcompanharPedido";
import Promocoes from "../pages/Promocoes";
import PedidoConfirmado from "../pages/PedidoConfirmado";
import Perfil from "../pages/Perfil";
import RecuperarSenha from "../pages/RecuperarSenha";
import NovaSenha from "../pages/NovaSenha";

import RotaProtegida from "../components/RotaProtegida";
import RotaLoja from "../components/RotaLoja";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÁGINAS DA LOJA:
            disponíveis para visitantes e clientes */}

        <Route
          path="/"
          element={
            <RotaLoja>
              <Home />
            </RotaLoja>
          }
        />

        <Route
          path="/pedido"
          element={
            <RotaLoja>
              <Pedido />
            </RotaLoja>
          }
        />

        <Route
          path="/promocoes"
          element={
            <RotaLoja>
              <Promocoes />
            </RotaLoja>
          }
        />

        <Route
          path="/criar-conta"
          element={
            <RotaLoja>
              <CriarConta />
            </RotaLoja>
          }
        />

        {/* AUTENTICAÇÃO E RECUPERAÇÃO DE SENHA */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/recuperar-senha"
          element={<RecuperarSenha />}
        />

        <Route
          path="/nova-senha"
          element={<NovaSenha />}
        />

        {/* ROTAS EXCLUSIVAS DE CLIENTE */}

        <Route
          path="/meus-pedidos"
          element={
            <RotaProtegida tiposPermitidos={["CLIENTE"]}>
              <MeusPedidos />
            </RotaProtegida>
          }
        />

        <Route
          path="/acompanhar-pedido"
          element={
            <RotaProtegida tiposPermitidos={["CLIENTE"]}>
              <AcompanharPedido />
            </RotaProtegida>
          }
        />

        <Route
          path="/pedido-confirmado"
          element={
            <RotaProtegida tiposPermitidos={["CLIENTE"]}>
              <PedidoConfirmado />
            </RotaProtegida>
          }
        />

        <Route
          path="/perfil"
          element={
            <RotaProtegida tiposPermitidos={["CLIENTE"]}>
              <Perfil />
            </RotaProtegida>
          }
        />

        {/* ROTA EXCLUSIVA DE FUNCIONÁRIO */}

        <Route
          path="/admin"
          element={
            <RotaProtegida tiposPermitidos={["FUNCIONARIO"]}>
              <Admin />
            </RotaProtegida>
          }
        />

        {/* ROTA INEXISTENTE */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

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
  );
}

export default AppRoutes;