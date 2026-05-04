// NEON ARCADE OS - CORE v1.9
// Cards v9.9 + Notificações + Pausa funcionando

const JOGOS = [
  { id: 'snake', nome: 'NEON SNAKE', emoji: '🐍', desc: 'Clássico snake com visual neon. Swipe perfeito!', arquivo: './games/snake.js', ativo: true },
  { id: 'breakout', nome: 'NEON BREAKOUT', emoji: '🧱', desc: 'Quebre todos os blocos. Paddle com touch suave!', arquivo: './games/breakout.js', ativo: true },
  { id: 'hacker', nome: 'NEON HACKER', emoji: '👾', desc: 'Decifre o código. Hacker mode ativado!', arquivo: './games/hacker.js', ativo: true },
  { id: 'racer', nome: 'NEON RACER', emoji: '🏎️', desc: 'Desvie dos carros. Velocidade neon!', arquivo: './games/racer.js', ativo: true },
  { id: 'byte', nome: 'NEON BYTE', emoji: '🦠', desc: 'Coma os bytes. Evite o antivírus!', arquivo: './games/byte.js', ativo: true },
  { id: 'dash', nome: 'NEON DASH', emoji: '▲', desc: 'Quadrado que gira no ar. Pule os espinhos!', arquivo: './games/dash.js', ativo: true },
  { id: 'pong', nome: 'NEON PONG', emoji: '🏓', desc: 'O clássico ping-pong em neon. 1P vs CPU!', arquivo: './games/pong.js', ativo: true },
  { id: 'space', nome: 'NEON SPACE', emoji: '🚀', desc: 'Nave no espaço. Desvie e atire!', arquivo: './games/space.js', ativo: false },
  { id: 'tetris', nome: 'NEON TETRIS', emoji: '⬜', desc: 'Empilhe os blocos. Clássico absoluto!', arquivo: './games/tetris.js', ativo: false },
  { id: 'flappy', nome: 'NEON FLAPPY', emoji: '🐦', desc: 'Passe pelos canos. Um toque vicia!', arquivo: './games/flappy.js', ativo: false }
];

let jogoAtivo = null;
let eventoInstalar = null;

// SISTEMA DE NOTIFICAÇÃO
function notificar(msg, tipo = 'info') {
    const notif = document.createElement('div');
    notif.className = `notificacao notificacao-${tipo}`;
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('mostrar'), 10);
    setTimeout(() => {
        notif.classList.remove('mostrar');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}
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
    const canvasVelho = document.getElementById('canvas');
    const canvasNovo = canvasVelho.cloneNode(true);
    canvasVelho.parentNode.replaceChild(canvasNovo, canvasVelho);

    const btnPausa = document.getElementById('btn-pausa');
    if(btnPausa) btnPausa.textContent = '⏸️ PAUSAR';

    mostrarTela('tela-menu');
    carregarListaJogos();
}

function voltarMenu() {
    irParaMenu();
}

// CARREGA LISTA DE JOGOS - VERSÃO v9.9 COM CARDS
function carregarListaJogos() {
    const container = document.getElementById('lista-jogos');
    container.innerHTML = '';
    
    JOGOS.forEach(jogo => {
        const hs = localStorage.getItem(`hs_${jogo.id}`) || 0;
        const card = document.createElement('div');
        card.className = `jogo-card ${jogo.ativo ? '' : 'disabled'}`;
        card.innerHTML = `
            ${jogo.ativo 
                ? `<div class="badge-hs">HS: ${hs}</div>` 
                : `<div class="badge-em-breve">EM BREVE</div>`
            }
            <div class="game-preview">${jogo.emoji}</div>
            <h3>${jogo.nome}</h3>
            <p>${jogo.desc}</p>
            <button class="btn-jogar ${jogo.ativo ? '' : 'disabled'}" 
                    ${jogo.ativo ? `onclick="carregarJogo('${jogo.id}')"` : 'disabled'}>
                ${jogo.ativo ? 'JOGAR' : 'INDISPONÍVEL'}
            </button>
        `;
        container.appendChild(card);
    });
}

// Carrega o arquivo do jogo só quando clica
function carregarJogo(idJogo) {
    const jogo = JOGOS.find(j => j.id === idJogo);
    if (!jogo || !jogo.ativo) {
        notificar(`${jogo.nome} - EM BREVE 🚧`, 'info');
        return;
    }

    if (jogoAtivo) {
        jogoAtivo.parar();
        jogoAtivo = null;
    }

    const scriptVelho = document.getElementById('script-jogo');
    if (scriptVelho) scriptVelho.remove();

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