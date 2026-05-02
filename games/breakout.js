// NEON BREAKOUT - v1.0
function iniciarBreakout(canvas) {
    const ctx = canvas.getContext('2d');
    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;

    let pontos = 0;
    let recorde = localStorage.getItem("recorde_breakout") || 0;

    // Bola
    let bola = { x: 200, y: 400, vx: 4, vy: -4, r: 8 };

    // Raquete
    let raquete = { x: 160, y: 500, w: 80, h: 10, vx: 0 };

    // Blocos
    let blocos = [];
    let linhas = 5;
    let colunas = 8;
    let blocoW = 45;
    let blocoH = 15;

    for(let i = 0; i < linhas; i++) {
        for(let j = 0; j < colunas; j++) {
            blocos.push({
                x: j * (blocoW + 5) + 10,
                y: i * (blocoH + 5) + 50,
                w: blocoW,
                h: blocoH,
                vivo: true,
                cor: `hsl(${i * 60}, 100%, 50%)`
            });
        }
    }

    let tStartX = 0;

    document.getElementById('record-live').textContent = "RECORDE: " + recorde;
    document.getElementById('score-live').textContent = pontos;

    function setNeon(color, blur = 10) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }

    function resetNeon() { ctx.shadowBlur = 0; }

    function reiniciar() {
        pontos = 0;
        bola = { x: 200, y: 400, vx: 4, vy: -4, r: 8 };
        raquete = { x: 160, y: 500, w: 80, h: 10, vx: 0 };
        blocos.forEach(b => b.vivo = true);
        gameOverAtivo = false;
        pausado = false;
        document.getElementById('score-live').textContent = 0;
        loop();
    }

    function loop() {
        if(pausado || gameOverAtivo) return;

        ctx.clearRect(0,0,400,550);

        // Move raquete
        raquete.x += raquete.vx;
        if(raquete.x < 0) raquete.x = 0;
        if(raquete.x > 400 - raquete.w) raquete.x = 400 - raquete.w;

        // Move bola
        bola.x += bola.vx;
        bola.y += bola.vy;

        // Colisão paredes
        if(bola.x - bola.r < 0 || bola.x + bola.r > 400) bola.vx *= -1;
        if(bola.y - bola.r < 0) bola.vy *= -1;

        // Colisão raquete
        if(bola.y + bola.r > raquete.y &&
           bola.x > raquete.x &&
           bola.x < raquete.x + raquete.w &&
           bola.vy > 0) {
            bola.vy *= -1;
            let hitPos = (bola.x - raquete.x) / raquete.w;
            bola.vx = 8 * (hitPos - 0.5);
        }

        // Colisão blocos
        blocos.forEach(b => {
            if(b.vivo &&
               bola.x > b.x && bola.x < b.x + b.w &&
               bola.y > b.y && bola.y < b.y + b.h) {
                b.vivo = false;
                bola.vy *= -1;
                pontos += 10;
                document.getElementById('score-live').textContent = pontos;
            }
        });

        // Game over
        if(bola.y > 550) {
            gameOver();
            return;
        }

        // Vitória
        if(blocos.every(b =>!b.vivo)) {
            gameOver(true);
            return;
        }

        // Desenha blocos
        blocos.forEach(b => {
            if(b.vivo) {
                setNeon(b.cor, 10);
                ctx.fillRect(b.x, b.y, b.w, b.h);
                resetNeon();
            }
        });

        // Desenha raquete
        setNeon('#0ff', 15);
        ctx.fillRect(raquete.x, raquete.y, raquete.w, raquete.h);
        resetNeon();

        // Desenha bola
        setNeon('#f44', 20);
        ctx.beginPath();
        ctx.arc(bola.x, bola.y, bola.r, 0, Math.PI*2);
        ctx.fill();
        resetNeon();

        animFrameId = requestAnimationFrame(loop);
    }

    function gameOver(vitoria = false) {
        gameOverAtivo = true;
        cancelAnimationFrame(animFrameId);

        if(pontos > recorde) {
            recorde = pontos;
            localStorage.setItem("recorde_breakout", recorde);
            document.getElementById('record-live').textContent = "RECORDE: " + recorde;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, 400, 550);

        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';

        if(vitoria) {
            setNeon('#0f0', 20);
            ctx.fillText('VITÓRIA!', 200, 220);
        } else {
            setNeon('#f44', 20);
            ctx.fillText('SISTEMA', 200, 200);
            ctx.fillText('FALHOU', 200, 240);
        }
        resetNeon();

        ctx.font = '12px "Press Start 2P"';
        setNeon('#0ff', 10);
        ctx.fillText(`PONTOS: ${pontos}`, 200, 300);
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

        const reiniciarClick = () => {
            canvas.removeEventListener('click', reiniciarClick);
            canvas.removeEventListener('touchstart', reiniciarClick);
            reiniciar();
        };
        canvas.addEventListener('click', reiniciarClick);
        canvas.addEventListener('touchstart', reiniciarClick);
    }

    function handleTouchStart(e) {
        tStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        if(pausado || gameOverAtivo) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - tStartX;
        raquete.vx = dx * 0.3;
        tStartX = e.touches[0].clientX;
    }

    function handleTouchEnd() {
        raquete.vx = 0;
    }

    canvas.addEventListener('touchstart', handleTouchStart, {passive: true});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd);

    loop();

    return {
        pausar: () => {
            if(gameOverAtivo) {
                voltarMenu();
                return true;
            }
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