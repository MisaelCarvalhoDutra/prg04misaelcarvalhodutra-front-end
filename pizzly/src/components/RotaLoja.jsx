import { Navigate } from "react-router-dom";

/**
 * Controla o acesso às páginas públicas da loja.
 *
 * Visitantes e clientes podem acessar normalmente.
 * Funcionários autenticados são redirecionados ao painel.
 */
export default function RotaLoja({ children }) {
  let usuarioLogado = null;

  try {
    usuarioLogado = JSON.parse(
      localStorage.getItem("pizzly_usuario")
    );
  } catch (error) {
    console.error("Erro ao recuperar usuário salvo:", error);

    localStorage.removeItem("pizzly_usuario");
  }

  if (usuarioLogado?.tipo === "FUNCIONARIO") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}