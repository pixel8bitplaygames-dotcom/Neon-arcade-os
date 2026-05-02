// NEON RACER - v1.0
function iniciarRacer(canvas) {
    const ctx = canvas.getContext('2d');
    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;

    let pontos = 0;
    let recorde = localStorage.getItem("recorde_racer") || 0;
    let velocidade = 3;
    let distancia = 0;

    // Jogador - carrinho
    let player = {
        x: 200,
        y: 450,
        w: 30,
        h: 50,
        pista: 1 // 0=esquerda, 1=meio, 2=direita
    };

    // Pistas - 3 faixas
    const pistas = [80, 185, 290]; // Posição X de cada pista

    // Obstáculos - carros inimigos
    let obstaculos = [];
    let tempoProxObstaculo = 0;

    // Linhas da pista pra dar sensação de movimento
    let linhas = [];
    for(let i = 0; i < 10; i++) {
        linhas.push({ y: i * 60 });
    }

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
        velocidade = 3;
        distancia = 0;
        player.pista = 1;
        player.x = pistas[1] - player.w/2;
        obstaculos = [];
        tempoProxObstaculo = 0;
        gameOverAtivo = false;
        pausado = false;
        document.getElementById('score-live').textContent = 0;
        loop();
    }

    function loop() {
        if(pausado || gameOverAtivo) return;

        ctx.clearRect(0,0,400,550);

        // Aumenta velocidade com o tempo
        velocidade += 0.001;
        distancia += velocidade;
        pontos = Math.floor(distancia / 10);
        document.getElementById('score-live').textContent = pontos;

        // Desenha fundo - pista
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 400, 550);

        // Desenha linhas da pista
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

        // Desenha divisórias das pistas
        setNeon('#444', 0);
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(133, 0);
        ctx.lineTo(133, 550);
        ctx.moveTo(266, 0);
        ctx.lineTo(266, 550);
        ctx.stroke();
        ctx.setLineDash([]);
        resetNeon();

        // Atualiza posição do player suavemente
        let alvoX = pistas[player.pista] - player.w/2;
        player.x += (alvoX - player.x) * 0.3;

        // Gera obstáculos
        tempoProxObstaculo--;
        if(tempoProxObstaculo <= 0) {
            let pistaAleatoria = Math.floor(Math.random() * 3);
            obstaculos.push({
                x: pistas[pistaAleatoria] - 15,
                y: -60,
                w: 30,
                h: 50,
                pista: pistaAleatoria
            });
            tempoProxObstaculo = Math.max(40, 80 - velocidade * 3);
        }

        // Move e desenha obstáculos
        setNeon('#f44', 15);
        obstaculos.forEach((obs, i) => {
            obs.y += velocidade;
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

            // Colisão
            if(obs.y + obs.h > player.y &&
               obs.y < player.y + player.h &&
               obs.pista === player.pista) {
                gameOver();
                return;
            }

            // Remove se saiu da tela
            if(obs.y > 550) obstaculos.splice(i, 1);
        });
        resetNeon();

        // Desenha player
        setNeon('#0f0', 20);
        ctx.fillRect(player.x, player.y, player.w, player.h);
        // Detalhe do farol
        setNeon('#fff', 10);
        ctx.fillRect(player.x + 5, player.y + 5, 5, 5);
        ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
        resetNeon();

        animFrameId = requestAnimationFrame(loop);
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
        ctx.fillText('BATIDA!', 200, 220);
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

        const reiniciarClick = () => {
            canvas.removeEventListener('click', reiniciarClick);
            canvas.removeEventListener('touchstart', reiniciarClick);
            reiniciar();
        };
        canvas.addEventListener('click', reiniciarClick);
        canvas.addEventListener('touchstart', reiniciarClick);
    }

    // Controle por toque - arrasta esquerda/direita
    let inicioToqueX = 0;
    function handleTouchStart(e) {
        inicioToqueX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        if(pausado || gameOverAtivo) return;
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if(pausado || gameOverAtivo) return;
        let fimToqueX = e.changedTouches[0].clientX;
        let diff = fimToqueX - inicioToqueX;

        // Swipe direita
        if(diff > 50 && player.pista < 2) {
            player.pista++;
        }
        // Swipe esquerda
        if(diff < -50 && player.pista > 0) {
            player.pista--;
        }
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