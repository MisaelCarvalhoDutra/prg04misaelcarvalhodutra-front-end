import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import API_URL from "../utils/api";
import { toastServidorOffline } from "../utils/toastUtils";

import logo from "../assets/images/logopizza.png";

import "../assets/css/RecuperarSenha.css";

export default function RecuperarSenha() {
  const navigate = useNavigate();

  // Dados e estados do formulário
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function enviarToken() {
    if (!emailValido) {
      toast.warning("Digite um e-mail válido.");
      return;
    }

    try {
      setCarregando(true);

      const response = await fetch(
        `${API_URL}/verificacao-email/senha/enviar`,
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

        toast.error(
          erro || "Não foi possível enviar o token de recuperação."
        );

        return;
      }

      setLinkEnviado(true);

      toast.success("Token de recuperação enviado!");
    } catch (error) {
      console.error("Erro ao enviar token de recuperação:", error);
      toastServidorOffline();
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await enviarToken();
  }

  return (
    <div className="rp-root">
      <main className="rp-main">
        <section
          className="rp-left"
          aria-label="Informações sobre recuperação de senha"
        >
          <div className="rp-pizza-pattern" aria-hidden="true" />

          <div className="rp-left-content">
            <div className="rp-brand">
              <div className="rp-logo-row">
                <span className="rp-logo-text">Pizzly</span>

                <img
                  src={logo}
                  alt="Logo da Pizzly"
                  className="rp-logo-icon"
                />
              </div>

              <p className="rp-tagline">SABOR QUE CONECTA</p>
            </div>

            <div className="rp-welcome">
              <h1>
                Recupere sua <br />
                <span className="rp-yellow">senha</span>
              </h1>

              <p>
                Sem problemas! Vamos ajudar você a voltar para sua conta com
                segurança.
              </p>
            </div>

            <div className="rp-info-box">
              <span aria-hidden="true">🔒</span>

              <p>
                O token será enviado apenas para o e-mail cadastrado e expirará
                em 15 minutos.
              </p>
            </div>
          </div>

          <div className="rp-pizza-photo" aria-hidden="true" />
        </section>

        <section
          className="rp-right"
          aria-labelledby="recuperar-senha-titulo"
        >
          <div className="rp-card-wrap">
            <div className="rp-card">
              <div
                className={`rp-card-icon ${
                  linkEnviado ? "success" : ""
                }`}
                aria-hidden="true"
              >
                {linkEnviado ? "✓" : "🔐"}
              </div>

              <h2
                id="recuperar-senha-titulo"
                className="rp-card-title"
              >
                {linkEnviado ? (
                  <>
                    Verifique seu <span>e-mail</span>
                  </>
                ) : (
                  <>
                    Recuperar <span>senha</span>
                  </>
                )}
              </h2>

              <p className="rp-card-sub">
                {linkEnviado
                  ? "Abra sua caixa de entrada e copie o token de recuperação."
                  : "Informe o e-mail cadastrado para receber o token de recuperação."}
              </p>

              {!linkEnviado ? (
                <form
                  onSubmit={handleSubmit}
                  className="rp-form"
                  noValidate
                >
                  <div className="rp-field">
                    <label htmlFor="rp-email">E-mail</label>

                    <div
                      className={`rp-input-box ${
                        email
                          ? emailValido
                            ? "valid"
                            : "invalid"
                          : ""
                      }`}
                    >
                      <input
                        id="rp-email"
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        aria-invalid={email ? !emailValido : undefined}
                        aria-describedby={
                          email && !emailValido
                            ? "rp-email-error"
                            : undefined
                        }
                        required
                      />
                    </div>

                    {email && !emailValido && (
                      <span
                        id="rp-email-error"
                        className="rp-error"
                        role="alert"
                      >
                        Digite um e-mail válido.
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="rp-btn-submit"
                    disabled={carregando}
                  >
                    {carregando
                      ? "Enviando..."
                      : "Enviar token de recuperação"}
                  </button>
                </form>
              ) : (
                <div
                  className="rp-success-box"
                  role="status"
                  aria-live="polite"
                >
                  <p>
                    Abra sua caixa de entrada, copie o token recebido e use-o
                    para criar uma nova senha.
                  </p>

                  <button
                    type="button"
                    className="rp-btn-submit"
                    onClick={() => navigate("/nova-senha")}
                  >
                    Informar token
                  </button>

                  <button
                    type="button"
                    className="rp-btn-secondary"
                    onClick={enviarToken}
                    disabled={carregando}
                  >
                    {carregando ? "Enviando..." : "Reenviar token"}
                  </button>

                  <button
                    type="button"
                    className="rp-btn-secondary"
                    onClick={() => setLinkEnviado(false)}
                    disabled={carregando}
                  >
                    Trocar e-mail
                  </button>
                </div>
              )}

              <Link to="/login" className="rp-back-link">
                ← Voltar para o login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="rp-footer-badges">
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
      </footer>
    </div>
  );
}