import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "../assets/css/Perfil.css";

const USUARIO_PADRAO = {
  nome: "Misael Dutra",
  email: "misael@email.com",
  telefone: "(74) 99999-9999",
};



const ENDERECO_FORM_INICIAL = {
  tipo: "Casa",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "BA",
  principal: false,
};

function converterEnderecoBackend(endereco) {
  return {
    id: endereco.id,
    tipo:
      endereco.tipo === "CASA"
        ? "Casa"
        : endereco.tipo === "TRABALHO"
        ? "Trabalho"
        : "Outro",
    principal: endereco.principal,
    endereco: endereco.logradouro,
    numero: endereco.numero,
    complemento: endereco.complemento || "",
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    uf: endereco.uf,
    cep: endereco.cep,
  };
}

export default function Perfil() {
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState("dados");

  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState(USUARIO_PADRAO);

  const [modalAberto, setModalAberto] = useState(false);

  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [formEndereco, setFormEndereco] = useState(ENDERECO_FORM_INICIAL);

  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [enderecos, setEnderecos] = useState([]);

  const isCliente = usuario?.tipo === "CLIENTE";
  const isFuncionario = usuario?.tipo === "FUNCIONARIO";

  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem("pizzly_usuario"));

    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
      setForm(usuarioSalvo);

      // carrega os endereços reais do cliente no backend
      if (usuarioSalvo.tipo === "CLIENTE") {
        fetch(`http://localhost:8080/enderecos/cliente/${usuarioSalvo.id}`)
          .then((response) => response.json())
          .then((dados) => {
            const enderecosConvertidos = dados.map(converterEnderecoBackend);
            setEnderecos(enderecosConvertidos);
          })
          .catch((error) => {
            console.error("Erro ao carregar endereços:", error);
          });
      }
    }

    if (usuarioSalvo?.tipo === "CLIENTE") {
      fetch(`http://localhost:8080/pedidos/cliente/${usuarioSalvo.id}`)
        .then((response) => response.json())
        .then((dados) => {
          setTotalPedidos(dados.length);
          setUltimosPedidos(dados.slice(0, 3));
        })
        .catch((error) => {
          console.error("Erro ao carregar pedidos do cliente:", error);
          setTotalPedidos(0);
          setUltimosPedidos([]);
        });
    } else {
      setTotalPedidos(0);
      setUltimosPedidos([]);
    }

  }, []);

  function abrirModal() {
    setForm(usuario);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  async function salvarPerfil(e) {
  e.preventDefault();

  if (!usuario?.id) {
    toast.error("Sessão expirada. Faça login novamente.");
    navigate("/login");
    return;
  }

  const endpoint =
    usuario.tipo === "FUNCIONARIO"
      ? `http://localhost:8080/funcionarios/${usuario.id}`
      : `http://localhost:8080/clientes/${usuario.id}`;

  const dadosAtualizados =
    usuario.tipo === "FUNCIONARIO"
      ? {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
        }
      : {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          cpf: form.cpf || "",
        };

  try {
    // envia os dados atualizados para o endpoint correto
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosAtualizados),
    });

    if (!response.ok) {
      toast.error("Não foi possível atualizar o perfil.");
      return;
    }

    const usuarioAtualizado = await response.json();

    const usuarioCompleto = {
      ...usuario,
      ...usuarioAtualizado,
      tipo: usuario.tipo,
      perfil: usuario.perfil,
    };

    setUsuario(usuarioCompleto);
    setForm(usuarioCompleto);

    localStorage.setItem("pizzly_usuario", JSON.stringify(usuarioCompleto));
    window.dispatchEvent(new Event("pizzlyUsuarioAtualizado"));

    setModalAberto(false);
    toast.success("Perfil atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    toast.error("Não foi possível conectar ao servidor.");
  }
}

  function abrirModalEndereco() {
    setFormEndereco(ENDERECO_FORM_INICIAL);
    setModalEnderecoAberto(true);
  }

  function fecharModalEndereco() {
    setModalEnderecoAberto(false);
  }

  async function salvarEndereco(e) {
    e.preventDefault();

    if (usuario.tipo !== "CLIENTE") {
      toast.warning("Apenas clientes podem cadastrar endereços.");
      return;
    }

    try {
      // envia o novo endereço para o backend
      const response = await fetch("http://localhost:8080/enderecos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo:
            formEndereco.tipo === "Casa"
              ? "CASA"
              : formEndereco.tipo === "Trabalho"
              ? "TRABALHO"
              : "OUTRO",
          cep: formEndereco.cep,
          logradouro: formEndereco.endereco,
          numero: formEndereco.numero,
          complemento: formEndereco.complemento,
          bairro: formEndereco.bairro,
          cidade: formEndereco.cidade,
          uf: formEndereco.uf,
          principal: formEndereco.principal,
          clienteId: usuario.id,
        }),
      });

      if (!response.ok) {
        toast.error("Não foi possível cadastrar o endereço.");
        return;
      }

      const enderecoSalvo = await response.json();
      const enderecoConvertido = converterEnderecoBackend(enderecoSalvo);

      setEnderecos((enderecosAtuais) => [
        ...enderecosAtuais.map((endereco) => ({
          ...endereco,
          principal: enderecoConvertido.principal ? false : endereco.principal,
        })),
        enderecoConvertido,
      ]);

      setModalEnderecoAberto(false);
      setAbaAtiva("enderecos");

      /* avisa o navbar para revalidar o perfil */
      window.dispatchEvent(new Event("pizzlyUsuarioAtualizado"));

      toast.success("Endereço cadastrado com sucesso!");

    } catch (error) {
      console.error("Erro ao cadastrar endereço:", error);
      toast.error("Não foi possível conectar ao servidor.");
    }
  }

  async function excluirEndereco(id) {
    try {
      // remove o endereço no backend
      const response = await fetch(`http://localhost:8080/enderecos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Não foi possível excluir o endereço.");
        return;
      }

      setEnderecos((enderecosAtuais) =>
        enderecosAtuais.filter((endereco) => endereco.id !== id)
      );

      /* avisa o navbar para revalidar o perfil */
      window.dispatchEvent(new Event("pizzlyUsuarioAtualizado"));

      toast.success("Endereço excluído com sucesso!");
      
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      toast.error("Não foi possível conectar ao servidor.");
    }
  }

  async function definirPrincipal(id) {
    try {
      // solicita ao backend para marcar este endereço como principal
      const response = await fetch(
        `http://localhost:8080/enderecos/${id}/principal`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        toast.error("Não foi possível definir o endereço principal.");
        return;
      }

      setEnderecos((enderecosAtuais) =>
        enderecosAtuais.map((endereco) => ({
          ...endereco,
          principal: endereco.id === id,
        }))
      );

      toast.success("Endereço principal atualizado!");
    } catch (error) {
      console.error("Erro ao definir endereço principal:", error);
      toast.error("Não foi possível conectar ao servidor.");
    }
  }

  if (!usuario) {
    return (
      <div className="pf-root">
        <Navbar />

        <main className="pf-main">
          <section className="pf-guest-card">
  <div className="pf-guest-icon-wrap">
    <div className="pf-guest-icon">🍕</div>
  </div>

  <span className="pf-guest-label">Minha conta Pizzly</span>

  <h1>Faça login para continuar</h1>

  <p>
    Entre na sua conta para finalizar pedidos, acompanhar entregas
    e manter seus endereços salvos.
  </p>

  <div className="pf-guest-benefits">
    <div>
      <span>📦</span>
      <p>Acompanhe seus pedidos em tempo real</p>
    </div>

    <div>
      <span>📍</span>
      <p>Use seus endereços salvos na entrega</p>
    </div>

    <div>
      <span>⭐</span>
      <p>Avalie suas experiências com a Pizzly</p>
    </div>
  </div>

  <button onClick={() => navigate("/login")}>
    Entrar na minha conta
  </button>

  <small>
    Novo por aqui?{" "}
    <strong onClick={() => navigate("/criar-conta")}>
      Criar conta grátis
    </strong>
  </small>
</section>
        </main>
      </div>
    );
  }

  return (
    <div className="pf-root">
      <Navbar />

      <main className="pf-main">
        <section className="pf-header">
          <div>
            <span className="pf-tag">Minha conta</span>
            <h1>Meu Perfil</h1>
            <p>Gerencie seus dados, endereços e acompanhe seus pedidos.</p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("pizzly_usuario");
              window.dispatchEvent(new Event("pizzlyUsuarioAtualizado"));
              navigate("/login");
            }}
          >
            Sair da conta
          </button>

        </section>

        <section className="pf-profile-card">
          <div className="pf-avatar">{usuario.nome.charAt(0).toUpperCase()}</div>

          <div className="pf-profile-info">
            <h2>{usuario.nome}</h2>
            <p>{usuario.email}</p>
          </div>

          <button onClick={abrirModal}>Editar perfil</button>
        </section>

        <section className="pf-stats">
          <div className="pf-stat-card">
            <div className="pf-stat-icon pf-blue">👤</div>
            <div>
              <span>Dados pessoais</span>
              <strong>Atualizados</strong>
            </div>
          </div>

          {isCliente && (
            <div className="pf-stat-card">
              <div className="pf-stat-icon pf-green">📍</div>
              <div>
                <span>Endereços salvos</span>
                <strong>{enderecos.length}</strong>
              </div>
            </div>
          )}

          <div className="pf-stat-card">
            <div className="pf-stat-icon pf-purple">📋</div>
            <div>
              <span>Pedidos realizados</span>
              <strong>{totalPedidos}</strong>
            </div>
          </div>
        </section>

        <section className="pf-tabs-card">
          <div className="pf-tabs">
            <button
              className={abaAtiva === "dados" ? "active" : ""}
              onClick={() => setAbaAtiva("dados")}
            >
              Dados pessoais
            </button>

            {isCliente && (
              <button
                className={abaAtiva === "enderecos" ? "active" : ""}
                onClick={() => setAbaAtiva("enderecos")}
              >
                Meus endereços
              </button>
            )}

            {isCliente && (
              <button
                className={abaAtiva === "pedidos" ? "active" : ""}
                onClick={() => setAbaAtiva("pedidos")}
              >
                Meus pedidos
              </button>
            )}

          </div>

          {abaAtiva === "dados" && (
            <div className="pf-tab-content">
              <div className="pf-section-title">
                <div>
                  <h2>Dados pessoais</h2>
                  <p>Informações básicas da sua conta.</p>
                </div>

                <button onClick={abrirModal}>Editar</button>
              </div>

              <div className="pf-data-grid">
                <div className="pf-data-field">
                  <small>Nome completo</small>
                  <strong>{usuario.nome}</strong>
                </div>

                <div className="pf-data-field">
                  <small>E-mail</small>
                  <strong>{usuario.email}</strong>
                </div>

                <div className="pf-data-field">
                  <small>Telefone</small>
                  <strong>{usuario.telefone}</strong>
                </div>

                <div className="pf-data-field">
                  <small>Status da conta</small>
                  <strong>Ativo</strong>
                </div>
              </div>
            </div>
          )}

          {isCliente && abaAtiva === "enderecos" && (
            <div className="pf-tab-content">
              <div className="pf-section-title">
                <div>
                  <h2>Meus endereços</h2>
                  <p>Endereços salvos para entrega dos seus pedidos.</p>
                </div>

                <button onClick={abrirModalEndereco}>+ Novo endereço</button>
              </div>

              <div className="pf-address-list">
                {enderecos.map((endereco) => (
                  <div className="pf-address-item" key={endereco.id}>
                    <div>
                      <div className="pf-address-title">
                        <strong>
                          {endereco.tipo === "Casa"
                            ? "🏠"
                            : endereco.tipo === "Trabalho"
                            ? "🏢"
                            : "📍"}{" "}
                          {endereco.tipo}
                        </strong>

                        {endereco.principal && <span>Principal</span>}
                      </div>

                      <p>
                        {endereco.endereco}, {endereco.numero}
                      </p>

                      {endereco.complemento && <p>{endereco.complemento}</p>}

                      <p>
                        {endereco.bairro} - {endereco.cidade}/{endereco.uf}
                      </p>

                      <p>CEP: {endereco.cep}</p>
                    </div>

                    <div className="pf-address-actions">
                      {!endereco.principal && (
                        <button onClick={() => definirPrincipal(endereco.id)}>
                          Tornar principal
                        </button>
                      )}

                      <button
                        className="delete"
                        onClick={() => excluirEndereco(endereco.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCliente && abaAtiva === "pedidos" && (
            <div className="pf-tab-content">
              <div className="pf-section-title">
                <div>
                  <h2>Meus pedidos</h2>
                  <p>Acompanhe o histórico e o status dos seus pedidos.</p>
                </div>

                <button onClick={() => navigate("/meus-pedidos")}>
                  Ver todos
                </button>
              </div>

              {ultimosPedidos.length === 0 ? (
                <div className="pf-empty-box">
                  <span>🍕</span>
                  <strong>Nenhum pedido realizado ainda.</strong>
                  <p>Faça seu primeiro pedido no cardápio.</p>

                  <button onClick={() => navigate("/pedido")}>
                    Ir para o cardápio
                  </button>
                </div>
              ) : (
                <div className="pf-delivery-orders">
                  {ultimosPedidos.map((pedido) => (
                    <article className="pf-delivery-order-card" key={pedido.id}>
                      <div className="pf-delivery-order-top">
                        <div>
                          <h3>Pedido {pedido.id}</h3>
                          <span>{pedido.data}</span>
                        </div>

                        <strong className="pf-status-badge">
                          {pedido.status}
                        </strong>
                      </div>

                      <div className="pf-delivery-order-items">
                        {pedido.itens?.map((item, index) => (
                          <span key={index}>{item}</span>
                        ))}
                      </div>

                      <div className="pf-delivery-order-bottom">
                        <div>
                          <small>Total</small>
                          <strong>{pedido.total}</strong>
                        </div>

                        <div>
                          <small>Tempo estimado</small>
                          <strong>{pedido.tempo || "30 - 45 min"}</strong>
                        </div>

                        <button
                          onClick={() => {
                            localStorage.setItem(
                              "pizzly_pedido_atual",
                              JSON.stringify(pedido)
                            );

                            navigate(`/acompanhar-pedido?id=${encodeURIComponent(pedido.id)}`);
                          }}
                        >
                          Acompanhar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {modalAberto && (
        <div className="pf-modal-overlay" onClick={fecharModal}>
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-header">
              <div>
                <span>Editar perfil</span>
                <h2>Atualize seus dados</h2>
              </div>

              <button type="button" onClick={fecharModal}>
                ×
              </button>
            </div>

            <form onSubmit={salvarPerfil} className="pf-modal-form">
              <label>
                Nome
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seuemail@email.com"
                  required
                />
              </label>

              <label>
                Telefone
                <input
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                  required
                />
              </label>

              <div className="pf-modal-actions">
                <button
                  type="button"
                  className="pf-cancel-btn"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="pf-save-btn">
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEnderecoAberto && (
        <div className="pf-modal-overlay" onClick={fecharModalEndereco}>
          <div
            className="pf-modal pf-address-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pf-modal-header">
              <div>
                <span>Novo endereço</span>
                <h2>Cadastre um endereço</h2>
              </div>

              <button type="button" onClick={fecharModalEndereco}>
                ×
              </button>
            </div>

            <form onSubmit={salvarEndereco} className="pf-modal-form">
              <label>
                Tipo
                <select
                  value={formEndereco.tipo}
                  onChange={(e) =>
                    setFormEndereco({ ...formEndereco, tipo: e.target.value })
                  }
                  required
                >
                  <option value="Casa">Casa</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>

              <div className="pf-modal-grid">
                <label>
                  CEP
                  <input
                    value={formEndereco.cep}
                    onChange={(e) =>
                      setFormEndereco({ ...formEndereco, cep: e.target.value })
                    }
                    placeholder="44900-000"
                    required
                  />
                </label>

                <label>
                  UF
                  <input
                    value={formEndereco.uf}
                    onChange={(e) =>
                      setFormEndereco({
                        ...formEndereco,
                        uf: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="BA"
                    maxLength="2"
                    required
                  />
                </label>
              </div>

              <label>
                Rua / Avenida
                <input
                  value={formEndereco.endereco}
                  onChange={(e) =>
                    setFormEndereco({
                      ...formEndereco,
                      endereco: e.target.value,
                    })
                  }
                  placeholder="Rua das Flores"
                  required
                />
              </label>

              <div className="pf-modal-grid">
                <label>
                  Número
                  <input
                    value={formEndereco.numero}
                    onChange={(e) =>
                      setFormEndereco({
                        ...formEndereco,
                        numero: e.target.value,
                      })
                    }
                    placeholder="123"
                    required
                  />
                </label>

                <label>
                  Complemento
                  <input
                    value={formEndereco.complemento}
                    onChange={(e) =>
                      setFormEndereco({
                        ...formEndereco,
                        complemento: e.target.value,
                      })
                    }
                    placeholder="Apto, casa, referência..."
                  />
                </label>
              </div>

              <div className="pf-modal-grid">
                <label>
                  Bairro
                  <input
                    value={formEndereco.bairro}
                    onChange={(e) =>
                      setFormEndereco({
                        ...formEndereco,
                        bairro: e.target.value,
                      })
                    }
                    placeholder="Centro"
                    required
                  />
                </label>

                <label>
                  Cidade
                  <input
                    value={formEndereco.cidade}
                    onChange={(e) =>
                      setFormEndereco({
                        ...formEndereco,
                        cidade: e.target.value,
                      })
                    }
                    placeholder="Irecê"
                    required
                  />
                </label>
              </div>

              <label className="pf-check-label">
                <input
                  type="checkbox"
                  checked={formEndereco.principal}
                  onChange={(e) =>
                    setFormEndereco({
                      ...formEndereco,
                      principal: e.target.checked,
                    })
                  }
                />
                Definir como endereço principal
              </label>

              <div className="pf-modal-actions">
                <button
                  type="button"
                  className="pf-cancel-btn"
                  onClick={fecharModalEndereco}
                >
                  Cancelar
                </button>

                <button type="submit" className="pf-save-btn">
                  Salvar endereço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}