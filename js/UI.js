const ui = {
    openModal: (id) => {
        const modal = document.getElementById(id);
        if(modal) {
            modal.classList.add('open');
            if(id === 'modal-payment') {
                const dateInput = document.getElementById('payment-date');
                if(dateInput) dateInput.valueAsDate = new Date();
            }
        }
    },
    closeModal: (id) => {
        const modal = document.getElementById(id);
        if(modal) modal.classList.remove('open');
    },
    
    setActiveNav: (id) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('nav-' + id);
        if(btn) btn.classList.add('active');
    },

    toggleView: (viewId) => {
        document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
        const view = document.getElementById('view-' + viewId);
        if(view) view.classList.remove('hidden');
        ui.setActiveNav(viewId);
    },

    showSearchResults: (results) => {
        const container = document.getElementById('search-results');
        if(!container) return;

        container.innerHTML = '';
        
        if (!results || results.length === 0) {
            container.classList.add('hidden');
            return;
        }

        results.forEach(client => {
            const div = document.createElement('div');
            div.className = 'search-item';
            // AQUI: Mudado de client.name para client.nome e client.phone para client.telefone
            div.innerHTML = `<strong>${client.nome}</strong> <span class="text-muted text-sm">(${client.displayPhone || client.telefone || 'Sem tel'})</span>`;
            div.onclick = () => app.selectClientForOrder(client);
            container.appendChild(div);
        });
        container.classList.remove('hidden');
    },

    displaySelectedClient: (client, debt) => {
        document.getElementById('order-search').value = '';
        document.getElementById('search-results').classList.add('hidden');
        document.getElementById('selected-client-card').classList.remove('hidden');
        
        // AQUI: Mudado para client.nome
        document.getElementById('selected-client-name').textContent = client.nome;
        document.getElementById('selected-client-debt').textContent = app.formatCurrency(debt);
    },

    clearSelectedClient: () => {
        document.getElementById('selected-client-card').classList.add('hidden');
        app.state.selectedClientForOrder = null;
    },

    showClientList: () => {
        document.getElementById('clients-list-view').classList.remove('hidden');
        document.getElementById('client-detail-view').classList.add('hidden');
    },

    showClientDetails: (client, history, totalDebt) => {
        document.getElementById('clients-list-view').classList.add('hidden');
        document.getElementById('client-detail-view').classList.remove('hidden');

        // AQUI: Mudado para client.nome e client.telefone
        document.getElementById('detail-name').textContent = client.nome;
        document.getElementById('detail-phone').textContent = client.displayPhone || client.telefone || 'Não informado';
        document.getElementById('detail-debt').textContent = app.formatCurrency(totalDebt);
        
        // Atualiza nome no modal de pagamento também
        const payName = document.getElementById('payment-client-name');
        if(payName) payName.textContent = client.nome;

        const historyContainer = document.getElementById('client-history-list');
        historyContainer.innerHTML = '';

        if (!history || history.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted text-center p-4">Nenhum histórico encontrado.</p>';
            return;
        }

        history.forEach(item => {
            const isPayment = item.type === 'payment';
            const div = document.createElement('div');
            div.className = 'list-item';
            
            const date = new Date(item.date).toLocaleDateString('pt-BR');
            const amount = app.formatCurrency(item.amount);
            
            const icon = isPayment ? 'arrow-down-circle' : 'shopping-cart';
            const colorClass = isPayment ? 'text-success' : 'text-danger';
            const sign = isPayment ? '-' : '+';

            div.innerHTML = `
                <div class="list-item-content">
                    <h4 class="${colorClass} flex items-center gap-2">
                        <i data-lucide="${icon}" size="16"></i> ${isPayment ? 'Pagamento' : 'Pedido'}
                    </h4>
                    <p class="text-sm text-muted">${date} - ${item.desc}</p>
                </div>
                <div class="font-bold ${colorClass}">
                    ${sign} ${amount}
                </div>
            `;
            historyContainer.appendChild(div);
        });
        
        if(window.lucide) lucide.createIcons();
    }
};