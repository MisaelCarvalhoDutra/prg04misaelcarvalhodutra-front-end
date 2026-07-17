import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../assets/css/PedidoConfirmado.css";

export default function PedidoConfirmado() {
  const navigate = useNavigate();

  // Dados do pedido confirmado
  const [pedido, setPedido] = useState(null);

  // Recupera o pedido salvo no navegador
  useEffect(() => {
    try {
      const pedidoSalvo = localStorage.getItem("pizzly_pedido_atual");

      if (!pedidoSalvo) {
        return;
      }

      setPedido(JSON.parse(pedidoSalvo));
    } catch (error) {
      console.error("Erro ao carregar o pedido confirmado:", error);
      setPedido(null);
    }
  }, []);

  const handleAcompanharPedido = () => {
    if (!pedido) {
      navigate("/meus-pedidos");
      return;
    }

    navigate("/acompanhar-pedido", {
      state: { pedido },
    });
  };

  return (
    <div className="pc-root">
      <Navbar />

      <main className="pc-main">
        <section
          className="pc-card"
          aria-labelledby="pedido-confirmado-titulo"
        >
          <div className="pc-icon" aria-hidden="true">
            ✅
          </div>

          <span className="pc-tag">Pedido confirmado</span>

          <h1 id="pedido-confirmado-titulo">
            Seu pedido foi realizado com sucesso!
          </h1>

          <p>
            Agora é só aguardar. Você pode acompanhar o andamento do seu pedido
            em tempo real.
          </p>

          <div className="pc-info-grid">
            <div>
              <small>Número do pedido</small>
              <strong>{pedido?.id || "#0000"}</strong>
            </div>

            <div>
              <small>Status</small>
              <strong>{pedido?.status || "Confirmado"}</strong>
            </div>

            <div>
              <small>Tempo estimado</small>
              <strong>{pedido?.tempo || "30 - 45 min"}</strong>
            </div>

            <div>
              <small>Total</small>
              <strong className="pc-total">
                {pedido?.total || "R$ 0,00"}
              </strong>
            </div>
          </div>

          {pedido?.itens?.length > 0 && (
            <div className="pc-items">
              <h2>Itens do pedido</h2>

              {pedido.itens.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          )}

          <div className="pc-actions">
            <button
              type="button"
              className="pc-primary"
              onClick={handleAcompanharPedido}
            >
              Acompanhar pedido
            </button>

            <button
              type="button"
              className="pc-secondary"
              onClick={() => navigate("/")}
            >
              Voltar para Home
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}