// NEON BYTE - v1.0
// Dino do Chrome versão vírus cyberpunk
function iniciarByte(canvas) {
    const ctx = canvas.getContext('2d');
    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;

    let pontos = 0;
    let recorde = localStorage.getItem("recorde_byte") || 0;
    let velocidade = 4;
    let distancia = 0;

    // Player - vírus
    let player = {
        x: 50,
        y: 400,
        w: 30,
        h: 30,
        vy: 0,
        pulando: false,
        noChao: true
    };

    const chaoY = 450;
    const gravidade = 0.6;
    const forcaPulo = -12;

    // Obstáculos - componentes eletrônicos
    let obstaculos = [];
    let tempoProxObstaculo = 0;

    // Nuvens de código no fundo
    let nuvens = [];
    for(let i = 0; i < 3; i++) {
        nuvens.push({
            x: Math.random() * 400,
            y: Math.random() * 200 + 50,
            w: 60,
            vel: 0.5 + Math.random()
        });
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
        velocidade = 4;
        distancia = 0;
        player.y = chaoY - player.h;
        player.vy = 0;
        player.pulando = false;
        player.noChao = true;
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

        // Aumenta velocidade
        velocidade += 0.002;
        distancia += velocidade;
        pontos = Math.floor(distancia / 10);
        document.getElementById('score-live').textContent = pontos;

        // Fundo - placa mãe
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 400, 550);

        // Nuvens de código
        setNeon('#0f0', 5);
        ctx.globalAlpha = 0.3;
        nuvens.forEach(nuvem => {
            nuvem.x -= nuvem.vel;
            if(nuvem.x < -nuvem.w) nuvem.x = 400;
            ctx.fillText('01010', nuvem.x, nuvem.y);
        });
        ctx.globalAlpha = 1;
        resetNeon();

        // Chão
        setNeon('#0ff', 10);
        ctx.fillRect(0, chaoY, 400, 5);
        resetNeon();

        // Física do player
        if(!player.noChao) {
            player.vy += gravidade;
            player.y += player.vy;
        }

        // Colisão com chão
        if(player.y + player.h >= chaoY) {
            player.y = chaoY - player.h;
            player.vy = 0;
            player.noChao = true;
            player.pulando = false;
        }

        // Gera obstáculos
        tempoProxObstaculo--;
        if(tempoProxObstaculo <= 0) {
            let tipo = Math.floor(Math.random() * 3);
            let altura = tipo === 0 ? 40 : tipo === 1 ? 30 : 20;
            obstaculos.push({
                x: 400,
                y: chaoY - altura,
                w: 20,
                h: altura,
                tipo: tipo // 0=chip, 1=resistor, 2=usb
            });
            tempoProxObstaculo = Math.max(60, 100 - velocidade * 5);
        }

        // Move e desenha obstáculos
        obstaculos.forEach((obs, i) => {
            obs.x -= velocidade;

            // Desenha baseado no tipo
            if(obs.tipo === 0) {
                // Chip
                setNeon('#f44', 15);
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                setNeon('#fff', 5);
                ctx.fillRect(obs.x + 5, obs.y + 5, 10, 10);
            } else if(obs.tipo === 1) {
                // Resistor
                setNeon('#ff0', 15);
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                setNeon('#000', 0);
                ctx.fillRect(obs.x + 3, obs.y + 10, 14, 3);
                ctx.fillRect(obs.x + 3, obs.y + 17, 14, 3);
            } else {
                // USB
                setNeon('#0ff', 15);
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                setNeon('#fff', 5);
                ctx.fillRect(obs.x + 8, obs.y + 5, 4, 10);
            }
            resetNeon();

            // Colisão
            if(obs.x < player.x + player.w &&
               obs.x + obs.w > player.x &&
               obs.y < player.y + player.h &&
               obs.y + obs.h > player.y) {
                gameOver();
                return;
            }

            // Remove se saiu da tela
            if(obs.x < -obs.w) obstaculos.splice(i, 1);
        });

        // Desenha player - vírus
        setNeon('#0f0', 20);
        ctx.fillRect(player.x, player.y, player.w, player.h);
        
        // Olhinhos
        setNeon('#fff', 5);
        ctx.fillRect(player.x + 6, player.y + 6, 4, 4);
        ctx.fillRect(player.x + 20, player.y + 6, 4, 4);
        setNeon('#000', 0);
        ctx.fillRect(player.x + 7, player.y + 7, 2, 2);
        ctx.fillRect(player.x + 21, player.y + 7, 2, 2);

        // Linguinha quando pula
        if(player.pulando) {
            setNeon('#f0f', 10);
            ctx.fillRect(player.x + 12, player.y + 20, 6, 12);
        } else {
            // Boquinha normal
            setNeon('#000', 0);
            ctx.fillRect(player.x + 10, player.y + 18, 10, 2);
        }
        resetNeon();

        animFrameId = requestAnimationFrame(loop);
    }

    function pular() {
        if(player.noChao && !gameOverAtivo && !pausado) {
            player.vy = forcaPulo;
            player.noChao = false;
            player.pulando = true;
        }
    }

    function gameOver() {
        gameOverAtivo = true;
        cancelAnimationFrame(animFrameId);

        if(pontos > recorde) {
            recorde = pontos;
            localStorage.setItem("recorde_byte", recorde);
            document.getElementById('record-live').textContent = "RECORDE: " + recorde;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, 400, 550);

        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        setNeon('#f44', 20);
        ctx.fillText('INFECTADO!', 200, 220);
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

    // Controle - toque = pula
    function handleTouchStart(e) {
        e.preventDefault();
        if(gameOverAtivo) return;
        pular();
    }

    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    canvas.addEventListener('click', handleTouchStart);

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
            canvas.removeEventListener('click', handleTouchStart);
        }
    };
}