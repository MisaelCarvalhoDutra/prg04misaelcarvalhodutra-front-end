import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../assets/css/NavBar.css";
import API_URL from "../utils/api";

// componente responsável pela barra de navegação da aplicação,
// incluindo menu, carrinho, notificações e acesso ao perfil
export default function Navbar() {
  const navigate = useNavigate();
  
  // controle visual dos painéis
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notificacoesOpen, setNotificacoesOpen] = useState(false);

  // dados do sistema
  const [usuario, setUsuario] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);

  // aviso de perfil incompleto
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [pendenciasPerfil, setPendenciasPerfil] = useState([]);

  // verifica se o usuário logado é funcionário
  const isFuncionario = usuario?.tipo === "FUNCIONARIO";

  // calcula a quantidade total de itens do carrinho
  const quantidadeCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  // calcula o valor total do carrinho
  const totalCarrinho = carrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

  // formata valores monetários no padrão brasileiro
  const fmt = (valor) =>
    `R$ ${valor.toFixed(2).replace(".", ",")}`;

  // recupera os itens salvos no localStorage
  function carregarCarrinho() {
    const carrinhoSalvo =
      JSON.parse(localStorage.getItem("pizzly_carrinho")) || [];

    setCarrinho(carrinhoSalvo);
  }

  // sincroniza Navbar com alterações no carrinho e no usuário logado
  //para atualizar automaticamente quando outro componente alterar o carrinho.
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

  // fecha todos os painéis laterais da Navbar: menu, carrinho e notificações
  function fecharMenu() {
    setMenuOpen(false);
    setCartOpen(false);
    setNotificacoesOpen(false);
  }

  // recupera o usuário autenticado e atualiza as informações relacionadas
  function carregarUsuario() {
    const usuarioSalvo = JSON.parse(localStorage.getItem("pizzly_usuario"));

    setUsuario(usuarioSalvo);
    carregarNotificacoes(usuarioSalvo);
    verificarPerfilCliente(usuarioSalvo);
  }

  // consulta o backend para buscar as notificações não lidas do cliente logado
  // endpoint consumido: GET /notificacoes/cliente/{id}/nao-lidas
  async function carregarNotificacoes(usuarioAtual = usuario) {
    if (!usuarioAtual || usuarioAtual.tipo !== "CLIENTE") {
      setNotificacoes([]);
      return;
    }

    // requisição para a API retornar apenas as notificações ainda não lidas
    try {
      const response = await fetch(
        `${API_URL}/notificacoes/cliente/${usuarioAtual.id}/nao-lidas`
      );

      if (!response.ok) return;

      const dados = await response.json();
      setNotificacoes(dados || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }

  // envia uma requisição ao backend para marcar uma notificação como lida
  // endpoint consumido: PATCH /notificacoes/{id}/lida
  async function marcarNotificacaoComoLida(id) {
    try {
      const response = await fetch(
          `${API_URL}/notificacoes/${id}/lida`,
      {
          method: "PATCH", //pra atualizar, ou seja, mudar para "lida"
        }
      );

      if (!response.ok) return;

      // recarrega a lista para remover da tela a notificação marcada como lida
      await carregarNotificacoes();
    } catch (error) {
      console.error(
        "Erro ao marcar notificação como lida:",
        error
      );
    }
  }

  // envia uma requisição ao backend para marcar todas as notificações do cliente como lidas
  // endpoint consumido: PATCH /notificacoes/cliente/{id}/lidas
  async function marcarTodasComoLidas() {
    try {
      const response = await fetch(
          `${API_URL}/notificacoes/cliente/${usuario.id}/lidas`,
      {
          method: "PATCH", //pra atualizar e mudar todas para lidas
        }
      );

      if (!response.ok) return;

      // limpa a lista local porque todas foram marcadas como lidas no backend
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


  // verifica se o cliente possui telefone e endereço cadastrados.
  // O telefone vem do usuário salvo no localStorage e os endereços vêm do backend
  // endpoint consumido: GET /enderecos/cliente/{id}
  async function verificarPerfilCliente(usuarioAtual) {
    if (!usuarioAtual || usuarioAtual.tipo !== "CLIENTE") {
      setPerfilIncompleto(false);
      return;
    }

    const telefoneVazio =
      !usuarioAtual.telefone || usuarioAtual.telefone.trim() === "";

    try {
      // consulta o backend para saber se o cliente possui endereço cadastrado
      const response = await fetch(
        `${API_URL}/enderecos/cliente/${usuarioAtual.id}`
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

      // salva as pendências encontradas para exibir o alerta "Complete seu perfil"
      setPendenciasPerfil(pendencias);

      setPerfilIncompleto(pendencias.length > 0);
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
      }
  }

  return (
    <>
    {/* barra principal de navegação do sistema */}
      <nav className="ho-nav">
        <div className="ho-nav-inner">

          {/* logo que redireciona para a página inicial */}
          <Link
            to={isFuncionario ? "/admin" : "/"}
            className="ho-logo"
            onClick={fecharMenu}
          >
            <svg width="34" height="34" viewBox="0 0 44 44" fill="none">
              <path d="M22 4 L40 38 H4 Z" fill="#FDD835" />
              <circle cx="18" cy="28" r="3" fill="#c0392b" />
              <circle cx="27" cy="22" r="2.5" fill="#c0392b" />
              <circle cx="30" cy="32" r="2" fill="#c0392b" />
            </svg>

            <span className="ho-logo-text">Pizzly</span>
          </Link>

          {/* links exibidos conforme o tipo do usuário logado */}
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

          {/* ações da navbar: carrinho, alerta de perfil, notificações, perfil/login e menu mobile */}
          <div className="ho-nav-actions">

            {/* carrinho disponível apenas para clientes e visitantes */}
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

            {/* alerta exibido quando o cliente está sem telefone ou endereço cadastrado */}
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

            {/* botão de notificações exibido apenas para clientes logados */}
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
                <span className="ho-notification-bell">🔔</span>

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

      {/* camada escura usada para fechar menus e painéis laterais ao clicar fora */}
      {menuOpen && (
        <div
          className="ho-overlay"
          onClick={fecharMenu}
        />
      )}

      {/* painel lateral do carrinho com resumo dos itens adicionados */}
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

              {/* leva o usuário para o cardápio caso o carrinho esteja vazio */}
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
                {/* lista os itens salvos no carrinho */}
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

              {/* direciona o usuário para a etapa de revisão/finalização do pedido */}
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

      {/* painel lateral com as notificações não lidas do cliente */}
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

        {/* marca todas as notificações como lidas no backend */}
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
              {/* lista as notificações retornadas pelo backend */}
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

                  {/* marca individualmente a notificação como lida */}
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