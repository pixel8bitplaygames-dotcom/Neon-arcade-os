// NEON ARCADE - TELA DE MANUTENÇÃO TURBINADA
function iniciarRacer(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let animFrameId = null;
    let tempo = 0;
    let particulas = [];
    let estrelas = [];

    // Gera estrelas de fundo
    for(let i = 0; i < 100; i++) {
        estrelas.push({
            x: Math.random() * 400,
            y: Math.random() * 550,
            tamanho: Math.random() * 2,
            brilho: Math.random()
        });
    }

    // Gera partículas neon
    for(let i = 0; i < 30; i++) {
        particulas.push({
            x: Math.random() * 400,
            y: Math.random() * 550,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 1 + 0.5,
            cor: ['#ff006e', '#00f5ff', '#00ff41', '#ff00ff', '#ffff00'][Math.floor(Math.random() * 5)],
            tamanho: Math.random() * 4 + 2
        });
    }

    function desenharGrid() {
        // Grid perspectiva cyberpunk
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
        ctx.lineWidth = 1;
        
        // Linhas verticais
        for(let i = 0; i < 400; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 550);
            ctx.stroke();
        }
        
        // Linhas horizontais com perspectiva
        for(let i = 0; i < 550; i += 20) {
            let distorcao = (i / 550) * 50;
            ctx.beginPath();
            ctx.moveTo(0 + distorcao, i);
            ctx.lineTo(400 - distorcao, i);
            ctx.stroke();
        }
    }

    function desenharScanlines() {
        // Efeito de TV antiga
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for(let i = 0; i < 550; i += 4) {
            ctx.fillRect(0, i, 400, 2);
        }
    }

    function loop() {
        tempo += 0.02;

        // Fundo gradiente roxo escuro
        const gradiente = ctx.createLinearGradient(0, 0, 0, 550);
        gradiente.addColorStop(0, '#0a0015');
        gradiente.addColorStop(0.5, '#1a0033');
        gradiente.addColorStop(1, '#0a0015');
        ctx.fillStyle = gradiente;
        ctx.fillRect(0, 0, 400, 550);

        // Estrelas piscando
        estrelas.forEach(e => {
            e.brilho = Math.sin(tempo * 2 + e.x) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${e.brilho})`;
            ctx.fillRect(e.x, e.y, e.tamanho, e.tamanho);
        });

        desenharGrid();

        // Partículas neon
        particulas.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if(p.y > 550) {
                p.y = -10;
                p.x = Math.random() * 400;
            }
            if(p.x < 0) p.x = 400;
            if(p.x > 400) p.x = 0;

            ctx.fillStyle = p.cor;
            ctx.fillRect(p.x, p.y, p.tamanho, p.tamanho);
            
            // Rastro
            ctx.fillStyle = p.cor + '40';
            ctx.fillRect(p.x, p.y - p.tamanho, p.tamanho, p.tamanho);
        });

        // Moldura neon
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 380, 530);
        ctx.strokeStyle = '#ff006e';
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 15, 370, 520);

        // TÍTULO COM GLITCH
        ctx.font = '32px "Press Start 2P"';
        ctx.textAlign = 'center';
        
        // Efeito glitch
        let glitchX = Math.random() > 0.95 ? (Math.random() - 0.5) * 10 : 0;
        let glitchY = Math.random() > 0.95 ? (Math.random() - 0.5) * 5 : 0;
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText('NEON', 200 + glitchX, 120 + glitchY);
        ctx.fillStyle = '#ff006e';
        ctx.fillText('NEON', 200 + glitchX, 120 + glitchY);
        
        ctx.strokeText('ARCADE', 200, 160);
        ctx.fillStyle = '#00f5ff';
        ctx.fillText('ARCADE', 200, 160);

        // Ícone animado
        let rotacao = Math.sin(tempo) * 0.1;
        ctx.save();
        ctx.translate(200, 250);
        ctx.rotate(rotacao);
        ctx.font = '70px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText('⚙️', 0, 0);
        ctx.restore();

        // TEXTO PISCANDO
        let alpha = Math.sin(tempo * 3) * 0.5 + 0.5;
        ctx.font = '16px "Press Start 2P"';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeText('EM MANUTENÇÃO', 200, 340);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText('EM MANUTENÇÃO', 200, 340);

        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#00ff41';
        ctx.fillText('>> ATUALIZANDO SISTEMA NEON <<', 200, 370);

        // Barra de carregamento com efeito
        let progresso = (tempo * 50) % 100;
        ctx.fillStyle = '#1a0033';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.fillRect(80, 400, 240, 25);
        ctx.strokeRect(80, 400, 240, 25);
        
        // Preenchimento animado
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(83, 403, (234 * progresso) / 100, 19);
        
        // Brilho na barra
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(83, 403, (234 * progresso) / 100, 5);

        // Porcentagem
        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.fillText(Math.floor(progresso) + '%', 200, 455);

        // Mensagem inferior piscando
        ctx.fillStyle = `rgba(255, 0, 110, ${Math.sin(tempo * 4) * 0.5 + 0.5})`;
        ctx.fillText('VOLTAMOS JÁ!', 200, 500);
        
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = '#00ff41';
        ctx.fillText('v2.0 CYBERPUNK EDITION', 200, 520);

        desenharScanlines();

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