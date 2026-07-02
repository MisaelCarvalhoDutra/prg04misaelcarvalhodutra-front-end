import "../assets/css/AcompanharPedido.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PEDIDO_PADRAO = {
  id: "#1025",
  data: "03/06/2026",
  status: "Preparando",
  itens: ["1x Pizza Calabresa", "1x Coca-Cola 2L"],
  total: "R$ 68,80",
  tempo: "30 - 45 min",
  entrega: "Rua das Flores, 123 — Centro",
  pagamento: "Pix",
};

const STATUS_ORDEM = [
  "Confirmado",
  "Preparando",
  "Saiu para entrega",
  "Entregue",
];

const ETAPAS_BASE = [
  {
    status: "Confirmado",
    titulo: "Pedido confirmado",
    desc: "Recebemos seu pedido com sucesso.",
    hora: "Agora",
  },
  {
    status: "Preparando",
    titulo: "Preparando",
    desc: "Sua pizza está sendo preparada.",
    hora: "Em andamento",
  },
  {
    status: "Saiu para entrega",
    titulo: "Saiu para entrega",
    desc: "O entregador já está a caminho.",
    hora: "Próxima etapa",
  },
  {
    status: "Entregue",
    titulo: "Entregue",
    desc: "Pedido entregue ao cliente.",
    hora: "Previsto",
  },
];

export default function AcompanharPedido() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(PEDIDO_PADRAO);
  const location = useLocation();

  const pedidoCancelado = pedido.status === "Cancelado";

    useEffect(() => {
    const pedidoDaNavegacao = location.state?.pedido;

    if (pedidoDaNavegacao) {
      setPedido({
        ...PEDIDO_PADRAO,
        ...pedidoDaNavegacao,
      });

      localStorage.setItem(
        "pizzly_pedido_atual",
        JSON.stringify(pedidoDaNavegacao)
      );

      return;
    }

    const pedidoAtual = JSON.parse(localStorage.getItem("pizzly_pedido_atual"));

    if (pedidoAtual) {
      setPedido({
        ...PEDIDO_PADRAO,
        ...pedidoAtual,
      });
    }
  }, [location.state]);

  const etapaAtual = useMemo(() => {
    const index = STATUS_ORDEM.indexOf(pedido.status);
    return index === -1 ? 1 : index;
  }, [pedido.status]);

  const etapas = ETAPAS_BASE.map((etapa, index) => ({
    ...etapa,
    concluido: index <= etapaAtual,
  }));

  return (
    <div className="ap-root">
      <Navbar />

      <main className="ap-main">
        <section className="ap-hero">
          <div>
            <span className="ap-tag">Pedido {pedido.id}</span>
            <h1>Acompanhe seu pedido</h1>
            <p>
              Veja o andamento do seu pedido e acompanhe as informações da
              entrega.
            </p>
          </div>

          <div className="ap-time-card">
            <span>Tempo estimado</span>
            <strong>{pedido.tempo}</strong>
          </div>
        </section>

        <section className="ap-grid">
          <div className="ap-card ap-timeline-card">
            <h2>Status da entrega</h2>

            <div className="ap-current-status">
              <span>Status atual</span>
              <strong>{pedido.status}</strong>
            </div>

            {pedidoCancelado ? (
              <div className="ap-cancelado-box">
                <strong>Pedido cancelado</strong>
                <p>
                  Este pedido foi cancelado pela pizzaria. Entre em contato para mais
                  informações.
                </p>
              </div>
            ) : (
              <div className="ap-timeline">
                {etapas.map((etapa, index) => (
                  <div
                    key={etapa.titulo}
                    className={`ap-step ${etapa.concluido ? "done" : ""}`}
                  >
                    <div className="ap-step-marker">
                      {etapa.concluido ? "✓" : index + 1}
                    </div>

                    <div className="ap-step-content">
                      <div className="ap-step-head">
                        <strong>{etapa.titulo}</strong>
                        <span>{etapa.hora}</span>
                      </div>

                      <p>{etapa.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="ap-side">
            <div className="ap-card">
              <h2>Resumo do pedido</h2>

              <div className="ap-order-items">
                {pedido.itens?.map((item, index) => (
                  <div key={index}>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="ap-total">
                <span>Total</span>
                <strong>{pedido.total}</strong>
              </div>
            </div>

            <div className="ap-card">
              <h2>Entrega</h2>

              <div className="ap-info">
                <small>Endereço / Retirada</small>
                <strong>{pedido.entrega || "Rua das Flores, 123 — Centro"}</strong>
              </div>

              <div className="ap-info">
                <small>Entregador</small>
                <strong>Marcos Silva</strong>
              </div>

              <div className="ap-info">
                <small>Pagamento</small>
                <strong>{pedido.pagamento || "Pix"}</strong>
              </div>
            </div>

            <button
              className="ap-help-btn"
              onClick={() => navigate("/meus-pedidos")}
            >
              Voltar para meus pedidos
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}