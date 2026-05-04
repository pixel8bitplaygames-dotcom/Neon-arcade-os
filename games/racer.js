// NEON RACER - v6.0 PULO NO TOQUE + CARROS FIX
function iniciarRacer(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;
    let ultimoTempo = 0;

    let pontos = 0;
    let recorde = localStorage.getItem("recorde_racer") || 0;
    let velocidade = 3;
    let distancia = 0;
    let energia = 100;

    // Power-ups
    let modoAsas = false;
    let tempoAsas = 0;

    // Sistema de PULO
    let pulando = false;
    let tempoPulo = 0;
    let alturaPulo = 0;
    let podePuloduplo = false; // ← Diamante libera
    let pulosRestantes = 1; // ← 1 normal, 2 com diamante

    const btnPause = { x: 350, y: 10, w: 40, h: 40 };

    let player = {
        x: 200,
        y: 450,
        w: 24,
        h: 36,
        pista: 1,
        yBase: 450
    };

    const pistas = [80, 185, 290];
    let obstaculos = [];
    let tempoProxObstaculo = 0;
    let powerups = [];

    let linhas = [];
    for(let i = 0; i < 15; i++) {
        linhas.push({ y: i * 40 });
    }

    const TIPOS_VEICULO = {
        VERMELHO: { cor: '#f44', w: 24, h: 36, vel: 1.0, pontos: 10 },
        AZUL: { cor: '#44f', w: 24, h: 36, vel: 1.3, pontos: 20 },
        CAMINHAO: { cor: '#4f4', w: 28, h: 70, vel: 0.8, pontos: 50 }
    };

    document.getElementById('record-live').textContent = "RECORDE: " + recorde;
    document.getElementById('score-live').textContent = '00000';

    // ← FIX: FUNÇÃO CORRIGIDA PRA DESENHAR CARRO
    function desenharCarro(x, y, tipo, ehPlayer = false) {
        const dados = TIPOS_VEICULO[tipo];
        ctx.save();
        ctx.translate(x, y - alturaPulo);

        if (ehPlayer && modoAsas) {
            // ASAS
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 15;

            // ASA ESQUERDA
            ctx.fillRect(-28, -8, 4, 16);
            ctx.fillRect(-24, -12, 4, 20);
            ctx.fillRect(-20, -14, 4, 24);
            ctx.fillRect(-16, -10, 4, 16);

            // ASA DIREITA
            ctx.fillRect(dados.w + 24, -8, 4, 16);
            ctx.fillRect(dados.w + 20, -12, 4, 20);
            ctx.fillRect(dados.w + 16, -14, 4, 24);
            ctx.fillRect(dados.w + 12, -10, 4, 16);

            ctx.shadowBlur = 0;
        }

        if (ehPlayer &&!gameOverAtivo) {
            ctx.fillStyle = '#ff0';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', dados.w/2, -8);
        }

        // CARROCERIA - CORRIGIDO
        ctx.fillStyle = dados.cor;
        ctx.fillRect(0, 0, dados.w, dados.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, dados.w, dados.h);

        if (tipo === 'CAMINHAO') {
            ctx.fillStyle = '#aaa';
            ctx.fillRect(2, 25, dados.w - 4, 45);
            ctx.strokeRect(2, 25, dados.w - 4, 45);
            ctx.fillStyle = '#0af';
            ctx.fillRect(6, 5, dados.w - 12, 8);
            ctx.strokeRect(6, 5, dados.w - 12, 8);
        } else {
            // Vidro
            ctx.fillStyle = '#111';
            ctx.fillRect(4, 4, dados.w - 8, 10);
            ctx.strokeRect(4, 4, dados.w - 8, 10);
            // Farol
            ctx.fillStyle = '#ff0';
            ctx.fillRect(2, 2, 4, 4);
            ctx.fillRect(dados.w - 6, 2, 4, 4);
            // Lanterna
            ctx.fillStyle = '#f00';
            ctx.fillRect(4, dados.h - 6, 4, 4);
            ctx.fillRect(dados.w - 8, dados.h - 6, 4, 4);
        }

        // SOMBRA
        if (ehPlayer && (modoAsas || pulando)) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(dados.w/2, dados.h + 15, dados.w/2, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function desenharPowerUp(p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.tipo === 'ENERGIA') {
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#0af';
            ctx.fillRect(-12, -16, 24, 32);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(-12, -16, 24, 32);
            ctx.fillStyle = '#0ff';
            ctx.fillRect(-8, -12, 16, 24);
            ctx.strokeRect(-8, -12, 16, 24);
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', 0, 4);
        } else if (p.tipo === 'ASAS') {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#fff';
            ctx.fillRect(-20, -4, 8, 8);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(-20, -4, 8, 8);
            ctx.fillRect(-12, -8, 8, 16);
            ctx.strokeRect(-12, -8, 8, 16);
            ctx.fillRect(-4, -12, 8, 24);
            ctx.strokeRect(-4, -12, 8, 24);
            ctx.fillRect(4, -8, 8, 16);
            ctx.strokeRect(4, -8, 8, 16);
            ctx.fillRect(12, -4, 8, 8);
            ctx.strokeRect(12, -4, 8, 8);
        } else if (p.tipo === 'DIAMANTE') {
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 20;

            ctx.fillStyle = '#0af';
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(-14, 0);
            ctx.lineTo(0, 18);
            ctx.lineTo(14, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.lineTo(-8, 0);
            ctx.lineTo(0, 14);
            ctx.lineTo(8, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-4, -5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function desenharHUD() {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.strokeText(pontos.toString().padStart(5, '0'), 10, 25);
        ctx.fillText(pontos.toString().padStart(5, '0'), 10, 25);

        // ENERGIA
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('ENERGIA', 280, 25);

        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(280, 30, 104, 12);
        ctx.strokeRect(280, 30, 104, 12);

        ctx.fillStyle = energia > 60? '#0af' : energia > 30? '#ff0' : '#f44';
        ctx.fillRect(282, 32, energia, 8);

        ctx.fillStyle = '#fff';
        ctx.fillRect(282 + energia, 32, 2, 8);

        // BARRINHA ASAS
        if (tempoAsas > 0) {
            ctx.fillStyle = '#000';
            ctx.fillRect(10, 35, 104, 12);
            ctx.strokeStyle = '#0f0';
            ctx.strokeRect(10, 35, 104, 12);

            ctx.fillStyle = '#0f0';
            ctx.fillRect(12, 37, (tempoAsas / 240) * 100, 8);

            ctx.fillStyle = '#fff';
            ctx.font = '6px "Press Start 2P"';
            ctx.fillText('ASAS', 12, 43);
        }

        // BARRINHA PULO
        if (tempoPulo > 0) {
            ctx.fillStyle = '#000';
            ctx.fillRect(10, 52, 104, 12);
            ctx.strokeStyle = '#0ff';
            ctx.strokeRect(10, 52, 104, 12);

            ctx.fillStyle = '#0ff';
            ctx.fillRect(12, 54, (tempoPulo / 120) * 100, 8);

            ctx.fillStyle = '#fff';
            ctx.font = '6px "Press Start 2P"';
            ctx.fillText('PULO', 12, 60);
        }

        // INDICADOR PULO DUPLO
        if (podePuloduplo &&!pulando) {
            ctx.fillStyle = '#0ff';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('PULO DUPLO', 120, 25);
        }

        // Botão pause
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(btnPause.x, btnPause.y, btnPause.w, btnPause.h);
        ctx.strokeRect(btnPause.x, btnPause.y, btnPause.w, btnPause.h);

        ctx.fillStyle = '#fff';
        if (pausado) {
            ctx.beginPath();
            ctx.moveTo(btnPause.x + 14, btnPause.y + 10);
            ctx.lineTo(btnPause.x + 14, btnPause.y + 30);
            ctx.lineTo(btnPause.x + 28, btnPause.y + 20);
            ctx.fill();
        } else {
            ctx.fillRect(btnPause.x + 12, btnPause.y + 10, 6, 20);
            ctx.fillRect(btnPause.x + 22, btnPause.y + 10, 6, 20);
        }
    }

    function reiniciar() {
        pontos = 0;
        velocidade = 3;
        distancia = 0;
        energia = 100;
        player.pista = 1;
        player.x = pistas[1] - player.w/2;
        player.y = player.yBase;
        obstaculos = [];
        powerups = [];
        tempoProxObstaculo = 0;
        modoAsas = false;
        pulando = false;
        tempoAsas = 0;
        tempoPulo = 0;
        alturaPulo = 0;
        podePuloduplo = false;
        pulosRestantes = 1;
        gameOverAtivo = false;
        pausado = false;
        ultimoTempo = performance.now();
        document.getElementById('score-live').textContent = '00000';
        loop(ultimoTempo);
    }

    function loop(tempoAtual) {
        if (!ultimoTempo) ultimoTempo = tempoAtual;
        const delta = Math.min((tempoAtual - ultimoTempo) / 16.67, 2);
        ultimoTempo = tempoAtual;

        if(pausado) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 400, 550);
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.strokeText('PAUSADO', 200, 280);
            ctx.fillStyle = '#ff0';
            ctx.fillText('PAUSADO', 200, 280);
            desenharHUD();
            animFrameId = requestAnimationFrame(loop);
            return;
        }

        if(gameOverAtivo) return;

        ctx.clearRect(0,0,400,550);

        velocidade += 0.0015 * delta;
        distancia += velocidade * delta;
        pontos = Math.floor(distancia / 10);
        energia = Math.max(0, energia - 0.03 * delta);
        document.getElementById('score-live').textContent = pontos.toString().padStart(5, '0');

        if (energia <= 0) {
            gameOver();
            return;
        }

        // Grama
        ctx.fillStyle = '#2a5';
        ctx.fillRect(0, 0, 50, 550);
        ctx.fillRect(350, 0, 50, 550);

        // Zebrinha
        for(let i = 0; i < 550; i += 20) {
            ctx.fillStyle = (i / 20) % 2 === 0? '#f00' : '#fff';
            ctx.fillRect(45, i, 5, 20);
            ctx.fillRect(350, i, 5, 20);
        }

        // Asfalto
        ctx.fillStyle = '#444';
        ctx.fillRect(50, 0, 300, 550);

        // Linhas
        ctx.fillStyle = '#ccc';
        linhas.forEach(linha => {
            linha.y += velocidade * delta;
            if(linha.y > 550) linha.y = -40;
            ctx.fillRect(197, linha.y, 6, 20);
        });

        // Move player
        let alvoX = pistas[player.pista] - player.w/2;
        player.x += (alvoX - player.x) * 0.4 * delta;

        // FÍSICA DO PULO
        if (pulando) {
            alturaPulo = Math.sin((tempoPulo / 120) * Math.PI) * 60;
            player.y = player.yBase - alturaPulo;
        } else if (modoAsas) {
            player.y = player.yBase - 20;
            alturaPulo = 20;
        } else {
            player.y = player.yBase;
            alturaPulo = 0;
        }

        // Spawn obstáculos
        tempoProxObstaculo -= delta;
        if(tempoProxObstaculo <= 0) {
            let pistaAleatoria = Math.floor(Math.random() * 3);
            let tipos = Object.keys(TIPOS_VEICULO);
            let tipoEscolhido = tipos[Math.floor(Math.random() * tipos.length)];

            if (pontos < 300 && tipoEscolhido === 'CAMINHAO') {
                tipoEscolhido = Math.random() < 0.5? 'VERMELHO' : 'AZUL';
            }

            const dados = TIPOS_VEICULO[tipoEscolhido];
            obstaculos.push({
                x: pistas[pistaAleatoria] - dados.w/2,
                y: -70,
                pista: pistaAleatoria,
                tipo: tipoEscolhido,
        ...dados
            });
            tempoProxObstaculo = Math.max(25, 60 - velocidade * 1.5);
        }

        // Spawn power-ups
        if (Math.random() < 0.002 * delta && pontos > 50) {
            let rand = Math.random();
            let tipo = rand < 0.4? 'ENERGIA' : rand < 0.7? 'ASAS' : 'DIAMANTE';
            powerups.push({
                x: pistas[Math.floor(Math.random() * 3)],
                y: -40,
                tipo: tipo
            });
        }

        // Atualiza obstáculos
        obstaculos = obstaculos.filter(obs => {
            obs.y += obs.vel * velocidade * delta;
            desenharCarro(obs.x, obs.y, obs.tipo, false);

            // Colisão - ignora se voando ou pulando
            if(!modoAsas &&!pulando &&
               obs.y + obs.h > player.y &&
               obs.y < player.y + player.h &&
               obs.pista === player.pista) {
                energia -= 34;
                if (energia <= 0) {
                    gameOver();
                    return false;
                }
                return false;
            }

            if(obs.y > 550) {
                pontos += obs.pontos;
                return false;
            }
            return true;
        });

        // Atualiza power-ups
        powerups = powerups.filter(p => {
            p.y += velocidade * 0.8 * delta;
            desenharPowerUp(p);

            if (Math.abs(p.x - (player.x + player.w/2)) < 25 &&
                Math.abs(p.y - (player.y + player.h/2)) < 35) {
                ativarPowerUp(p.tipo);
                return false;
            }
            return p.y < 580;
        });

        // Timer ASAS
        if (tempoAsas > 0) {
            tempoAsas -= delta;
            if (tempoAsas <= 0) {
                modoAsas = false;
            }
        }

        // Timer PULO
        if (tempoPulo > 0) {
            tempoPulo -= delta;
            if (tempoPulo <= 0) {
                pulando = false;
                pulosRestantes = podePuloduplo? 2 : 1;
            }
        }

        // Desenha player
        desenharCarro(player.x, player.y, 'VERMELHO', true);

        desenharHUD();
        animFrameId = requestAnimationFrame(loop);
    }

    function ativarPowerUp(tipo) {
        if (tipo === 'ENERGIA') {
            energia = Math.min(100, energia + 40);
        } else if (tipo === 'ASAS') {
            tempoAsas = 240;
            modoAsas = true;
        } else if (tipo === 'DIAMANTE') {
            podePuloduplo = true;
            pulosRestantes = 2;
        }
    }

    function gameOver() {
        gameOverAtivo = true;
        cancelAnimationFrame(animFrameId);

        if(pontos > recorde) {
            recorde = pontos;
            localStorage.setItem("recorde_racer", recorde);
            document.getElementById('record-live').textContent = "RECORDE: " + recorde;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, 400, 550);

        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText('VOCÊ FALHOU!', 200, 220);
        ctx.fillStyle = '#f44';
        ctx.fillText('VOCÊ FALHOU!', 200, 220);

        ctx.font = '12px "Press Start 2P"';
        ctx.strokeText(`DISTÂNCIA: ${pontos}m`, 200, 300);
        ctx.fillStyle = '#0ff';
        ctx.fillText(`DISTÂNCIA: ${pontos}m`, 200, 300);

        if(pontos >= recorde && pontos > 0) {
            ctx.fillStyle = '#ff0';
            ctx.fillText('NOVO RECORDE!', 200, 330);
        }

        ctx.fillStyle = '#0f0';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('TOQUE P/ REINICIAR', 200, 400);

        const reiniciarClick = () => {
            canvas.removeEventListener('click', reiniciarClick);
            canvas.removeEventListener('touchstart', reiniciarClick);
            reiniciar();
        };
        canvas.addEventListener('click', reiniciarClick);
        canvas.addEventListener('touchstart', reiniciarClick);
    }

    // CONTROLES - ARRASTA PRA LADO / TOQUE PRA PULAR
    let inicioToqueX = 0;
    let inicioToqueTempo = 0;
    let arrastando = false;

    function handleTouchStart(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);

        if (x >= btnPause.x && x <= btnPause.x + btnPause.w &&
            y >= btnPause.y && y <= btnPause.y + btnPause.h) {
            if (!gameOverAtivo) {
                pausado =!pausado;
                if (!pausado) {
                    ultimoTempo = performance.now();
                    loop(ultimoTempo);
                }
            }
            return;
        }

        inicioToqueX = e.touches[0].clientX;
        inicioToqueTempo = Date.now();
        arrastando = false;
    }

    function handleTouchMove(e) {
        if(!pausado &&!gameOverAtivo) e.preventDefault();
        arrastando = true;
    }

    function handleTouchEnd(e) {
        if(pausado || gameOverAtivo) return;

        let diff = e.changedTouches[0].clientX - inicioToqueX;
        let tempoToque = Date.now() - inicioToqueTempo;

        // TOQUE RÁPIDO = PULA
        if (!arrastando || (Math.abs(diff) < 15 && tempoToque < 200)) {
            if (pulosRestantes > 0 &&!pulando) {
                pulando = true;
                tempoPulo = 120;
                pulosRestantes--;
                if (pulosRestantes === 0) {
                    podePuloduplo = false;
                }
            }
        } else {
            // ARRASTA = MUDA PISTA
            if(diff > 25 && player.pista < 2) player.pista++;
            if(diff < -25 && player.pista > 0) player.pista--;
        }
    }

    canvas.addEventListener('touchstart', handleTouchStart, {passive: true});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd);

    ultimoTempo = performance.now();
    loop(ultimoTempo);

    return {
        pausar: () => {
            if(gameOverAtivo) return true;
            pausado =!pausado;
            if(!pausado) {
                ultimoTempo = performance.now();
                loop(ultimoTempo);
            }
            return pausado;
        },
        parar: () => {
            gameOverAtivo = true;
            cancelAnimationFrame(animFrameId);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        }
    };
}