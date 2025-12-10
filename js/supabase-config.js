const SUPABASE_URL = 'https://cgyqqhaflytzmxvcigff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneXFxaGFmbHl0em14dmNpZ2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mjg0OTIsImV4cCI6MjA4MDQwNDQ5Mn0.UBoyLvAJpLol60umFalacZr_KGG86MvPgNlr8Tc7n_E';

if (typeof window.supabase !== 'undefined') {
    window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Conectado com sucesso (v2).");
} else {
    console.error("ERRO CRÍTICO: Biblioteca Supabase JS não encontrada.");
    alert("Erro: Não foi possível conectar ao servidor.");
}