console.log("NEON ARCADE v12.2 - CORE CARREGADO");
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let jogoAtual = null, jogoRodando = false, jogoPausado = false;
let gameLoopId = null, ultimoTempo = 0;

function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
}

window.addEventListener('load', () => {
    document.getElementById('barra-loading').style.width = '100%';
    setTimeout(() => mostrarTela('tela-menu'), 1600);
});

function iniciarJogo(nome) {
    jogoAtual = nome;
    jogoRodando = true;
    jogoPausado = false;
    mostrarTela('tela-jogo');
    document.getElementById('painel-gameover').style.display = 'none';
    document.getElementById('btn-pausa').innerText = 'PAUSAR';
    
    pararJogo();
    ultimoTempo = 0;
    
    // Chama a função do jogo específico
    if (nome === 'snake' && typeof initSnake === 'function') initSnake();
    if (nome === 'breakout' && typeof initBreakout === 'function') initBreakout();
    if (nome === 'flap' && typeof initFlap === 'function') initFlap();
    if (nome === 'space' && typeof initSpace === 'function') initSpace();
}

function voltarMenu() {
    jogoRodando = false;
    pararJogo();
    mostrarTela('tela-menu');
}

function alternarPausa() {
    if (!jogoRodando) return;
    jogoPausado =!jogoPausado;
    document.getElementById('btn-pausa').innerText = jogoPausado? 'CONTINUAR' : 'PAUSAR';
}

function reiniciarJogo() { if (jogoAtual) iniciarJogo(jogoAtual); }

function mostrarGameOver(pontos) {
    jogoRodando = false;
    document.getElementById('score-final').innerText = `PONTOS: ${pontos}`;
    document.getElementById('painel-gameover').style.display = 'block';
    salvarRecorde(jogoAtual, pontos);
}

function atualizarPlacar(pontos) {
    document.getElementById('score-live').innerText = pontos;
    document.getElementById('record-live').innerText = `REC: ${pegarRecorde(jogoAtual)}`;
}

function pararJogo() {
    if (gameLoopId) { cancelAnimationFrame(gameLoopId); gameLoopId = null; }
}

function salvarRecorde(jogo, pontos) {
    let rec = pegarRecorde(jogo);
    if (pontos > rec) localStorage.setItem(`recorde_${jogo}`, pontos);
}

function pegarRecorde(jogo) {
    return parseInt(localStorage.getItem(`recorde_${jogo}`) || 0);
}