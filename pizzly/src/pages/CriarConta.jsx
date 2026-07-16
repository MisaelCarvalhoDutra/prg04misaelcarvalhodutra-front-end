import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { toastServidorOffline } from "../utils/toastUtils";
import API_URL from "../utils/api";

import "../assets/css/CriarConta.css";

import logo from "../assets/images/logopizza.png";

export default function CriarConta() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // controla a abertura do modal de verificação
const [modalCodigoAberto, setModalCodigoAberto] = useState(false);

// código digitado pelo usuário
const [codigo, setCodigo] = useState("");

// contador para liberar o reenvio do código
const [contador, setContador] = useState(60);

// controla loading ao enviar ou reenviar o código
const [enviandoCodigo, setEnviandoCodigo] = useState(false);

// controla loading ao validar o código
const [validandoCodigo, setValidandoCodigo] = useState(false);
  

  const emailValid =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordValid = password.length >= 8;
  
  let passwordStrength = 0;

  if (password.length >= 8) passwordStrength++;
  if (/[A-Z]/.test(password)) passwordStrength++;
  if (/[0-9]/.test(password)) passwordStrength++;
  if (/[^A-Za-z0-9]/.test(password)) passwordStrength++;

  const strengthLabel =
  passwordStrength <= 1
    ? "Fraca"
    : passwordStrength <= 3
    ? "Média"
    : "Forte";

  const strengthClass =
    passwordStrength <= 1
      ? "weak"
      : passwordStrength <= 3
      ? "medium"
      : "strong";

  const passwordLength = password.length;

  const nameValid = name.trim().length >= 3;
  const nameTouched = name.length > 0;

  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  // cronômetro do botão "Reenviar código"
useEffect(() => {
  if (!modalCodigoAberto || contador <= 0) return;

  const timer = setTimeout(() => {
    setContador((tempoAtual) => tempoAtual - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [modalCodigoAberto, contador]);


const handleSubmit = async (e) => {
  e.preventDefault();

  setEmailTouched(true);
  setPasswordTouched(true);

  if (!nameValid || !emailValid || !passwordValid || !passwordsMatch) {
    return;
  }

  try {
    setEnviandoCodigo(true);

    // primeiro envia o código para o e-mail informado
    const response = await fetch(
      `${API_URL}/verificacao-email/cadastro/enviar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      }
    );

    if (!response.ok) {
      const erro = await response.text();
      toast.error(erro || "Não foi possível enviar o código de verificação.");
      return;
    }

    // abre o modal somente após o código ser enviado
    setCodigo("");
    setContador(60);
    setModalCodigoAberto(true);
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    toastServidorOffline();
  } finally {
    setEnviandoCodigo(false);
  }
};

async function reenviarCodigo() {
  if (contador > 0) return;

  try {
    setEnviandoCodigo(true);

    // solicita um novo código para o mesmo e-mail
    const response = await fetch(
      `${API_URL}/verificacao-email/cadastro/enviar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      }
    );

    if (!response.ok) {
      toast.error("Não foi possível reenviar o código.");
      return;
    }

    setCodigo("");
    setContador(60);
  } catch (error) {
    console.error("Erro ao reenviar código:", error);
    toastServidorOffline();
  } finally {
    setEnviandoCodigo(false);
  }
}

async function validarCodigoECriarConta() {
  if (codigo.trim().length !== 6) {
    toast.warning("Digite o código de 6 dígitos.");
    return;
  }

  try {
    setValidandoCodigo(true);

    // valida o código e só então cria a conta no backend
    const response = await fetch(
      `${API_URL}/verificacao-email/cadastro/validar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          codigo: codigo,
          cliente: {
            nome: name,
            email: email,
            telefone: "",
            senha: password,
            cpf: "",
          },
        }),
      }
    );

    if (!response.ok) {
      const erro = await response.text();
      toast.error(erro || "Código inválido ou expirado.");
      return;
    }

    toast.success("Conta criada com sucesso!");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
    
  } catch (error) {
    console.error("Erro ao validar código:", error);
    toastServidorOffline();
  } finally {
    setValidandoCodigo(false);
  }
}

  return (
    <div className="lp-root">

      <div className="lp-main">


      {/* ══════════════════════════════════════
          COLUNA ESQUERDA — painel vermelho
      ══════════════════════════════════════ */}
      <div className="lp-left">

        {/* padrão de pizzas repetidas no fundo */}
        <div className="lp-pizza-pattern" aria-hidden="true" />

        <div className="lp-left-content">

          <div className="lp-brand">
            {/* Logo */}
            <div className="lp-logo-row">
              <span className="lp-logo-text">Pizzly</span>
              {/* fatia de pizza SVG amarela */}
              <img src={logo} alt="Pizzly Logo" className="lp-logo-icon" />
            </div>
            <p className="lp-tagline">SABOR QUE CONECTA</p>
          </div>

          {/* Bem-vindo */}
          <div className="lp-welcome">
            <h1>
              Crie sua <br /><span className="lp-yellow">conta!</span>
            </h1>
            <p>
             Cadastre-se para pedir suas pizzas favoritas de forma rápida e segura.
            </p>
          </div>

          {/* Box features */}
          <div className="lp-features">
            {/* Pizzas Deliciosas */}
            <div className="lp-feat">
              <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="16" r="12"/>
                <path d="M10 18 Q16 22 22 18"/>
                <circle cx="12" cy="13" r="1.5" fill="white"/>
                <circle cx="20" cy="13" r="1.5" fill="white"/>
                <circle cx="16" cy="20" r="2" fill="#c0392b" stroke="none"/>
                <circle cx="11" cy="18" r="1.5" fill="#c0392b" stroke="none"/>
                <circle cx="21" cy="18" r="1.5" fill="#c0392b" stroke="none"/>
              </svg>
              <span><strong>Pizzas</strong><br/>Deliciosas</span>
            </div>

            <div className="lp-feat-sep" />

            {/* Entrega Rápida */}
            <div className="lp-feat">
              <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20 L4 14 L10 8 L22 8 L22 20"/>
                <path d="M22 12 L28 12 L28 20"/>
                <line x1="4" y1="20" x2="28" y2="20"/>
                <circle cx="9" cy="22" r="2.5"/>
                <circle cx="23" cy="22" r="2.5"/>
                <line x1="16" y1="8" x2="16" y2="20"/>
              </svg>
              <span><strong>Entrega</strong><br/>Rápida</span>
            </div>

            <div className="lp-feat-sep" />

            {/* Qualidade Garantida */}
            <div className="lp-feat">
              <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3 L28 7 V16 C28 23 22 28 16 30 C10 28 4 23 4 16 V7 Z"/>
                <polyline points="11,16 14,19 21,12"/>
              </svg>
              <span><strong>Qualidade</strong><br/>Garantida</span>
            </div>
          </div>
        </div>

        {/* Foto da pizza no rodapé */}
        <div className="cc-pizza-photo" />
      </div>

      {/* ══════════════════════════════════════
          COLUNA DIREITA — branca
      ══════════════════════════════════════ */}
      <div className="lp-right">

        

        {/* ─── Card formulário ─── */}
        <div className="lp-card-wrap">
          <div className="lp-card">

            <h2 className="lp-card-title">
              Criar sua <span className="lp-red">conta</span>
            </h2>
            <p className="lp-card-sub">Informe seus dados para continuar</p>

            <form onSubmit={handleSubmit} className="lp-form">

              {/* Nome */}
              <div className="lp-field">
                <label htmlFor="lp-name">Nome</label>

                <div className={`lp-input-box ${nameTouched ? nameValid ? "valid" : "invalid" : ""}`}>
                  <input
                    id="lp-name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                {nameTouched && !nameValid && (
                  <span className="lp-field-error">
                    Digite seu nome completo.
                  </span>
                )}
              </div>


              {/* E-mail */}
              <div className="lp-field">
                <label htmlFor="lp-email">E-mail</label>
                <div className={`lp-input-box ${email ? emailValid ? "valid" : "invalid" : ""}`}>
                  <svg className="lp-input-ico" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.6" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input
                    id="lp-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                {email && !emailValid && (
                  <span className="lp-field-error">
                    Digite um e-mail válido.
                  </span>
                )}
              </div>

              {/* Senha */}
              <div className="lp-field">
                <label htmlFor="lp-password">Senha</label>
                <div className={`lp-input-box ${password ? passwordValid ? "valid" : "invalid" : ""}`}>
                  <svg className="lp-input-ico" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.6" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="lp-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {/* ícone olho estilo "scan / raios" igual ao mockup */}
                    {showPassword ? (
                      <svg
                        className="lp-eye-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a11.72 11.72 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A10.45 10.45 0 0 1 12 4c5 0 9.27 3.11 11 8a11.5 11.5 0 0 1-2.16 3.19" />
                        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        className="lp-eye-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {password && (
                  <div className="lp-password-strength">
                    <div className="lp-strength-bar">
                      <div className={`lp-strength-fill ${strengthClass}`} />
                    </div>

                    <div className="lp-strength-info">
                      <span className={`lp-strength-text ${strengthClass}`}>
                        {strengthLabel}
                      </span>

                      <span className="lp-strength-counter">
                        Mínimo de 8 caracteres ({Math.min(passwordLength, 8)}/8)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="lp-field">
                <label htmlFor="lp-confirm-password">
                  Confirmar senha
                </label>

                <div className={`lp-input-box ${confirmTouched ? passwordsMatch ? "valid" : "invalid" : ""}`}>
                  <input
                    id="lp-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {confirmTouched && !passwordsMatch && (
                  <span className="lp-field-error">
                    As senhas não conferem.
                  </span>
                )}
              </div>


              {/* Botão Entrar */}
              <button
                type="submit"
                className="lp-btn-submit"
                disabled={enviandoCodigo}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>

                {enviandoCodigo
                    ? "Enviando código..."
                    : "Criar conta"}
              </button>

            </form>

            

            <p className="lp-signup-text">
              Já possui conta?{" "}
              <Link to="/login" className="lp-signup-link">
                Entrar
              </Link>
            </p>

          </div>
        </div>

        </div>

      </div>

      {/* ════════════════════════════════
    MODAL DE VERIFICAÇÃO DO E-MAIL
    ════════════════════════════════ */}
    {modalCodigoAberto && (
      <div className="cc-modal-overlay">

        <div className="cc-modal">

          <button
            type="button"
            className="cc-modal-close"
            onClick={() => setModalCodigoAberto(false)}
          >
            ×
          </button>

          <div className="cc-modal-icon">
            ✉️
          </div>

          <h2>Verifique seu e-mail</h2>

          <p>
            Enviamos um código de verificação para
            <strong> {email}</strong>.
          </p>

          <input
            className="cc-code-input"
            type="text"
            maxLength="6"
            placeholder="000000"
            value={codigo}
            onChange={(e) =>
              setCodigo(e.target.value.replace(/\D/g, ""))
            }
          />

          <button
            type="button"
            className="cc-confirm-btn"
            onClick={validarCodigoECriarConta}
            disabled={validandoCodigo}
          >
            {validandoCodigo
              ? "Validando..."
              : "Confirmar código"}
          </button>

          <button
            type="button"
            className="cc-resend-btn"
            onClick={reenviarCodigo}
            disabled={contador > 0 || enviandoCodigo}
          >
            {contador > 0
              ? `Reenviar em ${contador}s`
              : "Reenviar código"}
          </button>

        </div>

      </div>
    )}


      {/* ─── Rodapé badges ─── */}
        <div className="lp-footer-badges">
          <div className="lp-badge">
            <svg className="lp-badge-ico" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <div>
              <strong>Pagamento seguro</strong>
              <p>Seus dados protegidos</p>
            </div>
          </div>

          <div className="lp-badge">
            {/* ícone folha/ingredientes */}
            <svg className="lp-badge-ico" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22 C6 18 10 14 22 2"/>
              <path d="M22 2 C22 2 14 2 8 8 C4 12 2 18 2 22 C2 22 8 20 14 16 C20 12 22 6 22 2Z"/>
            </svg>
            <div>
              <strong>Ingredientes frescos</strong>
              <p>Sempre selecionados</p>
            </div>
          </div>

          <div className="lp-badge">
            {/* ícone headset */}
            <svg className="lp-badge-ico" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
              <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
            <div>
              <strong>Atendimento Premium</strong>
              <p>Suporte quando precisar</p>
            </div>
          </div>

          <div className="lp-badge">
            {/* ícone cadeado */}
            <svg className="lp-badge-ico" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <strong>Ambiente 100% seguro</strong>
              <p>Compra protegida</p>
            </div>
          </div>
        </div>

        {/* ─── Footer copyright ─── */}
        <footer className="lp-footer">
          <span>© 2026 Pizzly - Todos os direitos reservados.</span>
          <div className="lp-footer-links">
            <a href="#">Termos de Uso</a>
            <a href="#">Política de Privacidade</a>
          </div>
        </footer>

      </div>

    
  );
}
