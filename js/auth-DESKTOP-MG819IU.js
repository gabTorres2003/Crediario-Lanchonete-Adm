console.log("Auth.js iniciou o carregamento...");

window.auth = {
    init: async () => {
        console.log("Verificando sessão...");
        if (!window._supabaseClient) {
            console.error("Supabase não encontrado!");
            return;
        }

        const { data: { session }, error } = await window._supabaseClient.auth.getSession();
        
        if (session) {
            console.log("Sessão encontrada:", session.user.email);
            window.auth.showApp();
        } else {
            console.log("Nenhuma sessão ativa.");
            window.auth.showLogin();
        }

        window._supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log("Mudança de Auth:", event);
            if (event === 'SIGNED_IN') {
                window.auth.showApp();
            } else if (event === 'SIGNED_OUT') {
                window.auth.showLogin();
            }
        });
    },

    login: async () => {
        console.log("Tentando logar...");
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (!emailInput || !passwordInput) return console.error("Campos não encontrados");

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            return ui.alert("Atenção", "Preencha e-mail e senha.", "warning");
        }

        const { data, error } = await window._supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error("Erro Supabase:", error);
            let msg = "E-mail ou senha incorretos.";
            if (error.message.includes("Email not confirmed")) msg = "E-mail não confirmado.";
            if (error.message.includes("Invalid login credentials")) msg = "Credenciais inválidas.";
            
            return ui.alert("Erro de Acesso", msg, "danger");
        }
        
        console.log("Login realizado com sucesso!", data);
    },

    logout: async () => {
        const confirm = await ui.confirm("Sair", "Deseja desconectar?", "Sair");
        if(confirm) {
            await window._supabaseClient.auth.signOut();
            window.location.reload(); 
        }
    },

    showApp: () => {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
    
        if (window.app && window.app.init) {
            setTimeout(() => {
                if (!window.appStateLoaded) { 
                    window.app.init(); 
                    window.appStateLoaded = true;
                }
            }, 100);
        }
    },

    showLogin: () => {
        document.getElementById('app-content').classList.add('hidden');
        document.getElementById('login-view').classList.remove('hidden');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.auth.init);
} else {
    window.auth.init();
}