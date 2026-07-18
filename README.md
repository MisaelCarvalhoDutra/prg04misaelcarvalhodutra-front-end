<div align="center">

<img src="pizzly/src/assets/images/logopizza.png" width="250">

# 🍕 Pizzly | Sistema Web para Pizzaria com Delivery

Sistema Full Stack desenvolvido durante a disciplina de Programação Web utilizando **React**, **Spring Boot** e **PostgreSQL**.

</div>

---

# 📖 Sobre o Projeto

O **Pizzly** é um sistema completo para gerenciamento de uma pizzaria com delivery, desenvolvido utilizando arquitetura cliente-servidor.

A aplicação permite que clientes realizem pedidos online de forma simples e intuitiva, enquanto funcionários administram toda a operação da pizzaria através de um painel administrativo exclusivo.

O projeto foi desenvolvido utilizando **React** no frontend e uma **API REST em Spring Boot** no backend, integrados através de requisições HTTP.

---

# 🎯 Objetivos

- Simular o funcionamento de uma pizzaria digital.
- Desenvolver uma aplicação Full Stack.
- Integrar Front-end e Back-end utilizando API REST.
- Aplicar conceitos modernos de React.
- Aplicar conceitos de Spring Boot.
- Utilizar banco de dados PostgreSQL.
- Desenvolver uma interface responsiva.
- Aplicar arquitetura em camadas.

---

# 🚀 Funcionalidades

## 👤 Cliente

- ✅ Cadastro de conta
- ✅ Login
- ✅ Login com Google
- ✅ Recuperação de senha por e-mail
- ✅ Completar perfil
- ✅ Editar perfil
- ✅ Cadastro de endereços
- ✅ Visualização do cardápio
- ✅ Promoções
- ✅ Carrinho de compras
- ✅ Realização de pedidos
- ✅ Acompanhamento do pedido em tempo real
- ✅ Histórico de pedidos
- ✅ Central de notificações
- ✅ Controle de acesso para finalização do pedido

---

## 👨‍💼 Administração

- ✅ Login administrativo
- ✅ Painel administrativo
- ✅ Controle de acesso por perfil de usuário
- ✅ Gerenciamento de produtos
- ✅ Gerenciamento de categorias
- ✅ Gerenciamento de clientes
- ✅ Gerenciamento de funcionários
- ✅ Gerenciamento de pedidos
- ✅ Gerenciamento de promoções
- ✅ Configurações da pizzaria
- ✅ Auditoria das ações administrativas

---

# 🔐 Controle de Acesso

O sistema possui três níveis de acesso.

## 👀 Visitante

- Pode navegar livremente pela aplicação;
- Visualiza cardápio e promoções;
- Pode adicionar produtos ao carrinho;
- Deve realizar login para concluir um pedido.

## 👤 Cliente

- Realiza pedidos;
- Gerencia seus dados;
- Acompanha pedidos;
- Possui acesso às funcionalidades do cliente.

## 👨‍💼 Funcionário

- É redirecionado automaticamente ao painel administrativo após o login;
- Possui acesso apenas ao ambiente administrativo;
- Não possui acesso às páginas da loja.

---

# 🏗️ Arquitetura

```text
                React + Vite
                     │
                     │
          Requisições HTTP (REST)
                     │
                     ▼
        Spring Boot (API REST)
                     │
                     ▼
      PostgreSQL (Supabase)
                     │
                     ▼
      Railway (Backend)
```

---

# 🗂️ Estrutura do Projeto

```text
📦 pizzly
├── 📂 public
├── 📂 src
│
├── 📂 assets
│   ├── css
│   ├── images
│   └── audio
│
├── 📂 components
│   ├── BackButton.jsx
│   ├── Button.jsx
│   ├── CardHome.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   └── Navbar.jsx
│
├── 📂 pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── CriarConta.jsx
│   ├── RecuperarSenha.jsx
│   ├── Pedido.jsx
│   ├── PedidoConfirmado.jsx
│   ├── Promocoes.jsx
│   ├── Perfil.jsx
│   ├── MeusPedidos.jsx
│   ├── AcompanharPedido.jsx
│   └── Admin.jsx
│
├── 📂 routes
│   ├── AppRoutes.jsx
│   ├── RotaLoja.jsx
│   └── RotaProtegida.jsx
│
├── App.jsx
├── main.jsx
└── README.md
```

---

# ⚙️ Tecnologias Utilizadas

## Front-end

- React
- React Router DOM
- React Toastify
- Bootstrap
- Vite
- JavaScript
- CSS3

---

## Back-end

- Spring Boot
- Spring Data JPA
- Hibernate
- Spring Validation
- Spring Mail
- Spring Security
- OAuth2 (Google Login)
- Lombok

---

## Banco de Dados

- PostgreSQL (Supabase)

---

## Deploy

- Vercel (Frontend)
- Railway (Backend)

---

# 🔗 Integração

O frontend consome uma API REST desenvolvida em Spring Boot.

Entre os principais recursos integrados estão:

- Autenticação
- Login com Google
- Cadastro de clientes
- Cadastro de funcionários
- Produtos
- Categorias
- Promoções
- Pedidos
- Carrinho
- Endereços
- Perfil
- Recuperação de senha
- Notificações
- Administração

Toda a comunicação entre Front-end e Back-end é realizada através de requisições HTTP utilizando JSON.

---

# 📱 Interface

A aplicação possui interface responsiva, adaptando-se automaticamente para diferentes dispositivos.

- 💻 Desktop
- 💻 Notebook
- 📱 Tablet
- 📱 Smartphone

---

# 🌐 Deploy

O sistema encontra-se publicado em ambiente de produção.

## Frontend

Hospedado na Vercel.

https://prg04misaelcarvalhodutra-front-end.vercel.app/

## Backend

Hospedado na Railway.

## Banco de Dados

PostgreSQL hospedado no Supabase.

---

# 📚 Conceitos Aplicados

- Componentização
- SPA (Single Page Application)
- React Hooks
- Props
- useState
- useEffect
- React Router DOM
- API REST
- Consumo de JSON
- LocalStorage
- Responsividade
- Mobile First
- Arquitetura Cliente-Servidor
- Arquitetura em Camadas
- Autenticação
- Autorização
- Controle de acesso por perfil
- Proteção de rotas
- Deploy em produção
- Integração Front-end e Back-end

---

# 👨‍💻 Autor

**Misael Carvalho Dutra**

Projeto desenvolvido durante a disciplina de **Programação Web** do curso de **Análise e Desenvolvimento de Sistemas (IFBA)**.