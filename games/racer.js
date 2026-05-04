// NEON RACER - EM MANUTENÇÃO
function iniciarRacer(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let animFrameId = null;
    let particulas = [];

    // Gera partículas de fundo
    for(let i = 0; i < 50; i++) {
        particulas.push({
            x: Math.random() * 400,
            y: Math.random() * 550,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.5 + 0.2,
            cor: ['#ff006e', '#00f5ff', '#00ff41', '#ff00ff'][Math.floor(Math.random() * 4)],
            tamanho: Math.random() * 3 + 1
        });
    }

    function loop() {
        // Fundo roxo escuro
        ctx.fillStyle = '#1a0033';
        ctx.fillRect(0, 0, 400, 550);

        // Grid neon de fundo
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for(let i = 0; i < 400; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 550);
            ctx.stroke();
        }
        for(let i = 0; i < 550; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(400, i);
            ctx.stroke();
        }

        // Partículas
        particulas.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if(p.y > 550) p.y = -10;
            if(p.x < 0) p.x = 400;
            if(p.x > 400) p.x = 0;

            ctx.fillStyle = p.cor;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(p.x, p.y, p.tamanho, p.tamanho);
            ctx.globalAlpha = 1;
        });

        // Título NEON
        ctx.font = '28px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeText('NEON', 200, 150);
        ctx.fillStyle = '#ff006e';
        ctx.fillText('NEON', 200, 150);

        ctx.strokeText('RACER', 200, 190);
        ctx.fillStyle = '#00f5ff';
        ctx.fillText('RACER', 200, 190);

        // Ícone engrenagem
        ctx.font = '60px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.fillText('⚙️', 200, 280);

        // Texto manutenção
        ctx.font = '14px "Press Start 2P"';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText('EM MANUTENÇÃO', 200, 340);
        ctx.fillStyle = '#fff';
        ctx.fillText('EM MANUTENÇÃO', 200, 340);

        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#00ff41';
        ctx.fillText('Atualizando sistema neon...', 200, 380);

        // Barra de carregamento
        let progresso = (Date.now() % 3000) / 3000;
        ctx.fillStyle = '#1a0033';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.fillRect(100, 420, 200, 20);
        ctx.strokeRect(100, 420, 200, 20);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(102, 422, 196 * progresso, 16);

        ctx.fillStyle = '#fff';
        ctx.fillText('VOLTAMOS JÁ!', 200, 480);

        animFrameId = requestAnimationFrame(loop);
    }

    loop();

    return {
        pausar: () => true,
        parar: () => {
            cancelAnimationFrame(animFrameId);
        }
    };
}