// NEON RACER - v2.2 MOBILE COM BOTÃO PAUSE
function iniciarRacer(canvas) {
    const ctx = canvas.getContext('2d');
    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;

    let pontos = 0;
    let recorde = localStorage.getItem("recorde_racer") || 0;
    let velocidade = 3;
    let distancia = 0;
    let nivelVelocidade = 1;

    let modoAnjo = false, modoTurbo = false, tempoPowerUp = 0;

    // Botão pause
    const btnPause = { x: 350, y: 10, w: 40, h: 40 };

    let player = {
        x: 200,
        y: 450,
        w: 30,
        h: 50,
        pista: 1
    };

    const pistas = [80, 185, 290];
    let obstaculos = [];
    let tempoProxObstaculo = 0;
    let powerups = [];

    let linhas = [];
    for(let i = 0; i < 10; i++) {
        linhas.push({ y: i * 60 });
    }

    const TIPOS_VEICULO = {
        AMARELO: { cor: '#ff0', w: 28, h: 45, vel: 1.0, pontos: 10 },
        VERMELHO: { cor: '#f44', w: 26, h: 42, vel: 1.4, pontos: 25 },
        CAMINHAO_PIPA: { cor: '#0af', w: 35, h: 60, vel: 0.7, pontos: 50, emoji: '🚛' },
        CAMINHAO_CARGA: { cor: '#888', w: 32, h: 55, vel: 0.8, pontos: 40, emoji: '🚚' }
    };

    document.getElementById('record-live').textContent = "RECORDE: " + recorde;
    document.getElementById('score-live').textContent = pontos;

    function setNeon(color, blur = 10) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }

    function resetNeon() { ctx.shadowBlur = 0; }

    function desenharBotaoPause() {
        ctx.save();
        // Fundo do botão
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(btnPause.x, btnPause.y, btnPause.w, btnPause.h, 8);
        ctx.fill();
        ctx.stroke();

        // Ícone pause ou play
        setNeon('#0ff', 10);
        if (pausado) {
            // Triângulo play
            ctx.beginPath();
            ctx.moveTo(btnPause.x + 14, btnPause.y + 10);
            ctx.lineTo(btnPause.x + 14, btnPause.y + 30);
            ctx.lineTo(btnPause.x + 28, btnPause.y + 20);
            ctx.closePath();
            ctx.fill();
        } else {
            // Duas barras pause
            ctx.fillRect(btnPause.x + 12, btnPause.y + 10, 6, 20);
            ctx.fillRect(btnPause.x + 22, btnPause.y + 10, 6, 20);
        }
        resetNeon();
        ctx.restore();
    }

    function desenharCarro(x, y, w, h, cor, tipo = 'PLAYER') {
        ctx.save();
        ctx.translate(x + w/2, y + h/2);

        if (modoAnjo && tipo === 'PLAYER') {
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-w, 0, 12, 20, -0.3, 0, Math.PI * 2);
            ctx.ellipse(w, 0, 12, 20, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowColor = (tipo === 'PLAYER' && modoTurbo)? '#ff0' : cor;
        ctx.shadowBlur = (tipo === 'PLAYER' && modoTurbo)? 30 : 15;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.fillStyle = cor;

        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h, 6);
        ctx.fill();
        ctx.stroke();

        if (tipo === 'PLAYER') {
            ctx.fillStyle = '#001133';
            ctx.beginPath();
            ctx.roundRect(-w/2 + 4, -h/2 + 4, w - 8, 15, 3);
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#fff';
            ctx.fillRect(-w/2 + 3, -h/2, 6, 3);
            ctx.fillRect(w/2 - 9, -h/2, 6, 3);
        } else if (tipo === 'CAMINHAO_PIPA' || tipo === 'CAMINHAO_CARGA') {
            ctx.font = `${h * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(TIPOS_VEICULO[tipo].emoji, 0, 0);
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(-w/2 + 3, -h/2 + 8, w - 6, 2);
        }

        ctx.restore();
    }

    function desenharPowerUp(powerup) {
        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        ctx.shadowColor = powerup.tipo === 'ASA'? '#fff' : '#f80';
        ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.tipo === 'ASA'? '👼' : '⛽️', 0, 0);
        ctx.restore();
    }

    function reiniciar() {
        pontos = 0;
        velocidade = 3;
        distancia = 0;
        nivelVelocidade = 1;
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
        document.getElementById('score-live').textContent = 0;
        loop();
    }

    function loop() {
        if(pausado) {
            // TELA DE PAUSE
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 400, 550);
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            setNeon('#ff0', 15);
            ctx.fillText('PAUSADO', 200, 280);
            resetNeon();
            desenharBotaoPause();
            animFrameId = requestAnimationFrame(loop);
            return;
        }

        if(gameOverAtivo) return;

        ctx.clearRect(0,0,400,550);

        // Velocidade aumenta
        velocidade += 0.0015;
        nivelVelocidade = Math.floor(velocidade);
        distancia += velocidade;
        pontos = Math.floor(distancia / 10);
        document.getElementById('score-live').textContent = pontos;

        // Fundo pista
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 400, 550);

        // Linhas da pista
        setNeon('#0ff', 5);
        ctx.lineWidth = 3;
        linhas.forEach(linha => {
            linha.y += velocidade;
            if(linha.y > 550) linha.y = -60;
            ctx.beginPath();
            ctx.moveTo(50, linha.y);
            ctx.lineTo(50, linha.y + 30);
            ctx.moveTo(350, linha.y);
            ctx.lineTo(350, linha.y + 30);
            ctx.stroke();
        });
        resetNeon();

        // Divisórias
        setNeon('#444', 0);
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(133, 0); ctx.lineTo(133, 550);
        ctx.moveTo(266, 0); ctx.lineTo(266, 550);
        ctx.stroke();
        ctx.setLineDash([]);
        resetNeon();

        // Move player
        let alvoX = pistas[player.pista] - player.w/2;
        player.x += (alvoX - player.x) * 0.3;

        // Spawn obstáculos
        tempoProxObstaculo--;
        if(tempoProxObstaculo <= 0) {
            let pistaAleatoria = Math.floor(Math.random() * 3);
            let tipos = Object.keys(TIPOS_VEICULO);
            let tipoEscolhido = tipos[Math.floor(Math.random() * tipos.length)];

            if (pontos < 500 && (tipoEscolhido.includes('CAMINHAO'))) {
                tipoEscolhido = Math.random() < 0.5? 'AMARELO' : 'VERMELHO';
            }

            const dados = TIPOS_VEICULO[tipoEscolhido];
            obstaculos.push({
                x: pistas[pistaAleatoria] - dados.w/2,
                y: -70,
                w: dados.w,
                h: dados.h,
                pista: pistaAleatoria,
                tipo: tipoEscolhido,
                vel: velocidade * dados.vel
            });
            tempoProxObstaculo = Math.max(30, 65 - velocidade * 2);
        }

        // Spawn power-ups
        if (Math.random() < 0.002 && pontos > 200) {
            powerups.push({
                x: pistas[Math.floor(Math.random() * 3)],
                y: -40,
                tipo: Math.random() < 0.5? 'ASA' : 'TURBO'
            });
        }

        // Atualiza obstáculos
        obstaculos = obstaculos.filter(obs => {
            obs.y += obs.vel;
            desenharCarro(obs.x, obs.y, obs.w, obs.h, TIPOS_VEICULO[obs.tipo].cor, obs.tipo);

            if(!modoAnjo &&
               obs.y + obs.h > player.y &&
               obs.y < player.y + player.h &&
               obs.pista === player.pista) {
                gameOver();
                return false;
            }

            if(obs.y > 550) {
                pontos += TIPOS_VEICULO[obs.tipo].pontos;
                document.getElementById('score-live').textContent = pontos;
                return false;
            }
            return true;
        });

        // Atualiza power-ups
        powerups = powerups.filter(p => {
            p.y += velocidade * 0.8;
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
            tempoPowerUp--;
            if (tempoPowerUp === 0) {
                modoAnjo = false;
                if (modoTurbo) {
                    modoTurbo = false;
                    velocidade -= 1.5;
                }
            }
        }

        // Desenha player
        desenharCarro(player.x, player.y, player.w, player.h,
                     modoTurbo? '#ff0' : '#0f0', 'PLAYER');

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(`NÍVEL: ${nivelVelocidade}`, 10, 20);

        if (tempoPowerUp > 0) {
            ctx.fillText(modoAnjo? '👼 ANJO' : '⛽️ NITRO', 10, 40);
            ctx.fillRect(10, 48, (tempoPowerUp / (modoAnjo? 240 : 180)) * 80, 4);
        }

        desenharBotaoPause();
        animFrameId = requestAnimationFrame(loop);
    }

    function ativarPowerUp(tipo) {
        tempoPowerUp = tipo === 'ASA'? 240 : 180;
        if (tipo === 'ASA') {
            modoAnjo = true;
            mostrarNotificacao('MODO ANJO!', 'sucesso');
        } else {
            modoTurbo = true;
            velocidade += 1.5;
            mostrarNotificacao('NITRO!', 'info');
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
        setNeon('#f44', 20);
        ctx.fillText('VOCÊ FALHOU!', 200, 220);
        resetNeon();

        ctx.font = '12px "Press Start 2P"';
        setNeon('#0ff', 10);
        ctx.fillText(`DISTÂNCIA: ${pontos}m`, 200, 300);
        resetNeon();

        if(pontos >= recorde && pontos > 0) {
            setNeon('#ff0', 15);
            ctx.fillText('NOVO RECORDE!', 200, 330);
            resetNeon();
        }

        setNeon('#0f0', 10);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('TOQUE P/ REINICIAR', 200, 400);
        resetNeon();

        const reiniciarClick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            // Se não clicou no botão pause, reinicia
            if (!(x >= btnPause.x && x <= btnPause.x + btnPause.w &&
                  y >= btnPause.y && y <= btnPause.y + btnPause.h)) {
                canvas.removeEventListener('click', reiniciarClick);
                canvas.removeEventListener('touchstart', reiniciarClick);
                reiniciar();
            }
        };
        canvas.addEventListener('click', reiniciarClick);
        canvas.addEventListener('touchstart', reiniciarClick);
    }

    function mostrarNotificacao(texto, tipo) {
        const notif = document.createElement('div');
        notif.className = `notificacao notificacao-${tipo} mostrar`;
        notif.textContent = texto;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 1500);
    }

    // Controles touch
    let inicioToqueX = 0;
    function handleTouchStart(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;

        // Clicou no botão pause?
        if (x >= btnPause.x && x <= btnPause.x + btnPause.w &&
            y >= btnPause.y && y <= btnPause.y + btnPause.h) {
            if (!gameOverAtivo) {
                pausado =!pausado;
                if (!pausado) loop();
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

    loop();

    return {
        pausar: () => {
            if(gameOverAtivo) return true;
            pausado =!pausado;
            if(!pausado) loop();
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

// Polyfill roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
    };
}