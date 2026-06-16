import EventSource from 'eventsource';

const URL = 'http://localhost:3000/api/processar';
const TIMEOUT = 60000;

function criarBarraProgresso(progresso) {
  const total = 20;
  const preenchido = Math.round((progresso / 100) * total);
  const barra = '█'.repeat(preenchido) + '░'.repeat(total - preenchido);
  return `[${barra}] ${progresso}%`;
}

function formatarTimestamp() {
  const agora = new Date();
  return agora.toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

console.log('\n🚀 Iniciando cliente SSE...\n');
console.log(`📡 Conectando a: ${URL}\n`);

const eventSource = new EventSource(URL);
const timeout = setTimeout(() => {
  console.error('\n⏱️  Timeout de 60 segundos atingido');
  eventSource.close();
  process.exit(1);
}, TIMEOUT);

eventSource.addEventListener('inicio', (event) => {
  const dados = JSON.parse(event.data);
  console.log(`[${formatarTimestamp()}] 🟢 INÍCIO`);
  console.log(`   ${dados.mensagem}`);
  console.log(`   ${criarBarraProgresso(dados.progresso)}\n`);
});

eventSource.addEventListener('requisicao_inicio', (event) => {
  const dados = JSON.parse(event.data);
  console.log(`[${formatarTimestamp()}] 🔵 REQUISIÇÃO INICIADA`);
  console.log(`   ${dados.mensagem}`);
  console.log(`   ${criarBarraProgresso(dados.progresso)}\n`);
});

eventSource.addEventListener('requisicao_completa', (event) => {
  const dados = JSON.parse(event.data);
  console.log(`[${formatarTimestamp()}] ✅ REQUISIÇÃO CONCLUÍDA`);
  console.log(`   ${dados.mensagem}`);
  console.log(`   📦 Dados:`, JSON.stringify(dados.dados, null, 6));
  console.log(`   ${criarBarraProgresso(dados.progresso)}\n`);
});

eventSource.addEventListener('processando', (event) => {
  const dados = JSON.parse(event.data);
  console.log(`[${formatarTimestamp()}] ⚙️  PROCESSANDO`);
  console.log(`   ${dados.mensagem}`);
  console.log(`   ${criarBarraProgresso(dados.progresso)}\n`);
});

eventSource.addEventListener('concluido', (event) => {
  const dados = JSON.parse(event.data);
  console.log(`[${formatarTimestamp()}] 🏁 PROCESSAMENTO CONCLUÍDO`);
  console.log(`   ${dados.mensagem}`);
  console.log(`   ${criarBarraProgresso(dados.progresso)}\n`);
  console.log('📊 Resultados Finais:');
  console.log(JSON.stringify(dados.resultados, null, 2));
  console.log('\n✨ Processamento finalizado com sucesso!\n');

  clearTimeout(timeout);
  eventSource.close();
  process.exit(0);
});

eventSource.addEventListener('error', (event) => {
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('\n✅ Conexão finalizada com sucesso');
  } else {
    console.error('\n❌ Erro na conexão SSE:', event.message || 'Desconectado');
    clearTimeout(timeout);
    eventSource.close();
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Cliente interrompido pelo usuário');
  clearTimeout(timeout);
  eventSource.close();
  process.exit(0);
});
