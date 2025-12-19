import fs from 'fs';
import https from 'https';

// Ler .env manualmente
const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/VITE_OPENROUTER_API_KEY=(sk-or-v1-[a-zA-Z0-9]+)/);
const apiKey = match ? match[1] : null;

console.log("Teste de Conexão OpenRouter (Node.js)");
console.log("-------------------------------------");
console.log(`Chave encontrada: ${apiKey ? "Sim (" + apiKey.substring(0, 15) + "...)" : "Não"}`);

if (!apiKey) {
    console.error("ERRO: Nenhuma chave encontrada no .env");
    process.exit(1);
}

const data = JSON.stringify({
    "model": "openai/gpt-3.5-turbo",
    "messages": [{ "role": "user", "content": "Teste" }]
});

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://eterhub.app',
        'X-Title': 'EterHub Test'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`\nStatus HTTP: ${res.statusCode}`);
        console.log(`Resposta: ${body}`);

        if (res.statusCode === 200) {
            console.log("\n✅ SUCESSO: Chave válida!");
        } else {
            console.log("\n❌ FALHA: Erro na chave ou requisição.");
        }
    });
});

req.on('error', (e) => {
    console.error(`ERRO: ${e.message}`);
});

req.write(data);
req.end();
