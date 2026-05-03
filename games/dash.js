function iniciarDash(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    // Jogo
    let gameOver = false;
    let pausado = false;
    let score = 0;
    let velocidade = 5;
    let record = localStorage.getItem('neonDashRecord') || 0;
    
    // Player
    const player = {
        x: 80,
        y: H - 80,
        w: 30,
        h: 30,
        vy: 0,
        noChao: true,
        pulo: -12,
        gravidade: 0.6,
        cor: '#0ff'
    };
    
    // Obstáculos
    let obstaculos = [];
    let frameCount = 0;
    
    // Chão
    const chaoY = H - 50;
    
    // HUD
    document.getElementById('score-live').textContent = score;
    document.getElementById('record-live').textContent = `RECORDE: ${record}`;
    
    // Controles
    function pular() {
        if (player.noChao && !gameOver && !pausado) {
            player.vy = player.pulo;
            player.noChao = false;
        }
    }
    
    canvas.addEventListener('touchstart', pular);
    canvas.addEventListener('click', pular);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') pular();
    });
    
    // Criar obstáculo
    function criarObstaculo() {
        const tipos = ['espinho', 'bloco'];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        
        if (tipo === 'espinho') {
            obstaculos.push({
                x: W,
                y: chaoY - 30,
                w: 30,
                h: 30,
                tipo: 'espinho'
            });
        } else {
            obstaculos.push({
                x: W,
                y: chaoY - 50,
                w: 30,
                h: 50,
                tipo: 'bloco'
            });
        }
    }
    
    // Update
    function update() {
        if (gameOver || pausado) return;
        
        frameCount++;
        
        // Aumenta dificuldade
        if (frameCount % 300 === 0) velocidade += 0.5;
        
        // Física do player
        player.vy += player.gravidade;
        player.y += player.vy;
        
        // Colisão com chão
        if (player.y + player.h >= chaoY) {
            player.y = chaoY - player.h;
            player.vy = 0;
            player.noChao = true;
        }
        
        // Criar obstáculos
        if (frameCount % 80 === 0) {
            criarObstaculo();
        }
        
        // Mover obstáculos
        obstaculos.forEach(obs => {
            obs.x -= velocidade;
        });
        
        // Remover obstáculos que saíram da tela
        obstaculos = obstaculos.filter(obs => obs.x + obs.w > 0);
        
        // Colisão com obstáculos
        obstaculos.forEach(obs => {
            if (player.x < obs.x + obs.w &&
                player.x + player.w > obs.x &&
                player.y < obs.y + obs.h &&
                player.y + player.h > obs.y) {
                gameOver = true;
                if (score > record) {
                    record = score;
                    localStorage.setItem('neonDashRecord', record);
                }
            }
        });
        
        // Score
        score++;
        document.getElementById('score-live').textContent = score;
        document.getElementById('record-live').textContent = `RECORDE: ${record}`;
    }
    
    // Desenhar
    function draw() {
        // Fundo
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);
        
        // Grid neon
        ctx.strokeStyle = 'rgba(0,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < W; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, H);
            ctx.stroke();
        }
        
        // Chão
        ctx.fillStyle = '#0ff';
        ctx.fillRect(0, chaoY, W, 2);
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, chaoY, W, 2);
        ctx.shadowBlur = 0;
        
        // Player
        ctx.fillStyle = player.cor;
        ctx.shadowColor = player.cor;
        ctx.shadowBlur = 15;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.shadowBlur = 0;
        
        // Olho do player
        ctx.fillStyle = '#000';
        ctx.fillRect(player.x + player.w - 10, player.y + 8, 5, 5);
        
        // Obstáculos
        obstaculos.forEach(obs => {
            if (obs.tipo === 'espinho') {
                // Espinho
                ctx.fillStyle = '#f44';
                ctx.shadowColor = '#f44';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(obs.x + obs.w/2, obs.y);
                ctx.lineTo(obs.x, obs.y + obs.h);
                ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Bloco
                ctx.fillStyle = '#f44';
                ctx.shadowColor = '#f44';
                ctx.shadowBlur = 10;
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                ctx.shadowBlur = 0;
            }
        });
        
        // Game Over
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, W, H);
            
            ctx.fillStyle = '#f44';
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#f44';
            ctx.shadowBlur = 10;
            ctx.fillText('GAME OVER', W/2, H/2 - 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Press Start 2P"';
            ctx.shadowBlur = 0;
            ctx.fillText(`SCORE: ${score}`, W/2, H/2 + 20);
            ctx.fillText('TOQUE PRA VOLTAR', W/2, H/2 + 50);
        }
        
        // Pausado
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
    
    // Loop
    let animId;
    function loop() {
        update();
        draw();
        animId = requestAnimationFrame(loop);
    }
    
    loop();
    
    // Click pra voltar quando der game over
    canvas.onclick = () => {
        if (gameOver) {
            voltarMenu();
        }
    };
    
    // API do jogo
    return {
        parar: () => {
            cancelAnimationFrame(animId);
            canvas.onclick = null;
        },
        pausar: () => {
            pausado = !pausado;
            return pausado;
        }
    };
}