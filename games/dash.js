function iniciarDash(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let gameOver = false;
    let pausado = false;
    let score = 0;
    let record = localStorage.getItem('neonDashRecord') || 0;

    // Player
    const player = {
        x: 50,
        y: H / 2,
        w: 20,
        h: 20,
        vy: 0,
        gravity: 0.5,
        jump: -8,
        cor: '#0ff'
    };

    // Obstáculos
    const obstaculos = [];
    let frameCount = 0;
    let velocidade = 4;

    // HUD
    document.getElementById('score-live').textContent = `SCORE: ${score}`;
    document.getElementById('record-live').textContent = `RECORDE: ${record}`;

    // Controles
    function pular() {
        if (!gameOver && !pausado) {
            player.vy = player.jump;
        }
    }

    canvas.addEventListener('touchstart', pular);
    canvas.addEventListener('click', pular);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') pular();
    });

    // Reiniciar jogo
    function reiniciar() {
        player.y = H / 2;
        player.vy = 0;
        obstaculos.length = 0;
        score = 0;
        velocidade = 4;
        frameCount = 0;
        gameOver = false;
        pausado = false;
        document.getElementById('score-live').textContent = `SCORE: ${score}`;
        if(window.notificar) window.notificar('JOGO REINICIADO!', 'info');
    }

    function update() {
        if (gameOver || pausado) return;

        // Física do player
        player.vy += player.gravity;
        player.y += player.vy;

        // Limite tela
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
        if (player.y + player.h > H) {
            gameOver = true;
            if(window.notificar) window.notificar('VOCÊ PERDEU!', 'erro');
        }

        // Criar obstáculos
        frameCount++;
        if (frameCount % 90 === 0) {
            const altura = Math.random() * (H - 150) + 50;
            obstaculos.push({
                x: W,
                y: 0,
                w: 40,
                h: altura,
                cor: '#f0f'
            });
            obstaculos.push({
                x: W,
                y: altura + 120,
                w: 40,
                h: H - altura - 120,
                cor: '#f0f'
            });
        }

        // Mover obstáculos
        for (let i = obstaculos.length - 1; i >= 0; i--) {
            obstaculos[i].x -= velocidade;

            // Colisão
            if (player.x < obstaculos[i].x + obstaculos[i].w &&
                player.x + player.w > obstaculos[i].x &&
                player.y < obstaculos[i].y + obstaculos[i].h &&
                player.y + player.h > obstaculos[i].y) {
                gameOver = true;
                if(window.notificar) window.notificar('VOCÊ PERDEU!', 'erro');
            }

            // Remove e pontua
            if (obstaculos[i].x + obstaculos[i].w < 0) {
                obstaculos.splice(i, 1);
                if (i % 2 === 0) { // Só conta 1x por par
                    score++;
                    document.getElementById('score-live').textContent = `SCORE: ${score}`;
                    
                    // Aumenta dificuldade
                    if (score % 5 === 0) {
                        velocidade += 0.3;
                    }
                }
            }
        }

        // Recorde
        if (gameOver && score > record) {
            record = score;
            localStorage.setItem('neonDashRecord', record);
            document.getElementById('record-live').textContent = `RECORDE: ${record}`;
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
            ctx.moveTo(i, 0);
            ctx.lineTo(i, H);
            ctx.stroke();
        }
        for (let i = 0; i < H; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(W, i);
            ctx.stroke();
        }

        // Obstáculos
        obstaculos.forEach(obs => {
            ctx.fillStyle = obs.cor;
            ctx.shadowColor = obs.cor;
            ctx.shadowBlur = 15;
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.shadowBlur = 0;
        });

        // Player
        ctx.fillStyle = player.cor;
        ctx.shadowColor = player.cor;
        ctx.shadowBlur = 20;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.shadowBlur = 0;

        // GAME OVER - CORRIGIDO
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
            ctx.fillText(`SCORE: ${score}`, W/2, H/2 - 20);
            ctx.fillText(`RECORDE: ${record}`, W/2, H/2 + 10);

            ctx.font = '10px "Press Start 2P"';
            ctx.fillText('TOQUE PARA JOGAR DE NOVO', W/2, H/2 + 50);
        }

        if (pausado && !gameOver) {
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
            pausado = !pausado;
            return pausado;
        },
        reiniciar: reiniciar
    };
}