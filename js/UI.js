const ui = {
  openModal: (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("open");
      if (id === "modal-payment") {
        const dateInput = document.getElementById("payment-date");
        if (dateInput) dateInput.valueAsDate = new Date();
      }
    }
  },
  closeModal: (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("open");
  },

  setActiveNav: (id) => {
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    const btn = document.getElementById("nav-" + id);
    if (btn) btn.classList.add("active");
  },

  toggleView: (viewId) => {
    document
      .querySelectorAll("main section")
      .forEach((s) => s.classList.add("hidden"));
    const view = document.getElementById("view-" + viewId);
    if (view) view.classList.remove("hidden");
    ui.setActiveNav(viewId);
  },

  showSearchResults: (results) => {
    console.log("UI: Exibindo resultados da busca:", results);

    const container = document.getElementById("search-results");
    if (!container) return;

    container.innerHTML = "";

    if (!results || results.length === 0) {
      container.classList.add("hidden");
      return;
    }

    results.forEach((client) => {
      const div = document.createElement("div");
      div.className = "search-item";

      const nomeExibicao = client.nome || client.name || "Sem Nome";
      const telExibicao =
        client.displayPhone || client.telefone || client.phone || "Sem tel";

      div.innerHTML = `<strong>${nomeExibicao}</strong> <span class="text-muted text-sm">(${telExibicao})</span>`;
      div.onclick = () => {
        console.log("UI: Cliente selecionado na busca:", client);
        app.selectClientForOrder(client);
      };
      container.appendChild(div);
    });
    container.classList.remove("hidden");
  },

  displaySelectedClient: (client, debt) => {
    console.log("UI: Exibindo cliente selecionado:", client);

    document.getElementById("order-search").value = "";
    document.getElementById("search-results").classList.add("hidden");
    document.getElementById("selected-client-card").classList.remove("hidden");

    const nomeExibicao = client.nome || client.name || "Cliente";

    document.getElementById("selected-client-name").textContent = nomeExibicao;
    document.getElementById("selected-client-debt").textContent =
      app.formatCurrency(debt);
  },

  clearSelectedClient: () => {
    document.getElementById("selected-client-card").classList.add("hidden");
    app.state.selectedClientForOrder = null;
  },

  showClientList: () => {
    document.getElementById("clients-list-view").classList.remove("hidden");
    document.getElementById("client-detail-view").classList.add("hidden");
  },

  showClientDetails: (client, history, totalDebt) => {
    console.log("UI: Exibindo detalhes do cliente:", client);

    document.getElementById("clients-list-view").classList.add("hidden");
    document.getElementById("client-detail-view").classList.remove("hidden");

    const filterSelect = document.getElementById("history-filter");
    if (filterSelect) filterSelect.value = "all";

    const nomeExibicao = client.nome || client.name || "Cliente";
    const telExibicao =
      client.displayPhone || client.telefone || client.phone || "Não informado";

    document.getElementById("detail-name").textContent = nomeExibicao;
    document.getElementById("detail-phone").textContent = telExibicao;
    document.getElementById("detail-debt").textContent =
      app.formatCurrency(totalDebt);

    const payName = document.getElementById("payment-client-name");
    if (payName) payName.textContent = nomeExibicao;
  },

  renderHistoryList: (history) => {
    const historyContainer = document.getElementById("client-history-list");
    historyContainer.innerHTML = "";

    const bulkActions = document.getElementById("bulk-actions");
    if (bulkActions) bulkActions.classList.add("hidden");

    if (!history || history.length === 0) {
      historyContainer.innerHTML =
        '<p class="text-muted text-center p-4">Nenhum registro encontrado.</p>';
      return;
    }

    history.forEach((item) => {
      const isPayment = item.type === "payment";
      const div = document.createElement("div");
      div.className = "list-item";

      let date = "--/--";
      if (item.date) {
        const parts = item.date.split("-");
        if (parts.length === 3) {
          date = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      const amount = app.formatCurrency(item.amount || 0);
      const icon = isPayment ? "arrow-down-circle" : "shopping-cart";
      const colorClass = isPayment ? "text-success" : "text-danger";
      const sign = isPayment ? "-" : "+";

      let statusBadge = "";
      if (!isPayment) {
        if (item.pago) {
          statusBadge = `<span class="badge badge-paid" style="font-size: 0.7em; margin-left: 8px;">Pago</span>`;
        } else {
          statusBadge = `<span class="badge badge-debt" style="font-size: 0.7em; margin-left: 8px;">Pendente</span>`;
        }
      }

      div.innerHTML = `
        <div class="list-item-content" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" class="history-select" value="${item.id}" 
                   style="width: 18px; height: 18px; cursor: pointer;"
                   onchange="ui.toggleBulkActions()">
            
            <div style="flex: 1;">
                <h4 class="${colorClass} flex items-center gap-2">
                    <i data-lucide="${icon}" size="16"></i> 
                    ${isPayment ? "Pagamento" : "Pedido"}
                    ${statusBadge}
                </h4>
                <p class="text-sm text-muted">${date} - ${
        item.desc || "Sem descrição"
      }</p>
            </div>
        </div>
        <div class="text-right">
            <span class="font-bold text-lg block">${sign} ${amount}</span>
        </div>
    `;
      historyContainer.appendChild(div);
    });

    if (window.lucide) lucide.createIcons();
  },

  toggleBulkActions: () => {
    const checkedBoxes = document.querySelectorAll(".history-select:checked");
    const bulkBar = document.getElementById("bulk-actions");

    if (checkedBoxes.length > 0) {
      bulkBar.classList.remove("hidden");
    } else {
      bulkBar.classList.add("hidden");
    }
  },
};
