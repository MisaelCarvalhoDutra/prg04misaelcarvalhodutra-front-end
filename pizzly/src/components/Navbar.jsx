import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../assets/css/NavBar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);

  const [carrinho, setCarrinho] = useState([]);

  const [usuario, setUsuario] = useState(null);

  // controla a abertura do painel de notificações
  const [notificacoesOpen, setNotificacoesOpen] = useState(false);

  // armazena as notificações não lidas do cliente
  const [notificacoes, setNotificacoes] = useState([]);

  //para verificação de perfil incompleto
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [pendenciasPerfil, setPendenciasPerfil] = useState([]);

  // verifica se o usuário logado é funcionário
  const isFuncionario = usuario?.tipo === "FUNCIONARIO";

  const quantidadeCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const totalCarrinho = carrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

const fmt = (valor) =>
  `R$ ${valor.toFixed(2).replace(".", ",")}`;

  function carregarCarrinho() {
    const carrinhoSalvo =
      JSON.parse(localStorage.getItem("pizzly_carrinho")) || [];

    setCarrinho(carrinhoSalvo);
  }

useEffect(() => {
  carregarCarrinho();
  carregarUsuario();

  window.addEventListener("pizzlyCarrinhoAtualizado", carregarCarrinho);
  window.addEventListener("pizzlyUsuarioAtualizado", carregarUsuario);
  window.addEventListener("storage", () => {
    carregarCarrinho();
    carregarUsuario();
  });

  return () => {
    window.removeEventListener("pizzlyCarrinhoAtualizado", carregarCarrinho);
    window.removeEventListener("pizzlyUsuarioAtualizado", carregarUsuario);
  };
}, []);

  function fecharMenu() {
    setMenuOpen(false);
    setCartOpen(false);
    setNotificacoesOpen(false);
  }

  function carregarUsuario() {
    const usuarioSalvo = JSON.parse(localStorage.getItem("pizzly_usuario"));

    setUsuario(usuarioSalvo);
    carregarNotificacoes(usuarioSalvo);
    verificarPerfilCliente(usuarioSalvo);
  }

    /**
   * Busca as notificações não lidas do cliente logado.
   */
  async function carregarNotificacoes(usuarioAtual = usuario) {
    if (!usuarioAtual || usuarioAtual.tipo !== "CLIENTE") {
      setNotificacoes([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/notificacoes/cliente/${usuarioAtual.id}/nao-lidas`
      );

      if (!response.ok) return;

      const dados = await response.json();
      setNotificacoes(dados || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }

  /**
 * Marca uma notificação como lida e atualiza a lista.
 */
async function marcarNotificacaoComoLida(id) {
  try {
    const response = await fetch(
      `http://localhost:8080/notificacoes/${id}/lida`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) return;

    await carregarNotificacoes();
  } catch (error) {
    console.error(
      "Erro ao marcar notificação como lida:",
      error
    );
  }
}

/**
 * Marca todas as notificações como lidas.
 */
async function marcarTodasComoLidas() {
  try {
    const response = await fetch(
      `http://localhost:8080/notificacoes/cliente/${usuario.id}/lidas`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) return;

    setNotificacoes([]);

    // fecha o painel após concluir a ação
    setNotificacoesOpen(false);

  } catch (error) {
    console.error(
      "Erro ao marcar notificações:",
      error
    );
  }
}

async function verificarPerfilCliente(usuarioAtual) {
  if (!usuarioAtual || usuarioAtual.tipo !== "CLIENTE") {
    setPerfilIncompleto(false);
    return;
  }

  const telefoneVazio =
    !usuarioAtual.telefone || usuarioAtual.telefone.trim() === "";

  try {
    const response = await fetch(
      `http://localhost:8080/enderecos/cliente/${usuarioAtual.id}`
    );

    const enderecos = response.ok ? await response.json() : [];
    const semEndereco = enderecos.length === 0;

    const pendencias = [];

    if (telefoneVazio) {
      pendencias.push("telefone");
    }

    if (semEndereco) {
      pendencias.push("endereço");
    }

    setPendenciasPerfil(pendencias);

    setPerfilIncompleto(pendencias.length > 0);
    } catch (error) {
      console.error("Erro ao verificar perfil:", error);
    }
}

  return (
    <>
      <nav className="ho-nav">
        <div className="ho-nav-inner">

          <Link to="/" className="ho-logo" onClick={fecharMenu}>
            <svg width="34" height="34" viewBox="0 0 44 44" fill="none">
              <path d="M22 4 L40 38 H4 Z" fill="#FDD835" />
              <circle cx="18" cy="28" r="3" fill="#c0392b" />
              <circle cx="27" cy="22" r="2.5" fill="#c0392b" />
              <circle cx="30" cy="32" r="2" fill="#c0392b" />
            </svg>

            <span className="ho-logo-text">Pizzly</span>
          </Link>

          <ul className="ho-nav-links">
            {isFuncionario ? (
              <li>
                <Link to="/admin" className="ho-nav-link">
                  Painel
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/" className="ho-nav-link">
                    Home
                  </Link>
                </li>

                <li>
                  <Link to="/pedido" className="ho-nav-link">
                    Cardápio
                  </Link>
                </li>

                <li>
                  <Link to="/promocoes" className="ho-nav-link">
                    Promoções
                  </Link>
                </li>

                <li>
                  <Link to="/meus-pedidos" className="ho-nav-link">
                    Meus Pedidos
                  </Link>
                </li>

                <li>
                  <Link to="/acompanhar-pedido" className="ho-nav-link">
                    Acompanhar Pedido
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="ho-nav-actions">

            {!isFuncionario && (
              <button
                type="button"
                className="ho-cart"
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(true);
                }}
                aria-label="Ir para o carrinho"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>

                {quantidadeCarrinho > 0 && (
                  <span className="ho-cart-badge">
                    {quantidadeCarrinho}
                  </span>
                )}
              </button>
            )}

            {!isFuncionario && usuario?.tipo === "CLIENTE" && perfilIncompleto && (
              <button
                type="button"
                className="ho-profile-warning"
                onClick={() => navigate("/perfil")}
              >
                <span>!</span>
                <div>
                  <strong>Complete seu perfil</strong>
                  <small>
                    {pendenciasPerfil.join(" e ")}{" "}
                    {pendenciasPerfil.length === 1 ? "pendente" : "pendentes"}
                  </small>
                </div>
                <b>→</b>
              </button>
            )}

            {!isFuncionario && usuario?.tipo === "CLIENTE" && (
              <button
                type="button"
                className="ho-notification"
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(false);
                  setNotificacoesOpen(true);
                  carregarNotificacoes();
                }}
                aria-label="Abrir notificações"
              >
                🔔

                {notificacoes.length > 0 && (
                  <span className="ho-notification-badge">
                    {notificacoes.length}
                  </span>
                )}
              </button>
            )}

            <button
                type="button"
                className="ho-btn-login"
                onClick={() => navigate(usuario ? "/perfil" : "/login")}
              >
                {usuario ? "Meu Perfil" : "Entrar"}
            </button>

            <button
              type="button"
              className={`ho-hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="ho-overlay"
          onClick={fecharMenu}
        />
      )}

      {cartOpen && (
        <div
          className="ho-overlay"
          onClick={fecharMenu}
        />
      )}

      {notificacoesOpen && (
        <div
          className="ho-overlay"
          onClick={fecharMenu}
        />
      )}

      {menuOpen && (
        <div className="ho-mobile-menu">

          {isFuncionario ? (
            <Link to="/admin" onClick={fecharMenu}>
              Painel
            </Link>
          ) : (
            <>
              <Link to="/" onClick={fecharMenu}>
                Home
              </Link>

              <Link to="/pedido" onClick={fecharMenu}>
                Cardápio
              </Link>

              <Link to="/promocoes" onClick={fecharMenu}>
                Promoções
              </Link>

              <Link to="/meus-pedidos" onClick={fecharMenu}>
                Meus Pedidos
              </Link>

              <Link to="/acompanhar-pedido" onClick={fecharMenu}>
                Acompanhar Pedido
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              fecharMenu();
              navigate(usuario ? "/perfil" : "/login");
            }}
          >
            {usuario ? "Meu Perfil" : "Entrar"}
          </button>
        </div>
      )}

      {cartOpen && (
        <aside className="ho-cart-panel">
          <div className="ho-cart-panel-header">
            <div>
              <span>Seu carrinho</span>
              <strong>Resumo do pedido</strong>
            </div>

            <button type="button" onClick={fecharMenu}>
              ×
            </button>
          </div>

          {carrinho.length === 0 ? (
            <>
              <div className="ho-cart-panel-empty">
                <span>🛒</span>
                <strong>Carrinho vazio</strong>
                <p>Adicione itens no cardápio para começar seu pedido.</p>
              </div>

              <button
                type="button"
                className="ho-cart-panel-btn"
                onClick={() => {
                  fecharMenu();
                  localStorage.setItem("pizzly_etapa", "2");
                  fecharMenu();
                  navigate("/pedido");
                }}
              >
                Ver cardápio →
              </button>
            </>
          ) : (
            <>
              <ul className="ho-cart-panel-list">
                {carrinho.map((item) => (
                  <li key={item.uid} className="ho-cart-panel-item">
                    <img src={item.img} alt={item.produto.nome} />

                    <div>
                      <strong>
                        {item.quantidade}x {item.produto.nome}
                      </strong>

                      {item.tamanho && <span>{item.tamanho}</span>}

                      <b>
                        {fmt(item.preco * item.quantidade)}
                      </b>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="ho-cart-panel-total">
                <span>Total parcial</span>
                <strong>{fmt(totalCarrinho)}</strong>
              </div>

              <button
                type="button"
                className="ho-cart-panel-btn"
                onClick={() => {
                  localStorage.setItem("pizzly_etapa", "2");
                  window.dispatchEvent(new Event("pizzlyIrParaRevisao"));

                  fecharMenu();
                  navigate("/pedido?etapa=2");
                }}
              >
                Finalizar pedido →
              </button>
            </>
          )}
        </aside>
      )}

      {/* painel lateral com as notificações do cliente */}
      {notificacoesOpen && (
        <aside className="ho-notification-panel">

          <div className="ho-cart-panel-header ho-notification-header">
          <div>
            <span>Central de notificações</span>
            <strong>Suas atualizações</strong>
          </div>

          <button
            type="button"
            onClick={fecharMenu}
          >
            ×
          </button>
        </div>

        {notificacoes.length > 0 && (
          <button
            type="button"
            className="ho-mark-all-btn"
            onClick={marcarTodasComoLidas}
          >
            ✓ Marcar todas como lidas
          </button>
        )}

          {notificacoes.length === 0 ? (
            <div className="ho-cart-panel-empty">
              <span>🔔</span>
              <strong>Nenhuma notificação</strong>

              <p>
                Você não possui notificações novas.
              </p>
            </div>
          ) : (
            <ul className="ho-notification-list">
              {notificacoes.map((notificacao) => (
                <li
                  key={notificacao.id}
                  className="ho-notification-item"
                >
                  <div>
                    <strong>
                      {notificacao.titulo}
                    </strong>

                    <p>
                      {notificacao.mensagem}
                    </p>

                    <small>
                      {new Date(
                        notificacao.dataEnvio
                      ).toLocaleString("pt-BR")}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      marcarNotificacaoComoLida(
                        notificacao.id
                      )
                    }
                  >
                    Marcar como lida
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </>
  );
}