import { Navigate, useLocation } from "react-router-dom";

export default function RotaProtegida({
  children,
  tiposPermitidos = [],
}) {
  const location = useLocation();

  let usuarioLogado = null;

  try {
    usuarioLogado = JSON.parse(
      localStorage.getItem("pizzly_usuario")
    );
  } catch (error) {
    console.error("Erro ao ler usuário salvo:", error);
    localStorage.removeItem("pizzly_usuario");
  }

  // Não existe usuário autenticado
  if (!usuarioLogado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  // O usuário existe, mas não possui o tipo permitido
  if (
    tiposPermitidos.length > 0 &&
    !tiposPermitidos.includes(usuarioLogado.tipo)
  ) {
    const destino =
      usuarioLogado.tipo === "FUNCIONARIO"
        ? "/admin"
        : "/";

    return <Navigate to={destino} replace />;
  }

  return children;
}