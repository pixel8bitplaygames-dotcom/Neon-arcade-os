function iniciarPong(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let gameOver = false;
    let pausado = false;

    // Jogadores
    const player1 = {
        x: 20,
        y: H / 2 - 40,
        w: 15,
        h: 80,
        score: 0,
        cor: '#0ff'
    };

    const player2 = {
        x: W - 35,
        y: H / 2 - 40,
        w: 15,
        h: 80,
        score: 0,
        cor: '#f0f'
    };

    // Bola
    const bola = {
        x: W / 2,
        y: H / 2,
        w: 12,
        h: 12,
        vx: 5,
        vy: 3,
        speed: 5
    };

    // HUD
    document.getElementById('score-live').textContent = `${player1.score} - ${player2.score}`;
    document.getElementById('record-live').textContent = `PONG NEON`;

    // Controles
    let toque1Y = null;
    let toque2Y = null;

    canvas.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            const x = e.touches[i].clientX - canvas.getBoundingClientRect().left;
            const y = e.touches[i].clientY - canvas.getBoundingClientRect().top;
            if (x < W / 2) toque1Y = y;
            else toque2Y = y;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            const x = e.touches[i].clientX - canvas.getBoundingClientRect().left;
            const y = e.touches[i].clientY - canvas.getBoundingClientRect().top;
            if (x < W / 2) toque1Y = y;
            else toque2Y = y;
        }
    });

    canvas.addEventListener('touchend', () => {
        toque1Y = null;
        toque2Y = null;
    });

    // Teclado pra PC
    const teclas = {};
    window.addEventListener('keydown', (e) => teclas[e.key] = true);
    window.addEventListener('keyup', (e) => teclas[e.key] = false);

    // Reset bola
    function resetBola() {
        bola.x = W / 2;
        bola.y = H / 2;
        bola.vx = (Math.random() > 0.5? 1 : -1) * bola.speed;
        bola.vy = (Math.random() - 0.5) * bola.speed;
    }

    // Update
    function update() {
        if (gameOver || pausado) return;

        // Mover players - Mobile
        if (toque1Y!== null) {
            player1.y = toque1Y - player1.h / 2;
        }
        if (toque2Y!== null) {
            player2.y = toque2Y - player2.h / 2;
        }

        // Mover players - PC
        if (teclas['w'] || teclas['W']) player1.y -= 7;
        if (teclas['s'] || teclas['S']) player1.y += 7;
        if (teclas['ArrowUp']) player2.y -= 7;
        if (teclas['ArrowDown']) player2.y += 7;

        // Limite players
        player1.y = Math.max(0, Math.min(H - player1.h, player1.y));
        player2.y = Math.max(0, Math.min(H - player2.h, player2.y));

        // Mover bola
        bola.x += bola.vx;
        bola.y += bola.vy;

        // Colisão bola com topo/baixo
        if (bola.y <= 0 || bola.y + bola.h >= H) {
            bola.vy *= -1;
        }

        // Colisão bola com player1
        if (bola.x <= player1.x + player1.w &&
            bola.x + bola.w >= player1.x &&
            bola.y + bola.h >= player1.y &&
            bola.y <= player1.y + player1.h) {
            bola.vx = Math.abs(bola.vx);
            bola.vy += (bola.y - (player1.y + player1.h / 2)) * 0.2;
        }

        // Colisão bola com player2
        if (bola.x + bola.w >= player2.x &&
            bola.x <= player2.x + player2.w &&
            bola.y + bola.h >= player2.y &&
            bola.y <= player2.y + player2.h) {
            bola.vx = -Math.abs(bola.vx);
            bola.vy += (bola.y - (player2.y + player2.h / 2)) * 0.2;
        }

        // Gol player 2
        if (bola.x < 0) {
            player2.score++;
            document.getElementById('score-live').textContent = `${player1.score} - ${player2.score}`;
            resetBola();
        }

        // Gol player 1
        if (bola.x > W) {
            player1.score++;
            document.getElementById('score-live').textContent = `${player1.score} - ${player2.score}`;
            resetBola();
        }

        // Fim de jogo - 10 pontos
        if (player1.score >= 10 || player2.score >= 10) {
            gameOver = true;
        }
    }

    // Desenhar
    function draw() {
        // Fundo
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        // Linha central
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);

        // Player 1
        ctx.fillStyle = player1.cor;
        ctx.shadowColor = player1.cor;
        ctx.shadowBlur = 15;
        ctx.fillRect(player1.x, player1.y, player1.w, player1.h);
        ctx.shadowBlur = 0;

        // Player 2
        ctx.fillStyle = player2.cor;
        ctx.shadowColor = player2.cor;
        ctx.shadowBlur = 15;
        ctx.fillRect(player2.x, player2.y, player2.w, player2.h);
        ctx.shadowBlur = 0;

        // Bola
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;
        ctx.fillRect(bola.x, bola.y, bola.w, bola.h);
        ctx.shadowBlur = 0;

        // Fim de jogo
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, W, H);

            const vencedor = player1.score >= 10? 'JOGADOR 1' : 'JOGADOR 2';
            const corVencedor = player1.score >= 10? player1.cor : player2.cor;

            ctx.fillStyle = corVencedor;
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.shadowColor = corVencedor;
            ctx.shadowBlur = 10;
            ctx.fillText(vencedor, W/2, H/2 - 40);
            ctx.fillText('VENCEU!', W/2, H/2 - 10);

            ctx.fillStyle = '#fff';
            ctx.font = '12px "Press Start 2P"';
            ctx.shadowBlur = 0;
            ctx.fillText(`${player1.score} - ${player2.score}`, W/2, H/2 + 20);
            ctx.fillText('TOQUE PARA RECOMEÇAR', W/2, H/2 + 50);
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

    // Loop
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

    // Reinicia quando toca
    canvas.onclick = () => {
        if (gameOver) {
            parar();
            iniciarPong(canvas);
        }
    };

    return {
        parar: parar,
        pausar: () => {
            pausado =!pausado;
            return pausado;
        }
    };
}