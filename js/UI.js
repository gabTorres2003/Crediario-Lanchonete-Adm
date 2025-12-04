const ui = {
    openModal: (id) => {
        document.getElementById(id).classList.add('open');
        if(id === 'modal-payment') {
            document.getElementById('payment-date').valueAsDate = new Date();
        }
    },
    closeModal: (id) => {
        document.getElementById(id).classList.remove('open');
    },
    
    // Navegação
    setActiveNav: (id) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('nav-' + id).classList.add('active');
    },

    toggleView: (viewId) => {
        document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
        document.getElementById('view-' + viewId).classList.remove('hidden');
        ui.setActiveNav(viewId);
    },

    // Funções de busca de cliente
    showSearchResults: (results) => {
        const container = document.getElementById('search-results');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.classList.add('hidden');
            return;
        }

        results.forEach(client => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<strong>${client.name}</strong> <span class="text-muted text-sm">(${client.phone || 'Sem tel'})</span>`;
            div.onclick = () => app.selectClientForOrder(client);
            container.appendChild(div);
        });
        container.classList.remove('hidden');
    },

    displaySelectedClient: (client, debt) => {
        document.getElementById('order-search').value = '';
        document.getElementById('search-results').classList.add('hidden');
        document.getElementById('selected-client-card').classList.remove('hidden');
        
        document.getElementById('selected-client-name').textContent = client.name;
        document.getElementById('selected-client-debt').textContent = app.formatCurrency(debt);
    },

    clearSelectedClient: () => {
        document.getElementById('selected-client-card').classList.add('hidden');
        app.state.selectedClientForOrder = null;
    },

    // Visualização de Detalhes
    showClientList: () => {
        document.getElementById('clients-list-view').classList.remove('hidden');
        document.getElementById('client-detail-view').classList.add('hidden');
    },

    showClientDetails: (client, history, totalDebt) => {
        document.getElementById('clients-list-view').classList.add('hidden');
        document.getElementById('client-detail-view').classList.remove('hidden');

        document.getElementById('detail-name').textContent = client.name;
        document.getElementById('detail-phone').textContent = client.phone || 'Não informado';
        document.getElementById('detail-debt').textContent = app.formatCurrency(totalDebt);
        document.getElementById('payment-client-name').textContent = client.name; // Para modal

        const historyContainer = document.getElementById('client-history-list');
        historyContainer.innerHTML = '';

        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted text-center p-4">Nenhum histórico encontrado.</p>';
            return;
        }

        history.forEach(item => {
            const isPayment = item.type === 'payment';
            const div = document.createElement('div');
            div.className = 'list-item';
            
            const date = new Date(item.date).toLocaleDateString('pt-BR');
            const amount = app.formatCurrency(item.amount);
            
            // Ícone e Cor dependendo se é Pedido ou Pagamento
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
            lucide.createIcons();
        });
    }
};

