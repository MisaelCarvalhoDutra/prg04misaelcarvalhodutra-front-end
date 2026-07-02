import "../assets/css/Promocoes.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import pizzaHero from "../assets/images/pizzaHero.png";
import pizzaCalabresa from "../assets/images/pizzaCalabresa.jpg";
import pizzaFrango from "../assets/images/pizzaFrango.jpg";
import pizzaPortuguesa from "../assets/images/pizzaPortuguesa.jpg";


export default function Promocoes() {
  const navigate = useNavigate();

  const [promocoes, setPromocoes] = useState([]);

  const [configuracoes, setConfiguracoes] = useState({
    aberta: true,
  });


  useEffect(() => {
  async function carregarPromocoes() {
    try {
      const response = await fetch("http://localhost:8080/promocoes?size=100");

      if (!response.ok) return;

      const dados = await response.json();

      const promocoesBackend = dados.content || [];

      const formatadas = promocoesBackend
        .filter((promo) => promo.ativa === true)
        .map((promo) => ({
          id: promo.id,
          titulo: promo.titulo,
          desc: promo.descricao || "",
          precoNovo: `R$ ${Number(
            promo.precoPromocional || 0
          ).toFixed(2).replace(".", ",")}`,
          produtosNomes: promo.produtosNomes || [],
          img: pizzaHero,
        }));

      setPromocoes(formatadas);
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
    }
  }

  carregarPromocoes();
}, []);

useEffect(() => {
  async function carregarConfiguracoes() {
    try {
      const response = await fetch("http://localhost:8080/configuracoes");

      if (!response.ok) return;

      const dados = await response.json();

      setConfiguracoes({
        aberta: dados.aberta === true || dados.aberta === "true",
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  }

  carregarConfiguracoes();
}, []);


  return (
    <div className="pr-root">
      <Navbar />

      <main className="pr-main">
        <section className="pr-hero">
          <div>
            <span className="pr-tag">Ofertas especiais</span>
            <h1>Promoções da Pizzly</h1>
            <p>
              Aproveite combos, descontos e ofertas especiais para pedir sua pizza favorita pagando menos.
            </p>
          </div>

          <button className="pr-hero-btn" onClick={() => navigate("/pedido")}>
            Ver cardápio
          </button>
        </section>

        {!configuracoes.aberta && (
          <div className="pr-closed-banner">
            <strong>🔴 Pizzaria fechada no momento</strong>
            <span>As promoções continuam disponíveis, mas novos pedidos estão temporariamente indisponíveis.</span>
          </div>
        )}

        <section className="pr-grid">
          {promocoes.map((promo) => (
            <div key={promo.id} className="pr-card">
              <div className="pr-img-wrap">
                <img src={promo.img} alt={promo.titulo} className="pr-img" />
                
              </div>

              <div className="pr-card-body">
                <h2>{promo.titulo}</h2>
                <p>{promo.desc}</p>

                <div className="pr-price-row">
                  
                  <strong className="pr-new-price">{promo.precoNovo}</strong>
                </div>

                <button
                  className="pr-btn"
                  disabled={!configuracoes.aberta}
                  onClick={() => {
                    if (!configuracoes.aberta) {
                      alert("A pizzaria está fechada no momento.");
                      return;
                    }

                    localStorage.setItem(
                      "pizzly_promocao_selecionada",
                      JSON.stringify(promo)
                    );
                    navigate("/pedido");
                  }}
                >
                  Aproveitar promoção
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}