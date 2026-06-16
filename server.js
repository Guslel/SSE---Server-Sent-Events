import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlFile = readFileSync(join(__dirname, 'index.html'), 'utf-8');

async function requisicaoExterna(numero) {
  await new Promise(r => setTimeout(r, 2000));
  return {
    id: numero,
    status: 'sucesso',
    dados: `Dados da requisição ${numero}`,
    timestamp: new Date().toISOString()
  };
}

const fastify = Fastify({ logger: false });

fastify.get('/', (req, reply) => {
  reply.header('Content-Type', 'text/html; charset=utf-8');
  reply.send(htmlFile);
});

fastify.get('/api/processar', async (req, reply) => {
  console.log('📡 Cliente conectado');
  
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  let conectado = true;
  req.raw.on('close', () => {
    console.log('🔌 Cliente desconectou');
    conectado = false;
  });

  const enviarEvento = (event, data) => {
    if (!conectado) return;
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  enviarEvento('inicio', { event: 'inicio', mensagem: 'Iniciando...', progresso: 0 });

  const resultados = [];

  for (let i = 1; i <= 4; i++) {
    if (!conectado) break;
    enviarEvento('requisicao_inicio', { event: 'requisicao_inicio', mensagem: `Requisição ${i}/4...`, progresso: (i - 1) * 25, numero: i });
    
    const resultado = await requisicaoExterna(i);
    resultados.push(resultado);
    
    if (!conectado) break;
    enviarEvento('requisicao_completa', { event: 'requisicao_completa', mensagem: `Requisição ${i} OK`, progresso: i * 25 - 5, dados: resultado, numero: i });
  }

  if (conectado) {
    enviarEvento('processando', { event: 'processando', mensagem: 'Finalizando...', progresso: 95 });
    await new Promise(r => setTimeout(r, 500));
  }

  if (conectado) {
    enviarEvento('concluido', { event: 'concluido', mensagem: 'Pronto!', progresso: 100, resultados });
    reply.raw.end();
  }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
  console.log(`\n🚀 http://localhost:3000\n`);
});
