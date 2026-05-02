// NEON ARCADE OS - CORE v1.1
// Sem sw.js, sem cache chato. Só funciona.

const JOGOS = [
  { id: 'snake', nome: '🐍 NEON SNAKE', arquivo: './games/snake.js' },
  { id: 'breakout', nome: '🧱 NEON BREAKOUT', arquivo: './games/breakout.js' }
];

let jogoAtivo = null;
let eventoInstalar = null;

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

    // Remove script antigo se existir
    const scriptVelho = document.getElementById('script-jogo');
    if (scriptVelho) scriptVelho.remove();

    const script = document.createElement('script');
    script.id = 'script-jogo';
    script.src = `${jogo.arquivo}?v=${Date.now()}`; // Evita cache

    script.onload = () => {
        mostrarTela('tela-jogo');
        // Cada jogo tem que ter uma função window.iniciarNomeDoJogo()
        const funcaoIniciar = window[`iniciar${idJogo.charAt(0).toUpperCase() + idJogo.slice(1)}`];
        if (funcaoIniciar) {
            jogoAtivo = funcaoIniciar(document.getElementById('canvas'));
        } else {
            alert(`Função iniciar${idJogo.charAt(0).toUpperCase() + idJogo.slice(1)} não encontrada!`);
            voltarMenu();
        }
    };

    script.onerror = () => {
        alert(`Erro ao carregar ${jogo.nome}. Verifica se o arquivo games/${idJogo}.js existe.`);
    };

    document.head.appendChild(script);
}

// Botão pausar
const btnPausa = document.getElementById('btn-pausa');
if(btnPausa) {
    btnPausa.onclick = () => {
        if (jogoAtivo && jogoAtivo.pausar) {
            const pausado = jogoAtivo.pausar();
            btnPausa.textContent = pausado ? 'VOLTAR' : 'PAUSAR';
        }
    };
}

// Inicia tudo
window.addEventListener('load', () => {
    carregarListaJogos();
});