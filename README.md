# 🛣️ RoadVizor — Site Institucional

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> Landing page institucional da plataforma **RoadVizor**, focada em apresentar soluções de observabilidade em tempo real para infraestruturas de pedágios eletrônicos **Free Flow**.

---

## 🎯 Sobre o Projeto

O **RoadVizor** é uma plataforma desenvolvida para monitorar a saúde operacional de pórticos e servidores de pedágio sem barreira (Free Flow). 

Esta landing page tem como objetivo apresentar a arquitetura do sistema, os recursos do **Vision Center**, depoimentos de concessionárias e canais diretos de suporte/contato.

---

## ⚡ Principais Recursos da Interface

- 📱 **Design Responsivo**: Adaptado para telas Desktop, Tablet e Mobile.
- 🎨 **Ícones Dinâmicos**: Integração com a biblioteca [Phosphor Icons](https://phosphoricons.com/).
- 🔗 **Fluxo Visual de Dados**: Diagrama interativo apresentando o caminho da informação (*Servidor $\rightarrow$ Client Local $\rightarrow$ AWS Cloud $\rightarrow$ Vision Center $\rightarrow$ CCO*).

---

## 🏗️ Arquitetura Apresentada

O produto final da RoadVizor é dividido em 2 camadas principais:

1. **Client Local (Agente)**: Instalado no servidor de borda do pedágio. Coleta métricas de hardware (CPU, RAM, disco), latência e taxa de leitura de OCR/RFID com comunicação unidirecional.
2. **Vision Center (Cloud)**: Central de inteligência web em nuvem (AWS) onde a equipe do CCO (Centro de Controle Operacional) monitora KPIs, recebe alertas no Slack e analisa relatórios de SLA.

---

## 📂 Estrutura de Arquivos do Frontend

```text
.
├── index.html              # Página principal (Landing Page)
├── favicon.svg             # Ícone do navegador
├── css/
│   └── output.css          # Estilos processados do Tailwind CSS
├── js/
│   └── components/
│       └── navbar.js       # Script de controle do menu responsivo
├── assets/
│   ├── svgs/              # Logos e ícones em vetor (logo-dark.svg, icon.svg)
│   └── images/            # Imagens de fundo e banners (hero-banner.png)
└── pages/
    └── login.html          # Tela de acesso ao Vision Center
