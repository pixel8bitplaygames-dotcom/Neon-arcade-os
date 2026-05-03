function iniciarHacker(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    let gameOver = false;
    let pausado = false;
    let score = 0;
    let record = localStorage.getItem('neonHackerRecord') || 0;
    
    // Player
    const player = {
        x: W / 2 - 20,
        y: H - 60,
        w: 40,
        h: 20,
        vx: 0,
        speed: 6,
        cor: '#0ff'
    };
    
    // Tiros
    let tiros = [];
    let tirosInimigos = [];
    let ultimoTiro = 0;
    const tiroDelay = 300;
    
    // Inimigos
    let inimigos = [];
    let direcaoInimigo = 1;
    let velocidadeInimigo = 1;
    let descidaInimigo = 0;
    
    // Criar formação de inimigos
    function criarInimigos() {
        inimigos = [];
        for (let linha = 0; linha < 4; linha++) {
            for (let col = 0; col < 8; col++) {
                inimigos.push({
                    x: 50 + col * 45,
                    y: 60 + linha * 40,
                    w: 30,
                    h: 20,
                    vivo: true,
                    tipo: linha
                });
            }
        }
    }
    criarInimigos();
    
    // HUD
    document.getElementById('score-live').textContent = score;
    document.getElementById('record-live').textContent = `RECORDE: ${record}`;
    
    // Controles
    let toqueX = null;
    
    canvas.addEventListener('touchstart', (e) => {
        toqueX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        toqueX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    });
    
    canvas.addEventListener('touchend', () => {
        toqueX = null;
        player.vx = 0;
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') player.vx = -player.speed;
        if (e.key === 'ArrowRight') player.vx = player.speed;
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.vx = 0;
    });
    
    // Update
    function update() {
        if (gameOver || pausado) return;
        
        // AUTO-FIRE - Atira sozinho a cada 300ms
        const agora = Date.now();
        if (agora - ultimoTiro > tiroDelay) {
            tiros.push({
                x: player.x + player.w / 2 - 2,
                y: player.y,
                w: 4,
                h: 15,
                vy: -8
            });
            ultimoTiro = agora;
        }
        
        // Mover player
        if (toqueX !== null) {
            if (toqueX < player.x + player.w / 2 - 10) player.vx = -player.speed;
            else if (toqueX > player.x + player.w / 2 + 10) player.vx = player.speed;
            else player.vx = 0;
        }
        
        player.x += player.vx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.w > W) player.x = W - player.w;
        
        // Mover tiros
        tiros = tiros.filter(tiro => {
            tiro.y += tiro.vy;
            return tiro.y > -tiro.h;
        });
        
        tirosInimigos = tirosInimigos.filter(tiro => {
            tiro.y += tiro.vy;
            return tiro.y < H;
        });
        
        // Mover inimigos
        let baterParede = false;
        inimigos.forEach(inv => {
            if (!inv.vivo) return;
            inv.x += direcaoInimigo * velocidadeInimigo;
            if (inv.x <= 0 || inv.x + inv.w >= W) baterParede = true;
        });
        
        if (baterParede) {
            direcaoInimigo *= -1;
            inimigos.forEach(inv => inv.y += 20);
            descidaInimigo += 20;
        }
        
        // Inimigos atiram
        if (Math.random() < 0.02) {
            const vivos = inimigos.filter(inv => inv.vivo);
            if (vivos.length > 0) {
                const atirador = vivos[Math.floor(Math.random() * vivos.length)];
                tirosInimigos.push({
                    x: atirador.x + atirador.w / 2 - 2,
                    y: atirador.y + atirador.h,
                    w: 4,
                    h: 10,
                    vy: 4
                });
            }
        }
        
        // Colisão tiro player vs inimigo
        tiros.forEach((tiro, ti) => {
            inimigos.forEach(inv => {
                if (inv.vivo &&
                    tiro.x < inv.x + inv.w &&
                    tiro.x + tiro.w > inv.x &&
                    tiro.y < inv.y + inv.h &&
                    tiro.y + tiro.h > inv.y) {
                    inv.vivo = false;
                    tiros.splice(ti, 1);
                    score += 10;
                    document.getElementById('score-live').textContent = score;
                }
            });
        });
        
        // Colisão tiro inimigo vs player
        tirosInimigos.forEach(tiro => {
            if (tiro.x < player.x + player.w &&
                tiro.x + tiro.w > player.x &&
                tiro.y < player.y + player.h &&
                tiro.y + tiro.h > player.y) {
                gameOver = true;
            }
        });
        
        // Colisão inimigo vs player
        inimigos.forEach(inv => {
            if (inv.vivo && inv.y + inv.h >= player.y) {
                gameOver = true;
            }
        });
        
        // Vitória - nova wave
        if (inimigos.every(inv => !inv.vivo)) {
            velocidadeInimigo += 0.5;
            criarInimigos();
            tirosInimigos = [];
        }
        
        // Game Over
        if (gameOver && score > record) {
            record = score;
            localStorage.setItem('neonHackerRecord', record);
            document.getElementById('record-live').textContent = `RECORDE: ${record}`;
        }
    }
    
    // Desenhar
    function draw() {
        // Fundo
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);
        
        // Estrelas
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 50; i++) {
            ctx.fillRect((i * 37) % W, (i * 73) % H, 1, 1);
        }
        
        // Player
        ctx.fillStyle = player.cor;
        ctx.shadowColor = player.cor;
        ctx.shadowBlur = 15;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillRect(player.x + player.w/2 - 5, player.y - 10, 10, 10);
        ctx.shadowBlur = 0;
        
        // Tiros player
        ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 10;
        tiros.forEach(tiro => {
            ctx.fillRect(tiro.x, tiro.y, tiro.w, tiro.h);
        });
        ctx.shadowBlur = 0;
        
        // Inimigos
        inimigos.forEach(inv => {
            if (!inv.vivo) return;
            const cores = ['#f44', '#f84', '#ff0', '#0f0'];
            ctx.fillStyle = cores[inv.tipo];
            ctx.shadowColor = cores[inv.tipo];
            ctx.shadowBlur = 10;
            ctx.fillRect(inv.x, inv.y, inv.w, inv.h);
            ctx.shadowBlur = 0;
        });
        
        // Tiros inimigos
        ctx.fillStyle = '#f44';
        ctx.shadowColor = '#f44';
        ctx.shadowBlur = 10;
        tirosInimigos.forEach(tiro => {
            ctx.fillRect(tiro.x, tiro.y, tiro.w, tiro.h);
        });
        ctx.shadowBlur = 0;
        
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
    
    canvas.onclick = () => {
        if (gameOver) voltarMenu();
    };
    
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