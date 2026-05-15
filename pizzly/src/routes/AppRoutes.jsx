import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "../pages/Home"
import Login from "../pages/Login"
import Pedido from "../pages/Pedido"
import Admin from "../pages/Admin"

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/pedido" element={<Pedido />} />

        <Route path="/admin" element={<Admin />} />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRoutes