import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import API_URL from "../utils/api";

import pizzaHero from "../assets/images/pizzaHero.png";
import pizzaCalabresa from "../assets/images/pizzaCalabresa.jpg";
import pizzaFrango from "../assets/images/pizzaFrango.jpg";
import pizzaPortuguesa from "../assets/images/pizzaPortuguesa.jpg";
import pizzaMarguerita from "../assets/images/pizzaMarguerita.png";
import comboFamilia from "../assets/images/comboFamilia.png";
import pizzaChocolate from "../assets/images/pizzaChocolate.jpg";

import "../assets/css/Promocoes.css";

const IMAGENS_PROMOCOES = {
  comboFamilia,
  calabresa: pizzaCalabresa,
  frango: pizzaFrango,
  portuguesa: pizzaPortuguesa,
  marguerita: pizzaMarguerita,
  quatroQueijos: pizzaHero,
  pizzaChocolate,
};

function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Promocoes() {
  const navigate = useNavigate();

  // Promoções ativas cadastradas no sistema
  const [promocoes, setPromocoes] = useState([]);

  // Configurações de funcionamento da pizzaria
  const [configuracoes, setConfiguracoes] = useState({
    aberta: true,
  });

  // Carrega as promoções cadastradas no backend
  useEffect(() => {
    async function carregarPromocoes() {
      try {
        const response = await fetch(`${API_URL}/promocoes?size=100`);

        if (!response.ok) {
          throw new Error("Não foi possível carregar as promoções.");
        }

        const dados = await response.json();

        const promocoesBackend = Array.isArray(dados.content)
          ? dados.content
          : [];

        const formatadas = promocoesBackend
          .filter(
            (promo) =>
              promo.ativa === true || promo.ativa === "true"
          )
          .map((promo) => ({
            id: promo.id,
            titulo: promo.titulo,
            desc: promo.descricao || "",
            precoNovo: formatarPreco(promo.precoPromocional),
            produtosNomes: promo.produtosNomes || [],
            img: IMAGENS_PROMOCOES[promo.imagem] || pizzaHero,
          }));

        setPromocoes(formatadas);
      } catch (error) {
        console.error("Erro ao carregar promoções:", error);
        setPromocoes([]);
      }
    }

    carregarPromocoes();
  }, []);

  // Verifica se a pizzaria está aberta para novos pedidos
  useEffect(() => {
    async function carregarConfiguracoes() {
      try {
        const response = await fetch(`${API_URL}/configuracoes`);

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar as configurações."
          );
        }

        const dados = await response.json();

        setConfiguracoes({
          aberta:
            dados.aberta === true || dados.aberta === "true",
        });
      } catch (error) {
        console.error(
          "Erro ao carregar configurações:",
          error
        );
      }
    }

    carregarConfiguracoes();
  }, []);

  const handleSelecionarPromocao = (promocao) => {
    if (!configuracoes.aberta) {
      return;
    }

    localStorage.setItem(
      "pizzly_promocao_selecionada",
      JSON.stringify(promocao)
    );

    navigate("/pedido");
  };

  return (
    <div className="pr-root">
      <Navbar />

      <main className="pr-main">
        <section
          className="pr-hero"
          aria-labelledby="promocoes-titulo"
        >
          <div className="pr-hero-content">
            <span className="pr-tag">Ofertas especiais</span>

            <h1 id="promocoes-titulo">
              Promoções da Pizzly
            </h1>

            <p>
              Aproveite combos, descontos e ofertas especiais
              para pedir sua pizza favorita pagando menos.
            </p>
          </div>

          <button
            type="button"
            className="pr-hero-btn"
            onClick={() => navigate("/pedido")}
          >
            Ver cardápio
          </button>
        </section>

        {!configuracoes.aberta && (
          <div
            className="pr-closed-banner"
            role="status"
            aria-live="polite"
          >
            <strong>
              🔴 Pizzaria fechada no momento
            </strong>

            <span>
              As promoções continuam disponíveis, mas novos
              pedidos estão temporariamente indisponíveis.
            </span>
          </div>
        )}

        <section
          className="pr-grid"
          aria-label="Lista de promoções"
        >
          {promocoes.length === 0 && (
            <p className="pr-empty">
              Nenhuma promoção disponível no momento.
            </p>
          )}

          {promocoes.map((promo) => (
            <article
              key={promo.id}
              className="pr-card"
            >
              <div className="pr-img-wrap">
                <img
                  src={promo.img}
                  alt={`Promoção ${promo.titulo}`}
                  className="pr-img"
                />
              </div>

              <div className="pr-card-body">
                <h2>{promo.titulo}</h2>

                <p>{promo.desc}</p>

                <div className="pr-price-row">
                  <strong className="pr-new-price">
                    {promo.precoNovo}
                  </strong>
                </div>

                <button
                  type="button"
                  className="pr-btn"
                  disabled={!configuracoes.aberta}
                  onClick={() =>
                    handleSelecionarPromocao(promo)
                  }
                >
                  Aproveitar promoção
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}