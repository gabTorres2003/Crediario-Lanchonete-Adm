const app = {
  state: {
    selectedClientForOrder: null,
    currentDetailClient: null,
    currentHistory: [],
    historyAsc: false,
  },

  init: () => {
    console.log("App v2 iniciado.");

    // Verifica conexão
    if (!window._supabaseClient) {
      console.error("Cliente Supabase não disponível.");
      return;
    }

    const dateInput = document.getElementById("order-date");
    if (dateInput) dateInput.valueAsDate = new Date();

    const searchInput = document.getElementById("order-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        app.searchClients(e.target.value)
      );
    }

    app.loadDailySummary();
    if (window.lucide) lucide.createIcons();
  },

  filterHistory: () => {
    const filterType = document.getElementById("history-filter").value;
    let processedHistory = [...(app.state.currentHistory || [])];

    // 1. Filtragem
    if (filterType !== "all") {
      processedHistory = processedHistory.filter(
        (item) => item.type === filterType
      );
    }

    // 2. Ordenação
    const isAsc = app.state.historyAsc;

    processedHistory.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return isAsc ? dateA - dateB : dateB - dateA;
      }

      const idA = String(a.id);
      const idB = String(b.id);

      return isAsc ? idA.localeCompare(idB) : idB.localeCompare(idA);
    });

    ui.renderHistoryList(processedHistory);
  },

  toggleHistoryOrder: () => {
    app.state.historyAsc = !app.state.historyAsc;
    app.filterHistory();
    console.log(
      "Ordenação alterada para:",
      app.state.historyAsc ? "Antigos primeiro" : "Novos primeiro"
    );
  },

  navigate: (page) => {
    ui.toggleView(page);
    if (page === "clients") app.loadClients();
    if (page === "dashboard") app.loadDailySummary();
  },

  formatCurrency: (val) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  },

  formatPhone: (phone) => {
    if (!phone) return "";
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 11)
      return clean.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    if (clean.length === 10)
      return clean.replace(/^(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
    return phone;
  },

  // --- CLIENTES ---

  createClient: async () => {
    const name = document.getElementById("new-client-name").value;
    const phone = document.getElementById("new-client-phone").value;
    const obs = document.getElementById("new-client-obs").value;

    if (!name) return alert("Nome é obrigatório");

    const payload = {
      nome: name,
      telefone: phone.replace(/\D/g, ""),
      obs: obs,
    };

    const { data, error } = await window._supabaseClient
      .from("clientes")
      .insert(payload)
      .select();

    if (error) {
      console.error("Erro Insert:", error);
      return alert("Erro ao salvar: " + error.message);
    }

    ui.closeModal("modal-client");
    document.getElementById("new-client-name").value = "";
    document.getElementById("new-client-phone").value = "";
    if (document.getElementById("new-client-obs"))
      document.getElementById("new-client-obs").value = "";

    app.loadClients();
    alert("Cliente cadastrado com sucesso!");
  },

  openEditClientModal: () => {
    const client = app.state.currentDetailClient;
    if (!client) return;

    document.getElementById("edit-client-id").value = client.id;
    document.getElementById("edit-client-name").value = client.nome;
    document.getElementById("edit-client-phone").value = client.telefone;

    ui.openModal("modal-edit-client");
  },

  updateClient: async () => {
    const id = document.getElementById("edit-client-id").value;
    const nome = document.getElementById("edit-client-name").value;
    const telefone = document.getElementById("edit-client-phone").value;

    if (!nome) return alert("O nome é obrigatório!");

    const { error } = await window._supabaseClient
      .from("clientes")
      .update({ nome: nome, telefone: telefone })
      .eq("id", id);

    if (error) {
      console.error(error);
      return alert("Erro ao atualizar: " + error.message);
    }

    alert("Cliente atualizado com sucesso!");
    ui.closeModal("modal-edit-client");

    app.state.currentDetailClient.nome = nome;
    app.state.currentDetailClient.telefone = telefone;

    app.openClientDetails(app.state.currentDetailClient.id);

    app.loadClients();
  },

  searchClients: async (term) => {
    if (term.length < 2) {
      ui.showSearchResults([]);
      return;
    }

    const { data, error } = await window._supabaseClient
      .from("clientes")
      .select("*")
      .ilike("nome", `%${term}%`)
      .limit(5);

    if (error) return console.error(error);

    const formattedData = (data || []).map((c) => ({
      ...c,
      displayPhone: app.formatPhone(c.telefone),
    }));

    ui.showSearchResults(formattedData);
  },

  selectClientForOrder: async (client) => {
    app.state.selectedClientForOrder = client;
    const debt = await app.calculateDebt(client.id);
    ui.displaySelectedClient(client, debt);
  },

  loadClients: async () => {
    const filterEl = document.getElementById("client-filter");
    const filter = filterEl ? filterEl.value : "";

    let query = window._supabaseClient.from("clientes").select("*");
    if (filter) {
      query = query.ilike("nome", `%${filter}%`);
    }

    const { data: clients, error } = await query.order("nome");

    if (error) return console.error("Erro Load Clients:", error);

    const grid = document.getElementById("clients-grid");
    if (grid) {
      grid.innerHTML = "";

      if (!clients || clients.length === 0) {
        grid.innerHTML =
          '<p class="text-muted p-4">Nenhum cliente encontrado.</p>';
        return;
      }

      for (const client of clients) {
        const debt = await app.calculateDebt(client.id);

        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">${client.nome}</h3> 
                        <span class="badge ${
                          debt > 0.05 ? "badge-debt" : "badge-paid"
                        }">
                            ${debt > 0.05 ? "Devedor" : "Ok"}
                        </span>
                    </div>
                    <p class="text-muted text-sm mb-4">${
                      app.formatPhone(client.telefone) || "Sem telefone"
                    }</p>
                    <p class="text-sm font-bold mb-4">Dívida: <span class="${
                      debt > 0.05 ? "text-danger" : "text-success"
                    }">${app.formatCurrency(debt)}</span></p>
                    <button class="btn btn-secondary w-full btn-sm" onclick="app.openClientDetails('${
                      client.id
                    }')">
                        Ver Detalhes
                    </button>
                `;
        grid.appendChild(div);
      }
    }
  },

  // --- PEDIDOS ---

  saveOrder: async () => {
    if (!app.state.selectedClientForOrder)
      return alert("Selecione um cliente primeiro.");

    const amount = parseFloat(document.getElementById("order-total").value);
    const desc = document.getElementById("order-desc").value;
    const date = document.getElementById("order-date").value;

    if (!amount || isNaN(amount) || amount <= 0)
      return alert("Digite um valor válido.");

    const { error } = await window._supabaseClient.from("pedidos").insert({
      cliente_id: app.state.selectedClientForOrder.id,
      total: amount,
      descricao: desc || "Consumo",
      data_pedido: date,
    });

    if (error) return alert("Erro ao salvar pedido: " + error.message);

    alert("Pedido registrado!");
    ui.clearSelectedClient();
    document.getElementById("order-total").value = "";
    document.getElementById("order-desc").value = "";

    app.loadDailySummary();
  },

  loadDailySummary: async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: orders, error } = await window._supabaseClient
      .from("pedidos")
      .select(`*, clientes (nome)`)
      .eq("data_pedido", today);

    if (error) return console.error("Erro Resumo:", error);

    const safeOrders = orders || [];
    const total = safeOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    const totalEl = document.getElementById("daily-total");
    if (totalEl) totalEl.textContent = app.formatCurrency(total);

    const list = document.getElementById("recent-orders-list");
    if (list) {
      list.innerHTML = "";

      const sortedOrders = safeOrders.sort((a, b) => b.id - a.id).slice(0, 5);

      if (sortedOrders.length === 0) {
        list.innerHTML =
          '<p class="text-muted text-sm text-center py-4">Nenhum pedido hoje.</p>';
        return;
      }

      sortedOrders.forEach((order) => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.style.padding = "10px";
        const nomeCliente = order.clientes ? order.clientes.nome : "(Excluído)";

        div.innerHTML = `
                    <div>
                        <div class="font-bold text-sm">${nomeCliente}</div>
                        <div class="text-xs text-muted">${
                          order.descricao || "-"
                        }</div>
                    </div>
                    <div class="font-bold text-danger text-sm">${app.formatCurrency(
                      order.total
                    )}</div>
                `;
        list.appendChild(div);
      });
    }
  },

  // --- DETALHES ---

  calculateDebt: async (clientId) => {
    const { data: orders } = await window._supabaseClient
      .from("pedidos")
      .select("total")
      .eq("cliente_id", clientId);

    const { data: payments } = await window._supabaseClient
      .from("pagamentos")
      .select("valor_pago")
      .eq("cliente_id", clientId);

    const totalOrders = orders
      ? orders.reduce((sum, o) => sum + parseFloat(o.total), 0)
      : 0;
    const totalPaid = payments
      ? payments.reduce((sum, p) => sum + parseFloat(p.valor_pago), 0)
      : 0;

    return totalOrders - totalPaid;
  },

  openClientDetails: async (clientId) => {
    const { data: clients, error } = await window._supabaseClient
      .from("clientes")
      .select("*")
      .eq("id", clientId);

    if (error || !clients || clients.length === 0)
      return alert("Erro ao carregar cliente.");

    const client = clients[0];
    app.state.currentDetailClient = client;

    const { data: orders } = await window._supabaseClient
      .from("pedidos")
      .select("*")
      .eq("cliente_id", clientId);

    const { data: payments } = await window._supabaseClient
      .from("pagamentos")
      .select("*")
      .eq("cliente_id", clientId);

    const history = [
      ...(orders || []).map((o) => ({
        type: "order",
        id: o.id,
        date: o.data_pedido,
        amount: o.total,
        desc: o.descricao || "Pedido",
        pago: o.pago 
      })),
      ...(payments || []).map((p) => ({
        type: "payment",
        id: p.id,
        date: p.data_pagamento,
        amount: p.valor_pago,
        desc: `Pagamento (${p.forma_pagamento})`,
      })),
    ];

    app.state.currentHistory = history;

    const debt = await app.calculateDebt(clientId);
    const clientForUI = { ...client, phone: app.formatPhone(client.telefone) };

    ui.showClientDetails(clientForUI, history, debt);
    app.filterHistory();
  },

  sendWhatsApp: () => {
    const client = app.state.currentDetailClient;
    if (!client || !client.telefone) {
      return alert("Cliente sem telefone cadastrado.");
    }

    // Limpa o telefone (remove parênteses, traços, espaços)
    let phone = client.telefone.replace(/\D/g, "");

    // Adiciona o código do Brasil (55) se não tiver
    if (phone.length <= 11) {
      phone = "55" + phone;
    }

    // Calcula saldo
    const history = app.state.currentHistory || [];
    const totalDebt = history
      .filter((h) => h.type === "order")
      .reduce((acc, c) => acc + Number(c.amount), 0);
    const totalPaid = history
      .filter((h) => h.type === "payment")
      .reduce((acc, c) => acc + Number(c.amount), 0);
    const balance = totalDebt - totalPaid;
    const balanceFormatted = balance.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    // Cria a mensagem
    const text = `Olá, ${client.nome}, aqui é da Sablina Lanches.\n\nSeu saldo devedor atual é: *${balanceFormatted}*.\n\nSegue em anexo o relatório detalhado.`;

    // Abre o WhatsApp
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  },

  openPaymentModal: () => {
    const client = app.state.currentDetailClient;
    document.getElementById("payment-client-name").innerText = client.nome;
    document.getElementById("payment-amount").value = "";
    document.getElementById("payment-date").valueAsDate = new Date();

    // Filtra apenas pedidos que são do tipo 'order' e NÃO estão pagos
    const pendingOrders = app.state.currentHistory.filter(
      (h) => h.type === "order" && !h.pago
    );

    const listContainer = document.getElementById("pending-orders-list");
    listContainer.innerHTML = "";

    if (pendingOrders.length === 0) {
      listContainer.innerHTML =
        "<p class='text-muted text-sm'>Nenhum pedido pendente.</p>";
    } else {
      pendingOrders.forEach((order) => {
        const div = document.createElement("div");
        div.className = "flex items-center gap-2 mb-2 p-2 border-bottom";
        // Checkbox com ID do pedido e valor
        div.innerHTML = `
                <input type="checkbox" class="order-checkbox" value="${
                  order.id
                }" data-amount="${
          order.amount
        }" onchange="app.updatePaymentTotal()">
                <label class="text-sm">
                    ${new Date(order.date).toLocaleDateString("pt-BR")} - ${
          order.desc
        } 
                    <strong>(R$ ${order.amount.toFixed(2)})</strong>
                </label>
            `;
        listContainer.appendChild(div);
      });
    }
    ui.openModal("modal-payment");
  },

  // 2. Soma automática ao clicar nos checkboxes
  updatePaymentTotal: () => {
    const checkboxes = document.querySelectorAll(".order-checkbox:checked");
    let total = 0;
    checkboxes.forEach((cb) => {
      total += parseFloat(cb.getAttribute("data-amount"));
    });
    // Atualiza o campo de valor (se quiser permitir edição manual, remova o readonly do HTML)
    document.getElementById("payment-amount").value = total.toFixed(2);
  },

  // 3. Salva o pagamento E atualiza os pedidos para 'pago = true'
  savePayment: async () => {
    const amount = parseFloat(document.getElementById("payment-amount").value);
    const method = document.getElementById("payment-method").value;
    const date = document.getElementById("payment-date").value;
    const client = app.state.currentDetailClient;

    if (!amount || amount <= 0) return alert("Valor inválido");

    // A. Registra o Pagamento
    const { error: payError } = await window._supabaseClient
      .from("pagamentos")
      .insert({
        cliente_id: client.id,
        valor_pago: amount,
        forma_pagamento: method,
        data_pagamento: date,
      });

    if (payError) {
      console.error(payError);
      return alert("Erro ao registrar pagamento.");
    }

    // B. Atualiza os pedidos selecionados para 'pago: true'
    const selectedCheckboxes = document.querySelectorAll(
      ".order-checkbox:checked"
    );
    const orderIdsToUpdate = Array.from(selectedCheckboxes).map(
      (cb) => cb.value
    );

    if (orderIdsToUpdate.length > 0) {
      const { error: updateError } = await window._supabaseClient
        .from("pedidos")
        .update({ pago: true })
        .in("id", orderIdsToUpdate); // Atualiza todos os IDs da lista

      if (updateError)
        console.error("Erro ao dar baixa nos pedidos", updateError);
    }

    ui.closeModal("modal-payment");
    alert("Pagamento salvo com sucesso!");
    app.loadClientDetails(client.id); // Recarrega para atualizar a lista e saldo
  },
  openReportModal: () => {
    ui.openModal("modal-report");
    document.getElementById("report-type").value = "completo";
    document.getElementById("report-dates").classList.add("hidden");
  },

  toggleReportDates: () => {
    const type = document.getElementById("report-type").value;
    const dateDiv = document.getElementById("report-dates");
    if (type === "periodo") {
      dateDiv.classList.remove("hidden");
    } else {
      dateDiv.classList.add("hidden");
    }
  },

  
  generatePDF: (type = "completo", start = null, end = null) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let title = "Extrato de Conta";
    let history = app.state.currentHistory || [];
    
    if (type === "selecionados") {
        const selectedIds = Array.from(document.querySelectorAll('.history-select:checked')).map(cb => cb.value);
        
        if (selectedIds.length === 0) {
            alert("Nenhum item selecionado na lista!");
            return;
        }
        history = history.filter(h => selectedIds.includes(String(h.id)));
        title = "Extrato: Itens Selecionados";
        
      } else if (type === "pendentes") {
        history = history.filter((h) => h.type === "order");
        title = "Relatório de Pendências";
        
      } else if (type === "periodo") {
        if (!start || !end) return alert("Selecione as datas.");
        
        history = history.filter((h) => h.date >= start && h.date <= end);
        
        const startBr = start.split('-').reverse().join('/');
        const endBr = end.split('-').reverse().join('/');
        title = `Extrato: ${startBr} a ${endBr}`;
      }
      
      history.sort((a, b) => (a.date > b.date ? 1 : -1));
      
      doc.setFontSize(18);
      doc.text("LanchoneteCred", 14, 20);
      doc.setFontSize(12);
      doc.text(title, 14, 30);
      if (app.state.currentDetailClient) {
        doc.text(`Cliente: ${app.state.currentDetailClient.name}`, 14, 38);
      }
      
      const tableData = history.map((h) => {
        const parts = h.date.split('-');
        const dateBr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        
        let statusText = h.type === "payment" ? "Pago" : "Pendente"; 
        
        return [
          dateBr,
          h.type === "payment" ? "Pagamento" : "Pedido",
          parseFloat(h.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          statusText 
        ];
      });

    doc.autoTable({
        startY: 45,
        head: [["Data", "Tipo", "Valor", "Status"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [225, 29, 72] }, 
      });
      
      const finalY = doc.lastAutoTable.finalY + 10;
      const totalOrder = history.filter(h => h.type === 'order').reduce((acc, c) => acc + Number(c.amount), 0);
      const totalPay = history.filter(h => h.type === 'payment').reduce((acc, c) => acc + Number(c.amount), 0);
      const balance = totalOrder - totalPay;
      
      doc.setFontSize(10);
      doc.text(`Total Pedidos (nesta visualização): ${totalOrder.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 14, finalY);
      doc.text(`Total Pagamentos (nesta visualização): ${totalPay.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 14, finalY + 6);
      
      doc.setFontSize(14);
      doc.text(`Saldo Calculado: ${balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 14, finalY + 14);
      
      doc.save(`Extrato_${new Date().getTime()}.pdf`);
      ui.closeModal("modal-report");
    },

    confirmGeneratePDF: () => {
      const type = document.getElementById("report-type").value;
      const start = document.getElementById("report-start").value; 
      const end = document.getElementById("report-end").value;     
  
      if (type === "periodo" && (!start || !end)) {
          alert("Por favor, selecione as datas de início e fim.");
          return;
      }
      app.generatePDF(type, start, end);
    },
};

window.addEventListener("DOMContentLoaded", app.init);
