import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/css/Pedido.css";
import Navbar from "../components/Navbar";

import pizzaCalabresa from "../assets/images/pizzaCalabresa.jpg";
import pizzaMarguerita from "../assets/images/pizzaMarguerita.png";
import pizzaPortuguesa from "../assets/images/pizzaPortuguesa.jpg";
import pizzaFrango from "../assets/images/pizzaFrango.jpg";
import pizzaHero from "../assets/images/pizzaHero.png";
import comboFamilia from "../assets/images/comboFamilia.png";
import cocaCola2l from "../assets/images/cocaCola.png";
import guarana2l from "../assets/images/guarana.png";
import pudim from "../assets/images/pudim.png";
import pizzaChocolate from "../assets/images/pizzaChocolate.jpg";

const IMAGENS_PRODUTOS = {
  calabresa: pizzaCalabresa,
  marguerita: pizzaMarguerita,
  portuguesa: pizzaPortuguesa,
  frango: pizzaFrango,
  quatroQueijos: pizzaHero,
  comboFamilia: comboFamilia,
  cocaCola2l: cocaCola2l,
  guarana2l: guarana2l,
  pudim: pudim,
  pizzaChocolate: pizzaChocolate,
};

const TAMANHOS = [
  { id: "p", label: "Pequena", fatias: "4 fatias", preco: 29.9 },
  { id: "m", label: "Média", fatias: "6 fatias", preco: 39.9 },
  { id: "g", label: "Grande", fatias: "8 fatias", preco: 49.9 },
  { id: "f", label: "Família", fatias: "12 fatias", preco: 69.9 },
];

const PRODUTOS = {
  Pizzas: [
    {
      id: 1,
      nome: "Calabresa",
      desc: "Mussarela, calabresa, cebola e orégano.",
      preco: 39.9,
      img: pizzaCalabresa,
      tag: "Mais vendida",
    },
    {
      id: 2,
      nome: "Marguerita",
      desc: "Mussarela, tomate fresco e manjericão.",
      preco: 39.9,
      img: pizzaMarguerita,
      tag: "Clássica",
    },
    {
      id: 3,
      nome: "Portuguesa",
      desc: "Presunto, ovos, cebola, pimentão e azeitonas.",
      preco: 44.9,
      img: pizzaPortuguesa,
    },
    {
      id: 4,
      nome: "Frango com Catupiry",
      desc: "Frango desfiado, catupiry e mussarela.",
      preco: 44.9,
      img: pizzaFrango,
    },
    {
      id: 5,
      nome: "4 Queijos",
      desc: "Mussarela, provolone, parmesão e gorgonzola.",
      preco: 49.9,
      img: pizzaHero,
    },
  ],

  Combos: [
    {
      id: 6,
      nome: "Combo Família",
      desc: "2 pizzas grandes + refrigerante 2L.",
      preco: 89.9,
      img: comboFamilia,
      tag: "Oferta",
    },
  ],

  Bebidas: [
    {
      id: 7,
      nome: "Coca-Cola 2L",
      desc: "Refrigerante Coca-Cola gelado.",
      preco: 12.9,
      img: cocaCola2l,
      tipoImagem: "contain",
    },
    {
      id: 8,
      nome: "Guaraná 2L",
      desc: "Refrigerante Guaraná gelado.",
      preco: 10.9,
      img: guarana2l,
      tipoImagem: "contain",
    },
  ],

  Sobremesas: [
    {
      id: 9,
      nome: "Pudim",
      desc: "Pudim de leite condensado com calda de caramelo.",
      preco: 8.9,
      img: pudim,
      tipoImagem: "contain",
    },
    {
      id: 10,
      nome: "Pizza Chocolate",
      desc: "Chocolate, granulado e morango.",
      preco: 34.9,
      img: pizzaChocolate,
    },
  ],
};

const CATEGORIAS = [
  { nome: "Pizzas", icon: "🍕", sub: "Sabores tradicionais" },
  { nome: "Combos", icon: "🎁", sub: "Ofertas para dividir" },
  { nome: "Bebidas", icon: "🥤", sub: "Refrigerantes gelados" },
  { nome: "Sobremesas", icon: "🍰", sub: "Doces para finalizar" },
];

const TAXA_ENTREGA_PADRAO = 6;

const fmt = (valor) => `R$ ${valor.toFixed(2).replace(".", ",")}`;

function converterProdutoBackend(produto) {
  return {
    id: produto.id,
    nome: produto.nome,
    desc: produto.descricao,
    preco: Number(produto.preco),
    img: IMAGENS_PRODUTOS[produto.imagem] || pizzaHero,
    tipoImagem: produto.categoriaNome === "Bebidas" ? "contain" : "cover",
    categoria: normalizarTexto(produto.categoriaNome),
  };
}

function converterCategoriaBackend(categoria) {
  return {
    nome: normalizarTexto(categoria.nome),
    icon:
      categoria.nome === "Pizzas"
        ? "🍕"
        : categoria.nome === "Bebidas"
        ? "🥤"
        : categoria.nome === "Sobremesas"
        ? "🍰"
        : categoria.nome === "Combos"
        ? "🎁"
        : "🍽️",
    sub: categoria.descricao || "Categoria cadastrada no sistema",
  };
}

function converterEnderecoBackend(endereco) {
  return {
    id: endereco.id,
    tipo: endereco.tipo,
    apelido:
      endereco.tipo === "CASA"
        ? "Casa"
        : endereco.tipo === "TRABALHO"
        ? "Trabalho"
        : "Outro",
    principal: endereco.principal,
    logradouro: endereco.logradouro,
    numero: endereco.numero,
    complemento: endereco.complemento || "",
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    uf: endereco.uf,
    cep: endereco.cep,
  };
}

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase();
}

export default function Pedido() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [etapa, setEtapa] = useState(() => {
    return Number(localStorage.getItem("pizzly_etapa")) || 1;
  });

  const [categoriaAtiva, setCategoriaAtiva] = useState("Pizzas");
  const [tamanho, setTamanho] = useState("m");

  const [carrinho, setCarrinho] = useState(() => {
    return JSON.parse(localStorage.getItem("pizzly_carrinho")) || [];
  });

  const [cupomAberto, setCupomAberto] = useState(false);
  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [cupomAplicado, setCupomAplicado] = useState("");
  const [observacaoPedido, setObservacaoPedido] = useState("");

  const [entrega, setEntrega] = useState({
    formaRecebimento: "entrega",
    enderecoSalvo: "casa",
    outroEndereco: "",
    horario: "rapido",
    observacao: "",
  });

  const [pagamento, setPagamento] = useState("pix");
  const [valorTroco, setValorTroco] = useState("");
  const [produtosSistema, setProdutosSistema] = useState({});
  const [categoriasSistema, setCategoriasSistema] = useState([]);

  const [enderecosCliente, setEnderecosCliente] = useState([]);

  const [configuracoes, setConfiguracoes] = useState({
    taxaEntrega: TAXA_ENTREGA_PADRAO,
    tempoEntrega: "30 - 45 min",
    aberta: true,
    endereco: "Centro - Irecê/BA",
  });

  useEffect(() => {
    localStorage.setItem("pizzly_etapa", etapa);
  }, [etapa]);

  useEffect(() => {
  localStorage.setItem("pizzly_carrinho", JSON.stringify(carrinho));

  window.dispatchEvent(new Event("pizzlyCarrinhoAtualizado"));
}, [carrinho]);

  // lê parâmetros recebidos pela URL
  useEffect(() => {

    const etapaUrl = searchParams.get("etapa");

    if (etapaUrl) {
      setEtapa(Number(etapaUrl));
    }

    // categoria enviada pela Home
    const categoriaUrl = searchParams.get("categoria");

    if (categoriaUrl) {
      setCategoriaAtiva(categoriaUrl);
    }

  }, [searchParams]);

  useEffect(() => {
  function irParaRevisao() {
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("pizzlyIrParaRevisao", irParaRevisao);

  return () => {
    window.removeEventListener("pizzlyIrParaRevisao", irParaRevisao);
  };
}, []);

  useEffect(() => {
    const promocao = JSON.parse(
      localStorage.getItem("pizzly_promocao_selecionada")
    );

    if (!promocao) return;

    const precoPromocao = Number(
      promocao.precoNovo
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim()
    );

    const itemPromocao = {
      uid: Date.now(),
      produto: {
        id: promocao.id,
        nome: promocao.titulo,
        desc: promocao.desc,
        preco: precoPromocao,
      },
      tamanho: "",
      preco: precoPromocao,
      img: promocao.img,
      quantidade: 1,
    };

    setCarrinho([itemPromocao]);
    localStorage.removeItem("pizzly_promocao_selecionada");
  }, []);

  useEffect(() => {
    async function carregarCardapio() {
      try {
        const [categoriasResponse, produtosResponse] = await Promise.all([
          fetch("http://localhost:8080/categorias?size=100"),
          fetch("http://localhost:8080/produtos?size=100"),
        ]);

        if (!categoriasResponse.ok || !produtosResponse.ok) {
          throw new Error("Erro ao buscar cardápio no backend");
        }

        const categoriasDados = await categoriasResponse.json();
        const produtosDados = await produtosResponse.json();

        const categoriasBackend = categoriasDados.content || [];
        const produtosBackend = produtosDados.content || [];

        const produtosDisponiveis = produtosBackend
          .filter((produto) => produto.disponivel)
          .map(converterProdutoBackend);

        const agrupados = {};

        produtosDisponiveis.forEach((produto) => {
          if (!agrupados[produto.categoria]) {
            agrupados[produto.categoria] = [];
          }

          agrupados[produto.categoria].push(produto);
        });

        const categoriasComProdutos = categoriasBackend
          .map(converterCategoriaBackend)
          .filter((categoria) => agrupados[categoria.nome]?.length > 0);

        setProdutosSistema(agrupados);
        setCategoriasSistema(categoriasComProdutos);

        // só define a primeira categoria se nenhuma veio pela URL
        if (
          categoriasComProdutos.length > 0 &&
          !searchParams.get("categoria")
        ) {
          setCategoriaAtiva(categoriasComProdutos[0].nome);
        }
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
        setCategoriasSistema([]);
        setProdutosSistema({});
      }
    }

    carregarCardapio();
  }, []);

  // adiciona automaticamente o combo vindo da Home
useEffect(() => {
  const adicionarCombo = searchParams.get("adicionarCombo");

  if (adicionarCombo !== "true") return;

  const comboSalvo = JSON.parse(
    localStorage.getItem("pizzly_combo_home")
  );

  if (!comboSalvo) return;

  const itemExistente = carrinho.find(
    (item) => item.produto.id === comboSalvo.id
  );

  if (itemExistente) {
    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.map((item) =>
        item.produto.id === comboSalvo.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  } else {
    setCarrinho((carrinhoAtual) => [
      ...carrinhoAtual,
      {
        uid: Date.now() + Math.random(),
        produto: {
          id: comboSalvo.id,
          nome: comboSalvo.name,
          desc: comboSalvo.desc,
          preco: Number(comboSalvo.preco),
        },
        tamanho: "",
        preco: Number(comboSalvo.preco),
        img: comboSalvo.img,
        quantidade: 1,
      },
    ]);
  }

  localStorage.removeItem("pizzly_combo_home");
}, []);

  useEffect(() => {
    async function carregarConfiguracoes() {
      try {
        const response = await fetch("http://localhost:8080/configuracoes");

        if (!response.ok) return;

        const dados = await response.json();

        setConfiguracoes({
          taxaEntrega: Number(dados.taxaEntrega || TAXA_ENTREGA_PADRAO),
          tempoEntrega: dados.tempoEntrega || "30 - 45 min",
          aberta: dados.aberta !== false,
          endereco: dados.endereco || "Centro - Irecê/BA",
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }

    carregarConfiguracoes();
  }, []);

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem("pizzly_usuario"));

    if (!usuarioLogado || usuarioLogado.tipo !== "CLIENTE") {
      return;
    }

    // busca os endereços reais do cliente para a etapa de entrega
    fetch(`http://localhost:8080/enderecos/cliente/${usuarioLogado.id}`)
      .then((response) => response.json())
      .then((dados) => {
        const enderecosConvertidos = dados.map(converterEnderecoBackend);

        setEnderecosCliente(enderecosConvertidos);

        const enderecoPrincipal =
          enderecosConvertidos.find((endereco) => endereco.principal) ||
          enderecosConvertidos[0];

        if (enderecoPrincipal) {
          setEntrega((entregaAtual) => ({
            ...entregaAtual,
            enderecoSalvo: String(enderecoPrincipal.id),
          }));
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar endereços do cliente:", error);
      });
  }, []);

  const produtos = produtosSistema[categoriaAtiva] || [];

  // endereço selecionado atualmente pelo cliente
  const enderecoSelecionado = enderecosCliente.find(
    (endereco) => String(endereco.id) === entrega.enderecoSalvo
  );

  const taxaEntregaAtual =
    entrega.formaRecebimento === "retirada" || carrinho.length === 0
      ? 0
      : configuracoes.taxaEntrega;

  const subtotal = useMemo(
    () =>
      carrinho.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
      ),
    [carrinho]
  );

  const total = Math.max(subtotal + taxaEntregaAtual - desconto, 0);

  async function verificarPizzariaAberta() {
    const response = await fetch("http://localhost:8080/configuracoes");
    const dados = await response.json();

    return dados.aberta === true || dados.aberta === "true";
  }

  async function adicionarProduto(produto) {
    try {
      const aberta = await verificarPizzariaAberta();

      if (!aberta) {
        toast.warning("A pizzaria está fechada no momento.");
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar status da pizzaria:", error);
      toast.error("Não foi possível verificar o funcionamento da pizzaria.");
      return;
    }

    const tamanhoSelecionado =
      categoriaAtiva === "pizzas"
        ? TAMANHOS.find((item) => item.id === tamanho)
        : null;

    const itemExistente = carrinho.find(
      (item) =>
        item.produto.id === produto.id &&
        item.tamanho === (tamanhoSelecionado?.label || "")
    );

    if (itemExistente) {
      setCarrinho((prev) =>
        prev.map((item) =>
          item.uid === itemExistente.uid
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
      return;
    }

    setCarrinho((prev) => [
      ...prev,
      {
        uid: Date.now() + Math.random(),
        produto,
        tamanho: tamanhoSelecionado?.label || "",
        preco: tamanhoSelecionado?.preco || produto.preco,
        img: produto.img,
        quantidade: 1,
      },
    ]);
  }

  function aumentarQuantidade(uid) {
    if (!configuracoes.aberta) {
      toast.warning("A pizzaria está fechada no momento.");
      return;
    }

    setCarrinho((prev) =>
      prev.map((item) =>
        item.uid === uid
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  }

  function diminuirQuantidade(uid) {
    setCarrinho((prev) =>
      prev
        .map((item) =>
          item.uid === uid
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function removerItem(uid) {
    setCarrinho((prev) => prev.filter((item) => item.uid !== uid));
  }

  function nomePagamento() {
    if (pagamento === "pix") return "Pix";
    if (pagamento === "credito") return "Cartão de crédito";
    if (pagamento === "debito") return "Cartão de débito";
    if (pagamento === "dinheiro") return "Dinheiro";
    return "Pix";
  }


  function enderecoEscolhido() {
    if (entrega.formaRecebimento === "retirada") {
      return "Retirada na Pizzly - Unidade Centro";
    }

    if (enderecoSelecionado) {
      return `${enderecoSelecionado.logradouro}, ${enderecoSelecionado.numero} - ${enderecoSelecionado.bairro}`;
    }

    return entrega.outroEndereco || "Outro endereço";
  }

  function aplicarCupom() {
    const codigo = cupom.trim().toUpperCase();

    if (!codigo) {
      toast.warning("Digite um cupom.");
      return;
    }

    if (carrinho.length === 0) {
      toast.warning("Adicione um item ao carrinho antes de aplicar o cupom.");
      return;
    }

    if (cupomAplicado) {
      toast.warning("Já existe um cupom aplicado.");
      return;
    }

    if (codigo === "PIZZLY10") {
      const valorDesconto = subtotal * 0.1;
      setDesconto(valorDesconto);
      setCupomAplicado("PIZZLY10");
      toast.success("Cupom PIZZLY10 aplicado com sucesso!");
      return;
    }

    if (codigo === "FRETEGRATIS") {
      if (taxaEntregaAtual === 0) {
        toast.warning("Esse cupom só pode ser usado em pedidos com entrega.");
        return;
      }

      setDesconto(taxaEntregaAtual);
      setCupomAplicado("FRETEGRATIS");
      toast.success("Cupom FRETEGRATIS aplicado com sucesso!");
      return;
    }

    toast.error("Cupom inválido.");
  }

  function removerCupom() {
    setCupom("");
    setDesconto(0);
    setCupomAplicado("");
  }

  async function proximaEtapa() {

    if (!configuracoes.aberta) {
      toast.warning("A pizzaria está fechada no momento.");
      return;
    }

    if (carrinho.length === 0) {
      toast.warning("Seu carrinho está vazio. Adicione pelo menos um item para continuar.");
      setEtapa(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (
      etapa === 3 &&
      entrega.formaRecebimento === "entrega" &&
      entrega.enderecoSalvo === "outro" &&
      !entrega.outroEndereco
    ) {
      toast.warning("Informe o endereço de entrega.");
      return;
    }

    if (etapa < 4) {
      setEtapa(etapa + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (etapa === 4 && pagamento === "dinheiro") {
      const valorInformado = Number(valorTroco);

      if (!valorTroco || valorInformado < total) {
        toast.warning("Informe um valor em mãos maior ou igual ao total do pedido.");
        return;
      }
    }

    try {
  const usuarioLogado = JSON.parse(localStorage.getItem("pizzly_usuario"));

  if (!usuarioLogado?.id || usuarioLogado.tipo !== "CLIENTE") {
    toast.warning("Faça login como cliente para finalizar o pedido.");
    navigate("/login");
    return;
  }

    const formaPagamentoBackend =
      pagamento === "pix"
        ? "PIX"
        : pagamento === "credito"
        ? "CARTAO_CREDITO"
        : pagamento === "debito"
        ? "CARTAO_DEBITO"
        : "DINHEIRO";

    // cria o pedido principal no backend
    const pedidoResponse = await fetch("http://localhost:8080/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subtotal,
        taxaEntrega: taxaEntregaAtual,
        observacao: observacaoPedido,
        formaRecebimento: entrega.formaRecebimento,
        enderecoId:
          entrega.formaRecebimento === "entrega" &&
          entrega.enderecoSalvo !== "outro"
            ? Number(entrega.enderecoSalvo)
            : null,
        clienteId: usuarioLogado.id,
      }),
    });

    if (!pedidoResponse.ok) {
      toast.error("Não foi possível criar o pedido.");
      return;
    }

    const pedidoCriado = await pedidoResponse.json();

    // cadastra todos os itens do carrinho vinculados ao pedido criado
    await Promise.all(
      carrinho.map((item) =>
        fetch("http://localhost:8080/itens-pedido", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantidade: item.quantidade,

            // preço utilizado no momento da compra
            precoUnitario: item.preco,

            pedidoId: pedidoCriado.id,
            produtoId: item.produto.id,
          }),
        })
      )
    );

    // cadastra a forma de pagamento vinculada ao pedido
    const pagamentoResponse = await fetch("http://localhost:8080/pagamentos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formaPagamento: formaPagamentoBackend,
        valorTroco: pagamento === "dinheiro" ? Number(valorTroco) : null,
        pedidoId: pedidoCriado.id,
      }),
    });

    if (!pagamentoResponse.ok) {
      toast.error("O pedido foi criado, mas ocorreu um erro ao registrar o pagamento.");
      return;
    }

    // guarda os dados completos do pedido para a tela de confirmação
    const pedidoAtual = {
      id: pedidoCriado.id,
      data: new Date(pedidoCriado.dataPedido).toLocaleDateString("pt-BR"),
      status: "Confirmado",
      itens: carrinho.map(
        (item) =>
          `${item.quantidade}x ${item.produto.nome}${
            item.tamanho ? ` (${item.tamanho})` : ""
          }`
      ),
      subtotal: fmt(subtotal),
      taxaEntrega: fmt(taxaEntregaAtual),
      total: fmt(total),
      tempo:
        entrega.formaRecebimento === "retirada"
          ? "25 min"
          : configuracoes.tempoEntrega,
      entrega: enderecoEscolhido(),
      formaRecebimento: entrega.formaRecebimento,
      pagamento: nomePagamento(),
    };

    localStorage.setItem("pizzly_pedido_atual", JSON.stringify(pedidoAtual));

    setCarrinho([]);
    localStorage.removeItem("pizzly_carrinho");
    localStorage.removeItem("pizzly_etapa");
    window.dispatchEvent(new Event("pizzlyCarrinhoAtualizado"));

    navigate("/pedido-confirmado");
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    toast.error("Não foi possível conectar ao servidor.");
  }

  }

  function voltarEtapa() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="pd-root">
      <Navbar />

      <main className="pd-page">
        <section className="pd-hero">

        {!configuracoes.aberta && (
          <div className="pd-closed-banner">
            <strong>🔴 Pizzaria fechada no momento</strong>
            <span>Novos pedidos estão temporariamente indisponíveis.</span>
          </div>
        )}

          <div>
            <span className="pd-hero-tag">Cardápio online</span>
            <h1>Monte seu pedido</h1>
            <p>
              Escolha seus itens, revise o carrinho, informe a entrega e
              finalize o pagamento.
            </p>
          </div>

          <div className="pd-hero-info">
            <span>Entrega estimada</span>
            <strong>
              {entrega.formaRecebimento === "retirada"
                ? "25 min"
                : configuracoes.tempoEntrega}
            </strong>
          </div>
        </section>

        <section className="pd-steps">
          {["Cardápio", "Revisão", "Entrega", "Pagamento"].map(
            (titulo, index) => (
              <div
                key={titulo}
                className={`pd-step ${etapa >= index + 1 ? "active" : ""}`}
              >
                <span>{etapa > index + 1 ? "✓" : index + 1}</span>
                <p>{titulo}</p>
              </div>
            )
          )}
        </section>

        <section className="pd-layout">
          <div className="pd-content">
            {etapa === 1 && (
              <>
                <section className="pd-categorias">
                  {categoriasSistema.map((categoria) => (
                    <button
                      key={categoria.nome}
                      className={`pd-categoria-card ${
                        categoriaAtiva === categoria.nome ? "active" : ""
                      }`}
                      onClick={() => setCategoriaAtiva(categoria.nome)}
                    >
                      <span>{categoria.icon}</span>
                      <div>
                        <strong>{categoria.nome}</strong>
                        <small>{categoria.sub}</small>
                      </div>
                    </button>
                  ))}
                </section>

                {categoriaAtiva === "pizzas" && (
                  <div className="pd-size-box">
                    <div className="pd-section-head">
                      <h2>Escolha o tamanho</h2>
                      <p>
                        O preço da pizza muda conforme o tamanho selecionado.
                      </p>
                    </div>

                    <div className="pd-size-grid">
                      {TAMANHOS.map((tam) => (
                        <button
                          key={tam.id}
                          className={`pd-size-card ${
                            tamanho === tam.id ? "selected" : ""
                          }`}
                          onClick={() => setTamanho(tam.id)}
                        >
                          <strong>{tam.label}</strong>
                          <span>{tam.fatias}</span>
                          <b>{fmt(tam.preco)}</b>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pd-section-head">
                  <h2>{categoriaAtiva}</h2>
                  <p>Escolha uma opção abaixo para adicionar ao pedido.</p>
                </div>

                <div className="pd-products-grid">
                  {produtos.map((produto) => (
                    <ProdutoCard
                      key={produto.id}
                      produto={produto}
                      precoAtual={
                        categoriaAtiva === "pizzas"
                          ? TAMANHOS.find((item) => item.id === tamanho)?.preco
                          : produto.preco
                      }
                      onAdd={() => adicionarProduto(produto)}
                      pizzariaAberta={configuracoes.aberta}
                    />
                  ))}
                </div>
              </>
            )}

            {etapa === 2 && (
              <div className="pd-step-card">
                <div className="pd-section-head">
                  <h2>Revise seu pedido</h2>
                  <p>Confira os itens antes de continuar para a entrega.</p>
                </div>

                {carrinho.length === 0 ? (
                  <div className="pd-cart-empty">
                    <span>🛒</span>
                    <strong>Carrinho vazio</strong>
                    <p>Volte ao cardápio e adicione itens ao pedido.</p>
                  </div>
                ) : (
                  <ul className="pd-review-list">
                    {carrinho.map((item) => (
                      <li key={item.uid}>
                        <img src={item.img} alt={item.produto.nome} />

                        <div>
                          <strong>{item.produto.nome}</strong>
                          {item.tamanho && <span>{item.tamanho}</span>}
                          <b>{fmt(item.preco * item.quantidade)}</b>
                        </div>

                        <div className="pd-qtd-control">
                          <button onClick={() => diminuirQuantidade(item.uid)}>
                            -
                          </button>
                          <span>{item.quantidade}</span>
                          <button onClick={() => aumentarQuantidade(item.uid)}>
                            +
                          </button>
                        </div>

                        <button onClick={() => removerItem(item.uid)}>
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <label className="pd-observacao-pedido">
                  Observação do pedido
                  <textarea
                    value={observacaoPedido}
                    onChange={(e) => setObservacaoPedido(e.target.value)}
                    placeholder="Ex: sem cebola, massa bem assada, cortar em 12 fatias..."
                  />
                </label>
              </div>
            )}

            {etapa === 3 && (
              <div className="pd-step-card">
                <div className="pd-section-head">
                  <h2>Entrega</h2>
                  <p>Escolha se deseja receber em casa ou retirar no balcão.</p>
                </div>

                <div className="pd-entrega-box">
                  <label>
                    Forma de recebimento
                    <select
                      value={entrega.formaRecebimento}
                      onChange={(e) =>
                        setEntrega({
                          ...entrega,
                          formaRecebimento: e.target.value,
                        })
                      }
                    >
                      <option value="entrega">Entrega</option>
                      <option value="retirada">Retirada no balcão</option>
                    </select>
                  </label>

                  {entrega.formaRecebimento === "entrega" ? (
                    <>
                      <label>
                        Endereço salvo
                        <select
                          value={entrega.enderecoSalvo}
                          onChange={(e) =>
                            setEntrega({
                              ...entrega,
                              enderecoSalvo: e.target.value,
                            })
                          }
                        >
                          {enderecosCliente.map((endereco) => (
                            <option key={endereco.id} value={String(endereco.id)}>
                              {endereco.apelido} - {endereco.logradouro}, {endereco.numero}
                            </option>
                          ))}

                          <option value="outro">Usar outro endereço</option>
                        </select>
                      </label>

                      {enderecoSelecionado && entrega.enderecoSalvo !== "outro" && (
                        <div className="pd-address-card">
                          <div>
                            <strong>{enderecoSelecionado.apelido}</strong>

                            {enderecoSelecionado.principal && (
                              <span>Principal</span>
                            )}
                          </div>

                          <p>
                            {enderecoSelecionado.logradouro}, {enderecoSelecionado.numero}
                          </p>

                          <p>
                            {enderecoSelecionado.bairro} - {enderecoSelecionado.cidade}/
                            {enderecoSelecionado.uf}
                          </p>

                          <p>CEP: {enderecoSelecionado.cep}</p>
                        </div>
                      )}

                      {entrega.enderecoSalvo === "outro" && (
                        <label>
                          Novo endereço
                          <input
                            value={entrega.outroEndereco}
                            onChange={(e) =>
                              setEntrega({
                                ...entrega,
                                outroEndereco: e.target.value,
                              })
                            }
                            placeholder="Rua, número, bairro e cidade"
                          />
                        </label>
                      )}

                      <button
                        type="button"
                        className="pd-location-btn"
                        onClick={() =>
                          toast.info("A detecção automática de localização será disponibilizada em uma próxima versão.")
                        }
                      >
                        📍 Detectar minha localização
                      </button>
                    </>
                  ) : (
                    <div className="pd-address-card">
                      <div>
                        <strong>Retirada na Pizzly</strong>
                        <span>Unidade Centro</span>
                      </div>

                      <p>Rua Principal, 100</p>
                      <p>{configuracoes.endereco}</p>
                      <p>Tempo estimado para retirada: 25 min</p>
                    </div>
                  )}

                  <label>
                    Horário preferido
                    <select
                      value={entrega.horario}
                      onChange={(e) =>
                        setEntrega({
                          ...entrega,
                          horario: e.target.value,
                        })
                      }
                    >
                      <option value="rapido">O mais rápido possível</option>
                      <option value="manha">Manhã</option>
                      <option value="tarde">Tarde</option>
                      <option value="noite">Noite</option>
                    </select>
                  </label>

                  <label>
                    Observações da entrega
                    <textarea
                      value={entrega.observacao}
                      onChange={(e) =>
                        setEntrega({
                          ...entrega,
                          observacao: e.target.value,
                        })
                      }
                      placeholder="Ex: chamar no WhatsApp, entregar no portão..."
                    />
                  </label>
                </div>
              </div>
            )}

            {etapa === 4 && (
              <div className="pd-step-card">
                <div className="pd-section-head">
                  <h2>Forma de pagamento</h2>
                  <p>Escolha como deseja pagar seu pedido.</p>
                </div>

                <div className="pd-payment-box">
                  <label>
                    Forma de pagamento
                    <select
                      value={pagamento}
                      onChange={(e) => setPagamento(e.target.value)}
                    >
                      <option value="pix">Pix</option>
                      <option value="credito">Cartão de crédito</option>
                      <option value="debito">Cartão de débito</option>
                      <option value="dinheiro">Dinheiro</option>
                    </select>
                  </label>

                  {pagamento === "pix" && (
                    <div className="pd-pix-box">
                      <strong>QR Code Pix</strong>
                      <div className="pd-qr-fake">PIX</div>
                      <p>Código copia e cola:</p>
                      <code>00020126580014BR.GOV.BCB.PIX.PIZZLY</code>
                    </div>
                  )}

                  {(pagamento === "credito" || pagamento === "debito") && (
                    <div className="pd-card-form">
                      <input placeholder="Número do cartão" />
                      <input placeholder="Nome impresso no cartão" />

                      <div>
                        <input placeholder="Validade" />
                        <input placeholder="CVV" />
                      </div>
                    </div>
                  )}

                  {pagamento === "dinheiro" && (
                    <label>
                      Valor em mãos para troco
                      <input
                        type="number"
                        value={valorTroco}
                        onChange={(e) => setValorTroco(e.target.value)}
                        placeholder="Ex: 100"
                      />
                    </label>
                  )}

                  {pagamento === "dinheiro" && valorTroco && (
                    <p className="pd-troco-info">
                      <strong>Troco para:</strong> {fmt(Number(valorTroco))}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pd-step-actions">
              {etapa > 1 && (
                <button className="pd-back-btn" onClick={voltarEtapa}>
                  ← Voltar
                </button>
              )}

              <button
                  className="pd-next-btn"
                  onClick={proximaEtapa}
                  disabled={!configuracoes.aberta}
                >
                {etapa === 4 ? "Confirmar pedido →" : "Próximo →"}
              </button>
            </div>
          </div>

          <ResumoPedido
            carrinho={carrinho}
            subtotal={subtotal}
            total={total}
            taxaEntregaAtual={taxaEntregaAtual}
            cupomAberto={cupomAberto}
            setCupomAberto={setCupomAberto}
            cupom={cupom}
            setCupom={setCupom}
            aplicarCupom={aplicarCupom}
            removerCupom={removerCupom}
            desconto={desconto}
            cupomAplicado={cupomAplicado}
            removerItem={removerItem}
            setCarrinho={setCarrinho}
            etapa={etapa}
            entrega={entrega}
            pagamento={pagamento}
            proximaEtapa={proximaEtapa}
          />
        </section>
      </main>
    </div>
  );
}

function ProdutoCard({ produto, precoAtual, onAdd, pizzariaAberta }) {
  const classeImagem =
    produto.tipoImagem === "contain" ? "pd-img-contain" : "pd-img-cover";

  return (
    <article className={`pd-product-card ${produto.tag ? "featured" : ""}`}>
      {produto.tag && <span className="pd-product-badge">{produto.tag}</span>}

      <div className="pd-product-img-wrap">
        <img src={produto.img} alt={produto.nome} className={classeImagem} />
      </div>

      <div className="pd-product-body">
        <h3>{produto.nome}</h3>
        <p>{produto.desc}</p>

        <div className="pd-product-bottom">
          <strong>{fmt(precoAtual)}</strong>
          <button onClick={onAdd} disabled={!pizzariaAberta}>
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

function ResumoPedido({
  carrinho,
  subtotal,
  total,
  taxaEntregaAtual,
  cupomAberto,
  setCupomAberto,
  cupom,
  setCupom,
  aplicarCupom,
  removerCupom,
  desconto,
  cupomAplicado,
  removerItem,
  setCarrinho,
  etapa,
  entrega,
  pagamento,
  proximaEtapa,
}) {

  const quantidadeItens = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  function textoEntrega() {
  if (entrega.formaRecebimento === "retirada") {
    return "Retirada no balcão";
  }

  return "Entrega";
}

  function textoPagamento() {
    if (pagamento === "pix") return "Pix";
    if (pagamento === "credito") return "Cartão de crédito";
    if (pagamento === "debito") return "Cartão de débito";
    if (pagamento === "dinheiro") return "Dinheiro";
    return "Pix";
  }

  return (
    <aside className="pd-cart">
      <div className="pd-cart-header">
        <div>
          <span>Resumo do pedido</span>
          <strong>{quantidadeItens} item(ns)</strong>
        </div>

        {carrinho.length > 0 && etapa < 3 && (
          <button onClick={() => setCarrinho([])}>Limpar</button>
        )}
      </div>

      {carrinho.length === 0 ? (
        <div className="pd-cart-empty">
          <span>🛒</span>
          <strong>Carrinho vazio</strong>
          <p>Adicione itens do cardápio para começar seu pedido.</p>
        </div>
      ) : (
        <ul className="pd-cart-list">
          {carrinho.map((item) => (
            <li key={item.uid} className="pd-cart-item">
              <img src={item.img} alt={item.produto.nome} />

              <div>
                <strong>
                  {item.quantidade}x {item.produto.nome}
                </strong>
                {item.tamanho && <span>{item.tamanho}</span>}
                <b>{fmt(item.preco * item.quantidade)}</b>
              </div>

              {etapa < 3 && (
                <button onClick={() => removerItem(item.uid)}>×</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {etapa < 4 && (
        <button
          className="pd-coupon-toggle"
          onClick={() => setCupomAberto(!cupomAberto)}
        >
          <span>🏷️ Adicionar cupom</span>
          <span>{cupomAberto ? "▴" : "▾"}</span>
        </button>
      )}

      {cupomAberto && etapa < 4 && (
        <div className="pd-coupon-box">
          <input
            type="text"
            value={cupom}
            onChange={(e) => setCupom(e.target.value)}
            placeholder="Digite o cupom"
            disabled={!!cupomAplicado}
          />

          {cupomAplicado ? (
            <button type="button" onClick={removerCupom}>
              Remover
            </button>
          ) : (
            <button type="button" onClick={aplicarCupom}>
              Aplicar
            </button>
          )}
        </div>
      )}

      {etapa >= 3 && (
        <div className="pd-extra-summary">
          <div>
            <span>Recebimento</span>
            <strong>{textoEntrega()}</strong>
          </div>

          <div>
            <span>Pagamento</span>
            <strong>{textoPagamento()}</strong>
          </div>
        </div>
      )}

      <div className="pd-summary">
        <div>
          <span>Subtotal</span>
          <strong>{fmt(subtotal)}</strong>
        </div>

        {desconto > 0 && (
          <div>
            <span>Desconto {cupomAplicado && `(${cupomAplicado})`}</span>
            <strong>- {fmt(desconto)}</strong>
          </div>
        )}

        <div>
          <span>Taxa de entrega</span>
          <strong>{fmt(taxaEntregaAtual)}</strong>
        </div>

        <div className="pd-summary-total">
          <span>Total</span>
          <strong>{fmt(total)}</strong>
        </div>
      </div>

      {etapa === 1 && carrinho.length > 0 && (
  <button className="pd-cart-next-btn" onClick={proximaEtapa}>
    Continuar Pedido →
  </button>
)}

      <div className="pd-security">
        <span>🛡️</span>
        <p>
          <strong>Compra segura</strong>
          Seus dados são protegidos conosco.
        </p>
      </div>
    </aside>
  );
}