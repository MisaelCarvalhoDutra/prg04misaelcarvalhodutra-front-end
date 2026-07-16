import "../assets/css/Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API_URL from "../utils/api";

import pizzaHero from "../assets/images/pizzaHero.png";
import pizzaCalabresa from "../assets/images/pizzaCalabresa.jpg";
import pizzaFrango from "../assets/images/pizzaFrango.jpg"
import pizzaPortuguesa from "../assets/images/pizzaPortuguesa.jpg"
import pizzaMarguerita from "../assets/images/pizzaMarguerita.png"
import comboFamilia from "../assets/images/comboFamilia.png";
import cocaCola2l from "../assets/images/cocaCola.png";
import guarana2l from "../assets/images/guarana.png";
import pudim from "../assets/images/pudim.png";
import pizzaChocolate from "../assets/images/pizzaChocolate.jpg";

const PRECO_INICIAL_PIZZA = "R$ 29,90";

const PIZZAS = [
  {
    img: pizzaCalabresa,
    name: "Calabresa",
    desc: "Calabresa fatiada, mussarela, cebola e orégano",
  },

  {
    img: pizzaFrango,
    name: "Frango com Catupiry",
    desc: "Frango desfiado, catupiry, mussarela e orégano",
  },

  {
    img: pizzaPortuguesa,
    name: "Portuguesa",
    desc: "Presunto, ovos, cebola, pimentão, azeitona e mussarela",
  },

  {
    img: pizzaMarguerita,
    name: "Marguerita",
    desc: "Mussarela de búfala, tomate fresco e manjericão",
  },

];

const CATEGORIAS = [
  {
    emoji: "🍕",
    label: "Tradicionais",
    categoria: "Pizzas",
    sub: "As clássicas que todo mundo ama",
    bg: "#fff5f5",
    color: "#c62828",
  },
  {
    emoji: "🧀",
    label: "Especiais",
    categoria: "Pizzas",
    sub: "Combinações incríveis",
    bg: "#fffbeb",
    color: "#b8860b",
  },
  {
    emoji: "🥤",
    label: "Bebidas",
    categoria: "Bebidas",
    sub: "Refrescantes para acompanhar",
    bg: "#f0fdf4",
    color: "#2e7d32",
  },
  {
    emoji: "🍰",
    label: "Sobremesas",
    categoria: "Sobremesas",
    sub: "O toque doce do seu pedido",
    bg: "#faf5ff",
    color: "#7b1fa2",
  },
];

const IMAGENS_PRODUTOS = {
  calabresa: pizzaCalabresa,
  marguerita: pizzaMarguerita,
  portuguesa: pizzaPortuguesa,
  frango: pizzaFrango,
  quatroQueijos: pizzaHero,
  comboFamilia,
  cocaCola2l,
  guarana2l,
  pudim,
  pizzaChocolate,
};

/*FUNÇÕES AUXILIARES: */
function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase();
}


function exibirTexto(texto) {
  return String(texto || "").trim();
}

function iconeCategoria(nome) {
  if (nome === "Pizzas") return "🍕";
  if (nome === "Bebidas") return "🥤";
  if (nome === "Sobremesas") return "🍰";
  if (nome === "Combos") return "🎁";

  return "🍽️";
}

export default function Home() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [produtosDestaque, setProdutosDestaque] = useState([]);

  //armazena o combo em destaque exibido na Home
  const [comboDestaque, setComboDestaque] = useState(null);


  // redireciona funcionários diretamente para o painel administrativo
  useEffect(() => {
    const usuarioLogado = JSON.parse(
      localStorage.getItem("pizzly_usuario")
    );

    if (usuarioLogado?.tipo === "FUNCIONARIO") {
      navigate("/admin");
    }
  }, [navigate]);

  // carrega categorias, produtos em destaque e o combo principal.
  useEffect(() => {
    async function carregarHome() {
      try {
        const [categoriasResponse, produtosResponse] = await Promise.all([
          fetch(`${API_URL}/categorias?size=100`),
          fetch(`${API_URL}/produtos?size=100`),
        ]);

        const categoriasDados = await categoriasResponse.json();
        const produtosDados = await produtosResponse.json();

        const categoriasBackend = categoriasDados.content || [];
        const produtosBackend = produtosDados.content || [];

        const produtosDisponiveis = produtosBackend
          .filter((produto) => produto.disponivel !== false)
          .map((produto) => ({
            id: produto.id,
            img: IMAGENS_PRODUTOS[produto.imagem] || pizzaHero,
            name: produto.nome,
            desc: produto.descricao,
            preco: produto.preco,
            categoria: normalizarTexto(produto.categoriaNome),
          }));

        const categoriasComProdutos = categoriasBackend
          .map((categoria) => ({
            id: categoria.id,
            emoji: categoria.icon || iconeCategoria(categoria.nome),
            label: exibirTexto(categoria.nome),
            categoria: normalizarTexto(categoria.nome),
            sub: categoria.descricao || "Categoria cadastrada no sistema",
            bg: "#fff5f5",
            color: "#c62828",
          }))
          .filter((categoria) =>
            produtosDisponiveis.some(
              (produto) => produto.categoria === categoria.categoria
            )
          );

        setCategorias(categoriasComProdutos);

        // exibe apenas produtos da categoria Pizzas na seção de destaque
        const pizzasDestaque = produtosDisponiveis
          .filter((produto) => produto.categoria === "pizzas")
          .slice(0, 4);

        setProdutosDestaque(pizzasDestaque);

        const comboPrincipal = produtosDisponiveis.find(
          (produto) => produto.categoria === "combos"
        );

        setComboDestaque(comboPrincipal || null);
        
      } catch (error) {
        console.error("Erro ao carregar Home:", error);
        setCategorias([]);
        setProdutosDestaque([]);
      }
    }

    carregarHome();
  }, []);


  //renderização
  return (
    <div className="ho-root">

      {/* NAVBAR*/}
      <Navbar />

      

      {/* HERO */}
      <section className="ho-hero">
        <div className="ho-hero-inner">
          <div className="ho-hero-txt">
            <h1>
              A pizza perfeita<br />
              <span className="ho-yellow">para qualquer</span><br />
              momento! 🍕
            </h1>
            <p>
              Peça suas favoritas com ingredientes<br />
              frescos e entrega rápida na sua casa.
            </p>
            <div className="ho-hero-btns">
              <Link to="/pedido" className="ho-btn-peca">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                  <circle cx="13" cy="17" r="3"/>
                  <circle cx="19" cy="17" r="3"/>
                  <path d="M13 17h6"/>
                </svg>
                Peça Agora
              </Link>

            </div>
          </div>

          {/* Foto hero */}
          <div className="ho-hero-img-wrap">
            <img
              src={pizzaHero} alt="Pizza"
              className="ho-hero-img"
            />
          </div>
        </div>
      </section>

      {/*conteudo*/}
      <main className="ho-main">

        {/* ── Categorias ── */}
        <section className="ho-section">
          <h2 className="ho-section-title">Nossas categorias</h2>
          <div className="ho-categorias">
            {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              className="ho-cat-card"
              style={{ background: c.bg }}
              onClick={() =>
                navigate(`/pedido?categoria=${encodeURIComponent(c.categoria)}`)
              }
            >
              <span className="ho-cat-emoji">{c.emoji}</span>

              <div>
                <strong style={{ color: c.color }}>{c.label}</strong>
                <p>{c.sub}</p>
              </div>

              <span className="ho-cat-arrow">→</span>
            </button>
          ))}
          </div>
        </section>

        {/* ── Pizzas em destaque ── */}
        <section id = "cardapio" className="ho-section">
          <div className="ho-sec-hdr">
            <h2 className="ho-section-title" style={{ margin: 0 }}>Pizzas em destaque</h2>
            <button
              type="button"
              className="ho-ver-todas"
              onClick={() => navigate("/pedido")}
            >
              Ver todas →
            </button>
          </div>

          <div className="ho-pizzas-grid">
            {produtosDestaque.map((p) => (
              <div key={p.id} className="ho-pizza-card">
                <img src={p.img} alt={p.name} className="ho-pizza-img" />
                <div className="ho-pizza-body">
                  <strong className="ho-pizza-name">{p.name}</strong>
                  <p className="ho-pizza-desc">{p.desc}</p>
                  <span className="ho-pizza-price">
                    A partir de{" "}
                      {p.categoria === "pizzas"
                        ? PRECO_INICIAL_PIZZA
                        : formatarMoeda(p.preco)}
                  </span>
                  <button
                    className="ho-pizza-btn"
                    onClick={() => navigate("/pedido")}
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

       {/* ── Banner Combo Família ── */}
        {comboDestaque && (
          <section className="ho-section">
            <div className="ho-combo-banner">
              <div className="ho-combo-left">
                <span className="ho-combo-tag">🔥 MAIS PEDIDO</span>

                <h2>{comboDestaque.name}</h2>

                <p>{comboDestaque.desc}</p>

                <div className="ho-combo-price-box">
                  <span className="ho-combo-por">por apenas</span>
                  <span className="ho-combo-val">
                    {formatarMoeda(comboDestaque.preco)}
                  </span>
                </div>

                <ul className="ho-combo-checks">
                  <li>✔ Produto cadastrado no sistema</li>
                  <li>✔ Disponível no cardápio</li>
                  <li>✔ Entrega rápida</li>
                </ul>

                <button
                  type="button"
                  className="ho-btn-peca"
                  onClick={() => {
                    localStorage.setItem(
                      "pizzly_combo_home",
                      JSON.stringify(comboDestaque)
                    );

                    navigate("/pedido?categoria=combos&adicionarCombo=true");
                  }}
                >
                  Pedir combo →
                </button>
                
              </div>

              <div className="ho-combo-imgs">
                <img
                  src={comboDestaque.img}
                  alt={comboDestaque.name}
                  className="ho-combo-pizza1"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Diferenciais ── */}
        <section className="ho-section">
          <div className="ho-diferenciais">
            <div className="ho-dif-item">
              <div className="ho-dif-ico" style={{ background: "#c62828" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div>
                <strong>Ingredientes frescos</strong>
                <p>Selecionamos os melhores ingredientes para você</p>
              </div>
            </div>

            <div className="ho-dif-item">
              <div className="ho-dif-ico" style={{ background: "#c62828" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><circle cx="13" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M13 17h6"/>
                </svg>
              </div>
              <div>
                <strong>Entrega rápida</strong>
                <p>Chegou rápido, chegou quente e delicioso</p>
              </div>
            </div>

            <div className="ho-dif-item">
              <div className="ho-dif-ico" style={{ background: "#c62828" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <strong>Pagamento seguro</strong>
                <p>Seus dados sempre protegidos em todas as compras</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer*/}
      <footer className="ho-footer">
        <div className="ho-footer-inner">

          {/* Logo + tagline */}
          <div className="ho-footer-brand">
            <div className="ho-footer-logo">
              <svg width="30" height="30" viewBox="0 0 44 44" fill="none">
                <path d="M22 4 L40 38 H4 Z" fill="#FDD835"/>
                <circle cx="18" cy="28" r="3"   fill="#c0392b"/>
                <circle cx="27" cy="22" r="2.5" fill="#c0392b"/>
                <circle cx="30" cy="32" r="2"   fill="#c0392b"/>
              </svg>
              <span className="ho-footer-logo-text">Pizzly</span>
            </div>
            <p>A pizza que você ama,<br/>do jeito que você gosta!</p>
          </div>

          {/* Institucional */}
          <div className="ho-footer-col">
            <strong>Institucional</strong>
            <a href="#">Sobre nós</a>
            <a href="#">Trabalhe conosco</a>
            <a href="#">Política de Privacidade</a>
            <a href="#">Termos de Uso</a>
          </div>

          {/* Ajuda */}
          <div className="ho-footer-col">
            <strong>Ajuda</strong>
            <a href="#">Dúvidas Frequentes</a>
            <a href="#">Trocas e Devoluções</a>
            <a href="#">Formas de Pagamento</a>
            <a href="#">Fale Conosco</a>
          </div>

          {/* Redes sociais */}
          <div className="ho-footer-col">
            <strong>Siga a Pizzly</strong>
            <div className="ho-socials">
              {/* Instagram */}
              <a href="#" className="ho-social-btn" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="ho-social-btn" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="#" className="ho-social-btn" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="ho-footer-bottom">
          <p>© 2024 Pizzly. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
