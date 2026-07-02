import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../assets/css/PedidoConfirmado.css";

export default function PedidoConfirmado() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const pedidoSalvo = JSON.parse(
      localStorage.getItem("pizzly_pedido_atual")
    );

    setPedido(pedidoSalvo);
  }, []);

  return (
    <div className="pc-root">
      <Navbar />

      <main className="pc-main">
        <section className="pc-card">
          <div className="pc-icon">✅</div>

          <span className="pc-tag">Pedido confirmado</span>

          <h1>Seu pedido foi realizado com sucesso!</h1>

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
              <strong className="pc-total">{pedido?.total || "R$ 0,00"}</strong>
            </div>
          </div>

          {pedido?.itens?.length > 0 && (
            <div className="pc-items">
              <h2>Itens do pedido</h2>

              {pedido.itens.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          )}

          <div className="pc-actions">
            <button
              className="pc-primary"
              onClick={() => {
                if (!pedido) {
                  navigate("/meus-pedidos");
                  return;
                }

                navigate("/acompanhar-pedido", { state: { pedido } });
              }}
            >
              Acompanhar pedido
            </button>

            <button
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