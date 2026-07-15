import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/css/Login.css";
import { toastServidorOffline } from "../utils/toastUtils";


import logo from "../assets/images/logopizza.png";
import googleLogo from "../assets/images/googleLogo.svg";



export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("pizzly_email_lembrado") || "";
  });

  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailValid =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordValid = password.length >= 8;
  const emailError = emailTouched && !emailValid;
  const passwordError = passwordTouched && !passwordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailTouched(true);
    setPasswordTouched(true);

    if (!emailValid || !passwordValid) {
      return;
    }

    try {
      // envia email e senha para o backend autenticar o usuário
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          senha: password,
        }),
      });

      if (!response.ok) {
        const erro = await response.text();
        toast.error(erro || "E-mail ou senha inválidos.");
        return;
      }

      const usuarioLogado = await response.json();

      toast.success(`Bem-vindo, ${usuarioLogado.nome}!`);

      // salva os dados reais do usuário autenticado
      localStorage.setItem(
        "pizzly_usuario",
        JSON.stringify(usuarioLogado)
      );

      // lembrar de mim 
      if (rememberMe) {
        localStorage.setItem("pizzly_email_lembrado", email);
      } else {
        localStorage.removeItem("pizzly_email_lembrado");
      }

      // avisa outros componentes, como Navbar, que o usuário mudou
      window.dispatchEvent(new Event("pizzlyUsuarioAtualizado"));

      
      // cliente vai para a loja
      if (usuarioLogado.tipo === "CLIENTE") {
        navigate("/");
      }

      // funcionário vai direto para o painel administrativo
      else if (usuarioLogado.tipo === "FUNCIONARIO") {
        navigate("/admin");
      }

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toastServidorOffline();
    }
  };

  // envia o token do Google para o backend autenticar/criar o cliente
  async function loginComGoogle(credential) {
    try {
      const response = await fetch("http://localhost:8080/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        toast.error("Não foi possível entrar com a conta Google.");
        return;
      }

      const usuarioLogado = await response.json();

      // salva o usuário logado no mesmo padrão do login normal
      localStorage.setItem(
        "pizzly_usuario",
        JSON.stringify(usuarioLogado)
      );

      window.dispatchEvent(new Event("pizzlyUsuarioAtualizado"));

      if (usuarioLogado.tipo === "CLIENTE") {
        navigate("/");
      } else if (usuarioLogado.tipo === "FUNCIONARIO") {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toastServidorOffline();
    }
  }

  // carrega e inicializa o botão oficial do Google
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response) => {
        loginComGoogle(response.credential);
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-btn"),
      {
        theme: "outline",
        size: "large",
        width: 230,
        text: "signin_with",
      }
    );
    
  }, []);

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
              Bem-vindo<br />
              de <span className="lp-yellow">volta!</span>
            </h1>
            <p>
              Acesse sua conta para gerenciar pedidos,<br />
              clientes e muito mais.
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
        <div className="lp-pizza-photo" />
      </div>

      {/* ══════════════════════════════════════
          COLUNA DIREITA — branca
      ══════════════════════════════════════ */}
      <div className="lp-right">

        

        {/* ─── Card formulário ─── */}
        <div className="lp-card-wrap">
          <div className="lp-card">

            <h2 className="lp-card-title">
              Entrar na sua <span className="lp-red">conta</span>
            </h2>
            <p className="lp-card-sub">Informe seus dados para continuar</p>

            <form onSubmit={handleSubmit} className="lp-form">

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
                  />
                </div>
                {emailError && (
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
                  />
                 <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
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
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a11.72 11.72 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A10.45 10.45 0 0 1 12 4c5 0 9.27 3.11 11 8a11.5 11.5 0 0 1-2.16 3.19"/>
                        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/>
                        <path d="M1 1l22 22"/>
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
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <span className="lp-field-error">
                    Digite sua senha.
                  </span>
                )}
              </div>

              {/* Lembrar / Esqueceu */}
              <div className="lp-options-row">
                <label className="lp-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="lp-check-box" aria-hidden="true">
                    {rememberMe && (
                      <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <polyline points="2,6 5,9 10,3"/>
                      </svg>
                    )}
                  </span>
                  Lembrar de mim
                </label>
                
                <button
                  type="button"
                  className="lp-forgot"
                  onClick={() => navigate("/recuperar-senha")}
                >
                  Esqueceu sua senha?
                </button>

              </div>

              {/* Botão Entrar */}
              <button type="submit" className="lp-btn-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Entrar
              </button>

            </form>

            
            <div className="lp-divider">
              <span>ou continue com</span>
            </div>

            <div className="lp-social-row">

              {/**botão google */}
              <div className="lp-google-wrapper">
                <button type="button" className="lp-google-custom-btn">
                  <img src={googleLogo} alt="Google" className="lp-google-custom-icon" />
                  <span>Google</span>
                </button>

                <div id="google-login-btn" className="lp-google-real-btn"></div>
              </div>

              <button
                type="button"
                className="lp-login-create-btn"
                onClick={() => navigate("/criar-conta")}
              >
                Criar conta
              </button>
            </div>

          </div>
        </div>

        </div>

      </div>


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
