# 🚀 Server-Sent Events (SSE) - Guia de Conceitos e Boas Práticas

Este repositório contém uma implementação prática para testar e entender o **Server-Sent Events (SSE)**. Este arquivo serve como um guia explicativo abrangente sobre o que é o SSE, suas vantagens, desvantagens, cuidados importantes e quando utilizá-lo.

---

## 📚 O que é Server-Sent Events (SSE)?

O **Server-Sent Events (SSE)** é um padrão de comunicação web que permite ao servidor empurrar (**push**) dados para o cliente em tempo real, de forma assíncrona, através de uma única conexão HTTP persistente.

Diferente do modelo tradicional de requisição-resposta HTTP (onde o cliente sempre pede e o servidor apenas responde), no SSE o cliente estabelece uma conexão inicial e o servidor mantém essa conexão aberta, enviando "eventos" sempre que houver novas informações disponíveis.

---

## 🔄 SSE vs WebSocket vs Long Polling

| Característica            | SSE (Server-Sent Events)                      | WebSocket                                  | Long Polling (Polling)         |
| :------------------------ | :-------------------------------------------- | :----------------------------------------- | :----------------------------- |
| **Direção**               | Unidirecional (Servidor ➔ Cliente)            | Bidirecional (Servidor ⇆ Cliente)          | Bidirecional (Reabre conexões) |
| **Protocolo**             | HTTP Padrão (HTTP/1.1 ou HTTP/2)              | Protocolo próprio (`ws://` / `wss://`)     | HTTP Padrão                    |
| **Facilidade de Proxy**   | Alta (passa fácil por firewalls e Nginx)      | Média/Baixa (requer configuração de proxy) | Alta                           |
| **Reconexão Auto**        | Sim (nativa pelo navegador)                   | Não (precisa ser implementada manualmente) | N/A                            |
| **Limitação de Conexões** | Sim (no HTTP/1.1, máx 6 conexões por domínio) | Não (limitado apenas pelo servidor)        | Sim                            |
| **Transporte**            | Baseado em texto (`UTF-8`)                    | Binário e Texto                            | Baseado em texto               |

---

## 🟢 Pontos Positivos (Vantagens)

1. **Simplicidade de Implementação:** Usa o protocolo HTTP padrão. Não exige servidores adicionais, bibliotecas complexas ou portas abertas especiais no servidor.
2. **Reconexão Automática Nativa:** O navegador (via API `EventSource`) gerencia a reconexão sozinho caso o sinal caia, disparando um evento de erro e tentando reconectar após alguns segundos.
3. **Gerenciamento Nativo de IDs (Resiliência):** Se a conexão cair, o navegador envia automaticamente o cabeçalho `Last-Event-ID` na tentativa de reconexão. O servidor pode ler esse ID e enviar apenas as mensagens perdidas.
4. **Fácil de Debugar:** Por ser baseado em HTTP e texto puro, você consegue inspecionar o fluxo de dados em tempo real direto na aba _Network_ do DevTools do navegador.
5. **Leveza:** Ideal para fluxos onde o cliente apenas consome dados (como logs, progresso ou notificações), evitando o overhead de manter um canal bidirecional como WebSockets.

---

## 🔴 Pontos Negativos (Desvantagens)

1. **Unidirecionalidade:** O cliente não consegue enviar dados de volta para o servidor usando a mesma conexão do SSE. Para enviar dados, o cliente precisa abrir uma requisição HTTP tradicional separada (POST/PUT/GET).
2. **Somente Texto:** O SSE foi desenhado para enviar fluxos de dados em texto codificado em UTF-8. Embora seja possível codificar binários em formatos como Base64, isso aumenta consideravelmente o tamanho da carga.
3. **Limitação de Conexões (HTTP/1.1):** Quando usado sobre HTTP/1.1, os navegadores impõem um limite estrito de **6 conexões simultâneas por domínio**. Se o usuário abrir 6 abas que usam SSE no mesmo site, a 7ª aba travará.
4. **Incompatibilidade Antiga:** Embora praticamente todos os navegadores modernos suportem SSE nativamente hoje, navegadores muito legados (como o Internet Explorer) exigem o uso de _polyfills_.

---

## ⚠️ Cuidados Cruciais ao Utilizar SSE

Ao projetar e implementar SSE em produção, certifique-se de tomar os seguintes cuidados para evitar falhas de desempenho e quedas de servidor:

### 1. Limite de Conexões com HTTP/1.1 (Use HTTP/2)

Se seu servidor suportar apenas HTTP/1.1, o limite de 6 conexões abertas por navegador fará com que novas abas do seu site fiquem "congeladas".

> [!IMPORTANT]
> **Solução:** Utilize **HTTP/2** (ou HTTP/3) em produção. O HTTP/2 suporta multiplexação, permitindo centenas de streams de SSE rodando concorrentemente sobre uma única conexão TCP.

### 2. Evite Vazamento de Recursos (Memory Leaks)

Como as conexões ficam abertas por muito tempo, se você não limpar os timers, intervalos ou listeners associados a uma conexão fechada pelo cliente, o servidor rapidamente consumirá toda a memória disponível.

> [!WARNING]
> **Solução:** Sempre escute pelo encerramento da conexão no servidor (no Fastify: `req.raw.on('close', ...)` ou no Express: `req.on('close', ...)`) e limpe imediatamente timers, loops e banco de dados associados àquela requisição.

### 3. Buffering em Proxies e Nginx

Servidores proxy, firewalls e balanceadores de carga (como o Nginx ou Cloudflare) tendem a acumular os dados na memória (buffer) e só enviar ao cliente quando atingirem um tamanho específico. Isso destrói o tempo real do SSE.

> [!TIP]
> **Solução:** Configure o Nginx com o cabeçalho `X-Accel-Buffering: no` e certifique-se de enviar o cabeçalho `Cache-Control: no-cache` para evitar cache e buffering ao longo do caminho.

### 4. Compressão (Gzip/Brotli)

Se a compressão estiver ativa de maneira agressiva no servidor, ela pode reter os chunks de texto do SSE para comprimi-los em blocos maiores.

> [!IMPORTANT]
> Desative a compressão especificamente para rotas do tipo `text/event-stream` ou certifique-se de realizar o _flush_ dos dados imediatamente após cada escrita.

---

## 🎯 Como Testar Este Projeto

O projeto anexo contém uma simulação de processamento assíncrono para demonstrar o SSE em ação.

### Instalação e Execução

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor:

   ```bash
   npm start
   # Ou em modo desenvolvimento (com watch):
   npm run dev
   ```

3. Acesse e teste de três formas:
   - **Navegador (Interface Visual):** Abra `http://localhost:3000`
   - **Terminal (Cliente Simulado):** Em outra janela do terminal, execute `npm test`
   - **Ferramenta curl:** Execute `curl -N http://localhost:3000/api/processar`

---

**Desenvolvido para estudo e fixação dos conceitos de Server-Sent Events (SSE) 🚀**
