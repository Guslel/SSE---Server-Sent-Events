# 🚀 Server-Sent Events (SSE) Test Project

Um projeto Node.js completo para testar e entender Server-Sent Events com interface web, cliente terminal e servidor Fastify.

## 📚 O que é Server-Sent Events (SSE)?

Server-Sent Events é um padrão de comunicação unidirecional (servidor → cliente) que permite ao servidor enviar atualizações em tempo real ao cliente através de uma conexão HTTP. É ideal para:

- **Notificações em tempo real**: Atualizações de status, alertas
- **Streaming de dados**: Processamento longo com progresso
- **Dashboards ao vivo**: Atualizações contínuas de métricas
- **Chat em tempo real**: Mensagens do servidor
- **Feeds de atividades**: Atualizações de eventos

### SSE vs WebSocket vs Polling

| Característica     | SSE                | WebSocket    | Polling            |
| ------------------ | ------------------ | ------------ | ------------------ |
| **Direção**        | Servidor → Cliente | Bidirecional | Cliente → Servidor |
| **Latência**       | Baixa              | Muito Baixa  | Alta               |
| **Complexidade**   | Baixa              | Alta         | Baixa              |
| **HTTP**           | Sim                | Sim          | Sim                |
| **Reconexão Auto** | Sim                | Não          | N/A                |
| **Use case**       | Updates            | Chat, jogos  | Fallback           |

## 📦 Instalação

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Setup

```bash
# Clone ou copie os arquivos do projeto
cd sse-test-project

# Instale as dependências
npm install

# Ou com yarn
yarn install
```

## 🎯 Como Usar

### 1️⃣ Iniciar o Servidor

```bash
npm start
```

Saída esperada:

```
🚀 Servidor rodando em http://0.0.0.0:3000
📡 Abra http://localhost:3000 no navegador
🧪 Teste SSE: curl -N http://localhost:3000/api/processar
```

### 2️⃣ Testar no Terminal (Cliente Node.js)

Em outro terminal:

```bash
npm test
```

Saída esperada:

```
🚀 Iniciando cliente SSE...

📡 Conectando a: http://localhost:3000/api/processar

[12:34:56] 🟢 INÍCIO
   Iniciando processamento...
   [████░░░░░░░░░░░░░░] 0%

[12:34:56] 🔵 REQUISIÇÃO INICIADA
   Processando requisição 1 de 4...
   [████████░░░░░░░░░░] 25%

[12:34:58] ✅ REQUISIÇÃO CONCLUÍDA
   Requisição 1 concluída
   📦 Dados: {
     "id": 1,
     "status": "sucesso",
     "dados": "Dados da requisição 1",
     "timestamp": "2024-01-15T12:34:56.000Z"
   }
   [██████████░░░░░░░░] 20%

...

[12:35:08] 🏁 PROCESSAMENTO CONCLUÍDO
   Processamento concluído com sucesso!
   [████████████████████] 100%

📊 Resultados Finais:
[
  {
    "id": 1,
    "status": "sucesso",
    "dados": "Dados da requisição 1",
    "timestamp": "2024-01-15T12:34:56.000Z"
  },
  {
    "id": 2,
    "status": "sucesso",
    "dados": "Dados da requisição 2",
    "timestamp": "2024-01-15T12:34:58.000Z"
  },
  ...
]

✨ Processamento finalizado com sucesso!
```

### 3️⃣ Testar no Navegador

Abra seu navegador e acesse:

```
http://localhost:3000
```

Você verá uma interface bonita com:

- Botão para iniciar processamento
- Barra de progresso visual
- Log de eventos em tempo real
- Resultado final formatado

### 4️⃣ Testar com curl (linha de comando)

```bash
curl -N http://localhost:3000/api/processar
```

A flag `-N` desabilita buffering para ver eventos em tempo real.

## 📊 Estrutura de Dados

### Evento SSE

Cada evento SSE tem a seguinte estrutura:

```json
{
  "event": "requisicao_completa",
  "mensagem": "Requisição 1 concluída",
  "progresso": 25,
  "dados": {
    "id": 1,
    "status": "sucesso",
    "dados": "Dados da requisição 1",
    "timestamp": "2024-01-15T12:34:56.000Z"
  }
}
```

### Fluxo de Eventos

```
[CLIENTE INICIA]
       ↓
[Servidor Recebe GET /api/processar]
       ↓
evento: inicio (0%)
       ↓
┌─────────────────────────────┐
│ Para cada requisição (4×):  │
├─────────────────────────────┤
│ evento: requisicao_inicio   │
│ evento: requisicao_completa │
│ (espera 2s)                 │
└─────────────────────────────┘
       ↓
evento: processando (95%)
       ↓
evento: concluido (100%) + resultados
       ↓
[CONEXÃO FECHADA]
```

### Exemplos de JSON dos Eventos

#### 1. Início

```json
{
  "event": "inicio",
  "mensagem": "Iniciando processamento...",
  "progresso": 0
}
```

#### 2. Requisição Iniciada

```json
{
  "event": "requisicao_inicio",
  "mensagem": "Processando requisição 1 de 4...",
  "progresso": 25,
  "requisicao_numero": 1
}
```

#### 3. Requisição Completa

```json
{
  "event": "requisicao_completa",
  "mensagem": "Requisição 1 concluída",
  "progresso": 20,
  "requisicao_numero": 1,
  "dados": {
    "id": 1,
    "status": "sucesso",
    "dados": "Dados da requisição 1",
    "timestamp": "2024-01-15T12:34:56.000Z"
  }
}
```

#### 4. Processando

```json
{
  "event": "processando",
  "mensagem": "Finalizando processamento...",
  "progresso": 95
}
```

#### 5. Concluído

```json
{
  "event": "concluido",
  "mensagem": "Processamento concluído com sucesso!",
  "progresso": 100,
  "resultados": [
    {
      "id": 1,
      "status": "sucesso",
      "dados": "Dados da requisição 1",
      "timestamp": "2024-01-15T12:34:56.000Z"
    },
    {
      "id": 2,
      "status": "sucesso",
      "dados": "Dados da requisição 2",
      "timestamp": "2024-01-15T12:34:58.000Z"
    },
    {
      "id": 3,
      "status": "sucesso",
      "dados": "Dados da requisição 3",
      "timestamp": "2024-01-15T12:35:00.000Z"
    },
    {
      "id": 4,
      "status": "sucesso",
      "dados": "Dados da requisição 4",
      "timestamp": "2024-01-15T12:35:02.000Z"
    }
  ]
}
```

## 🔧 Integração no Seu Projeto Real

### Backend (Node.js/Fastify)

```javascript
import Fastify from 'fastify'

const fastify = Fastify()

fastify.get('/api/meus-dados', async (request, reply) => {
  // Headers SSE obrigatórios usando writeHead do reply.raw
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  // Enviar evento de início
  reply.raw.write(
    `event: inicio\ndata: ${JSON.stringify({
      event: 'inicio',
      mensagem: 'Processando dados...',
      progresso: 0,
    })}\n\n`,
  )

  // Sua lógica aqui...
  const dados = await processarDados()

  // Enviar evento de conclusão
  reply.raw.write(
    `event: concluido\ndata: ${JSON.stringify({
      event: 'concluido',
      mensagem: 'Pronto!',
      progresso: 100,
      resultados: dados,
    })}\n\n`,
  )

  reply.raw.end()
})

fastify.listen({ port: 3000 })
```

### Frontend (JavaScript Vanilla)

```javascript
const eventSource = new EventSource('/api/meus-dados')

eventSource.addEventListener('inicio', (event) => {
  const data = JSON.parse(event.data)
  console.log('Iniciado:', data.mensagem)
  atualizarProgresso(data.progresso)
})

eventSource.addEventListener('concluido', (event) => {
  const data = JSON.parse(event.data)
  console.log('Resultados:', data.resultados)
  mostrarResultados(data.resultados)
  eventSource.close()
})

eventSource.addEventListener('error', () => {
  console.error('Erro na conexão')
  eventSource.close()
})
```

### Frontend (React)

```jsx
import { useEffect, useState } from 'react'

function ProcessingComponent() {
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const iniciar = () => {
    setIsProcessing(true)
    const eventSource = new EventSource('/api/meus-dados')

    eventSource.addEventListener('requisicao_inicio', (event) => {
      const { progresso } = JSON.parse(event.data)
      setProgress(progresso)
    })

    eventSource.addEventListener('concluido', (event) => {
      const { resultados } = JSON.parse(event.data)
      setResults(resultados)
      setProgress(100)
      setIsProcessing(false)
      eventSource.close()
    })

    eventSource.addEventListener('error', () => {
      setIsProcessing(false)
      eventSource.close()
    })
  }

  return (
    <div>
      <button onClick={iniciar} disabled={isProcessing}>
        {isProcessing ? 'Processando...' : 'Iniciar'}
      </button>
      <div>Progresso: {progress}%</div>
      {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
    </div>
  )
}

export default ProcessingComponent
```

### Frontend (Vue.js)

```vue
<template>
  <div>
    <button @click="iniciar" :disabled="isProcessing">
      {{ isProcessing ? 'Processando...' : 'Iniciar' }}
    </button>
    <div>Progresso: {{ progress }}%</div>
    <div v-if="results">
      <pre>{{ JSON.stringify(results, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      progress: 0,
      results: null,
      isProcessing: false,
      eventSource: null,
    }
  },
  methods: {
    iniciar() {
      this.isProcessing = true
      this.eventSource = new EventSource('/api/meus-dados')

      this.eventSource.addEventListener('requisicao_inicio', (event) => {
        const { progresso } = JSON.parse(event.data)
        this.progress = progresso
      })

      this.eventSource.addEventListener('concluido', (event) => {
        const { resultados } = JSON.parse(event.data)
        this.results = resultados
        this.progress = 100
        this.isProcessing = false
        this.eventSource.close()
      })

      this.eventSource.addEventListener('error', () => {
        this.isProcessing = false
        this.eventSource.close()
      })
    },
  },
}
</script>
```

## 🐛 Troubleshooting

### Erro: "CORS error"

**Problema**: Tentando acessar de um domínio diferente.

**Solução**: O servidor já tem CORS habilitado. Se estiver usando outro servidor:

```javascript
import cors from '@fastify/cors'
await fastify.register(cors)
```

### Erro: "Connection refused"

**Problema**: Servidor não está rodando.

**Solução**:

```bash
# Certifique-se de que o servidor está iniciado
npm start

# Verifique a porta
lsof -i :3000
```

### Cliente fecha conexão rapidamente

**Problema**: EventSource fecha antes de receber dados.

**Solução**: Certifique-se de que o servidor não está enviando status HTTP diferente de 200.

### Eventos não aparecem no navegador

**Problema**: Browser ou rede está bloqueando SSE.

**Solução**:

- Verifique o DevTools (Network tab)
- Certifique-se de que Content-Type é `text/event-stream`
- Não use `fetch()` para SSE, use `EventSource`

### Progresso não atualiza

**Problema**: Eventos estão sendo buffered.

**Solução**: O servidor deve enviar `\n\n` após cada evento:

```javascript
reply.raw.write(`event: nome\ndata: ${JSON.stringify(dados)}\n\n`)
```

### Reconexão automática

**Problema**: Quer que o cliente reconecte automaticamente.

**Solução**: Configure o retry nos eventos:

```javascript
reply.send(`event: dados\nretry: 3000\ndata: ${JSON.stringify(dados)}\n\n`)
```

## 📝 Scripts Disponíveis

```bash
npm start     # Inicia o servidor (porta 3000)
npm run dev   # Inicia o servidor com auto-reload (--watch)
npm test      # Executa cliente Node.js para testar
```

## 🏗️ Arquivos do Projeto

```
sse-test-project/
├── package.json      # Dependências e scripts
├── server.js         # Servidor Fastify com SSE
├── client.js         # Cliente Node.js para testar
├── index.html        # Interface web
├── README.md         # Esta documentação
└── node_modules/     # Dependências instaladas
```

## 📚 Referências Úteis

- [MDN - Server-Sent Events API](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [HTML5 EventSource Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Fastify Documentation](https://www.fastify.io/)
- [EventSource npm package](https://www.npmjs.com/package/eventsource)

## 📄 Licença

MIT

## 🤝 Contribuições

Sinta-se livre para forkear, modificar e compartilhar!

## 💡 Dicas Importantes

### Headers SSE Obrigatórios

```javascript
reply.header('Content-Type', 'text/event-stream')
reply.header('Cache-Control', 'no-cache')
reply.header('Connection', 'keep-alive')
```

### Formato de Evento

```
event: nome\n
data: {JSON}\n
\n
```

### Não Usar com fetch()

```javascript
// ❌ ERRADO
fetch('/api/processar').then((r) => r.body)

// ✅ CORRETO
const eventSource = new EventSource('/api/processar')
```

### Reconexão Automática

EventSource reconecta automaticamente se a conexão cair, mas você pode controlar:

```javascript
eventSource.addEventListener('error', () => {
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('Conexão fechada')
  }
})
```

### ID de Eventos (para resumir)

```javascript
reply.raw.write(`event: dados\nid: ${id}\ndata: ${JSON.stringify(dados)}\n\n`)
```

Depois reconectar a partir do último ID:

```javascript
const eventSource = new EventSource('/api/processar?lastEventId=' + lastId)
```

---

**Desenvolvido com ❤️ para aprender Server-Sent Events**
