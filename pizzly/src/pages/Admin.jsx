import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; //substitui alerts()
import Swal from "sweetalert2"; //import para modal moderno
import "../assets/css/Admin.css";
import { toastServidorOffline } from "../utils/toastUtils";
import API_URL from "../utils/api";

import { uploadImagem } from "../services/storageService";

// Imagens utilizadas nos produtos e promoções
import pizzaCalabresa from "../assets/images/pizzaCalabresa.jpg";
import pizzaFrango from "../assets/images/pizzaFrango.jpg";
import pizzaPortuguesa from "../assets/images/pizzaPortuguesa.jpg";
import pizzaMarguerita from "../assets/images/pizzaMarguerita.png";

import pizzaHero from "../assets/images/pizzaHero.png";
import comboFamilia from "../assets/images/comboFamilia.png";
import cocaCola2l from "../assets/images/cocaCola.png";
import guarana2l from "../assets/images/guarana.png";
import pudim from "../assets/images/pudim.png";
import pizzaChocolate from "../assets/images/pizzaChocolate.jpg";

{/*react-toastify para mensagens de sucesso, erro e aviso. 
  SweetAlert2 para confirmações de ações importantes. (modal moderno)*/
}




/*CONSTANTES E MAPEAMENTOS*/

// Relaciona a chave salva no banco à imagem importada no front-end
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

// imagens disponíveis para o cadastro de promoções
const IMAGENS_PROMOCOES = {
  comboFamilia,
  calabresa: pizzaCalabresa,
  frango: pizzaFrango,
  portuguesa: pizzaPortuguesa,
  marguerita: pizzaMarguerita,
  quatroQueijos: pizzaHero,
  pizzaChocolate,
};

function obterImagemPromocao(imagem) {
  if (!imagem) {
    return comboFamilia;
  }

  if (imagem.startsWith("http")) {
    return imagem;
  }

  return IMAGENS_PROMOCOES[imagem] || comboFamilia;
}

// relaciona cada status de pedido à sua classe visual no CSS
const STATUS_COLOR = {
  Confirmado: "status-confirmado",
  Preparando: "status-preparando",
  "Saiu para entrega": "status-saiu",
  "Pronto para retirada": "status-pronto-retirada",
  Entregue: "status-entregue",
  Retirado: "status-retirado",
  Cancelado: "status-cancelado",
};


/*FUNÇÕES AUXILIARES DE FORMATAÇÃO E CONVERSÃO */
function moedaParaNumero(valor) {
  if (!valor) return 0;

  return Number(
    String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

function formatarData(data) {
  if (!data) return "Data não informada";

  return new Date(data).toLocaleDateString("pt-BR");
}

function capitalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .split(" ")
    .map(
      (palavra) =>
        palavra.charAt(0).toUpperCase() +
        palavra.slice(1)
    )
    .join(" ");
}

// converte o status recebido do backend para o texto exibido na interface
function converterStatusPedido(status) {
  if (status === "CONFIRMADO") return "Confirmado";
  if (status === "PREPARANDO") return "Preparando";
  if (status === "SAIU_PARA_ENTREGA") return "Saiu para entrega";
  if (status === "PRONTO_PARA_RETIRADA") return "Pronto para retirada";
  if (status === "ENTREGUE") return "Entregue";
  if (status === "RETIRADO") return "Retirado";
  if (status === "CANCELADO") return "Cancelado";

  return "Confirmado";
}

// aqui converte o texto exibido na interface para o enum esperado pelo backend
function converterStatusBackend(status) {
  if (status === "Confirmado") return "CONFIRMADO";
  if (status === "Preparando") return "PREPARANDO";
  if (status === "Saiu para entrega") return "SAIU_PARA_ENTREGA";
  if (status === "Pronto para retirada") {
    return "PRONTO_PARA_RETIRADA";
  }
  if (status === "Entregue") return "ENTREGUE";
  if (status === "Retirado") return "RETIRADO";
  if (status === "Cancelado") return "CANCELADO";

  return "CONFIRMADO";
}

// adapta o formato do produto vindo do backend para o formato usado na tela
function converterProdutoBackend(produto) {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao || "",
    preco: Number(produto.preco).toFixed(2).replace(".", ","),
    categoria: produto.categoriaNome,
    categoriaId: produto.categoriaId,
    imagem: produto.imagem || "calabresa",
    disponivel: produto.disponivel !== false,
  };
}

// adapta a promoção retornada pelo backend ao formato utilizado no painel
function converterPromocaoBackend(promocao) {
  return {
    id: promocao.id,
    titulo: promocao.titulo,
    desc: promocao.descricao || "",
    tag: promocao.tag || "OFERTA",
    imagem: promocao.imagem || "",
    precoAntigo: Number(promocao.precoAntigo || 0)
      .toFixed(2)
      .replace(".", ","),
    precoNovo: Number(promocao.precoPromocional || 0)
      .toFixed(2)
      .replace(".", ","),
    dataInicio: promocao.dataInicio || "",
    dataFim: promocao.dataFim || "",
    ativa: promocao.ativa !== false,
    produtosIds: promocao.produtosIds || [],
    produtosNomes: promocao.produtosNomes || [],
  };
}

function moedaInputParaNumero(valor) {
  return Number(String(valor).replace(",", "."));
}

function converterFormaPagamento(forma) {
  if (forma === "PIX") return "Pix";
  if (forma === "CARTAO_CREDITO") return "Cartão de crédito";
  if (forma === "CARTAO_DEBITO") return "Cartão de débito";
  if (forma === "DINHEIRO") return "Dinheiro";

  return "Não informado";
}



//para fazer o grafico de dados
//renderiza um gráfico de linha em SVG com os valores de vendas do período selecionado
function LineChart({ dados }) {
  const W = 280;
  const H = 100;
  const pad = 10;

  const valores = dados.map((item) => item.valor);
  const max = Math.max(...valores, 1);

  // se tiver só um ponto, duplica para conseguir desenhar uma linha
  const pontos = dados.length === 1
    ? [dados[0], dados[0]]
    : dados;

  const xs = pontos.map((_, i) =>
    pad + (i / (pontos.length - 1)) * (W - 2 * pad)
  );

  const ys = pontos.map((p) =>
    H - pad - (p.valor / max) * (H - 2 * pad)
  );

  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`)
    .join(" ");

  const area = `${path} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  if (dados.length === 0) {
    return (
      <div className="ad-chart-empty">
        Sem dados para o período selecionado
      </div>
    );
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="adLineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c62828" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c62828" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={area} fill="url(#adLineGradient)" />

      <path
        d={path}
        fill="none"
        stroke="#c62828"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill="#c62828" />
      ))}
    </svg>
  );
}


export default function Admin() {
  //Navegação e Estados da Interface
  const navigate = useNavigate();

  // mantém a última aba acessada mesmo após atualizar a página
  const [activeNav, setActiveNav] = useState(() => {
    return localStorage.getItem("pizzly_admin_aba") || "Dashboard";
  });

  const [menuAberto, setMenuAberto] = useState(null);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [buscaPedido, setBuscaPedido] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [arquivoImagemProduto, setArquivoImagemProduto] = useState(null);

  const [periodoResumo, setPeriodoResumo] = useState("todos");

  const [sidebarAberta, setSidebarAberta] = useState(false);


  useEffect(() => {
    localStorage.setItem("pizzly_admin_aba", activeNav);
  }, [activeNav]);

  //AUTENTICAÇÃO E CONTROLE DE PERMISSÕES:

  // usuário autenticado
  const usuarioLogado = JSON.parse(localStorage.getItem("pizzly_usuario"));

  // perfil do funcionário logado
  const perfilFuncionario = usuarioLogado?.perfil || "ATENDENTE";

  // id usado para registrar logs de auditoria no backend
  const funcionarioIdLogado = usuarioLogado?.id;

  // permissões de acesso por perfil
  const permissoesPorPerfil = {
    ADMINISTRADOR: [
      "Dashboard",
      "Pedidos",
      "Clientes",
      "Cardápio",
      "Categorias",
      "Promoções",
      "Relatórios",
      "Funcionários",
      "Auditoria",
      "Configurações",
    ],

    GERENTE: [
      "Dashboard",
      "Pedidos",
      "Clientes",
      "Cardápio",
      "Categorias",
      "Promoções",
      "Relatórios",
    ],

    ATENDENTE: [
      "Dashboard",
      "Pedidos",
      "Clientes",
    ],

    ENTREGADOR: [
      "Dashboard",
      "Pedidos",
    ],
  };

  // impede acesso a abas sem permissão
  useEffect(() => {
    const abasPermitidas =
      permissoesPorPerfil[perfilFuncionario] || [];

    if (!abasPermitidas.includes(activeNav)) {
      setActiveNav("Dashboard");
    }
  }, [activeNav, perfilFuncionario]);


  /*ESTADOS DOS DADOS ADMINISTRATIVOS*/
  const [categorias, setCategorias] = useState([]);

  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const [promocoes, setPromocoes] = useState([]);


  const [promocaoEditando, setPromocaoEditando] = useState(null);

  const [
    arquivoImagemPromocao,
    setArquivoImagemPromocao,
  ] = useState(null);

  const [configuracoes, setConfiguracoes] = useState({
    nomePizzaria: "Pizzly",
    whatsapp: "",
    endereco: "",
    taxaEntrega: "0,00",
    tempoEntrega: "",
    aberta: true,
    temaEscuro: localStorage.getItem("pizzly_admin_tema_escuro") === "true",
  });


  const [produtos, setProdutos] = useState([]);

  const [funcionarios, setFuncionarios] = useState([]);

  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const [logsAuditoria, setLogsAuditoria] = useState([]);

  // armazena as avaliações feitas pelos clientes
  const [avaliacoes, setAvaliacoes] = useState([]);

  // armazena os clientes reais cadastrados no backend
  const [clientesBackend, setClientesBackend] = useState([]);

  useEffect(() => {
    let usuarioAtual = null;

    try {
      usuarioAtual = JSON.parse(
        localStorage.getItem("pizzly_usuario")
      );
    } catch (error) {
      console.error(
        "Erro ao recuperar funcionário autenticado:",
        error
      );

      localStorage.removeItem("pizzly_usuario");
    }

    // somente funcionários podem acessar o painel administrativo
    if (
      !usuarioAtual ||
      usuarioAtual.tipo !== "FUNCIONARIO"
    ) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);


  //aqui é pra exibir um modal de confirmação antes de executar ações importantes
  //retorna true caso o usuário confirme a operação
  async function confirmarAcao(
    titulo,
    texto,
    textoBotao = "Confirmar"
  ) {
    const resultado = await Swal.fire({
      title: titulo,
      text: texto,
      icon: "warning",

      showCancelButton: true,

      confirmButtonText: textoBotao,
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#c62828",
      cancelButtonColor: "#6b7280",

      reverseButtons: true,
      focusCancel: true,
    });

    return resultado.isConfirmed;
  }

  // busca os clientes reais cadastrados no backend
  async function carregarClientes() {
    try {
      const response = await fetch(`${API_URL}/clientes?size=100`)

      if (!response.ok) {
        toast.error("Não foi possível carregar os clientes.");
        return;
      }

      const dados = await response.json();

      setClientesBackend(dados.content || dados);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toastServidorOffline();
    }
  }

  //carrega os pedidos e complementa cada registro com seus itens e dados de pagamento
  async function carregarPedidos() {
    try {
      // busca todos os pedidos reais cadastrados no backend
      const pedidosResponse = await fetch(`${API_URL}/pedidos?size=100`)

      if (!pedidosResponse.ok) {
        const erro = await pedidosResponse.text();
        console.error("Erro ao carregar pedidos:", erro);
        toast.error("Não foi possível carregar os pedidos: " + erro);
        return;
      }

      const pedidosDados = await pedidosResponse.json();
      const pedidosBackend = pedidosDados.content || [];

      // para cada pedido, busca os itens e o pagamento vinculados
      const pedidosFormatados = await Promise.all(
        pedidosBackend.map(async (pedido) => {
          const itensResponse = await fetch(
            `${API_URL}/itens-pedido/pedido/${pedido.id}`
          );

          const pagamentoResponse = await fetch(
            `${API_URL}/pagamentos/pedido/${pedido.id}`
          );

          const itensBackend = itensResponse.ok
            ? await itensResponse.json()
            : [];

          const pagamentoBackend = pagamentoResponse.ok
            ? await pagamentoResponse.json()
            : null;

          const itens = itensBackend.map(
            (item) => `${item.quantidade}x ${item.produtoNome}`
          );

          return {
            id: String(pedido.id),
            idBackend: pedido.id,
            clienteId: pedido.clienteId, // usado para identificar o cliente corretamente
            cliente: pedido.clienteNome || "Cliente Pizzly",
            formaRecebimento: pedido.formaRecebimento,
            itens,
            produtos: `${itens.length} ${itens.length === 1 ? "item" : "itens"}`,
            status: converterStatusPedido(pedido.status),
            tempo:
              pedido.status === "ENTREGUE"
                ? "Entregue"
                : pedido.status === "RETIRADO"
                  ? "Retirado"
                  : pedido.status === "PRONTO_PARA_RETIRADA"
                    ? "Aguardando retirada"
                    : pedido.formaRecebimento === "retirada"
                      ? "25 min"
                      : "30 - 45 min",
            total: formatarMoeda(pedido.total),
            valor: formatarMoeda(pedido.total),
            entrega:
              pedido.formaRecebimento === "retirada"
                ? "Retirada na Pizzly - Unidade Centro"
                : pedido.enderecoId
                  ? `Endereço ID ${pedido.enderecoId}`
                  : "Endereço não informado",
            pagamento: converterFormaPagamento(
              pagamentoBackend?.formaPagamento
            ),
            data: formatarData(pedido.dataPedido),
            dataOriginal: pedido.dataPedido,
            subtotal: formatarMoeda(pedido.subtotal),
            taxaEntrega: formatarMoeda(pedido.taxaEntrega),
            desconto: "R$ 0,00",
            cupomAplicado: "",
            observacaoPedido: pedido.observacao,
            observacaoEntrega: "",
            valorTroco: pagamentoBackend?.valorTroco
              ? formatarMoeda(pagamentoBackend.valorTroco)
              : "",
          };
        })
      );

      setPedidos(pedidosFormatados);
      setUltimaAtualizacao(new Date());
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toastServidorOffline();
    }
  }

  async function carregarProdutos() {
    try {
      // busca os produtos reais cadastrados no backend
      const response = await fetch(`${API_URL}/produtos?size=100`)

      if (!response.ok) {
        toast.error("Não foi possível carregar os produtos.");
        return;
      }

      const dados = await response.json();
      const produtosBackend = dados.content || [];

      setProdutos(produtosBackend.map(converterProdutoBackend));
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toastServidorOffline();
    }
  }

  async function carregarCategorias() {
    try {
      // busca as categorias reais cadastradas no backend
      const response = await fetch(`${API_URL}/categorias?size=100`)

      if (!response.ok) {
        toast.error("Não foi possível carregar as categorias.");
        return;
      }

      const dados = await response.json();
      const categoriasBackend = dados.content || [];

      setCategorias(
        categoriasBackend.map((categoria) => ({
          id: categoria.id,
          nome: categoria.nome,
          descricao: categoria.descricao || "",
          icon: categoria.icon || "🍽️",
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toastServidorOffline();
    }
  }

  //busca as promoções reais no backend
  async function carregarPromocoes() {
    try {
      const response = await fetch(`${API_URL}/promocoes?size=100`)

      if (!response.ok) {
        toast.error("Não foi possível carregar as promoções.");
        return;
      }

      const dados = await response.json();
      const promocoesBackend = dados.content || [];

      setPromocoes(promocoesBackend.map(converterPromocaoBackend));
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
      toastServidorOffline();
    }
  }

  // busca funcionários cadastrados no backend
  async function carregarFuncionarios() {
    try {
      const response = await fetch(`${API_URL}/funcionarios?size=100`)

      if (!response.ok) {
        toast.error("Não foi possível carregar os funcionários.");
        return;
      }

      const dados = await response.json();
      setFuncionarios(dados.content || dados);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toastServidorOffline();
    }
  }

  //busca as avaliações feitas pelos clientes
  async function carregarAvaliacoes() {
    try {
      const response = await fetch(`${API_URL}/avaliacoes?size=100&sort=dataAvaliacao,desc`);

      if (!response.ok) {
        toast.error("Não foi possível carregar as avaliações.");
        return;
      }

      const dados = await response.json();
      setAvaliacoes(dados.content || dados);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      toastServidorOffline();
    }
  }

  // busca os logs de auditoria registrados no backend
  async function carregarLogsAuditoria() {
    try {
      const response = await fetch(`${API_URL}/logs?size=100&sort=dataHora,desc`)

      if (!response.ok) {
        toast.error("Não foi possível carregar os logs de auditoria.");
        return;
      }

      const dados = await response.json();
      setLogsAuditoria(dados.content || dados);
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
      toastServidorOffline();
    }
  }

  function abrirNovoFuncionario() {
    setFuncionarioEditando({
      id: null,
      nome: "",
      email: "",
      telefone: "",
      senha: "",
      matricula: "",
      perfil: "ATENDENTE",
    });
  }

  // cadastra ou atualiza funcionário no backend
  async function salvarFuncionario() {
    if (
      !funcionarioEditando.nome ||
      !funcionarioEditando.email ||
      !funcionarioEditando.senha ||
      !funcionarioEditando.matricula ||
      !funcionarioEditando.perfil
    ) {
      toast.warning("Preencha nome, e-mail, senha, matrícula e perfil.");
      return;
    }

    try {
      const url = funcionarioEditando.id
        ? `${API_URL}/funcionarios/${funcionarioEditando.id}?funcionarioId=${funcionarioIdLogado}`
        : `${API_URL}/funcionarios?funcionarioId=${funcionarioIdLogado}`;

      const metodo = funcionarioEditando.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(funcionarioEditando),
      });

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao salvar funcionário: " + erro);
        return;
      }

      await carregarFuncionarios();
      setFuncionarioEditando(null);
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      toastServidorOffline();
    }
  }

  //carrega as configurações da pizzaria
  async function carregarConfiguracoes() {
    try {
      const response = await fetch(`${API_URL}/configuracoes`);

      if (!response.ok) {
        toast.error("Não foi possível carregar as configurações.");
        return;
      }

      const dados = await response.json();


      setConfiguracoes((configAtual) => ({
        ...configAtual,
        nomePizzaria: dados.nomePizzaria || "Pizzly",
        whatsapp: dados.whatsapp || "",
        endereco: dados.endereco || "",
        taxaEntrega: Number(dados.taxaEntrega || 0)
          .toFixed(2)
          .replace(".", ","),
        tempoEntrega: dados.tempoEntrega || "",
        aberta: dados.aberta === true || dados.aberta === "true",
      }));
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toastServidorOffline();
    }
  }

  //salva as configurações feitas pelo admin
  async function salvarConfiguracoes() {
    try {
      const configuracaoDTO = {
        nomePizzaria: configuracoes.nomePizzaria,
        whatsapp: configuracoes.whatsapp,
        endereco: configuracoes.endereco,
        taxaEntrega: moedaInputParaNumero(configuracoes.taxaEntrega),
        tempoEntrega: configuracoes.tempoEntrega,
        aberta: configuracoes.aberta,
      };

      const response = await fetch(
        `${API_URL}/configuracoes?funcionarioId=${funcionarioIdLogado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configuracaoDTO),
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao salvar configurações: " + erro);
        return;
      }

      await carregarConfiguracoes();
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toastServidorOffline();
    }
  }

  /*Efeitos e Sincronizações: */

  // aqui aplica o tema escolhido no body e salva a preferência localmente
  useEffect(() => {
    if (configuracoes.temaEscuro) {
      document.body.classList.add("dark-admin");
    } else {
      document.body.classList.remove("dark-admin");
    }

    localStorage.setItem(
      "pizzly_admin_tema_escuro",
      configuracoes.temaEscuro ? "true" : "false"
    );

    return () => {
      document.body.classList.remove("dark-admin");
    };
  }, [configuracoes.temaEscuro]);

  // Carrega os dados necessários na abertura do painel
  useEffect(() => {
    carregarPedidos();
    carregarClientes();
    carregarProdutos();
    carregarCategorias();
    carregarPromocoes();
    carregarAvaliacoes();
    carregarFuncionarios();
    carregarConfiguracoes();
    carregarLogsAuditoria();
  }, []);

  // Atualiza os pedidos do Dashboard a cada 30 segundos
  useEffect(() => {
    if (activeNav !== "Dashboard") return;

    const intervalo = setInterval(() => {
      carregarPedidos();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [activeNav]);

  /*Dados calculados e filtros: */

  const estatisticas = useMemo(() => {
    const totalPedidos = pedidos.length;

    const faturamento = pedidos.reduce(
      (soma, pedido) => soma + moedaParaNumero(pedido.total),
      0
    );

    const pizzasVendidas = pedidos.reduce((soma, pedido) => {
      const saboresPizza = [
        "pizza",
        "calabresa",
        "marguerita",
        "portuguesa",
        "frango",
        "4 queijos",
        "chocolate",
        "combo família",
      ];

      return (
        soma +
        (pedido.itens?.reduce((total, item) => {
          const texto = item.toLowerCase();
          const ehPizza = saboresPizza.some((sabor) =>
            texto.includes(sabor)
          );

          if (!ehPizza) return total;

          const quantidade = Number(item.match(/^(\d+)x/i)?.[1]) || 1;

          return total + quantidade;
        }, 0) || 0)
      );
    }, 0);

    const clientesUnicos = new Set(pedidos.map((pedido) => pedido.cliente)).size;

    const porStatus = {
      Confirmado: pedidos.filter(
        (pedido) => pedido.status === "Confirmado"
      ).length,

      Preparando: pedidos.filter(
        (pedido) => pedido.status === "Preparando"
      ).length,

      "Saiu para entrega": pedidos.filter(
        (pedido) => pedido.status === "Saiu para entrega"
      ).length,

      "Pronto para retirada": pedidos.filter(
        (pedido) => pedido.status === "Pronto para retirada"
      ).length,

      Entregue: pedidos.filter(
        (pedido) => pedido.status === "Entregue"
      ).length,

      Retirado: pedidos.filter(
        (pedido) => pedido.status === "Retirado"
      ).length,

      Cancelado: pedidos.filter(
        (pedido) => pedido.status === "Cancelado"
      ).length,
    };

    return {
      totalPedidos,
      faturamento,
      pizzasVendidas,
      clientesUnicos,
      porStatus,
    };
  }, [pedidos]);

  const atividades = useMemo(() => {
    return pedidos.slice(0, 4).map((pedido) => ({
      icon:
        pedido.status === "Entregue" ||
          pedido.status === "Retirado"
          ? "✅"
          : pedido.status === "Cancelado"
            ? "❌"
            : "📦",
      texto: `Pedido ${pedido.id} - ${pedido.status}`,
      tempo: pedido.data,
    }));
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const statusOk =
        filtroStatus === "Todos" || pedido.status === filtroStatus;

      const busca = buscaPedido.toLowerCase();

      const buscaOk =
        String(pedido.id).toLowerCase().includes(busca) ||
        pedido.cliente.toLowerCase().includes(busca) ||
        pedido.itens.join(" ").toLowerCase().includes(busca);

      return statusOk && buscaOk;
    });
  }, [pedidos, filtroStatus, buscaPedido]);

  const clientes = useMemo(() => {
    const mapa = {};

    pedidos.forEach((pedido) => {
      // agora agrupamos pelo ID do cliente, não pelo nome
      const chaveCliente = pedido.clienteId || pedido.cliente;

      const clienteReal = clientesBackend.find(
        (cliente) => cliente.id === pedido.clienteId
      );

      if (!mapa[chaveCliente]) {
        mapa[chaveCliente] = {
          id: pedido.clienteId,
          nome: clienteReal?.nome || pedido.cliente || "Cliente Pizzly",
          email: clienteReal?.email || "E-mail não encontrado",
          telefone: clienteReal?.telefone || "Não cadastrado",
          pedidos: [],
          totalGasto: 0,
          ultimoPedido: pedido.data,
        };
      }

      mapa[chaveCliente].pedidos.push(pedido);
      mapa[chaveCliente].totalGasto += moedaParaNumero(pedido.total);
      mapa[chaveCliente].ultimoPedido = pedido.data;
    });

    return Object.values(mapa);
  }, [pedidos, clientesBackend]);

  const clientesFiltrados = useMemo(() => {
    const busca = buscaCliente.toLowerCase();

    return clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(busca)
    );
  }, [clientes, buscaCliente]);

  // Calcula o ranking dos produtos com maior quantidade vendida
  const produtosMaisVendidos = useMemo(() => {
    const mapa = {};

    pedidos.forEach((pedido) => {
      pedido.itens?.forEach((item) => {
        const quantidade = Number(item.match(/^(\d+)x/i)?.[1]) || 1;

        const nome = item
          .replace(/^(\d+)x\s*/i, "")
          .replace(/\s*\(.*?\)/g, "")
          .trim();

        const produtoCardapio = produtos.find((produto) => {
          const nomeProduto = produto.nome.toLowerCase();
          const nomeItem = nome.toLowerCase().replace("pizza ", "");

          return (
            nomeProduto === nomeItem ||
            nomeProduto.includes(nomeItem) ||
            nomeItem.includes(nomeProduto)
          );
        });

        const precoUnitario = moedaParaNumero(produtoCardapio?.preco || 0);

        if (!mapa[nome]) {
          mapa[nome] = {
            nome,
            quantidade: 0,
            faturamento: 0,
          };
        }

        mapa[nome].quantidade += quantidade;
        mapa[nome].faturamento += quantidade * precoUnitario;
      });
    });

    return Object.values(mapa)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 4);
  }, [pedidos, produtos]);

  const produtosFiltrados = useMemo(() => {
    const busca = buscaProduto.toLowerCase();

    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(busca) ||
        produto.categoria.toLowerCase().includes(busca)
    );
  }, [produtos, buscaProduto]);


  const pedidosResumo = useMemo(() => {
    const hoje = new Date();

    return pedidos.filter((pedido) => {
      if (periodoResumo === "todos") return true;

      const dataPedido = new Date(pedido.dataOriginal);

      if (periodoResumo === "hoje") {
        return dataPedido.toDateString() === hoje.toDateString();
      }

      const dias = periodoResumo === "7dias" ? 7 : 30;

      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - dias);

      return dataPedido >= dataLimite;
    });
  }, [pedidos, periodoResumo]);

  // Calcula o resumo financeiro do período selecionado
  const resumoVendas = useMemo(() => {
    const faturamento = pedidosResumo.reduce(
      (soma, pedido) => soma + moedaParaNumero(pedido.total),
      0
    );

    return {
      totalPedidos: pedidosResumo.length,
      faturamento,
    };
  }, [pedidosResumo]);

  const pedidosAtivosQuantidade = useMemo(() => {
    return pedidos.filter(
      (pedido) =>
        pedido.status !== "Entregue" &&
        pedido.status !== "Retirado" &&
        pedido.status !== "Cancelado"
    ).length;
  }, [pedidos]);

  //agrupa o faturamento por data para alimentar o gráfico de vendas
  const dadosGraficoVendas = useMemo(() => {
    const mapa = {};

    pedidosResumo.forEach((pedido) => {
      if (!pedido.dataOriginal) return;

      const data = new Date(pedido.dataOriginal);

      const chave = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });

      if (!mapa[chave]) {
        mapa[chave] = 0;
      }

      mapa[chave] += moedaParaNumero(pedido.total);
    });

    return Object.entries(mapa).map(([data, valor]) => ({
      data,
      valor,
    }));
  }, [pedidosResumo]);

  //retorna os próximos status permitidos conforme a forma de recebimento: entrega ou retirada no balcão
  function proximosStatus(statusAtual, formaRecebimento) {
    const ehRetirada = formaRecebimento === "retirada";

    const fluxoEntrega = {
      Confirmado: ["Preparando", "Cancelado"],
      Preparando: ["Saiu para entrega", "Cancelado"],
      "Saiu para entrega": ["Entregue", "Cancelado"],
      Entregue: [],
      Cancelado: [],
    };

    const fluxoRetirada = {
      Confirmado: ["Preparando", "Cancelado"],
      Preparando: ["Pronto para retirada", "Cancelado"],
      "Pronto para retirada": ["Retirado", "Cancelado"],
      Retirado: [],
      Cancelado: [],
    };

    const fluxo = ehRetirada ? fluxoRetirada : fluxoEntrega;

    return fluxo[statusAtual] || [];
  }


  const navItems = [
    { icon: "🏠", label: "Dashboard" },
    { icon: "📋", label: "Pedidos", badge: pedidosAtivosQuantidade },
    { icon: "👥", label: "Clientes" },
    { icon: "🍕", label: "Cardápio" },
    { icon: "🗂️", label: "Categorias" },
    { icon: "🏷️", label: "Promoções" },
    { icon: "📊", label: "Relatórios" },
    { icon: "👔", label: "Funcionários" },
    { icon: "🧾", label: "Auditoria" },
    { icon: "⚙️", label: "Configurações" },
  ];

  // exibe apenas as opções permitidas para o perfil logado
  const navItemsPermitidos = navItems.filter((item) =>
    permissoesPorPerfil[perfilFuncionario]?.includes(item.label)
  );

  function abrirModalPedido(pedido) {
    setPedidoEditando(pedido);
    setNovoStatus(pedido.status);
    setMenuAberto(null);
  }

  // atualiza o status do pedido no backend
  async function salvarStatus() {

    if (
      !podeAlterarStatus(
        pedidoEditando.status,
        novoStatus,
        pedidoEditando.formaRecebimento
      )
    ) {
      toast.warning(
        `Não é possível alterar o pedido de "${pedidoEditando.status}" para "${novoStatus}".`
      );
      return;
    }

    try {
      const statusBackend = converterStatusBackend(novoStatus);

      const response = await fetch(
        `${API_URL}/pedidos/${pedidoEditando.idBackend}/status?status=${statusBackend}&funcionarioId=${funcionarioIdLogado}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const erro = await response.text();

        console.error(
          "Erro ao atualizar status do pedido:",
          response.status,
          erro
        );

        toast.error("Não foi possível atualizar o status do pedido.");
        return;
      }

      await carregarPedidos();
      setPedidoEditando(null);
    } catch (error) {
      console.error("Erro ao salvar status:", error);
      toastServidorOffline();
    }
  }


  async function cancelarPedido(pedidoIdBackend) {
    try {
      const response = await fetch(
        `${API_URL}/pedidos/${pedidoIdBackend}/status?status=CANCELADO&funcionarioId=${funcionarioIdLogado}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        toast.error("Não foi possível cancelar o pedido.");
        return;
      }

      await carregarPedidos();
      setMenuAberto(null);
      toast.success("Pedido cancelado com sucesso!");

    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      toastServidorOffline();
    }
  }

  //OPERAÇÕES DE PRODUTOS:

  function abrirNovoProduto() {
    setArquivoImagemProduto(null);

    setProdutoEditando({
      id: null,
      nome: "",
      descricao: "",
      preco: "",
      categoriaId: "",
      categoria: "",
      imagem: "",
      disponivel: true,
    });
  }

  // cadastra ou atualiza um produto no backend
  async function salvarProduto() {
    if (!produtoEditando.nome || !produtoEditando.preco || !produtoEditando.categoriaId) {
      toast.warning("Preencha nome, preço e categoria do produto.");
      return;
    }

    try {
      let urlImagem = produtoEditando.imagem || "";

      if (arquivoImagemProduto) {
        urlImagem = await uploadImagem(
          arquivoImagemProduto,
          "produtos"
        );
      }

      if (!urlImagem) {
        toast.warning("Selecione uma imagem para o produto.");
        return;
      }

      const produtoDTO = {
        nome: produtoEditando.nome,
        descricao: produtoEditando.descricao || "",
        preco: moedaInputParaNumero(produtoEditando.preco),
        imagem: urlImagem,
        disponivel: produtoEditando.disponivel !== false,
        categoriaId: Number(produtoEditando.categoriaId),
      };

      const url = produtoEditando.id
        ? `${API_URL}/produtos/${produtoEditando.id}?funcionarioId=${funcionarioIdLogado}`
        : `${API_URL}/produtos?funcionarioId=${funcionarioIdLogado}`;

      const metodo = produtoEditando.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoDTO),
      });

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao salvar produto: " + erro);
        return;
      }

      await carregarProdutos();
      setProdutoEditando(null);
      setArquivoImagemProduto(null);
      toast.success("Produto salvo com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error(error.message || "Erro ao salvar produto.");
    }
  }

  // remove um produto do banco de dados
  async function excluirProduto(id) {

    const confirmar = await confirmarAcao(
      "Excluir produto?",
      "Esta ação não poderá ser desfeita.",
      "Sim, excluir"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/produtos/${id}?funcionarioId=${funcionarioIdLogado}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao excluir produto: " + erro);
        return;
      }

      await carregarProdutos();
      toast.success("Produto excluído com sucesso!");

    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toastServidorOffline();
    }
  }

  //OPERAÇÕES DE CATEGORIAS:
  function abrirNovaCategoria() {
    setCategoriaEditando({
      id: null,
      nome: "",
      descricao: "",
      icon: "🍕",
    });
  }

  // cadastra ou atualiza uma categoria no backend
  async function salvarCategoria() {
    if (!categoriaEditando.nome) {
      toast.warning("Preencha o nome da categoria.");
      return;
    }

    try {
      const categoriaDTO = {
        nome: categoriaEditando.nome,
        descricao: categoriaEditando.descricao || "",
        icon: categoriaEditando.icon || "🍽️",
      };

      const url = categoriaEditando.id
        ? `${API_URL}/categorias/${categoriaEditando.id}?funcionarioId=${funcionarioIdLogado}`
        : `${API_URL}/categorias?funcionarioId=${funcionarioIdLogado}`;

      const metodo = categoriaEditando.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoriaDTO),
      });

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao salvar categoria: " + erro);
        return;
      }

      await carregarCategorias();
      await carregarProdutos();

      setCategoriaEditando(null);
      toast.success("Categoria salva com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toastServidorOffline();
    }
  }

  // remove uma categoria do banco, desde que não possua produtos vinculados
  async function excluirCategoria(id, nome) {
    const temProduto = produtos.some((produto) => produto.categoria === nome);

    if (temProduto) {
      toast.warning("Não é possível excluir uma categoria que possui produtos.");
      return;
    }

    const confirmar = await confirmarAcao(
      "Excluir categoria?",
      "Esta ação não poderá ser desfeita.",
      "Sim, excluir"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/categorias/${id}?funcionarioId=${funcionarioIdLogado}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao excluir categoria: " + erro);
        return;
      }

      await carregarCategorias();
      toast.success("Categoria excluída com sucesso!");

    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toastServidorOffline();
    }
  }


  //OPERAÇÕES DE PROMOÇÕES:

  function fecharModalPromocao() {
    setPromocaoEditando(null);
    setArquivoImagemPromocao(null);
  }

  function abrirEdicaoPromocao(promocao) {
    setArquivoImagemPromocao(null);
    setPromocaoEditando(promocao);
  }

  function abrirNovaPromocao() {
    setArquivoImagemPromocao(null);

    setPromocaoEditando({
      id: null,
      titulo: "",
      desc: "",
      tag: "OFERTA",
      imagem: "",
      precoAntigo: "",
      precoNovo: "",
      dataInicio: "",
      dataFim: "",
      ativa: true,
      produtosIds: [],
    });
  }

  async function salvarPromocao() {
    if (
      !promocaoEditando.titulo ||
      !promocaoEditando.precoAntigo ||
      !promocaoEditando.precoNovo ||
      !promocaoEditando.dataInicio ||
      !promocaoEditando.dataFim ||
      promocaoEditando.produtosIds.length === 0
    ) {
      toast.warning("Preencha título, preços, datas e selecione pelo menos um produto.");
      return;
    }

    try {
      let urlImagem = promocaoEditando.imagem || "";

      if (arquivoImagemPromocao) {
        urlImagem = await uploadImagem(
          arquivoImagemPromocao,
          "promocoes"
        );
      }

      if (!urlImagem) {
        toast.warning("Selecione uma imagem para a promoção.");
        return;
      }

      const promocaoDTO = {
        titulo: promocaoEditando.titulo,
        descricao: promocaoEditando.desc || "",
        tag: promocaoEditando.tag || "OFERTA",
        imagem: urlImagem,
        precoAntigo: moedaInputParaNumero(promocaoEditando.precoAntigo),
        precoPromocional: moedaInputParaNumero(promocaoEditando.precoNovo),
        dataInicio: promocaoEditando.dataInicio,
        dataFim: promocaoEditando.dataFim,
        ativa: promocaoEditando.ativa,
        produtosIds: promocaoEditando.produtosIds.map(Number),
      };

      const url = promocaoEditando.id
        ? `${API_URL}/promocoes/${promocaoEditando.id}?funcionarioId=${funcionarioIdLogado}`
        : `${API_URL}/promocoes?funcionarioId=${funcionarioIdLogado}`;

      const metodo = promocaoEditando.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promocaoDTO),
      });

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao salvar promoção: " + erro);
        return;
      }

      await carregarPromocoes();
      setPromocaoEditando(null);
      setArquivoImagemPromocao(null);
      toast.success("Promoção salva com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar promoção:", error);
      toast.error(
        error.message || "Erro ao salvar promoção."
      );
    }
  }

  async function excluirPromocao(id) {
    const promocao = promocoes.find((promo) => promo.id === id);

    if (promocao?.ativa) {
      toast.warning("Não é possível excluir uma promoção ativa. Desative a promoção antes de removê-la.");
      return;
    }

    const confirmar = await confirmarAcao(
      "Excluir promoção?",
      "Esta ação não poderá ser desfeita.",
      "Sim, excluir"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/promocoes/${id}?funcionarioId=${funcionarioIdLogado}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao excluir promoção: " + erro);
        return;
      }

      await carregarPromocoes();
      toast.success("Promoção excluída com sucesso!");

    } catch (error) {
      console.error("Erro ao excluir promoção:", error);
      toastServidorOffline();
    }
  }

  //OPERAÇÕES DE FUNCIONÁRIOS:

  // ativa ou inativa funcionário sem apagar o histórico
  async function alterarStatusFuncionario(funcionario) {
    const novoStatus = !funcionario.ativo;

    const confirmar = await confirmarAcao(
      novoStatus ? "Ativar funcionário?" : "Inativar funcionário?",
      novoStatus
        ? "O funcionário voltará a ter acesso ao sistema."
        : "O funcionário perderá o acesso ao sistema.",
      novoStatus ? "Sim, ativar" : "Sim, inativar"
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/funcionarios/${funcionario.id}/status?ativo=${novoStatus}&funcionarioId=${funcionarioIdLogado}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const erro = await response.text();
        toast.error("Erro ao alterar status do funcionário: " + erro);
        return;
      }

      await carregarFuncionarios();
      toast.success(
        novoStatus
          ? "Funcionário ativado com sucesso!"
          : "Funcionário inativado com sucesso!"
      );

    } catch (error) {
      console.error("Erro ao alterar status do funcionário:", error);
      toastServidorOffline();
    }
  }

  // verifica se a transição escolhida faz parte do fluxo permitido
  function podeAlterarStatus(
    statusAtual,
    novoStatus,
    formaRecebimento
  ) {
    return proximosStatus(
      statusAtual,
      formaRecebimento
    ).includes(novoStatus);
  }

  function sair() {
    localStorage.removeItem("pizzly_usuario");
    localStorage.removeItem("pizzly_admin_aba");

    window.dispatchEvent(
      new Event("pizzlyUsuarioAtualizado")
    );

    navigate("/login", {
      replace: true,
    });
  }

  //RENDERIZAÇÃO RESPONSIVA DAS ABAS:
  // Os cards são utilizados no mobile e as tabelas no desktop

  function renderCardsPedidos(lista) {
    return (
      <div className="ad-pedido-cards">
        {lista.map((pedido) => (
          <div key={pedido.id} className="ad-pedido-card">
            <div className="ad-pedido-card-top">
              <strong>{pedido.id}</strong>
              <span className={`ad-status ${STATUS_COLOR[pedido.status]}`}>
                {pedido.status}
              </span>
            </div>

            <p><strong>Cliente:</strong> {pedido.cliente}</p>
            <p><strong>Produtos:</strong> {pedido.produtos}</p>
            <p><strong>Tempo:</strong> {pedido.tempo}</p>
            <p><strong>Valor:</strong> {pedido.total}</p>

            <div className="ad-pedido-card-actions">
              <button onClick={() => abrirModalPedido(pedido)}>
                Ver / editar
              </button>

              <button onClick={() => cancelarPedido(pedido.idBackend)}>
                Cancelar
              </button>
            </div>
          </div>
        ))}

        {lista.length === 0 && (
          <div className="ad-pedido-card">
            <strong>Nenhum pedido encontrado.</strong>
          </div>
        )}
      </div>
    );
  }

  function renderTabelaPedidos(lista) {
    return (
      <>
        {renderCardsPedidos(lista)}

        <div className="ad-table-wrap ad-pedidos-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Status</th>
                <th>Tempo</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {lista.map((pedido) => (
                <tr key={pedido.id}>
                  <td>
                    <strong>{pedido.id}</strong>
                  </td>
                  <td>{pedido.cliente}</td>
                  <td>{pedido.produtos}</td>
                  <td>
                    <span className={`ad-status ${STATUS_COLOR[pedido.status]}`}>
                      {pedido.status}
                    </span>
                  </td>
                  <td>{pedido.tempo}</td>
                  <td>{pedido.total}</td>
                  <td className="ad-actions">
                    <button
                      className="ad-dots"
                      onClick={() =>
                        setMenuAberto(
                          menuAberto === pedido.id ? null : pedido.id
                        )
                      }
                    >
                      ⋮
                    </button>

                    {menuAberto === pedido.id && (
                      <div className="ad-dropdown">
                        <button onClick={() => abrirModalPedido(pedido)}>
                          👁️ Ver / editar
                        </button>

                        <button onClick={() => cancelarPedido(pedido.idBackend)}>
                          ❌ Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {lista.length === 0 && (
                <tr>
                  <td colSpan="7">Nenhum pedido encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  //CONTEÚDO DAS ABAS:

  function DashboardContent() {
    return (
      <>
        <div className="ad-kpis">
          {[
            {
              ico: "🛍️",
              label: "Pedidos hoje",
              val: estatisticas.totalPedidos,
              delta: "Pedidos cadastrados",
              bg: "#fff5f5",
              ic: "#c62828",
            },
            {
              ico: "💲",
              label: "Faturamento",
              val: `R$ ${estatisticas.faturamento
                .toFixed(2)
                .replace(".", ",")}`,
              delta: "Total em pedidos",
              bg: "#fffbeb",
              ic: "#b8860b",
            },
            {
              ico: "👥",
              label: "Clientes",
              val: estatisticas.clientesUnicos,
              delta: "Clientes únicos",
              bg: "#f0fdf4",
              ic: "#2e7d32",
            },
            {
              ico: "🍕",
              label: "Pizzas vendidas",
              val: estatisticas.pizzasVendidas,
              delta: "Itens de pizza",
              bg: "#f5f0ff",
              ic: "#7b1fa2",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="ad-kpi-card">
              <div
                className="ad-kpi-icon"
                style={{ background: kpi.bg, color: kpi.ic }}
              >
                {kpi.ico}
              </div>

              <div>
                <p className="ad-kpi-label">{kpi.label}</p>
                <strong className="ad-kpi-val">{kpi.val}</strong>
                <p className="ad-kpi-delta">↑ {kpi.delta}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ad-main-grid">
          <div className="ad-col-main">
            <div className="ad-card">
              <div className="ad-card-hdr">
                <strong>Pedidos recentes</strong>
                <button
                  className="ad-link-btn"
                  onClick={() => setActiveNav("Pedidos")}
                >
                  Ver todos
                </button>
              </div>

              {renderTabelaPedidos(pedidos.slice(0, 5))}
            </div>

            <div className="ad-second-row">
              <div className="ad-card">
                <div className="ad-card-hdr">
                  <strong>Status dos pedidos</strong>
                  <button className="ad-link-btn">Atualizado agora</button>
                </div>

                <ul className="ad-atividade">
                  {Object.entries(estatisticas.porStatus).map(
                    ([status, qtd]) => (
                      <li key={status} className="ad-ativ-item">
                        <span className="ad-ativ-icon">📌</span>
                        <span className="ad-ativ-texto">{status}</span>
                        <span className="ad-ativ-tempo">{qtd}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="ad-card">
                <div className="ad-card-hdr">
                  <strong>Atividade recente</strong>
                  <button
                    className="ad-link-btn"
                    onClick={() => setActiveNav("Pedidos")}
                  >
                    Ver todas
                  </button>
                </div>

                <ul className="ad-atividade">
                  {atividades.map((atividade, index) => (
                    <li key={index} className="ad-ativ-item">
                      <span className="ad-ativ-icon">{atividade.icon}</span>
                      <span className="ad-ativ-texto">{atividade.texto}</span>
                      <span className="ad-ativ-tempo">{atividade.tempo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-card-hdr">
                <strong>Produtos mais vendidos</strong>
                <button
                  className="ad-link-btn"
                  onClick={() => setActiveNav("Relatórios")}
                >
                  Ver relatório
                </button>
              </div>

              <ul className="ad-top-list">
                {produtosMaisVendidos.map((produto, index) => (
                  <li key={produto.nome} className="ad-top-item">
                    <span className="ad-top-rank">{index + 1}</span>

                    <div className="ad-top-info">
                      <strong>{produto.nome}</strong>
                      <span>{produto.quantidade} venda(s)</span>
                    </div>

                    <span className="ad-top-val">
                      R$ {produto.faturamento.toFixed(2).replace(".", ",")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ad-col-side">
            <div className="ad-card">
              <div className="ad-card-hdr">
                <strong>Resumo de vendas</strong>
                <select className="ad-period-select"
                  value={periodoResumo}
                  onChange={(e) => setPeriodoResumo(e.target.value)}
                >
                  <option value="todos">Todos os pedidos</option>
                  <option value="hoje">Hoje</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                </select>
              </div>

              <p className="ad-fat-label">Faturamento</p>
              <strong className="ad-fat-val">
                R$ {resumoVendas.faturamento.toFixed(2).replace(".", ",")}
              </strong>
              <p className="ad-fat-delta">{resumoVendas.totalPedidos} pedido(s) no período selecionado</p>

              <div className="ad-chart-wrap">
                <LineChart dados={dadosGraficoVendas} />
              </div>

              {/*mudando labels fixas para atuais*/}
              <div className="ad-chart-labels">
                {dadosGraficoVendas.map((item) => (
                  <span key={item.data}>{item.data}</span>
                ))}
              </div>
            </div>

            <div className="ad-card">
              <strong className="ad-card-title">Atalhos rápidos</strong>

              <div className="ad-atalhos">
                {[
                  { ico: "📋", label: "Ver pedidos", nav: "Pedidos", bg: "#fff5f5", color: "#c62828" },
                  { ico: "🍕", label: "Cardápio", nav: "Cardápio", bg: "#fffbeb", color: "#b8860b" },
                  { ico: "🏷️", label: "Promoções", nav: "Promoções", bg: "#f0fdf4", color: "#2e7d32" },
                  { ico: "📊", label: "Relatórios", nav: "Relatórios", bg: "#f5f0ff", color: "#7b1fa2" },
                ].map((atalho) => (
                  <button
                    key={atalho.label}
                    className="ad-atalho-btn"
                    style={{ background: atalho.bg }}
                    onClick={() => setActiveNav(atalho.nav)}
                  >
                    <span
                      className="ad-atalho-ico"
                      style={{ color: atalho.color }}
                    >
                      {atalho.ico}
                    </span>
                    <span className="ad-atalho-label">{atalho.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ad-card">
              <strong className="ad-card-title">Alertas</strong>

              <ul className="ad-atividade">
                <li className="ad-ativ-item">
                  <span className="ad-ativ-icon">⚠️</span>
                  <span className="ad-ativ-texto">
                    {estatisticas.porStatus.Confirmado} pedido(s) aguardando preparo
                  </span>
                </li>

                <li className="ad-ativ-item">
                  <span className="ad-ativ-icon">🚚</span>
                  <span className="ad-ativ-texto">
                    {estatisticas.porStatus["Saiu para entrega"]} pedido(s) em entrega
                  </span>
                </li>

                <li className="ad-ativ-item">
                  <span className="ad-ativ-icon">🏷️</span>
                  <span className="ad-ativ-texto">
                    Revise promoções ativas da semana
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  }

  function PedidosContent() {
    return (
      <div className="ad-card">
        <div className="ad-card-hdr">
          <div>
            <strong>Gerenciar pedidos</strong>
            <p className="ad-greeting-sub">
              Busque, filtre e atualize o status dos pedidos recebidos.
            </p>
          </div>

          <span className="ad-update-info">
            Última atualização:{" "}
            {ultimaAtualizacao.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>

        </div>

        <div className="ad-filters">
          <input
            type="text"
            value={buscaPedido}
            onChange={(e) => setBuscaPedido(e.target.value)}
            placeholder="Buscar por pedido, cliente ou item..."
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Preparando">Preparando</option>
            <option value="Saiu para entrega">Saiu para entrega</option>
            <option value="Pronto para retirada">Pronto para retirada</option>
            <option value="Entregue">Entregue</option>
            <option value="Retirado">Retirado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {renderTabelaPedidos(pedidosFiltrados)}
      </div>
    );
  }

  function renderCardsClientes(lista) {
    return (
      <div className="ad-cliente-cards">
        {lista.map((cliente) => (
          <div key={cliente.id || cliente.nome} className="ad-cliente-card">
            <div className="ad-cliente-card-top">
              <strong>{cliente.nome}</strong>
              <span>{cliente.pedidos.length} pedido(s)</span>
            </div>

            <p><strong>Email:</strong> {cliente.email}</p>
            <p><strong>Telefone:</strong> {cliente.telefone}</p>
            <p>
              <strong>Total gasto:</strong> R$ {cliente.totalGasto.toFixed(2).replace(".", ",")}
            </p>
            <p><strong>Último pedido:</strong> {cliente.ultimoPedido}</p>

            <button
              className="ad-cliente-card-btn"
              onClick={() => setClienteSelecionado(cliente)}
            >
              Ver detalhes
            </button>
          </div>
        ))}

        {lista.length === 0 && (
          <div className="ad-cliente-card">
            <strong>Nenhum cliente encontrado.</strong>
          </div>
        )}
      </div>
    );
  }

  function ClientesContent() {
    const melhorCliente =
      clientes.length > 0
        ? clientes.reduce((maior, cliente) =>
          cliente.totalGasto > maior.totalGasto ? cliente : maior
        )
        : { nome: "Nenhum", totalGasto: 0 };

    return (
      <>
        <div className="ad-kpis">
          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#f0fdf4", color: "#2e7d32" }}>
              👥
            </div>
            <div>
              <p className="ad-kpi-label">Clientes</p>
              <strong className="ad-kpi-val">{clientes.length}</strong>
              <p className="ad-kpi-delta">Clientes únicos</p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#fff5f5", color: "#c62828" }}>
              🛍️
            </div>
            <div>
              <p className="ad-kpi-label">Pedidos vinculados</p>
              <strong className="ad-kpi-val">{pedidos.length}</strong>
              <p className="ad-kpi-delta">Total de pedidos</p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#fffbeb", color: "#b8860b" }}>
              ⭐
            </div>
            <div>
              <p className="ad-kpi-label">Melhor cliente</p>
              <strong className="ad-kpi-val">{melhorCliente.nome}</strong>
              <p className="ad-kpi-delta">
                R$ {melhorCliente.totalGasto.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-hdr">
            <div>
              <strong>Gerenciar clientes</strong>
              <p className="ad-greeting-sub">
                Visualize clientes, total gasto e histórico de pedidos.
              </p>
            </div>
          </div>

          <div className="ad-filters">
            <input
              type="text"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              placeholder="Buscar cliente pelo nome..."
            />
          </div>

          {renderCardsClientes(clientesFiltrados)}

          <div className="ad-table-wrap ad-clientes-table">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Pedidos</th>
                  <th>Total gasto</th>
                  <th>Último pedido</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id || cliente.nome}>
                    <td>
                      <strong>{cliente.nome}</strong>
                    </td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefone}</td>
                    <td>{cliente.pedidos.length}</td>
                    <td>
                      R$ {cliente.totalGasto.toFixed(2).replace(".", ",")}
                    </td>
                    <td>{cliente.ultimoPedido}</td>
                    <td>
                      <button
                        className="ad-link-btn"
                        onClick={() => setClienteSelecionado(cliente)}
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}

                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7">Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  function renderCardsProdutos(lista) {
    return (
      <div className="ad-produto-cards">
        {lista.map((produto) => (
          <div key={produto.id} className="ad-produto-card">
            <img
              src={
                produto.imagem?.startsWith("http")
                  ? produto.imagem
                  : IMAGENS_PRODUTOS[produto.imagem] || pizzaHero
              }
              alt={produto.nome}
              className="ad-produto-card-img"
            />
            <div className="ad-produto-card-top">
              <strong>{produto.nome}</strong>
              <span>{produto.categoria}</span>
            </div>

            <p>
              <strong>Preço:</strong> R$ {produto.preco}
            </p>

            <div className="ad-produto-card-actions">
              <button onClick={() => setProdutoEditando(produto)}>
                Editar
              </button>

              <button onClick={() => excluirProduto(produto.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}

        {lista.length === 0 && (
          <div className="ad-produto-card">
            <strong>Nenhum produto encontrado.</strong>
          </div>
        )}
      </div>
    );
  }

  function CardapioContent() {
    return (
      <div className="ad-card">
        <div className="ad-card-hdr">
          <div>
            <strong>Gerenciar cardápio</strong>
            <p className="ad-greeting-sub">
              Cadastre, edite e remova produtos disponíveis no cardápio.
            </p>
          </div>

          <button className="ad-save-btn" onClick={abrirNovoProduto}>
            + Novo produto
          </button>
        </div>

        <div className="ad-filters">

          <input
            type="text"
            value={buscaProduto}
            onChange={(e) => setBuscaProduto(e.target.value)}
            placeholder="Buscar produto ou categoria..."
          />
        </div>

        {renderCardsProdutos(produtosFiltrados)}

        <div className="ad-table-wrap ad-produtos-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {produtosFiltrados.map((produto) => (
                <tr key={produto.id}>
                  <td>
                    <img
                      src={
                        produto.imagem?.startsWith("http")
                          ? produto.imagem
                          : IMAGENS_PRODUTOS[produto.imagem] || pizzaHero
                      }
                      alt={produto.nome}
                      className="ad-produto-thumb"
                    />
                  </td>

                  <td>
                    <strong>{produto.nome}</strong>
                  </td>
                  <td>{produto.categoria}</td>
                  <td>R$ {produto.preco}</td>
                  <td>
                    <button
                      className="ad-link-btn"
                      onClick={() => setProdutoEditando(produto)}
                    >
                      Editar
                    </button>

                    <button
                      className="ad-link-btn"
                      onClick={() => excluirProduto(produto.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderCardsCategorias(lista) {
    return (
      <div className="ad-categoria-cards">
        {lista.map((categoria) => {
          const totalProdutos = produtos.filter(
            (produto) => produto.categoria === categoria.nome
          ).length;

          return (
            <div key={categoria.id} className="ad-categoria-card">
              <div className="ad-categoria-card-top">
                <span>{categoria.icon}</span>
                <strong>{capitalizarTexto(categoria.nome)}</strong>
              </div>

              <p>
                <strong>Produtos vinculados:</strong> {totalProdutos}
              </p>

              <div className="ad-categoria-card-actions">
                <button onClick={() => setCategoriaEditando(categoria)}>
                  Editar
                </button>

                <button
                  onClick={() => excluirCategoria(categoria.id, categoria.nome)}
                >
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function CategoriasContent() {
    return (
      <div className="ad-card">
        <div className="ad-card-hdr">
          <div>
            <strong>Gerenciar categorias</strong>
            <p className="ad-greeting-sub">
              Crie, edite e organize as categorias do cardápio.
            </p>
          </div>

          <button className="ad-save-btn" onClick={abrirNovaCategoria}>
            + Nova categoria
          </button>
        </div>

        {renderCardsCategorias(categorias)}
        <div className="ad-table-wrap ad-categorias-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Ícone</th>
                <th>Categoria</th>
                <th>Produtos vinculados</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {categorias.map((categoria) => {
                const totalProdutos = produtos.filter(
                  (produto) => produto.categoria === categoria.nome
                ).length;

                return (
                  <tr key={categoria.id}>
                    <td>{categoria.icon}</td>
                    <td>
                      <strong>{categoria.nome}</strong>
                    </td>
                    <td>{totalProdutos}</td>
                    <td>
                      <button
                        className="ad-link-btn"
                        onClick={() => setCategoriaEditando(categoria)}
                      >
                        Editar
                      </button>

                      <button
                        className="ad-link-btn"
                        onClick={() =>
                          excluirCategoria(categoria.id, categoria.nome)
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderCardsPromocoes(lista) {
    return (
      <div className="ad-promocao-cards">
        {lista.map((promo) => (
          <div key={promo.id} className="ad-promocao-card">
            <img
              src={obterImagemPromocao(promo.imagem)}
              alt={promo.titulo}
              className="ad-promocao-card-img"
            />
            <div className="ad-promocao-card-top">
              <strong>{promo.titulo}</strong>
              <span>{promo.ativa ? "Ativa" : "Inativa"}</span>
            </div>

            <p>{promo.desc}</p>

            <p>
              <strong>Preço promocional:</strong> R$ {promo.precoNovo}
            </p>

            <p>
              <strong>Período:</strong> {promo.dataInicio} até {promo.dataFim}
            </p>

            <p>
              <strong>Produtos:</strong>{" "}
              {promo.produtosNomes?.join(", ") || "Nenhum produto"}
            </p>

            <div className="ad-promocao-card-actions">
              <button onClick={() => abrirEdicaoPromocao(promo)}>
                Editar
              </button>

              <button onClick={() => excluirPromocao(promo.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function PromocoesContent() {
    return (
      <div className="ad-card">
        <div className="ad-card-hdr">
          <div>
            <strong>Gerenciar promoções</strong>
            <p className="ad-greeting-sub">
              Crie, edite e remova ofertas especiais da Pizzly.
            </p>
          </div>

          <button className="ad-save-btn" onClick={abrirNovaPromocao}>
            + Nova promoção
          </button>
        </div>

        {renderCardsPromocoes(promocoes)}
        <div className="ad-table-wrap ad-promocoes-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Promoção</th>
                <th>Preço</th>
                <th>Período</th>
                <th>Status</th>
                <th>Produtos</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {promocoes.map((promo) => (
                <tr key={promo.id}>
                  <td>
                    <div className="ad-promocao-info">
                      <img
                        src={obterImagemPromocao(promo.imagem)}
                        alt={promo.titulo}
                        className="ad-promocao-thumb"
                      />

                      <div className="ad-promocao-info-texto">
                        <strong>{promo.titulo}</strong>
                        <small>{promo.desc}</small>
                      </div>
                    </div>
                  </td>

                  <td>R$ {promo.precoNovo}</td>

                  <td>
                    {promo.dataInicio} até {promo.dataFim}
                  </td>

                  <td>{promo.ativa ? "Ativa" : "Inativa"}</td>

                  <td>{promo.produtosNomes?.join(", ") || "Nenhum produto"}</td>

                  <td>
                    <button
                      className="ad-link-btn"
                      onClick={() => abrirEdicaoPromocao(promo)}
                    >
                      Editar
                    </button>

                    <button
                      className="ad-link-btn"
                      onClick={() => excluirPromocao(promo.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {promocoes.length === 0 && (
                <tr>
                  <td colSpan="6">Nenhuma promoção cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderCardsAvaliacoes(lista) {
    return (
      <div className="ad-avaliacao-cards">
        {lista.map((avaliacao) => (
          <div key={avaliacao.id} className="ad-avaliacao-card">
            <div className="ad-avaliacao-card-top">
              <strong>
                {avaliacao.clienteNome || "Cliente"}
              </strong>

              <span
                className="ad-avaliacao-nota"
                aria-label={`${avaliacao.nota} de 5 estrelas`}
              >
                {"⭐".repeat(Number(avaliacao.nota) || 0)}
              </span>
            </div>

            <p>
              <strong>Pedido:</strong>{" "}
              #{avaliacao.pedidoId || "Não informado"}
            </p>

            <p className="ad-avaliacao-comentario">
              <strong>Comentário:</strong>{" "}
              {avaliacao.comentario || "Nenhum comentário informado."}
            </p>

            <p className="ad-avaliacao-data">
              <strong>Data:</strong>{" "}
              {avaliacao.dataAvaliacao
                ? new Date(avaliacao.dataAvaliacao).toLocaleString("pt-BR")
                : "Não informada"}
            </p>
          </div>
        ))}

        {lista.length === 0 && (
          <div className="ad-avaliacao-card">
            <strong>Nenhuma avaliação encontrada.</strong>
          </div>
        )}
      </div>
    );
  }

  function RelatoriosContent() {
    const ticketMedio =
      estatisticas.totalPedidos > 0
        ? estatisticas.faturamento / estatisticas.totalPedidos
        : 0;

    const totalDescontos = pedidos.reduce(
      (soma, pedido) => soma + moedaParaNumero(pedido.desconto),
      0
    );

    const totalTaxasEntrega = pedidos.reduce(
      (soma, pedido) => soma + moedaParaNumero(pedido.taxaEntrega),
      0
    );

    const produtosVendidos = {};
    const pagamentos = {};

    pedidos.forEach((pedido) => {
      pagamentos[pedido.pagamento] = (pagamentos[pedido.pagamento] || 0) + 1;

      pedido.itens?.forEach((item) => {
        const quantidade = Number(item.match(/^(\d+)x/i)?.[1]) || 1;
        const nome = item.replace(/^(\d+)x\s*/i, "").replace(/\s*\(.*?\)/g, "");

        produtosVendidos[nome] = (produtosVendidos[nome] || 0) + quantidade;
      });
    });

    const rankingProdutos = Object.entries(produtosVendidos)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    const rankingClientes = [...clientes]
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, 5);

    const rankingPagamentos = Object.entries(pagamentos)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const melhorCliente = rankingClientes[0];
    const pagamentoMaisUsado = rankingPagamentos[0];

    return (
      <>
        <div className="ad-kpis">
          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#fffbeb", color: "#b8860b" }}>
              💰
            </div>
            <div>
              <p className="ad-kpi-label">Faturamento</p>
              <strong className="ad-kpi-val">
                R$ {estatisticas.faturamento.toFixed(2).replace(".", ",")}
              </strong>
              <p className="ad-kpi-delta">Total vendido</p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#fff5f5", color: "#c62828" }}>
              🛍️
            </div>
            <div>
              <p className="ad-kpi-label">Pedidos</p>
              <strong className="ad-kpi-val">{estatisticas.totalPedidos}</strong>
              <p className="ad-kpi-delta">Pedidos registrados</p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#f0fdf4", color: "#2e7d32" }}>
              📊
            </div>
            <div>
              <p className="ad-kpi-label">Ticket médio</p>
              <strong className="ad-kpi-val">
                R$ {ticketMedio.toFixed(2).replace(".", ",")}
              </strong>
              <p className="ad-kpi-delta">Média por pedido</p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#f5f0ff", color: "#7b1fa2" }}>
              ⭐
            </div>
            <div>
              <p className="ad-kpi-label">Cliente destaque</p>
              <strong className="ad-kpi-val">
                {melhorCliente?.nome || "Nenhum"}
              </strong>
              <p className="ad-kpi-delta">
                R$ {(melhorCliente?.totalGasto || 0).toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: "#fff5f5", color: "#c62828" }}>
              🍕
            </div>
            <div>
              <p className="ad-kpi-label">Pizzas vendidas</p>
              <strong className="ad-kpi-val">{estatisticas.pizzasVendidas}</strong>
              <p className="ad-kpi-delta">Itens de pizza</p>
            </div>
          </div>

          <div className="ad-kpi-card">
            <div
              className="ad-kpi-icon"
              style={{ background: "#f0fdf4", color: "#2e7d32" }}
            >
              🏆
            </div>

            <div>
              <p className="ad-kpi-label">Produto campeão</p>

              <strong className="ad-kpi-val">
                {rankingProdutos[0]?.nome || "Nenhum"}
              </strong>

              <p className="ad-kpi-delta">
                {rankingProdutos[0]?.quantidade || 0} vendas
              </p>
            </div>
          </div>
        </div>

        <div className="ad-main-grid">
          <div className="ad-card">
            <div className="ad-card-hdr">
              <strong>Produtos mais vendidos</strong>
            </div>

            <ul className="ad-atividade">
              {rankingProdutos.map((produto, index) => (
                <li key={produto.nome} className="ad-ativ-item">
                  <span className="ad-ativ-icon">#{index + 1}</span>
                  <span className="ad-ativ-texto">{produto.nome}</span>
                  <span className="ad-ativ-tempo">{produto.quantidade}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ad-card">
            <div className="ad-card-hdr">
              <strong>Clientes que mais compraram</strong>
            </div>

            <ul className="ad-atividade">
              {rankingClientes.map((cliente, index) => (
                <li key={cliente.nome} className="ad-ativ-item">
                  <span className="ad-ativ-icon">#{index + 1}</span>
                  <span className="ad-ativ-texto">{cliente.nome}</span>
                  <span className="ad-ativ-tempo">
                    R$ {cliente.totalGasto.toFixed(2).replace(".", ",")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ad-card">
            <div className="ad-card-hdr">
              <strong>Pedidos por status</strong>
            </div>

            <ul className="ad-atividade">
              {Object.entries(estatisticas.porStatus).map(([status, qtd]) => (
                <li key={status} className="ad-ativ-item">
                  <span className="ad-ativ-icon">📌</span>
                  <span className="ad-ativ-texto">{status}</span>
                  <span className="ad-ativ-tempo">{qtd}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ad-card">
            <div className="ad-card-hdr">
              <strong>Resumo financeiro</strong>
            </div>

            <ul className="ad-atividade">
              <li className="ad-ativ-item">
                <span className="ad-ativ-icon">💰</span>
                <span className="ad-ativ-texto">Faturamento bruto</span>
                <span className="ad-ativ-tempo">
                  R$ {estatisticas.faturamento.toFixed(2).replace(".", ",")}
                </span>
              </li>

              <li className="ad-ativ-item">
                <span className="ad-ativ-icon">🚚</span>
                <span className="ad-ativ-texto">Taxas de entrega</span>
                <span className="ad-ativ-tempo">
                  R$ {totalTaxasEntrega.toFixed(2).replace(".", ",")}
                </span>
              </li>

              <li className="ad-ativ-item">
                <span className="ad-ativ-icon">🏷️</span>
                <span className="ad-ativ-texto">Descontos aplicados</span>
                <span className="ad-ativ-tempo">
                  R$ {totalDescontos.toFixed(2).replace(".", ",")}
                </span>
              </li>
            </ul>
          </div>

          <div className="ad-card">
            <div className="ad-card-hdr">
              <strong>Formas de pagamento</strong>
            </div>

            <ul className="ad-atividade">
              {rankingPagamentos.map((pagamento) => (
                <li key={pagamento.nome} className="ad-ativ-item">
                  <span className="ad-ativ-icon">💳</span>
                  <span className="ad-ativ-texto">{pagamento.nome}</span>
                  <span className="ad-ativ-tempo">
                    {pagamento.quantidade}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-hdr">
            <div>
              <strong>Avaliações dos clientes</strong>

              <p className="ad-greeting-sub">
                Acompanhe as notas e comentários enviados após os pedidos.
              </p>
            </div>

            <button className="ad-save-btn" onClick={carregarAvaliacoes}>
              Atualizar
            </button>
          </div>

          {renderCardsAvaliacoes(avaliacoes)}

          <div className="ad-table-wrap ad-avaliacoes-table">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Pedido</th>
                  <th>Nota</th>
                  <th>Comentário</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {avaliacoes.map((avaliacao) => (
                  <tr key={avaliacao.id}>
                    <td>{avaliacao.clienteNome}</td>
                    <td>#{avaliacao.pedidoId}</td>
                    <td>{"⭐".repeat(avaliacao.nota)}</td>
                    <td>{avaliacao.comentario || "Sem comentário"}</td>

                    <td>
                      {new Date(
                        avaliacao.dataAvaliacao
                      ).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}

                {avaliacoes.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      Nenhuma avaliação registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </>
    );
  }

  function renderCardsFuncionarios(lista) {
    return (
      <div className="ad-funcionario-cards">
        {lista.map((funcionario) => (
          <div key={funcionario.id} className="ad-funcionario-card">
            <div className="ad-funcionario-card-top">
              <strong>{funcionario.nome}</strong>

              <span
                className={
                  funcionario.ativo
                    ? "ad-status-funcionario ativo"
                    : "ad-status-funcionario inativo"
                }
              >
                {funcionario.ativo ? "🟢 Ativo" : "🔴 Inativo"}
              </span>
            </div>

            <p><strong>Email:</strong> {funcionario.email}</p>
            <p><strong>Telefone:</strong> {funcionario.telefone}</p>
            <p><strong>Matrícula:</strong> {funcionario.matricula}</p>
            <p><strong>Perfil:</strong> {funcionario.perfil}</p>

            <div className="ad-funcionario-card-actions">
              <button onClick={() => setFuncionarioEditando(funcionario)}>
                Editar
              </button>

              <button
                className={
                  funcionario.ativo
                    ? "ad-btn-inativar"
                    : "ad-btn-ativar"
                }
                onClick={() => alterarStatusFuncionario(funcionario)}
              >
                {funcionario.ativo ? "Inativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}

        {lista.length === 0 && (
          <div className="ad-funcionario-card">
            <strong>Nenhum funcionário cadastrado.</strong>
          </div>
        )}
      </div>
    );
  }

  function FuncionariosContent() {
    return (
      <div className="ad-card">
        <div className="ad-card-hdr">
          <div>
            <strong>Gerenciar funcionários</strong>
            <p className="ad-greeting-sub">
              Cadastre funcionários e defina o perfil de acesso ao painel.
            </p>
          </div>

          <button className="ad-save-btn" onClick={abrirNovoFuncionario}>
            + Novo funcionário
          </button>
        </div>

        {renderCardsFuncionarios(funcionarios)}
        <div className="ad-table-wrap ad-funcionarios-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Matrícula</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {funcionarios.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>
                    <strong>{funcionario.nome}</strong>
                  </td>
                  <td>{funcionario.email}</td>
                  <td>{funcionario.telefone}</td>
                  <td>{funcionario.matricula}</td>
                  <td>{funcionario.perfil}</td>

                  <td>
                    <span
                      className={
                        funcionario.ativo
                          ? "ad-status-funcionario ativo"
                          : "ad-status-funcionario inativo"
                      }
                    >
                      {funcionario.ativo ? "🟢 Ativo" : "🔴 Inativo"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="ad-link-btn"
                      onClick={() => setFuncionarioEditando(funcionario)}
                    >
                      Editar
                    </button>

                    <button
                      className={
                        funcionario.ativo
                          ? "ad-btn-inativar"
                          : "ad-btn-ativar"
                      }
                      onClick={() => alterarStatusFuncionario(funcionario)}
                    >
                      {funcionario.ativo ? "Inativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}

              {funcionarios.length === 0 && (
                <tr>
                  <td colSpan="7">Nenhum funcionário cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function ConfiguracoesContent() {
    return (
      <>
        <div className="ad-card">
          <div className="ad-card-hdr">
            <div>
              <strong>Configurações da pizzaria</strong>
              <p className="ad-greeting-sub">
                Gerencie informações gerais, entrega e funcionamento.
              </p>
            </div>
          </div>

          <div className="ad-config-grid">
            <label>
              Nome da pizzaria
              <input
                value={configuracoes.nomePizzaria}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    nomePizzaria: e.target.value,
                  })
                }
              />
            </label>

            <label>
              WhatsApp
              <input
                value={configuracoes.whatsapp}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    whatsapp: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Endereço
              <input
                value={configuracoes.endereco}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    endereco: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Taxa de entrega
              <input
                value={configuracoes.taxaEntrega}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    taxaEntrega: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Tempo estimado de entrega
              <input
                value={configuracoes.tempoEntrega}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    tempoEntrega: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Status da pizzaria
              <select
                value={configuracoes.aberta ? "aberta" : "fechada"}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    aberta: e.target.value === "aberta",
                  })
                }
              >
                <option value="aberta">Aberta</option>
                <option value="fechada">Fechada</option>
              </select>
            </label>

            <label>
              Tema do painel

              <select
                value={configuracoes.temaEscuro ? "escuro" : "claro"}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    temaEscuro: e.target.value === "escuro",
                  })
                }
              >
                <option value="claro">☀️ Claro</option>
                <option value="escuro">🌙 Escuro</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            className="ad-save-btn"
            onClick={salvarConfiguracoes}
          >
            Salvar configurações
          </button>

        </div>
      </>
    );
  }

  function renderCardsAuditoria(lista) {
    return (
      <div className="ad-auditoria-cards">
        {lista.map((log) => (
          <div key={log.id} className="ad-auditoria-card">
            <div className="ad-auditoria-card-top">
              <strong>{log.acao}</strong>
              <span>{log.entidade}</span>
            </div>

            <p><strong>Data:</strong> {new Date(log.dataHora).toLocaleString("pt-BR")}</p>
            <p><strong>Funcionário:</strong> {log.funcionarioNome || "Não informado"}</p>
            <p><strong>Descrição:</strong> {log.descricao}</p>
          </div>
        ))}

        {lista.length === 0 && (
          <div className="ad-auditoria-card">
            <strong>Nenhum log registrado.</strong>
          </div>
        )}
      </div>
    );
  }

  function AuditoriaContent() {

    return (
      <div className="ad-card">
        <div className="ad-card-hdr">
          <div>
            <strong>Logs de auditoria</strong>
            <p className="ad-greeting-sub">
              Acompanhe as ações administrativas realizadas no sistema.
            </p>
          </div>

          <button className="ad-save-btn" onClick={carregarLogsAuditoria}>
            Atualizar
          </button>
        </div>

        {renderCardsAuditoria(logsAuditoria)}
        <div className="ad-table-wrap ad-auditoria-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Funcionário</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>Descrição</th>
              </tr>
            </thead>

            <tbody>
              {logsAuditoria.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.dataHora).toLocaleString("pt-BR")}</td>
                  <td>{log.funcionarioNome || "Não informado"}</td>
                  <td>{log.acao}</td>
                  <td>{log.entidade}</td>
                  <td>{log.descricao}</td>
                </tr>
              ))}

              {logsAuditoria.length === 0 && (
                <tr>
                  <td colSpan="5">Nenhum log registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-root">

      <button
        className="ad-mobile-menu-btn"
        onClick={() => setSidebarAberta(true)}
      >
        ☰
      </button>

      {sidebarAberta && (
        <div
          className="ad-sidebar-overlay"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      <aside className={`ad-sidebar ${sidebarAberta ? "open" : ""}`}>
        <div className="ad-sidebar-logo">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
            <path d="M22 4 L40 38 H4 Z" fill="#FDD835" />
            <circle cx="18" cy="28" r="3" fill="#c0392b" />
            <circle cx="27" cy="22" r="2.5" fill="#c0392b" />
            <circle cx="30" cy="32" r="2" fill="#c0392b" />
          </svg>
          <span className="ad-logo-text">Pizzly</span>
        </div>

        <nav className="ad-nav">
          {navItemsPermitidos.map((item) => (
            <button
              key={item.label}
              className={`ad-nav-item ${activeNav === item.label ? "active" : ""
                }`}
              onClick={() => {
                setActiveNav(item.label);
                setSidebarAberta(false);
              }}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              <span className="ad-nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="ad-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-row">
            <div className="ad-user-avatar">AD</div>
            <div className="ad-user-info">
              <strong>Administrador</strong>
              <span>Painel Pizzly</span>
            </div>
          </div>

          <button className="ad-sair-btn" onClick={sair}>
            <span>↩</span> Sair
          </button>
        </div>
      </aside>

      <main className="ad-content">
        <div className="ad-topbar">
          <div>
            <h1 className="ad-greeting">
              {activeNav === "Dashboard"
                ? "Painel Administrativo 🍕"
                : activeNav}
            </h1>
            <p className="ad-greeting-sub">
              {activeNav === "Dashboard"
                ? "Gerencie pedidos, clientes, cardápio e promoções da Pizzly."
                : `Área administrativa de ${activeNav.toLowerCase()}.`}
            </p>
          </div>

          <div className="ad-date-box">
            <span>Hoje</span>
          </div>
        </div>

        {activeNav === "Dashboard" && DashboardContent()}
        {activeNav === "Pedidos" && PedidosContent()}
        {activeNav === "Clientes" && ClientesContent()}
        {activeNav === "Cardápio" && CardapioContent()}
        {activeNav === "Categorias" && CategoriasContent()}
        {activeNav === "Promoções" && PromocoesContent()}
        {activeNav === "Relatórios" && RelatoriosContent()}
        {activeNav === "Funcionários" && FuncionariosContent()}
        {activeNav === "Auditoria" && AuditoriaContent()}
        {activeNav === "Configurações" && ConfiguracoesContent()}

        {activeNav !== "Dashboard" &&
          activeNav !== "Pedidos" &&
          activeNav !== "Clientes" &&
          activeNav !== "Cardápio" &&
          activeNav !== "Categorias" &&
          activeNav !== "Promoções" &&
          activeNav !== "Relatórios" &&
          activeNav !== "Funcionários" &&
          activeNav !== "Auditoria" &&
          activeNav !== "Configurações" && (
            <div className="ad-card">
              <h2>{activeNav}</h2>
              <p className="ad-greeting-sub">
                Essa área será implementada nas próximas etapas do projeto.
              </p>
            </div>
          )}

        {pedidoEditando && (
          <div className="ad-modal-overlay">
            <div className="ad-modal ad-pedido-modal">
              <div className="ad-pedido-modal-header">
                <div className="ad-pedido-modal-icon">🧾</div>

                <div>
                  <h2>Pedido {pedidoEditando.id}</h2>
                  <p>{pedidoEditando.cliente}</p>
                </div>

                <button
                  className="ad-modal-close"
                  onClick={() => setPedidoEditando(null)}
                >
                  ×
                </button>
              </div>

              <div className="ad-pedido-modal-resumo">
                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={`ad-status ${STATUS_COLOR[pedidoEditando.status]}`}
                    >
                      {pedidoEditando.status}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Data</span>
                  <strong>{pedidoEditando.data}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{pedidoEditando.total}</strong>
                </div>
              </div>

              <div className="ad-pedido-modal-info-grid">
                <div className="ad-pedido-modal-info-item">
                  <span>Entrega</span>
                  <strong>{pedidoEditando.entrega}</strong>
                </div>

                <div className="ad-pedido-modal-info-item">
                  <span>Pagamento</span>
                  <strong>{pedidoEditando.pagamento}</strong>
                </div>

                {pedidoEditando.valorTroco && (
                  <div className="ad-pedido-modal-info-item">
                    <span>Troco para</span>
                    <strong>{pedidoEditando.valorTroco}</strong>
                  </div>
                )}
              </div>

              <div className="ad-pedido-modal-section">
                <div className="ad-pedido-modal-section-title">
                  <span>📦</span>
                  Itens do pedido
                </div>

                <ul className="ad-pedido-modal-itens">
                  {pedidoEditando.itens?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {(pedidoEditando.observacaoPedido ||
                pedidoEditando.observacaoEntrega) && (
                  <div className="ad-pedido-modal-section">
                    {pedidoEditando.observacaoPedido && (
                      <div className="ad-pedido-modal-obs">
                        <strong>Obs. pedido</strong>
                        <p>{pedidoEditando.observacaoPedido}</p>
                      </div>
                    )}

                    {pedidoEditando.observacaoEntrega && (
                      <div className="ad-pedido-modal-obs">
                        <strong>Obs. entrega</strong>
                        <p>{pedidoEditando.observacaoEntrega}</p>
                      </div>
                    )}
                  </div>
                )}

              <div className="ad-pedido-modal-section">
                <label className="ad-pedido-modal-status-label">
                  <strong>Atualizar status</strong>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    disabled={
                      proximosStatus(
                        pedidoEditando.status,
                        pedidoEditando.formaRecebimento
                      ).length === 0
                    }
                  >
                    <option value={pedidoEditando.status}>
                      {pedidoEditando.status}
                    </option>

                    {proximosStatus(
                      pedidoEditando.status,
                      pedidoEditando.formaRecebimento
                    ).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="ad-pedido-modal-financeiro">
                <div className="ad-pedido-modal-financeiro-row">
                  <span>Subtotal</span>
                  <span>{pedidoEditando.subtotal || pedidoEditando.total}</span>
                </div>

                <div className="ad-pedido-modal-financeiro-row">
                  <span>Taxa de entrega</span>
                  <span>{pedidoEditando.taxaEntrega || "R$ 0,00"}</span>
                </div>

                {pedidoEditando.desconto &&
                  pedidoEditando.desconto !== "R$ 0,00" && (
                    <div className="ad-pedido-modal-financeiro-row ad-pedido-modal-financeiro-desconto">
                      <span>Desconto</span>
                      <span>{pedidoEditando.desconto}</span>
                    </div>
                  )}

                <div className="ad-pedido-modal-financeiro-row ad-pedido-modal-financeiro-total">
                  <span>Total</span>
                  <span>{pedidoEditando.total}</span>
                </div>
              </div>

              <div className="ad-modal-actions">
                <button onClick={() => setPedidoEditando(null)}>
                  Cancelar
                </button>
                <button className="ad-save-btn" onClick={salvarStatus}>
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {clienteSelecionado && (
          <div className="ad-modal-overlay">
            <div className="ad-modal ad-cliente-modal">
              <div className="ad-cliente-modal-header">
                <div className="ad-cliente-avatar">
                  {clienteSelecionado.nome
                    .split(" ")
                    .map((parte) => parte[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>{clienteSelecionado.nome}</h2>
                  <p>Detalhes do cliente e histórico de pedidos</p>
                </div>

                <button
                  className="ad-modal-close"
                  onClick={() => setClienteSelecionado(null)}
                >
                  ×
                </button>
              </div>

              <div className="ad-cliente-resumo">
                <div>
                  <span>Pedidos</span>
                  <strong>{clienteSelecionado.pedidos.length}</strong>
                </div>

                <div>
                  <span>Total gasto</span>
                  <strong>
                    R$ {clienteSelecionado.totalGasto.toFixed(2).replace(".", ",")}
                  </strong>
                </div>

                <div>
                  <span>Último pedido</span>
                  <strong>{clienteSelecionado.ultimoPedido}</strong>
                </div>
              </div>

              <div className="ad-cliente-info-grid">
                <div className="ad-cliente-info-item">
                  <span>E-mail</span>
                  <strong>{clienteSelecionado.email}</strong>
                </div>

                <div className="ad-cliente-info-item">
                  <span>Telefone</span>
                  <strong>{clienteSelecionado.telefone}</strong>
                </div>
              </div>

              <div className="ad-cliente-historico">
                <div className="ad-cliente-section-title">
                  <span>📦</span>
                  <strong>Histórico de pedidos</strong>
                </div>

                {clienteSelecionado.pedidos.map((pedido) => (
                  <div key={pedido.id} className="ad-cliente-pedido-item">
                    <div>
                      <strong>Pedido {pedido.id}</strong>
                      <span>{pedido.data}</span>
                    </div>

                    <span className={`ad-status ${STATUS_COLOR[pedido.status]}`}>
                      {pedido.status}
                    </span>

                    <strong>{pedido.total}</strong>
                  </div>
                ))}
              </div>

              <div className="ad-modal-actions">
                <button onClick={() => setClienteSelecionado(null)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {produtoEditando && (
          <div className="ad-modal-overlay">
            <div className="ad-modal">
              <div className="ad-modal-header">
                <h2>{produtoEditando.id ? "Editar produto" : "Novo produto"}</h2>

                <button
                  className="ad-modal-close"
                  onClick={() => setProdutoEditando(null)}
                >
                  ×
                </button>
              </div>

              <label>
                <strong>Nome:</strong>
                <input
                  value={produtoEditando.nome}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      nome: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={produtoEditando.descricao || ""}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      descricao: e.target.value,
                    })
                  }
                  placeholder="Ex: Pizza com calabresa, cebola e queijo"
                />
              </label>

              <label>
                <strong>Categoria:</strong>

                <select
                  value={produtoEditando.categoriaId || ""}
                  onChange={(e) => {
                    const categoriaId = Number(e.target.value);

                    const categoriaSelecionada = categorias.find(
                      (categoria) => categoria.id === categoriaId
                    );

                    setProdutoEditando({
                      ...produtoEditando,
                      categoriaId,
                      categoria: categoriaSelecionada?.nome || "",
                    });
                  }}
                >
                  <option value="" disabled hidden>
                    Selecione uma categoria
                  </option>

                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <strong>Imagem:</strong>

                <div className="ad-file-upload">
                  <input
                    id="imagem-produto"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      const arquivoSelecionado =
                        e.target.files?.[0] || null;

                      setArquivoImagemProduto(arquivoSelecionado);
                    }}
                  />

                  <label
                    htmlFor="imagem-produto"
                    className="ad-file-upload-button"
                  >
                    <span className="ad-file-upload-icon">📁</span>

                    <span>
                      {arquivoImagemProduto
                        ? arquivoImagemProduto.name
                        : "Escolher imagem"}
                    </span>
                  </label>

                  <small>
                    PNG, JPG ou WebP
                  </small>
                </div>
              </label>

              <label>
                <strong>Preço:</strong>
                <input
                  value={produtoEditando.preco}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      preco: e.target.value,
                    })
                  }
                  placeholder="Ex: 49,90"
                />
              </label>

              <div className="ad-modal-actions">
                <button onClick={() => setProdutoEditando(null)}>Cancelar</button>
                <button className="ad-save-btn" onClick={salvarProduto}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {categoriaEditando && (
          <div className="ad-modal-overlay">
            <div className="ad-modal">
              <h2>{categoriaEditando.id ? "Editar categoria" : "Nova categoria"}</h2>

              <label>
                <strong>Nome:</strong>
                <input
                  value={categoriaEditando.nome}
                  onChange={(e) =>
                    setCategoriaEditando({
                      ...categoriaEditando,
                      nome: e.target.value,
                    })
                  }
                  placeholder="Ex: Massas"
                />
              </label>

              <label>
                <strong>Ícone:</strong>
                <input
                  value={categoriaEditando.icon}
                  onChange={(e) =>
                    setCategoriaEditando({
                      ...categoriaEditando,
                      icon: e.target.value,
                    })
                  }
                  placeholder="Ex: 🍝"
                />
              </label>

              <div className="ad-modal-actions">
                <button onClick={() => setCategoriaEditando(null)}>Cancelar</button>
                <button className="ad-save-btn" onClick={salvarCategoria}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {promocaoEditando && (
          <div className="ad-modal-overlay">
            <div className="ad-modal">
              <div className="ad-modal-header">
                <h2>{promocaoEditando.id ? "Editar promoção" : "Nova promoção"}</h2>

                <button
                  className="ad-modal-close"
                  onClick={fecharModalPromocao}
                >
                  ×
                </button>
              </div>

              <label>
                <strong>Título:</strong>
                <input
                  value={promocaoEditando.titulo}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      titulo: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <strong>Descrição:</strong>
                <textarea
                  value={promocaoEditando.desc}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      desc: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                <strong>Tag:</strong>
                <input
                  value={promocaoEditando.tag}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      tag: e.target.value,
                    })
                  }
                  placeholder="Ex: OFERTA"
                />
              </label>


              <label>
                <strong>Imagem:</strong>

                <div className="ad-file-upload">
                  <input
                    id="imagem-promocao"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      const arquivoSelecionado =
                        e.target.files?.[0] || null;

                      setArquivoImagemPromocao(arquivoSelecionado);
                    }}
                  />

                  <label
                    htmlFor="imagem-promocao"
                    className="ad-file-upload-button"
                  >
                    <span className="ad-file-upload-icon">📁</span>

                    <span>
                      {arquivoImagemPromocao
                        ? arquivoImagemPromocao.name
                        : promocaoEditando.imagem
                          ? "Trocar imagem"
                          : "Escolher imagem"}
                    </span>
                  </label>

                  <small>PNG, JPG ou WebP</small>
                </div>
              </label>

              <label>
                <strong>Preço antigo:</strong>
                <input
                  value={promocaoEditando.precoAntigo}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      precoAntigo: e.target.value,
                    })
                  }
                  placeholder="Ex: 109,90"
                />
              </label>

              <label>
                <strong>Preço novo:</strong>
                <input
                  value={promocaoEditando.precoNovo}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      precoNovo: e.target.value,
                    })
                  }
                  placeholder="Ex: 89,90"
                />
              </label>

              <div className="ad-promo-products-section">
                <div className="ad-promo-products-header">
                  <strong>Produtos da promoção</strong>
                  <span>Selecione um ou mais produtos</span>
                </div>

                <div className="ad-promo-products-grid">
                  {produtos.map((produto) => {
                    const selecionado = promocaoEditando.produtosIds.includes(produto.id);

                    return (
                      <label
                        key={produto.id}
                        className={`ad-promo-product-option ${selecionado ? "selected" : ""
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={(e) => {
                            const produtoId = produto.id;

                            setPromocaoEditando({
                              ...promocaoEditando,
                              produtosIds: e.target.checked
                                ? [...promocaoEditando.produtosIds, produtoId]
                                : promocaoEditando.produtosIds.filter(
                                  (id) => id !== produtoId
                                ),
                            });
                          }}
                        />

                        <span className="ad-promo-product-check">
                          {selecionado ? "✓" : ""}
                        </span>

                        <div>
                          <strong>{produto.nome}</strong>
                          <small>{produto.categoria}</small>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <label>
                Data de início
                <input
                  type="date"
                  value={promocaoEditando.dataInicio}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      dataInicio: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Data de fim
                <input
                  type="date"
                  value={promocaoEditando.dataFim}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      dataFim: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={promocaoEditando.ativa ? "ativa" : "inativa"}
                  onChange={(e) =>
                    setPromocaoEditando({
                      ...promocaoEditando,
                      ativa: e.target.value === "ativa",
                    })
                  }
                >
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </label>

              <div className="ad-modal-actions">
                <button onClick={fecharModalPromocao}>
                  Cancelar
                </button>
                <button className="ad-save-btn" onClick={salvarPromocao}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {funcionarioEditando && (
          <div className="ad-modal-overlay">
            <div className="ad-modal">
              <div className="ad-modal-header">
                <h2>
                  {funcionarioEditando.id ? "Editar funcionário" : "Novo funcionário"}
                </h2>

                <button
                  className="ad-modal-close"
                  onClick={() => setFuncionarioEditando(null)}
                >
                  ×
                </button>
              </div>

              <label>
                Nome
                <input
                  value={funcionarioEditando.nome}
                  onChange={(e) =>
                    setFuncionarioEditando({
                      ...funcionarioEditando,
                      nome: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Email
                <input
                  value={funcionarioEditando.email}
                  onChange={(e) =>
                    setFuncionarioEditando({
                      ...funcionarioEditando,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Telefone
                <input
                  value={funcionarioEditando.telefone}
                  onChange={(e) =>
                    setFuncionarioEditando({
                      ...funcionarioEditando,
                      telefone: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  value={funcionarioEditando.senha || ""}
                  onChange={(e) =>
                    setFuncionarioEditando({
                      ...funcionarioEditando,
                      senha: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Matrícula
                <input
                  value={funcionarioEditando.matricula}
                  onChange={(e) =>
                    setFuncionarioEditando({
                      ...funcionarioEditando,
                      matricula: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Perfil
                <select
                  value={funcionarioEditando.perfil}
                  onChange={(e) =>
                    setFuncionarioEditando({
                      ...funcionarioEditando,
                      perfil: e.target.value,
                    })
                  }
                >
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="ATENDENTE">Atendente</option>
                  <option value="ENTREGADOR">Entregador</option>
                </select>
              </label>

              <div className="ad-modal-actions">
                <button onClick={() => setFuncionarioEditando(null)}>
                  Cancelar
                </button>

                <button className="ad-save-btn" onClick={salvarFuncionario}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}