// NEON ARCADE OS - CORE v1.8
// Agora com Notificações + Pausa funcionando

const JOGOS = [
  { id: 'snake', nome: '🐍 NEON SNAKE', arquivo: './games/snake.js' },
  { id: 'breakout', nome: '🧱 NEON BREAKOUT', arquivo: './games/breakout.js' },
  { id: 'hacker', nome: '👾 NEON HACKER', arquivo: './games/hacker.js' },
  { id: 'racer', nome: '🏎️ NEON RACER', arquivo: './games/racer.js' },
  { id: 'byte', nome: '🦠 NEON BYTE', arquivo: './games/byte.js' },
  { id: 'dash', nome: '▲ NEON DASH', arquivo: './games/dash.js' },
  { id: 'pong', nome: '🏓 NEON PONG', arquivo: './games/pong.js' },
  { id: 'space', nome: '🚀 NEON SPACE', arquivo: './games/space.js' },
  { id: 'tetris', nome: '⬜ NEON TETRIS', arquivo: './games/tetris.js' },
  { id: 'flappy', nome: '🐦 NEON FLAPPY', arquivo: './games/flappy.js' }
];

let jogoAtivo = null;
let eventoInstalar = null;

// SISTEMA DE NOTIFICAÇÃO
function notificar(msg, tipo = 'info') {
    const notif = document.createElement('div');
    notif.className = `notificacao notificacao-${tipo}`;
    notif.textContent = msg;
    document.body.appendChild(notif);
    
    // Animação de entrada
    setTimeout(() => notif.classList.add('mostrar'), 10);
    
    // Remove depois de 3s
    setTimeout(() => {
        notif.classList.remove('mostrar');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Deixa global pros jogos usarem
window.notificar = notificar;

// PWA - Botão de instalar
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalar = e;
    const btn = document.getElementById('btn-instalar');
    if(btn) btn.style.display = 'block';
});

const btnInstalar = document.getElementById('btn-instalar');
if(btnInstalar) {
    btnInstalar.addEventListener('click', async () => {
        if (!eventoInstalar) return;
        eventoInstalar.prompt();
        await eventoInstalar.userChoice;
        eventoInstalar = null;
        btnInstalar.style.display = 'none';
        notificar('App instalado! 🎮', 'sucesso');
    });
}

// Troca de telas
function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
}

function irParaMenu() {
    if (jogoAtivo) {
        jogoAtivo.parar();
        jogoAtivo = null;
    }
    // FIX: Clona o canvas pra matar TODOS os event listeners antigos
    const canvasVelho = document.getElementById('canvas');
    const canvasNovo = canvasVelho.cloneNode(true);
    canvasVelho.parentNode.replaceChild(canvasNovo, canvasVelho);
    
    // Reseta botão de pausa
    const btnPausa = document.getElementById('btn-pausa');
    if(btnPausa) btnPausa.textContent = '⏸️ PAUSAR';
    
    mostrarTela('tela-menu');
    carregarListaJogos();
}

function voltarMenu() {
    irParaMenu();
}

// Carrega lista de jogos no menu
function carregarListaJogos() {
    const container = document.getElementById('lista-jogos');
    container.innerHTML = '';
    JOGOS.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'jogo-card';
        card.textContent = jogo.nome;
        card.onclick = () => carregarJogo(jogo.id);
        container.appendChild(card);
    });
}

// Carrega o arquivo do jogo só quando clica
function carregarJogo(idJogo) {
    const jogo = JOGOS.find(j => j.id === idJogo);
    if (!jogo) return;

    // Para jogo anterior se existir
    if (jogoAtivo) {
        jogoAtivo.parar();
        jogoAtivo = null;
    }

    // Remove script antigo se existir
    const scriptVelho = document.getElementById('script-jogo');
    if (scriptVelho) scriptVelho.remove();

    // FIX: Clona o canvas antes de carregar jogo novo
    const canvasVelho = document.getElementById('canvas');
    const canvasNovo = canvasVelho.cloneNode(true);
    canvasVelho.parentNode.replaceChild(canvasNovo, canvasVelho);

    const script = document.createElement('script');
    script.id = 'script-jogo';
    script.src = `${jogo.arquivo}?v=${Date.now()}`;

    script.onload = () => {
        mostrarTela('tela-jogo');
        const funcaoIniciar = window[`iniciar${idJogo.charAt(0).toUpperCase() + idJogo.slice(1)}`];
        if (funcaoIniciar) {
            jogoAtivo = funcaoIniciar(document.getElementById('canvas'));
            notificar(`${jogo.nome} carregado!`, 'sucesso');
        } else {
            notificar(`Erro: Função não encontrada!`, 'erro');
            voltarMenu();
        }
    };

    script.onerror = () => {
        notificar(`${jogo.nome} - EM BREVE 🚧`, 'info');
        voltarMenu();
    };

    document.head.appendChild(script);
}

// BOTÃO PAUSAR - AGORA FUNCIONA
const btnPausa = document.getElementById('btn-pausa');
if(btnPausa) {
    btnPausa.onclick = () => {
        if (jogoAtivo && jogoAtivo.pausar) {
            const pausado = jogoAtivo.pausar();
            btnPausa.textContent = pausado ? '▶️ CONTINUAR' : '⏸️ PAUSAR';
            notificar(pausado ? 'Jogo pausado ⏸️' : 'Jogo retomado ▶️', 'info');
        } else {
            notificar('Esse jogo não suporta pausa', 'erro');
        }
    };
}

// Inicia tudo
window.addEventListener('load', () => {
    carregarListaJogos();
});