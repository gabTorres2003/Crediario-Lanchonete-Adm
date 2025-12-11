const ui = {
  initIcons: () => {
    if (!window.lucide) return;
    
    lucide.createIcons();

    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        lucide.createIcons();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  },

  openModal: (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("open");
      if (id === "modal-payment") {
        const dateInput = document.getElementById("payment-date");
        if (dateInput) dateInput.valueAsDate = new Date();
      }
      if (window.lucide) setTimeout(() => lucide.createIcons(), 10);
    }
  },

  closeModal: (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("open");
  },

  setActiveNav: (id) => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    const btn = document.getElementById("nav-" + id);
    if (btn) btn.classList.add("active");
  },

  toggleView: (viewId) => {
    document.querySelectorAll("main section").forEach((s) => s.classList.add("hidden"));
    const view = document.getElementById("view-" + viewId);
    if (view) {
      view.classList.remove("hidden");
      if (window.lucide) setTimeout(() => lucide.createIcons(), 10);
    }
    ui.setActiveNav(viewId);
  },

  showSearchResults: (results, title = null) => {
    const container = document.getElementById("search-results");
    if (!container) return;
    container.innerHTML = "";

    if (!results || results.length === 0) {
      container.classList.add("hidden");
      return;
    }

    if (title) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "text-xs text-muted font-bold uppercase";
      titleDiv.style.padding = "8px 10px 4px 10px";
      titleDiv.style.backgroundColor = "#f9fafb";
      titleDiv.innerText = title;
      container.appendChild(titleDiv);
    }

    results.forEach((client) => {
      const div = document.createElement("div");
      div.className = "search-item";
      const nomeExibicao = client.nome || client.name || "Sem Nome";
      const telExibicao = client.displayPhone || app.formatPhone(client.telefone) || "Sem tel";

      div.innerHTML = `
        <div class="flex justify-between items-center w-full">
            <strong>${nomeExibicao}</strong> 
            <span class="text-muted text-sm">${telExibicao}</span>
        </div>
      `;
      div.onclick = () => app.selectClientForOrder(client);
      container.appendChild(div);
    });
    container.classList.remove("hidden");
  },

  displaySelectedClient: (client, debt) => {
    document.getElementById("order-search").value = "";
    document.getElementById("search-results").classList.add("hidden");
    document.getElementById("selected-client-card").classList.remove("hidden");
    document.getElementById("selected-client-name").textContent = client.nome || client.name || "Cliente";
    document.getElementById("selected-client-debt").textContent = app.formatCurrency(debt);
    if (window.lucide) lucide.createIcons();
  },

  clearSelectedClient: () => {
    document.getElementById("selected-client-card").classList.add("hidden");
    app.state.selectedClientForOrder = null;
  },

  showClientList: () => {
    document.getElementById("clients-list-view").classList.remove("hidden");
    document.getElementById("client-detail-view").classList.add("hidden");
    if (window.lucide) lucide.createIcons();
  },

  showClientDetails: (client, history, totalDebt) => {
    document.getElementById("clients-list-view").classList.add("hidden");
    document.getElementById("client-detail-view").classList.remove("hidden");

    const filterSelect = document.getElementById("history-filter");
    if (filterSelect) filterSelect.value = "all";

    document.getElementById("detail-name").textContent = client.nome || "Cliente";
    document.getElementById("detail-phone").textContent = client.displayPhone || client.telefone || "Não informado";
    document.getElementById("detail-debt").textContent = app.formatCurrency(totalDebt);
    
    const payName = document.getElementById("payment-client-name");
    if (payName) payName.textContent = client.nome;
    
    if (window.lucide) lucide.createIcons();
  },

  renderHistoryList: (history) => {
    const historyContainer = document.getElementById("client-history-list");
    historyContainer.innerHTML = "";
    const bulkActions = document.getElementById("bulk-actions");
    if (bulkActions) bulkActions.classList.add("hidden");

    if (!history || history.length === 0) {
      historyContainer.innerHTML = '<p class="text-muted text-center p-4">Nenhum registro encontrado.</p>';
      return;
    }

    history.forEach((item) => {
      const isPayment = item.type === "payment";
      const div = document.createElement("div");
      div.className = "list-item";
      
      let date = "--/--";
      if (item.date) {
        const parts = item.date.split("-");
        if (parts.length === 3) date = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      const amount = app.formatCurrency(item.amount || 0);
      const icon = isPayment ? "arrow-down-circle" : "shopping-cart";
      const colorClass = isPayment ? "text-success" : "text-danger";
      const sign = isPayment ? "-" : "+";
      
      let statusBadge = "";
      if (!isPayment) {
        statusBadge = item.pago 
          ? `<span class="badge badge-paid" style="font-size: 0.7em; margin-left: 8px;">Pago</span>`
          : `<span class="badge badge-debt" style="font-size: 0.7em; margin-left: 8px;">Pendente</span>`;
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
                <p class="text-sm text-muted">${date} - ${item.desc || "Sem descrição"}</p>
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

  alert: (title, message, type = "success") => {
    return new Promise((resolve) => {
      ui.setupAlertModal(title, message, type);
      const btnConfirm = document.getElementById("btn-alert-confirm");
      const btnCancel = document.getElementById("btn-alert-cancel");

      btnConfirm.className = `btn w-full ${type === "danger" ? "btn-danger" : "btn-primary"}`;
      btnConfirm.innerText = "OK";
      btnConfirm.onclick = () => {
        ui.closeModal("modal-alert");
        resolve(true);
      };
      btnCancel.classList.add("hidden-btn");
      ui.openModal("modal-alert");
    });
  },

  confirm: (title, message, confirmText = "Confirmar", type = "warning") => {
    return new Promise((resolve) => {
      ui.setupAlertModal(title, message, type);
      const btnConfirm = document.getElementById("btn-alert-confirm");
      const btnCancel = document.getElementById("btn-alert-cancel");

      btnConfirm.className = `btn w-full ${type === "danger" ? "btn-danger" : "btn-primary"}`;
      btnConfirm.innerText = confirmText;
      btnConfirm.onclick = () => {
        ui.closeModal("modal-alert");
        resolve(true);
      };
      btnCancel.classList.remove("hidden-btn");
      btnCancel.onclick = () => {
        ui.closeModal("modal-alert");
        resolve(false);
      };
      ui.openModal("modal-alert");
    });
  },

  setupAlertModal: (title, message, type) => {
    const iconContainer = document.getElementById("alert-icon-container");
    const icon = document.getElementById("alert-icon");
    document.getElementById("alert-title").innerText = title;
    document.getElementById("alert-message").innerText = message;

    iconContainer.className = "alert-icon-circle";
    if (type === "success") {
      iconContainer.classList.add("success");
      icon.setAttribute("data-lucide", "check");
    } else if (type === "danger") {
      iconContainer.classList.add("danger");
      icon.setAttribute("data-lucide", "alert-circle");
    } else {
      iconContainer.classList.add("warning");
      icon.setAttribute("data-lucide", "help-circle");
    }
    if (window.lucide) lucide.createIcons();
  }
};