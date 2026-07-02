import "../assets/css/MeusPedidos.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const statusClass = {
  Confirmado: "mp-confirmado",
  Preparando: "mp-preparando",
  "Saiu para entrega": "mp-saiu",
  Entregue: "mp-entregue",
  Cancelado: "mp-cancelado",
};

function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function converterStatus(status) {
  if (status === "CONFIRMADO") return "Confirmado";
  if (status === "PREPARANDO") return "Preparando";
  if (status === "SAIU_PARA_ENTREGA") return "Saiu para entrega";
  if (status === "ENTREGUE") return "Entregue";
  if (status === "CANCELADO") return "Cancelado";
  return "Confirmado";
}

export default function MeusPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);

  // controla qual pedido será avaliado
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  // controla os dados preenchidos no modal de avaliação
  const [notaAvaliacao, setNotaAvaliacao] = useState(5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");

useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem("pizzly_usuario"));

    if (!usuarioLogado?.id || usuarioLogado.tipo !== "CLIENTE") {
      navigate("/login");
      return;
    }

    async function carregarPedidos() {
      try {
        // busca os pedidos reais do cliente logado
        const pedidosResponse = await fetch(
          `http://localhost:8080/pedidos/cliente/${usuarioLogado.id}`
        );

        if (!pedidosResponse.ok) {
          alert("Erro ao carregar pedidos.");
          return;
        }

        const pedidosBackend = await pedidosResponse.json();

        // para cada pedido, busca também os itens vinculados
        const pedidosComItens = await Promise.all(
          pedidosBackend.map(async (pedido) => {
            const itensResponse = await fetch(
              `http://localhost:8080/itens-pedido/pedido/${pedido.id}`
            );

            const itensBackend = itensResponse.ok
              ? await itensResponse.json()
              : [];

              // verifica se o pedido já possui avaliação cadastrada
              const avaliacaoResponse = await fetch(
                `http://localhost:8080/avaliacoes/pedido/${pedido.id}`
              );

              const jaAvaliado = avaliacaoResponse.ok;

            return {
              id: pedido.id,
              data: formatarData(pedido.dataPedido),
              status: converterStatus(pedido.status),

              // indica se o pedido já foi avaliado
              jaAvaliado,
              
              itens: itensBackend.map(
                (item) => `${item.quantidade}x ${item.produtoNome}`
              ),
              total: formatarMoeda(pedido.total),
              tempo:
                pedido.formaRecebimento === "retirada"
                  ? "25 min"
                  : "30 - 45 min",
              entrega:
                pedido.formaRecebimento === "retirada"
                  ? "Retirada na Pizzly"
                  : "Entrega",
              formaRecebimento: pedido.formaRecebimento,
            };
          })
        );

        setPedidos(pedidosComItens);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        alert("Erro ao conectar com o servidor.");
      }
    }

    carregarPedidos();
  }, [navigate]);

  /**
 * Envia a avaliação do pedido para o backend.
 */
async function enviarAvaliacao() {
  if (!pedidoSelecionado) return;

  const usuarioLogado = JSON.parse(localStorage.getItem("pizzly_usuario"));

  if (!usuarioLogado?.id) {
    alert("Faça login para avaliar o pedido.");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/avaliacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nota: notaAvaliacao,
        comentario: comentarioAvaliacao,
        clienteId: usuarioLogado.id,
        pedidoId: pedidoSelecionado.id,
      }),
    });

    if (!response.ok) {
      const erro = await response.text();
      alert("Erro ao enviar avaliação: " + erro);
      return;
    }

    alert("Avaliação enviada com sucesso!");

    setPedidos((pedidosAtuais) =>
      pedidosAtuais.map((pedido) =>
        pedido.id === pedidoSelecionado.id
          ? { ...pedido, jaAvaliado: true }
          : pedido
      )
    );

    setPedidoSelecionado(null);
    setComentarioAvaliacao("");
    setNotaAvaliacao(5);
  } catch (error) {
    console.error("Erro ao enviar avaliação:", error);
    alert("Erro ao conectar com o servidor.");
  }
}

  return (
    <div className="mp-root">
      <Navbar />

      <main className="mp-main">
        <section className="mp-header">
          <div>
            <span className="mp-tag">Histórico</span>
            <h1>Meus pedidos</h1>
            <p>Acompanhe seus pedidos recentes e veja o status de cada entrega.</p>
          </div>

          <button className="mp-new-order" onClick={() => navigate("/pedido")}>
            Fazer novo pedido
          </button>
        </section>

        <section className="mp-list">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="mp-card">
              <div className="mp-card-top">
                <div>
                  <h2>Pedido {pedido.id}</h2>
                  <p>Realizado em {pedido.data}</p>
                </div>

                <span className={`mp-status ${statusClass[pedido.status]}`}>
                  {pedido.status}
                </span>
              </div>

              <div className="mp-items">
                {pedido.itens.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>

              <div className="mp-card-bottom">
                <div>
                  <small>Tempo estimado</small>
                  <strong>{pedido.tempo}</strong>
                </div>

                <div>
                  <small>Total</small>
                  <strong className="mp-total">{pedido.total}</strong>
                </div>

                <div className="mp-actions">

                <button
                  className="mp-details-btn"
                  onClick={() => {
                    localStorage.setItem(
                      "pizzly_pedido_atual",
                      JSON.stringify(pedido)
                    );

                    navigate("/acompanhar-pedido", {
                      state: { pedido }
                    });
                  }}
                >
                  Ver detalhes
                </button>

                {/* avaliação disponível apenas para pedidos entregues */}
                {pedido.status === "Entregue" && (
                  pedido.jaAvaliado ? (
                    <span className="mp-reviewed-badge">
                      ✓ Avaliado
                    </span>
                  ) : (
                    <button
                      className="mp-avaliar-btn"
                    onClick={() => {
                      setPedidoSelecionado(pedido);
                      setNotaAvaliacao(5);
                      setComentarioAvaliacao("");
                    }}
                  >
                    <span>⭐</span>
                    Avaliar pedido
                  </button>
                  )
                )}

              </div>
              </div>
            </div>
          ))}

          {pedidoSelecionado && (
          <div className="mp-modal-overlay">
            <div className="mp-modal">
              <button
                className="mp-modal-close"
                onClick={() => setPedidoSelecionado(null)}
              >
                ×
              </button>

              <span className="mp-modal-tag">Avaliação</span>
              <h2>Como foi seu pedido?</h2>
              <p>Conte como foi sua experiência com o pedido {pedidoSelecionado.id}.</p>

              <div className="mp-stars">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    type="button"
                    className={estrela <= notaAvaliacao ? "active" : ""}
                    onClick={() => setNotaAvaliacao(estrela)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={comentarioAvaliacao}
                onChange={(e) => setComentarioAvaliacao(e.target.value)}
                placeholder="Escreva um comentário opcional..."
              />

              <button className="mp-submit-review" onClick={enviarAvaliacao}>
                Enviar avaliação
              </button>
            </div>
          </div>
        )}
        </section>
      </main>
    </div>
  );
}