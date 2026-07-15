import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/css/RecuperarSenha.css";

import logo from "../assets/images/logopizza.png";

export default function NovaSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const senhaValida = novaSenha.length >= 8;
  const senhasConferem =
    confirmarSenha.length > 0 &&
    novaSenha === confirmarSenha;

  async function redefinirSenha(e) {
    e.preventDefault();

    if (!token) {
      toast.error("Link de recuperação inválido.");
      return;
    }

    if (!senhaValida) {
      toast.warning(
        "A nova senha deve ter no mínimo 8 caracteres."
      );
      return;
    }

    if (!senhasConferem) {
      toast.warning("As senhas não conferem.");
      return;
    }

    try {
      setCarregando(true);

      const response = await fetch(
        "http://localhost:8080/verificacao-email/senha/redefinir",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            novaSenha,
          }),
        }
      );

      if (!response.ok) {
        const erro = await response.text();

        toast.error(
          erro || "Link inválido ou expirado."
        );

        return;
      }

      toast.success("Senha redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
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
                Crie sua <br />
                <span className="rp-yellow">nova senha</span>
              </h1>

              <p>
                Escolha uma senha segura para voltar a acessar sua conta.
              </p>
            </div>

            <div className="rp-info-box">
              <span>🔒</span>
              <p>
                Sua nova senha deve possuir pelo menos 8 caracteres.
              </p>
            </div>
          </div>

          <div className="rp-pizza-photo" />
        </div>

        <div className="rp-right">
          <div className="rp-card-wrap">
            <div className="rp-card rp-card-reset">
              <div className="rp-card-icon">🔑</div>

              <h2 className="rp-card-title">
                Nova <span>senha</span>
              </h2>

              <p className="rp-card-sub">
                Digite e confirme a nova senha da sua conta.
              </p>

              {!token ? (
                <div className="rp-success-box">
                  <p>
                    Este link de recuperação é inválido ou está incompleto.
                  </p>

                  <Link
                    to="/recuperar-senha"
                    className="rp-back-link"
                  >
                    Solicitar novo link
                  </Link>
                </div>
              ) : (
                <form onSubmit={redefinirSenha} className="rp-form">
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
                        onChange={(e) =>
                          setNovaSenha(e.target.value)
                        }
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
                        placeholder="Confirme sua nova senha"
                        value={confirmarSenha}
                        onChange={(e) =>
                          setConfirmarSenha(e.target.value)
                        }
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
                    {carregando
                      ? "Redefinindo..."
                      : "Redefinir senha"}
                  </button>
                </form>
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