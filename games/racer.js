// NEON RACER - v7.0 FINAL: PULO NO TOQUE + CARROS FIX + NEON
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
    let pulando = false;
    let tempoPulo = 0;
    let alturaPulo = 0;
    let podePuloduplo = false;
    let pulosRestantes = 1;

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
    let particulas = [];

    let linhas = [];
    for(let i = 0; i < 15; i++) {
        linhas.push({ y: i * 40 });
    }

    const CORES_NEON = {
        VERMELHO: '#ff006e',
        AZUL: '#00f5ff',
        CAMINHAO: '#00ff41',
        CIANO: '#00ffff',
        MAGENTA: '#ff00ff',
        AMARELO: '#ffff00'
    };

    const TIPOS_VEICULO = {
        VERMELHO: { cor: CORES_NEON.VERMELHO, w: 24, h: 36, vel: 1.0, pontos: 10 },
        AZUL: { cor: CORES_NEON.AZUL, w: 24, h: 36, vel: 1.3, pontos: 20 },
        CAMINHAO: { cor: CORES_NEON.CAMINHAO, w: 28, h: 70, vel: 0.8, pontos: 50 }
    };

    document.getElementById('record-live').textContent = "RECORDE: " + recorde;
    document.getElementById('score-live').textContent = '00000';

    function desenharCarro(x, y, tipo, ehPlayer = false) {
        const dados = TIPOS_VEICULO;
        ctx.save();
        ctx.translate(x, y - alturaPulo);

        if (ehPlayer && modoAsas) {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillRect(-28, -8, 4, 16);
            ctx.fillRect(-24, -12, 4, 20);
            ctx.fillRect(-20, -14, 4, 24);
            ctx.fillRect(-16, -10, 4, 16);
            ctx.fillRect(dados.w + 24, -8, 4, 16);
            ctx.fillRect(dados.w + 20, -12, 4, 20);
            ctx.fillRect(dados.w + 16, -14, 4, 24);
            ctx.fillRect(dados.w + 12, -10, 4, 16);
            ctx.shadowBlur = 0;
        }

        if (ehPlayer &&!gameOverAtivo) {
            ctx.fillStyle = '#ff0';
            ctx.shadowColor = '#ff0';
            ctx.shadowBlur = 10;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', dados.w/2, -8);
            ctx.shadowBlur = 0;
        }

        // CARROCERIA NEON
        ctx.shadowColor = dados.cor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = dados.cor;
        ctx.fillRect(0, 0, dados.w, dados.h);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, dados.w, dados.h);

        if (tipo === 'CAMINHAO') {
            ctx.fillStyle = '#aaa';
            ctx.fillRect(2, 25, dados.w - 4, 45);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(2, 25, dados.w - 4, 45);
            ctx.shadowColor = CORES_NEON.CIANO;
            ctx.shadowBlur = 15;
            ctx.fillStyle = CORES_NEON.CIANO;
            ctx.fillRect(6, 5, dados.w - 12, 8);
            ctx.strokeRect(6, 5, dados.w - 12, 8);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(4, 4, dados.w - 8, 10);
            ctx.strokeStyle = CORES_NEON.CIANO;
            ctx.strokeRect(4, 4, dados.w - 8, 10);

            ctx.shadowColor = CORES_NEON.AMARELO;
            ctx.shadowBlur = 25;
            ctx.fillStyle = CORES_NEON.AMARELO;
            ctx.fillRect(2, 2, 4, 4);
            ctx.fillRect(dados.w - 6, 2, 4, 4);
            ctx.shadowBlur = 0;

            ctx.shadowColor = CORES_NEON.VERMELHO;
            ctx.shadowBlur = 15;
            ctx.fillStyle = CORES_NEON.VERMELHO;
            ctx.fillRect(4, dados.h - 6, 4, 4);
            ctx.fillRect(dados.w - 8, dados.h - 6, 4, 4);
            ctx.shadowBlur = 0;
        }

        if (ehPlayer && (modoAsas || pulando)) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.ellipse(dados.w/2, dados.h + 15, dados.w/2, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (ehPlayer && Math.random() < 0.4) {
            particulas.push({
                x: x + dados.w/2 + (Math.random() - 0.5) * 10,
                y: y + dados.h,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 2,
                cor: modoAsas? '#fff' : pulando? CORES_NEON.CIANO : CORES_NEON.MAGENTA,
                vida: 20
            });
        }

        ctx.restore();
    }

    function desenharPowerUp(p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.tipo === 'ENERGIA') {
            ctx.shadowColor = CORES_NEON.CIANO;
            ctx.shadowBlur = 20;
            ctx.fillStyle = CORES_NEON.CIANO;
            ctx.fillRect(-12, -16, 24, 32);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(-12, -16, 24, 32);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(-8, -12, 16, 24);
            ctx.strokeRect(-8, -12, 16, 24);
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', 0, 4);
            ctx.shadowBlur = 0;
        } else if (p.tipo === 'ASAS') {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20;
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
            ctx.shadowBlur = 0;
        } else if (p.tipo === 'DIAMANTE') {
            ctx.shadowColor = CORES_NEON.CIANO;
            ctx.shadowBlur = 25;
            ctx.fillStyle = CORES_NEON.CIANO;
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(-14, 0);
            ctx.lineTo(0, 18);
            ctx.lineTo(14, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#00ffff';
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
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    }

    function desenharHUD() {
        ctx.fillStyle = CORES_NEON.MAGENTA;
        ctx.shadowColor = CORES_NEON.MAGENTA;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.strokeText(pontos.toString().padStart(5, '0'), 10, 25);
        ctx.fillText(pontos.toString().padStart(5, '0'), 10, 25);
        ctx.shadowBlur = 0;

        ctx.fillStyle = CORES_NEON.CIANO;
        ctx.shadowColor = CORES_NEON.CIANO;
        ctx.shadowBlur = 10;
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('ENERGIA', 280, 25);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#1a0033';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(280, 30, 104, 12);
        ctx.strokeRect(280, 30, 104, 12);

        let corEnergia = energia > 60? CORES_NEON.CIANO : energia > 30? CORES_NEON.AMARELO : CORES_NEON.VERMELHO;
        ctx.shadowColor = corEnergia;
        ctx.shadowBlur = 10;
        ctx.fillStyle = corEnergia;
        ctx.fillRect(282, 32, energia, 8);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.fillRect(282 + energia, 32, 2, 8);

        if (tempoAsas > 0) {
            ctx.fillStyle = '#1a0033';
            ctx.fillRect(10, 35, 104, 12);
            ctx.strokeStyle = '#0f0';
            ctx.strokeRect(10, 35, 104, 12);
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#0f0';
            ctx.fillRect(12, 37, (tempoAsas / 240) * 100, 8);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = '6px "Press Start 2P"';
            ctx.fillText('ASAS', 12, 43);
        }

        if (tempoPulo > 0) {
            ctx.fillStyle = '#1a0033';
            ctx.fillRect(10, 52, 104, 12);
            ctx.strokeStyle = CORES_NEON.CIANO;
            ctx.strokeRect(10, 52, 104, 12);
            ctx.shadowColor = CORES_NEON.CIANO;
            ctx.shadowBlur = 10;
            ctx.fillStyle = CORES_NEON.CIANO;
            ctx.fillRect(12, 54, (tempoPulo / 120) * 100, 8);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = '6px "Press Start 2P"';
            ctx.fillText('PULO', 12, 60);
        }

        if (podePuloduplo &&!pulando) {
            ctx.fillStyle = CORES_NEON.CIANO;
            ctx.shadowColor = CORES_NEON.CIANO;
            ctx.shadowBlur = 15;
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('PULO DUPLO', 120, 25);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = 'rgba(26,0,51,0.8)';
        ctx.strokeStyle = CORES_NEON.MAGENTA;
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
        particulas = [];
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
            ctx.fillStyle = CORES_NEON.MAGENTA;
            ctx.shadowColor = CORES_NEON.MAGENTA;
            ctx.shadowBlur = 15;
            ctx.fillText('PAUSADO', 200, 280);
            ctx.shadowBlur = 0;
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

        // Grama NEON
        ctx.fillStyle = '#001a00';
        ctx.fillRect(0, 0, 50, 550);
        ctx.fillRect(350, 0, 50, 550);
        ctx.shadowColor = CORES_NEON.CAMINHAO;
        ctx.shadowBlur = 20;
        ctx.fillStyle = CORES_NEON.CAMINHAO;
        ctx.fillRect(0, 0, 50, 550);
        ctx.fillRect(350, 0, 50, 550);
        ctx.shadowBlur = 0;

        // Zebrinha NEON
        for(let i = 0; i < 550; i += 20) {
            let cor = (i / 20) % 2 === 0? CORES_NEON.VERMELHO : CORES_NEON.CIANO;
            ctx.shadowColor = cor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = cor;
            ctx.fillRect(45, i, 5, 20);
            ctx.fillRect(350, i, 5, 20);
        }
        ctx.shadowBlur = 0;

        // Asfalto ROXO
        ctx.fillStyle = '#1a0033';
        ctx.fillRect(50, 0, 300, 550);

        // Linhas NEON
        ctx.shadowColor = CORES_NEON.CIANO;
        ctx.shadowBlur = 15;
        ctx.fillStyle = CORES_NEON.CIANO;
        linhas.forEach(linha => {
            linha.y += velocidade * delta;
            if(linha.y > 550) linha.y = -40;
            ctx.fillRect(197, linha.y, 6, 20);
        });
        ctx.shadowBlur = 0;

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

        // Partículas
        particulas = particulas.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vida--;
            ctx.fillStyle = p.cor;
            ctx.shadowColor = p.cor;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = p.vida / 20;
            ctx.fillRect(p.x, p.y, 3, 3);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            return p.vida > 0;
        });

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
        ctx.fillStyle = CORES_NEON.VERMELHO;
        ctx.shadowColor = CORES_NEON.VERMELHO;
        ctx.shadowBlur = 20;
        ctx.fillText('VOCÊ FALHOU!', 200, 220);
        ctx.shadowBlur = 0;

        ctx.font = '12px "Press Start 2P"';
        ctx.strokeText(`DISTÂNCIA: ${pontos}m`, 200, 300);
        ctx.fillStyle = CORES_NEON.CIANO;
        ctx.shadowColor = CORES_NEON.CIANO;
        ctx.shadowBlur = 15;
        ctx.fillText(`DISTÂNCIA: ${pontos}m`, 200, 300);
        ctx.shadowBlur = 0;

        if(pontos >= recorde && pontos > 0) {
            ctx.fillStyle = CORES_NEON.AMARELO;
            ctx.shadowColor = CORES_NEON.AMARELO;
            ctx.shadowBlur = 15;
            ctx.fillText('NOVO RECORDE!', 200, 330);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = CORES_NEON.CAMINHAO;
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