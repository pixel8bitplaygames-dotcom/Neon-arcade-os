function iniciarDash(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let gameOver = false;
    let pausado = false;
    let score = 0;
    let record = localStorage.getItem('neonDashRecord') || 0;

    // Player - QUADRADO
    const player = {
        x: 100,
        y: H - 100,
        w: 30,
        h: 30,
        vy: 0,
        gravity: 0.8,
        jump: -14,
        noChao: true,
        cor: '#0ff',
        rotacao: 0,
        rotacaoAlvo: 0 // Pra onde ele tem que girar
    };

    // Chão
    const chao = H - 50;

    // Obstáculos - TRIÂNGULOS/ESPINHOS
    const obstaculos = [];
    let frameCount = 0;
    let velocidade = 6;
    let spawnRate = 90;

    // Partículas de fundo
    const particulas = [];
    for (let i = 0; i < 50; i++) {
        particulas.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    // HUD
    document.getElementById('score-live').textContent = `DISTÂNCIA: ${score}m`;
    document.getElementById('record-live').textContent = `RECORDE: ${record}m`;

    // Controles
    function pular() {
        if (!gameOver &&!pausado && player.noChao) {
            player.vy = player.jump;
            player.noChao = false;
            player.rotacaoAlvo += Math.PI * 2; // GIRA 360° quando pula
        }
    }

    canvas.addEventListener('touchstart', pular);
    canvas.addEventListener('click', pular);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') pular();
    });

    // Reiniciar jogo
    function reiniciar() {
        player.y = chao - player.h;
        player.vy = 0;
        player.noChao = true;
        player.rotacao = 0;
        player.rotacaoAlvo = 0;
        obstaculos.length = 0;
        score = 0;
        velocidade = 6;
        spawnRate = 90;
        frameCount = 0;
        gameOver = false;
        pausado = false;
        document.getElementById('score-live').textContent = `DISTÂNCIA: ${score}m`;
        if(window.notificar) window.notificar('JOGO REINICIADO!', 'info');
    }

    function update() {
        if (gameOver || pausado) return;

        // Física do player
        player.vy += player.gravity;
        player.y += player.vy;

        // Colisão com chão
        if (player.y + player.h >= chao) {
            player.y = chao - player.h;
            player.vy = 0;
            player.noChao = true;
            // Para de girar e alinha no chão
            player.rotacao = 0;
            player.rotacaoAlvo = 0;
        } else {
            player.noChao = false;
            // SÓ GIRA NO AR
            player.rotacao += (player.rotacaoAlvo - player.rotacao) * 0.15;
        }

        // Mover partículas
        particulas.forEach(p => {
            p.x -= p.speed * velocidade * 0.3;
            if (p.x < 0) {
                p.x = W;
                p.y = Math.random() * H;
            }
        });

        // Spawn obstáculos - TRIÂNGULOS
        frameCount++;
        if (frameCount % spawnRate === 0) {
            obstaculos.push({
                x: W,
                y: chao - 30,
                w: 30,
                h: 30,
                tipo: 'triangulo',
                cor: '#f0f'
            });

            // Aumenta dificuldade
            if (score > 0 && score % 10 === 0) {
                velocidade += 0.2;
                spawnRate = Math.max(60, spawnRate - 2);
            }
        }

        // Mover obstáculos e colisão
        for (let i = obstaculos.length - 1; i >= 0; i--) {
            obstaculos[i].x -= velocidade;

            // Colisão com triângulo
            if (player.x + player.w - 5 > obstaculos[i].x &&
                player.x + 5 < obstaculos[i].x + obstaculos[i].w &&
                player.y + player.h - 5 > obstaculos[i].y) {
                gameOver = true;
                if(window.notificar) window.notificar('VOCÊ PERDEU!', 'erro');
            }

            // Remove e pontua
            if (obstaculos[i].x + obstaculos[i].w < 0) {
                obstaculos.splice(i, 1);
                score++;
                document.getElementById('score-live').textContent = `DISTÂNCIA: ${score}m`;
            }
        }

        // Recorde
        if (gameOver && score > record) {
            record = score;
            localStorage.setItem('neonDashRecord', record);
            document.getElementById('record-live').textContent = `RECORDE: ${record}m`;
            if(window.notificar) window.notificar('NOVO RECORDE! 🏆', 'sucesso');
        }
    }

    function draw() {
        // Fundo
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        // Grid de fundo
        ctx.strokeStyle = 'rgba(0,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < W; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i - (frameCount * velocidade * 0.5) % 40, 0);
            ctx.lineTo(i - (frameCount * velocidade * 0.5) % 40, H);
            ctx.stroke();
        }

        // Chão
        ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, chao, W, 3);
        ctx.shadowBlur = 0;

        // Partículas
        ctx.fillStyle = 'rgba(0,255,255,0.5)';
        particulas.forEach(p => {
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Obstáculos - TRIÂNGULOS
        obstaculos.forEach(obs => {
            ctx.fillStyle = obs.cor;
            ctx.shadowColor = obs.cor;
            ctx.shadowBlur = 15;
            // Desenha triângulo
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.h);
            ctx.lineTo(obs.x + obs.w / 2, obs.y);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Player - QUADRADO ROTACIONANDO
        ctx.save();
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
        ctx.rotate(player.rotacao);
        ctx.fillStyle = player.cor;
        ctx.shadowColor = player.cor;
        ctx.shadowBlur = 20;
        ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
        ctx.shadowBlur = 0;
        
        // Borda do quadrado
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-player.w / 2, -player.h / 2, player.w, player.h);
        ctx.restore();

        // GAME OVER
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#f44';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#f44';
            ctx.shadowBlur = 15;
            ctx.fillText('VOCÊ PERDEU!', W/2, H/2 - 60);

            ctx.fillStyle = '#fff';
            ctx.font = '14px "Press Start 2P"';
            ctx.shadowBlur = 0;
            ctx.fillText(`DISTÂNCIA: ${score}m`, W/2, H/2 - 20);
            ctx.fillText(`RECORDE: ${record}m`, W/2, H/2 + 10);

            ctx.font = '10px "Press Start 2P"';
            ctx.fillText('TOQUE PARA JOGAR DE NOVO', W/2, H/2 + 50);
        }

        if (pausado &&!gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#0ff';
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 10;
            ctx.fillText('PAUSADO', W/2, H/2);
            ctx.shadowBlur = 0;
        }
    }

    let animId;
    function loop() {
        update();
        draw();
        animId = requestAnimationFrame(loop);
    }

    function parar() {
        cancelAnimationFrame(animId);
        canvas.onclick = null;
    }

    loop();

    // TOQUE REINICIA O JOGO
    canvas.onclick = () => {
        if (gameOver) {
            reiniciar();
        }
    };

    return {
        parar: parar,
        pausar: () => {
            pausado =!pausado;
            return pausado;
        },
        reiniciar: reiniciar
    };
}