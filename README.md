# 🍔 Sablina Cred Lanches - Sistema de Gestão de Crediário

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-brightgreen) ![Tecnologia](https://img.shields.io/badge/Tech-JavaScript%20%7C%20Supabase-blue)

Um sistema web completo para gerenciamento de vendas "fiado" (crediário), controle de dívidas de clientes e fluxo de caixa diário, desenvolvido especificamente para atender às necessidades da **Sablina Lanches**, a lanchonete da minha tia.

---

## 🎯 O Problema Resolvido

Muitos pequenos comércios e lanchonetes enfrentam dificuldades ao gerenciar as vendas a prazo (o famoso "fiado"). O controle em cadernos ou planilhas manuais gera:
* ❌ **Erros de cálculo:** Dificuldade em saber o saldo exato de cada cliente.
* ❌ **Perda de histórico:** Não saber o que o cliente consumiu há um mês.
* ❌ **Cobrança ineficiente:** Falta de dados para cobrar o cliente.
* ❌ **Falta de visão de caixa:** Não saber quanto entrou de dinheiro vs. quanto foi vendido a prazo.

**A Solução:** Este sistema automatiza todo esse processo, calculando dívidas automaticamente, gerando relatórios em PDF e facilitando a cobrança via WhatsApp com um clique.

---

## 🚀 Funcionalidades Principais

* **👥 Gestão de Clientes:**
    * Cadastro completo com validação inteligente de telefone (Adição automática de DDD 22 se esquecido).
    * Visualização rápida de status: "Devedor" (Vermelho) ou "Ok" (Verde).
    * Edição e exclusão de cadastros.
* **📝 Controle de Pedidos:**
    * Registro ágil de consumo selecionando o cliente.
    * Cálculo automático do saldo devedor.
* **💰 Gestão de Pagamentos:**
    * Baixa parcial ou total de dívidas.
    * Suporte a múltiplas formas de pagamento (Dinheiro, PIX, Cartão).
    * Seleção de pedidos específicos para pagar.
* **📊 Relatórios e Documentos:**
    * Geração de **PDFs** profissionais (Extrato completo, Apenas pendências, Por período).
    * Envio de resumo de dívida direto para o **WhatsApp** do cliente.
* **📈 Dashboard Diário:**
    * Visão do total vendido no dia.
    * Lista dos últimos pedidos em tempo real.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído focado em performance e simplicidade de manutenção, sem frameworks pesados (Vanilla JS), mas com poder de nuvem.

* **Frontend:** HTML5, CSS3 (com variáveis e design modular), JavaScript (ES6+).
* **Backend / Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL) para autenticação e armazenamento de dados em tempo real.
* **Bibliotecas:**
    * `jsPDF` & `jspdf-autotable`: Para geração de relatórios PDF no navegador.
    * `Lucide Icons`: Para ícones vetoriais leves e modernos.

---

## 📸 Galeria do Sistema

### 1. Tela de Login 
Primeira tela exibida ao usuário acessar o link.
![Login](assets/screenshots/tela_login.png)

### 2. Dashboard Principal
Visão geral do caixa e registro rápido de pedidos.
![Dashboard](assets/screenshots/dashboard_placeholder.png)

### 3. Lista de Clientes
Controle visual de quem deve e quem está em dia.
![Clientes](assets/screenshots/clientes_placeholder.png)

### 4. Detalhes do Cliente e Extrato
Histórico detalhado de consumo e pagamentos.
![Detalhes](assets/screenshots/detalhes_placeholder.png)

### 5. Geração de PDF e Cobrança
Exemplo de relatório gerado pelo sistema.
![PDF](assets/screenshots/pdf_placeholder.png)

---

## 🧠 Aprendizados e Desenvolvimento

Durante a construção deste projeto, foram aplicados e desenvolvidos conceitos importantes de Engenharia de Software e Programação Web:

1.  **Arquitetura MVC (Model-View-Controller) Adaptada:**
    * Separação clara entre a lógica de dados (`app.js`), manipulação de interface (`UI.js`) e estrutura (`html`).
2.  **Manipulação Assíncrona (Async/Await):**
    * Comunicação fluida com o banco de dados Supabase para não travar a interface do usuário durante o carregamento de dados.
3.  **Lógica de Negócio Real:**
    * Implementação de regras de negócio complexas, como o tratamento automático de números de telefone (Regex) e cálculo de saldo devedor baseado em transações de crédito e débito.
4.  **UX/UI Design:**
    * Criação de feedbacks visuais (Modais, Alertas SweetAlert customizados, Badges de status) para melhorar a experiência do usuário final.

---

Made by [Gabriel Torres]