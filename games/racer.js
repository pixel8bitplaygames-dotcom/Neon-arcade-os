// NEON RACER - v3.0 PIXEL ART STYLE
function iniciarRacer(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // ← PIXEL CROCANTE

    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;
    let ultimoTempo = 0; // ← FIX DO BUG DO PAUSE

    let pontos = 0;
    let recorde = localStorage.getItem("recorde_racer") || 0;
    let velocidade = 3;
    let distancia = 0;
    let energia = 100; // ← BARRA DE ENERGIA

    let modoAnjo = false, modoTurbo = false, tempoPowerUp = 0;

    const btnPause = { x: 350, y: 10, w: 40, h: 40 };

    let player = {
        x: 200,
        y: 450,
        w: 24,
        h: 36,
        pista: 1
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
        CAMINHAO: { cor: '#4f4', w: 28, h: 70, vel: 0.8, pontos: 50 },
        CONE: { cor: '#f80', w: 20, h: 20, vel: 1.0, pontos: 5, fixo: true }
    };

    document.getElementById('record-live').textContent = "RECORDE: " + recorde;
    document.getElementById('score-live').textContent = '00000';

    function desenharPixel(x, y, w, h, cor) {
        ctx.fillStyle = cor;
        ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
        // Borda preta pixel
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.floor(x), Math.floor(y), w, h);
    }

    function desenharCarroPixel(x, y, tipo) {
        const dados = TIPOS_VEICULO[tipo];
        ctx.save();
        ctx.translate(x, y);

        if (tipo === 'CAMINHAO') {
            // Cabine
            desenharPixel(0, 0, dados.w, 25, dados.cor);
            // Carroceria
            desenharPixel(2, 25, dados.w - 4, 45, '#aaa');
            // Vidro
            desenharPixel(6, 5, dados.w - 12, 8, '#0af');
        } else if (tipo === 'CONE') {
            // Cone laranja
            desenharPixel(4, 0, dados.w - 8, dados.h, dados.cor);
            desenharPixel(0, dados.h - 5, dados.w, 5, '#f40');
        } else {
            // Carro normal
            desenharPixel(0, 0, dados.w, dados.h, dados.cor);
            // Vidro
            desenharPixel(4, 4, dados.w - 8, 10, '#111');
            // Farol
            desenharPixel(2, 2, 4, 4, '#ff0');
            desenharPixel(dados.w - 6, 2, 4, 4, '#ff0');
        }

        // Fumaça
        ctx.fillStyle = '#fff';
        ctx.fillRect(6, dados.h + 2, 4, 4);
        ctx.fillRect(dados.w - 10, dados.h + 2, 4, 4);

        ctx.restore();
    }

    function desenharPowerUp(p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Aura pulsante
        ctx.shadowColor = p.tipo === 'ENERGIA'? '#0ff' : '#ff0';
        ctx.shadowBlur = 15 + Math.sin(Date.now() / 100) * 5;

        if (p.tipo === 'ENERGIA') {
            desenharPixel(-12, -16, 24, 32, '#0af');
            desenharPixel(-8, -12, 16, 24, '#0ff');
        } else {
            desenharPixel(-16, -16, 32, 32, '#ff0');
            ctx.fillStyle = '#f00';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', 0, -2);
            ctx.fillText('▲', 0, 8);
        }
        ctx.restore();
    }

    function desenharHUD() {
        // Placar pixelado
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.strokeText(pontos.toString().padStart(5, '0'), 10, 25);
        ctx.fillText(pontos.toString().padStart(5, '0'), 10, 25);

        // Barra de energia
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(280, 10, 104, 20);
        ctx.strokeRect(280, 10, 104, 20);

        ctx.fillStyle = energia > 30? '#0af' : '#f44';
        ctx.fillRect(282, 12, energia, 16);

        ctx.fillStyle = '#fff';
        ctx.fillRect(282 + energia, 12, 2, 16);

        desenharBotaoPause();
    }

    function desenharBotaoPause() {
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
        obstaculos = [];
        powerups = [];
        tempoProxObstaculo = 0;
        modoAnjo = false;
        modoTurbo = false;
        tempoPowerUp = 0;
        gameOverAtivo = false;
        pausado = false;
        ultimoTempo = performance.now(); // ← RESETA TEMPO
        document.getElementById('score-live').textContent = '00000';
        loop(ultimoTempo);
    }

    function loop(tempoAtual) {
        // FIX DO BUG: calcula delta real
        if (!ultimoTempo) ultimoTempo = tempoAtual;
        const delta = Math.min((tempoAtual - ultimoTempo) / 16.67, 2); // max 2x
        ultimoTempo = tempoAtual;

        if(pausado) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 400, 550);
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff0';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.strokeText('PAUSADO', 200, 280);
            ctx.fillText('PAUSADO', 200, 280);
            desenharBotaoPause();
            animFrameId = requestAnimationFrame(loop);
            return;
        }

        if(gameOverAtivo) return;

        ctx.clearRect(0,0,400,550);

        // Velocidade aumenta com delta
        velocidade += 0.0015 * delta;
        distancia += velocidade * delta;
        pontos = Math.floor(distancia / 10);
        energia = Math.max(0, energia - 0.05 * delta); // Gasta energia
        document.getElementById('score-live').textContent = pontos.toString().padStart(5, '0');

        // Grama verde nas laterais
        ctx.fillStyle = '#2a5';
        ctx.fillRect(0, 0, 50, 550);
        ctx.fillRect(350, 0, 50, 550);

        // Zebrinha vermelho/branco
        for(let i = 0; i < 550; i += 20) {
            ctx.fillStyle = (i / 20) % 2 === 0? '#f00' : '#fff';
            ctx.fillRect(45, i, 5, 20);
            ctx.fillRect(350, i, 5, 20);
        }

        // Asfalto
        ctx.fillStyle = '#444';
        ctx.fillRect(50, 0, 300, 550);

        // Linhas da pista
        ctx.fillStyle = '#ccc';
        linhas.forEach(linha => {
            linha.y += velocidade * delta;
            if(linha.y > 550) linha.y = -40;
            ctx.fillRect(197, linha.y, 6, 20);
        });

        // Move player
        let alvoX = pistas[player.pista] - player.w/2;
        player.x += (alvoX - player.x) * 0.3 * delta;

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
        if (Math.random() < 0.0015 * delta && pontos > 100) {
            powerups.push({
                x: pistas[Math.floor(Math.random() * 3)],
                y: -40,
                tipo: Math.random() < 0.6? 'ENERGIA' : 'TURBO'
            });
        }

        // Atualiza obstáculos
        obstaculos = obstaculos.filter(obs => {
            obs.y += obs.vel * velocidade * delta;
            desenharCarroPixel(obs.x, obs.y, obs.tipo);

            if(!modoAnjo &&
               obs.y + obs.h > player.y &&
               obs.y < player.y + player.h &&
               obs.pista === player.pista) {
                energia -= 34; // Dano
                if (energia <= 0) {
                    gameOver();
                    return false;
                }
                return false; // Remove após bater
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

        // Timer power-up
        if (tempoPowerUp > 0) {
            tempoPowerUp -= delta;
            if (tempoPowerUp <= 0) {
                modoAnjo = false;
                if (modoTurbo) {
                    modoTurbo = false;
                    velocidade -= 1.5;
                }
            }
        }

        // Desenha player
        desenharCarroPixel(player.x, player.y, 'VERMELHO');

        // Barra power-up
        if (tempoPowerUp > 0) {
            ctx.fillStyle = modoAnjo? '#0ff' : '#ff0';
            ctx.fillRect(player.x + player.w/2 - 15, player.y - 15,
                        (tempoPowerUp / (modoAnjo? 240 : 180)) * 30, 4);
        }

        desenharHUD();
        animFrameId = requestAnimationFrame(loop);
    }

    function ativarPowerUp(tipo) {
        if (tipo === 'ENERGIA') {
            energia = Math.min(100, energia + 40);
        } else {
            tempoPowerUp = 180;
            modoTurbo = true;
            velocidade += 1.5;
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

        const reiniciarClick = (e) => {
            canvas.removeEventListener('click', reiniciarClick);
            canvas.removeEventListener('touchstart', reiniciarClick);
            reiniciar();
        };
        canvas.addEventListener('click', reiniciarClick);
        canvas.addEventListener('touchstart', reiniciarClick);
    }

    // Controles
    let inicioToqueX = 0;
    function handleTouchStart(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);

        // Botão pause
        if (x >= btnPause.x && x <= btnPause.x + btnPause.w &&
            y >= btnPause.y && y <= btnPause.y + btnPause.h) {
            if (!gameOverAtivo) {
                pausado =!pausado;
                if (!pausado) {
                    ultimoTempo = performance.now(); // ← FIX: reseta tempo
                    loop(ultimoTempo);
                }
            }
            return;
        }

        inicioToqueX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        if(!pausado &&!gameOverAtivo) e.preventDefault();
    }

    function handleTouchEnd(e) {
        if(pausado || gameOverAtivo) return;
        let diff = e.changedTouches[0].clientX - inicioToqueX;
        if(diff > 50 && player.pista < 2) player.pista++;
        if(diff < -50 && player.pista > 0) player.pista--;
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
                ultimoTempo = performance.now(); // ← FIX
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