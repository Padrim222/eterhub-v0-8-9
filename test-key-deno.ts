import { config } from "dotenv";

// Carregar variáveis de ambiente
const envFile = await Deno.readTextFile(".env");
const apiKeyMatch = envFile.match(/VITE_OPENROUTER_API_KEY=(sk-or-v1-[a-zA-Z0-9]+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

console.log("Teste de Conexão OpenRouter");
console.log("---------------------------");
console.log(`Chave encontrada: ${apiKey ? "Sim (" + apiKey.substring(0, 15) + "...)" : "Não"}`);

if (!apiKey) {
    console.error("ERRO: Nenhuma chave encontrada no .env");
    Deno.exit(1);
}

try {
    console.log("\nEnviando requisição de teste para OpenRouter...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://eterhub.app", // Obrigatório para OpenRouter
            "X-Title": "EterHub Test Script"
        },
        body: JSON.stringify({
            "model": "openai/gpt-3.5-turbo", // Modelo barato para teste
            "messages": [
                { "role": "user", "content": "Teste de conexão. Responda 'OK'." }
            ]
        })
    });

    const status = response.status;
    const text = await response.text();

    console.log(`\nStatus HTTP: ${status}`);
    console.log(`Resposta: ${text}`);

    if (status === 200) {
        console.log("\n✅ SUCESSO: A chave está válida e funcionando!");
    } else {
        console.log("\n❌ FALHA: A chave retornou erro.");
        if (text.includes("User not found")) {
            console.log("DIAGNÓSTICO: O erro 'User not found' geralmente indica que a chave é inválida ou foi deletada no painel do OpenRouter.");
        }
    }

} catch (error) {
    console.error("\nERRO DE REDE:", error);
}
