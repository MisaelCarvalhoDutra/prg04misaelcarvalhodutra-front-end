import "../assets/css/AcompanharPedido.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API_URL from "../utils/api";

// dados padrão utilizados caso não exista pedido vindo da navegação ou do localStorage
const PEDIDO_PADRAO = {
  id: "#1025",
  data: "03/06/2026",
  status: "Preparando",
  itens: ["1x Pizza Calabresa", "1x Coca-Cola 2L"],
  total: "R$ 68,80",
  tempo: "",
  entrega: "Rua das Flores, 123 — Centro",
  pagamento: "Pix",
};

const STATUS_ORDEM_ENTREGA = [
  "Confirmado",
  "Preparando",
  "Saiu para entrega",
  "Entregue",
];

const STATUS_ORDEM_RETIRADA = [
  "Confirmado",
  "Preparando",
  "Pronto para retirada",
  "Retirado",
];

const ETAPAS_ENTREGA = [
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
    hora: "Concluído",
  },
];

const ETAPAS_RETIRADA = [
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
    status: "Pronto para retirada",
    titulo: "Pronto para retirada",
    desc: "Seu pedido já pode ser retirado no balcão.",
    hora: "Aguardando cliente",
  },
  {
    status: "Retirado",
    titulo: "Retirado",
    desc: "Pedido retirado com sucesso.",
    hora: "Concluído",
  },
];

/*Funções auxiiares: */
function converterStatus(status) {
  if (status === "CONFIRMADO") return "Confirmado";
  if (status === "PREPARANDO") return "Preparando";
  if (status === "SAIU_PARA_ENTREGA") return "Saiu para entrega";
  if (status === "PRONTO_PARA_RETIRADA") return "Pronto para retirada";
  if (status === "ENTREGUE") return "Entregue";
  if (status === "RETIRADO") return "Retirado";
  if (status === "CANCELADO") return "Cancelado";

  return "Confirmado";
}


 function obterUsuarioLogado() {
  try {
    return JSON.parse(
      localStorage.getItem("pizzly_usuario")
    );
  } catch (error) {
    console.error(
      "Erro ao recuperar usuário logado:",
      error
    );

    return null;
  }
}

// página responsável por exibir o acompanhamento do pedido do cliente
export default function AcompanharPedido() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [tempoEntrega, setTempoEntrega] = useState("25 - 30 min");
  const location = useLocation();

  // identifica se o pedido foi cancelado para exibir uma mensagem específica
  const pedidoCancelado =
  pedido?.status === "Cancelado";

const ehRetirada =
  pedido?.formaRecebimento === "retirada";

  const statusOrdem = ehRetirada
    ? STATUS_ORDEM_RETIRADA
    : STATUS_ORDEM_ENTREGA;

  const etapasBase = ehRetirada
    ? ETAPAS_RETIRADA
    : ETAPAS_ENTREGA;

  useEffect(() => {
    async function carregarConfiguracoes() {
      try {
        const response = await fetch(`${API_URL}/configuracoes`);

        if (!response.ok) {
          console.error(
            "Não foi possível carregar as configurações:",
            response.status
          );
          return;
        }

        const dados = await response.json();

        setTempoEntrega(dados.tempoEntrega || "");
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }

    carregarConfiguracoes();
  }, []);

  useEffect(() => {
  const usuarioLogado = obterUsuarioLogado();

  if (!usuarioLogado?.id) {
    setPedido(null);
    return;
  }

  const chavePedido =
    `pizzly_pedido_atual_${usuarioLogado.id}`;

  const pedidoDaNavegacao =
    location.state?.pedido;

  let pedidoSalvo = null;

  try {
    pedidoSalvo = JSON.parse(
      localStorage.getItem(chavePedido)
    );
  } catch (error) {
    console.error(
      "Erro ao recuperar pedido salvo:",
      error
    );

    localStorage.removeItem(chavePedido);
  }

  const pedidoInicial =
    pedidoDaNavegacao || pedidoSalvo;

  if (!pedidoInicial?.id) {
    setPedido(null);
    return;
  }

  setPedido({
    ...PEDIDO_PADRAO,
    ...pedidoInicial,
  });



    async function carregarPedidoAtualizado() {
      try {
        const response = await fetch(
          `${API_URL}/pedidos/${pedidoInicial.id}`
        );

        if (!response.ok) {
          console.error(
            "Não foi possível carregar o pedido atualizado:",
            response.status
          );
          return;
        }

        const pedidoBackend = await response.json();

        const pedidoAtualizado = {
          ...PEDIDO_PADRAO,
          ...pedidoInicial,

          id: pedidoBackend.id,
          status: converterStatus(pedidoBackend.status),
          formaRecebimento: pedidoBackend.formaRecebimento,

          total: `R$ ${Number(pedidoBackend.total || 0)
            .toFixed(2)
            .replace(".", ",")}`,

          tempo:
            pedidoBackend.status === "ENTREGUE"
              ? "Entregue"
              : pedidoBackend.status === "RETIRADO"
                ? "Retirado"
                : pedidoBackend.status === "PRONTO_PARA_RETIRADA"
                  ? "Pronto para retirada"
                  : pedidoBackend.formaRecebimento === "retirada"
                    ? "25 min"
                    : tempoEntrega,

          entrega:
            pedidoBackend.formaRecebimento === "retirada"
              ? "Retirada na Pizzly"
              : pedidoInicial.entrega || "Entrega",
        };

        setPedido(pedidoAtualizado);

        localStorage.setItem(
  chavePedido,
  JSON.stringify(pedidoAtualizado)
);
      } catch (error) {
        console.error("Erro ao atualizar o pedido:", error);
      }
    }

    // Atualiza os dados imediatamente ao abrir a página
    carregarPedidoAtualizado();

    function atualizarAoVoltarParaPagina() {
      carregarPedidoAtualizado();
    }

    window.addEventListener("focus", atualizarAoVoltarParaPagina);

    // revalida o status do pedido periodicamente
    const intervalo = setInterval(() => {
      carregarPedidoAtualizado();
    }, 10000);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", atualizarAoVoltarParaPagina);
    };
  }, [location.state, tempoEntrega]);

  //CÁLCULO DA LINHA DO TEMPO

  // calcula qual etapa da linha do tempo deve aparecer como concluída
  const etapaAtual = useMemo(() => {
  const index = statusOrdem.indexOf(
    pedido?.status
  );

  return index === -1 ? 0 : index;
}, [pedido?.status, statusOrdem]);

  // marca cada etapa como concluída ou pendente com base no status atual do pedido
  const etapas = etapasBase.map((etapa, index) => ({
    ...etapa,
    concluido: index <= etapaAtual,
  }));

  if (!pedido) {
  return (
    <div className="ap-root">
      <Navbar />

      <main className="ap-main">
        <section className="ap-card ap-empty">
          <h1>Nenhum pedido em andamento</h1>

          <p>
            Você ainda não possui nenhum pedido
            para acompanhar.
          </p>

          <button
            type="button"
            className="ap-help-btn"
            onClick={() => navigate("/pedido")}
          >
            Fazer um pedido
          </button>
        </section>
      </main>
    </div>
  );
}

  //renderização
  return (
    <div className="ap-root">
      {/* navbar principal da aplicação */}
      <Navbar />

      <main className="ap-main">
        {/* cabeçalho da página com número do pedido e tempo estimado */}
        <section className="ap-hero">
          <div>
            <span className="ap-tag">Pedido {pedido.id}</span>
            <h1>Acompanhe seu pedido</h1>
            <p>
              {ehRetirada
                ? "Veja o andamento do seu pedido até a retirada no balcão."
                : "Veja o andamento do seu pedido e acompanhe as informações da entrega."}
            </p>
          </div>

          {/* Tempo estimado do pedido */}
          <div className="ap-time-card">
            <span>Tempo estimado</span>
            <strong>{pedido.tempo || "Carregando..."}</strong>
          </div>
        </section>

        <section className="ap-grid">
          {/* Status atual e linha do tempo */}
          <div className="ap-card ap-timeline-card">
            <h2>
              {ehRetirada ? "Status da retirada" : "Status da entrega"}
            </h2>

            <div className="ap-current-status">
              <span>Status atual</span>
              <strong>{pedido.status}</strong>
            </div>

            {/* se o pedido estiver cancelado, exibe uma mensagem em vez da linha do tempo */}
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
                {/* renderiza as etapas do acompanhamento do pedido */}
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

          {/* painel lateral com resumo, entrega e pagamento */}
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
              <h2>{ehRetirada ? "Retirada" : "Entrega"}</h2>

              <div className="ap-info">
                <small>Endereço / Retirada</small>
                <strong>{pedido.entrega}</strong>
              </div>

              {!ehRetirada && (
                <div className="ap-info">
                  <small>Entregador</small>
                  <strong>Marcos Silva</strong>
                </div>
              )}

              <div className="ap-info">
                <small>Pagamento</small>
                <strong>{pedido.pagamento}</strong>
              </div>
            </div>

            <button
              type="button"
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