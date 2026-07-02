import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/css/RecuperarSenha.css";

import logo from "../assets/images/logopizza.png";

export default function RecuperarSenha() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // controla a etapa atual da recuperação
  const [etapa, setEtapa] = useState("email");

  // controla loading dos botões
  const [carregando, setCarregando] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const senhaValida = novaSenha.length >= 8;
  const senhasConferem = novaSenha === confirmarSenha;

  async function enviarCodigo(e) {
    e.preventDefault();

    if (!emailValid) return;

    try {
      setCarregando(true);

      // envia o código para o e-mail cadastrado
      const response = await fetch(
        "http://localhost:8080/verificacao-email/senha/enviar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error(erro || "Não foi possível enviar o código.");
        return;
      }

      setEtapa("codigo");
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  async function redefinirSenha(e) {
    e.preventDefault();

    if (codigo.length !== 6) {
      toast.warning("Digite o código de 6 dígitos.");
      return;
    }

    if (!senhaValida) {
      toast.warning("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (!senhasConferem) {
      toast.warning("As senhas não conferem.");
      return;
    }

    try {
      setCarregando(true);

      // valida o código e redefine a senha no backend
      const response = await fetch(
        "http://localhost:8080/verificacao-email/senha/redefinir",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            codigo,
            novaSenha,
          }),
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error(erro || "Código inválido ou expirado.");
        return;
      }

      toast.success("Senha redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rp-root">
      <div className="rp-main">
        <div className="rp-left">
          <div className="rp-pizza-pattern" />

          <div className="rp-left-content">
            <div className="rp-brand">
              <div className="rp-logo-row">
                <span className="rp-logo-text">Pizzly</span>
                <img src={logo} alt="Pizzly Logo" className="rp-logo-icon" />
              </div>

              <p className="rp-tagline">SABOR QUE CONECTA</p>
            </div>

            <div className="rp-welcome">
              <h1>
                Recupere sua <br />
                <span className="rp-yellow">senha</span>
              </h1>

              <p>
                Sem problemas! Vamos te ajudar a voltar para sua conta com
                segurança.
              </p>
            </div>

            <div className="rp-info-box">
              <span>🔒</span>
              <p>
                O código será enviado apenas para o e-mail cadastrado.
              </p>
            </div>
          </div>

          <div className="rp-pizza-photo" />
        </div>

        <div className="rp-right">
          <div className="rp-card-wrap">
            <div className={`rp-card ${etapa === "codigo" ? "rp-card-reset" : ""}`}>
              <div className="rp-card-icon">
                {etapa === "email" ? "🔐" : "✉️"}
              </div>

              <h2 className="rp-card-title">
                {etapa === "email" ? (
                  <>
                    Recuperar <span>senha</span>
                  </>
                ) : (
                  <>
                    Nova <span>senha</span>
                  </>
                )}
              </h2>

              <p className="rp-card-sub">
                {etapa === "email"
                  ? "Informe seu e-mail cadastrado para receber o código de recuperação."
                  : `Digite o código enviado para ${email} e cadastre sua nova senha.`}
              </p>

              {etapa === "email" ? (
                <form onSubmit={enviarCodigo} className="rp-form">
                  <div className="rp-field">
                    <label htmlFor="rp-email">E-mail</label>

                    <div
                      className={`rp-input-box ${
                        email ? (emailValid ? "valid" : "invalid") : ""
                      }`}
                    >
                      <input
                        id="rp-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {email && !emailValid && (
                      <span className="rp-error">Digite um e-mail válido.</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="rp-btn-submit"
                    disabled={carregando}
                  >
                    {carregando ? "Enviando..." : "Enviar código"}
                  </button>
                </form>
              ) : (
                <form onSubmit={redefinirSenha} className="rp-form">
                  <div className="rp-field">
                    <label>Código recebido</label>

                    <div className="rp-input-box">
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="000000"
                        value={codigo}
                        onChange={(e) =>
                          setCodigo(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  </div>

                  <div className="rp-field">
                    <label>Nova senha</label>

                    <div
                      className={`rp-input-box ${
                        novaSenha
                          ? senhaValida
                            ? "valid"
                            : "invalid"
                          : ""
                      }`}
                    >
                      <input
                        type="password"
                        placeholder="Nova senha"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                      />
                    </div>

                    {novaSenha && !senhaValida && (
                      <span className="rp-error">
                        A senha deve ter no mínimo 8 caracteres.
                      </span>
                    )}
                  </div>

                  <div className="rp-field">
                    <label>Confirmar senha</label>

                    <div
                      className={`rp-input-box ${
                        confirmarSenha
                          ? senhasConferem
                            ? "valid"
                            : "invalid"
                          : ""
                      }`}
                    >
                      <input
                        type="password"
                        placeholder="Confirme sua senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                      />
                    </div>

                    {confirmarSenha && !senhasConferem && (
                      <span className="rp-error">
                        As senhas não conferem.
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="rp-btn-submit"
                    disabled={carregando}
                  >
                    {carregando ? "Redefinindo..." : "Redefinir senha"}
                  </button>

                  <button
                    type="button"
                    className="rp-btn-secondary"
                    onClick={() => setEtapa("email")}
                  >
                    Trocar e-mail
                  </button>
                </form>
              )}

              {etapa === "email" && (
                <Link to="/login" className="rp-back-link">
                  ← Voltar para o login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rp-footer-badges">
        <div className="rp-badge">
          <strong>Pagamento seguro</strong>
          <p>Seus dados protegidos</p>
        </div>

        <div className="rp-badge">
          <strong>Ingredientes frescos</strong>
          <p>Sempre selecionados</p>
        </div>

        <div className="rp-badge">
          <strong>Atendimento Premium</strong>
          <p>Suporte quando precisar</p>
        </div>

        <div className="rp-badge">
          <strong>Ambiente 100% seguro</strong>
          <p>Compra protegida</p>
        </div>
      </div>
    </div>
  );
}