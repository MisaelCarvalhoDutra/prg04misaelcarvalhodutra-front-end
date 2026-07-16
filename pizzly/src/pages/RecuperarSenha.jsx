import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/css/RecuperarSenha.css";
import { toastServidorOffline } from "../utils/toastUtils";
import API_URL from "../utils/api";

import logo from "../assets/images/logopizza.png";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [linkEnviado, setLinkEnviado] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function enviarLink(e) {
    e.preventDefault();

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
          erro || "Não foi possível enviar o link de recuperação."
        );

        return;
      }

      setLinkEnviado(true);

      toast.success("Link de recuperação enviado!");
    } catch (error) {
      console.error("Erro ao enviar link:", error);
      toastServidorOffline();
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
                O link será enviado apenas para o e-mail cadastrado e expirará
                em 15 minutos.
              </p>
            </div>
          </div>

          <div className="rp-pizza-photo" />
        </div>

        <div className="rp-right">
          <div className="rp-card-wrap">
            <div className="rp-card">
              <div
                className={`rp-card-icon ${
                  linkEnviado ? "success" : ""
                }`}
              >
                {linkEnviado ? "✓" : "🔐"}
              </div>

              <h2 className="rp-card-title">
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
                  ? `Enviamos um link de recuperação para ${email}.`
                  : "Informe seu e-mail cadastrado para receber o link de recuperação."}
              </p>

              {!linkEnviado ? (
                <form onSubmit={enviarLink} className="rp-form">
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
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {email && !emailValido && (
                      <span className="rp-error">
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
                      : "Enviar link de recuperação"}
                  </button>
                </form>
              ) : (
                <div className="rp-success-box">
                  <p>
                    Abra sua caixa de entrada e clique no link enviado para
                    criar uma nova senha.
                  </p>

                  <button
                    type="button"
                    className="rp-btn-secondary"
                    onClick={enviarLink}
                    disabled={carregando}
                  >
                    {carregando ? "Enviando..." : "Reenviar link"}
                  </button>

                  <button
                    type="button"
                    className="rp-btn-secondary"
                    onClick={() => setLinkEnviado(false)}
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