// NEON SNAKE - v2.0 COM TELA GAME OVER
function iniciarSnake(canvas) {
    const ctx = canvas.getContext('2d');
    let pausado = false;
    let gameOverAtivo = false;
    let animFrameId = null;
    let timeoutId = null;
    
    let pontos = 0;
    let recorde = localStorage.getItem("recorde_snake") || 0;
    let snk = [{x:10,y:10},{x:9,y:10}];
    let mc = {x:15,y:15};
    let sDx = 1, sDy = 0;
    let sV = 150;
    let mudouDirecaoNesteFrame = false;
    let particulas = [];
    let tStartX = 0, tStartY = 0;

    document.getElementById('record-live').textContent = "RECORDE: " + recorde;
    document.getElementById('score-live').textContent = pontos;

    function setNeon(color, blur = 10) { 
        ctx.shadowBlur = blur; 
        ctx.shadowColor = color; 
        ctx.fillStyle = color; 
        ctx.strokeStyle = color; 
    }
    
    function resetNeon() { ctx.shadowBlur = 0; }

    function criarExplosao(x, y, cor) { 
        for(let i=0; i<20; i++) {
            particulas.push({ 
                x, y, 
                vx:(Math.random()-0.5)*15, 
                vy:(Math.random()-0.5)*15, 
                vida:1, 
                cor, 
                g: 0.15, 
                size: 2 + Math.random()*3 
            }); 
        }
    }
    
    function desenharParticulas() { 
        particulas.forEach((p, i) => { 
            p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.vida-=0.02; 
            if(p.vida<=0) particulas.splice(i,1); 
            else { 
                setNeon(`rgba(${p.cor},${p.vida})`, 5); 
                ctx.fillRect(p.x,p.y,p.size||3,p.size||3); 
                resetNeon(); 
            } 
        }); 
    }

    function desenharRostoCobra(x, y) {
        setNeon("#0ff", 15);
        ctx.fillRect(x*20+1, y*20+1, 18, 18);
        ctx.fillStyle = "#000"; 
        let oX = sDx!== 0? (sDx > 0? 12 : 4) : 4; 
        let oY = sDy!== 0? (sDy > 0? 12 : 4) : 4;
        ctx.fillRect(x*20+oX, y*20+oY, 4, 4); 
        if(sDx!== 0) ctx.fillRect(x*20+oX, y*20+(oY === 4? 12 : 4), 4, 4); 
        else ctx.fillRect(x*20+(oX === 4? 12 : 4), y*20+oY, 4, 4);
        resetNeon();
    }

    function loop() {
        if(pausado || gameOverAtivo) return;
        mudouDirecaoNesteFrame = false; 
        ctx.clearRect(0,0,400,550); 
        desenharParticulas();
        
        setNeon("#f44", 15); 
        ctx.beginPath(); 
        ctx.arc(mc.x*20+10, mc.y*20+10, 8, 0, Math.PI*2); 
        ctx.fill(); 
        resetNeon();
        
        snk.forEach((p, i) => { 
            if(i===0) desenharRostoCobra(p.x, p.y); 
            else { 
                setNeon("#0aa", 5); 
                ctx.fillRect(p.x*20+2, p.y*20+2, 16, 16); 
                resetNeon(); 
            } 
        });
        
        let h = {x:snk[0].x+sDx, y:snk[0].y+sDy};
        
        if(h.x<0||h.x>=20||h.y<0||h.y>=27||snk.some(s=>s.x===h.x&&s.y===h.y)){ 
            gameOver(); 
            return; 
        }
        
        snk.unshift(h); 
        
        if(h.x===mc.x&&h.y===mc.y){ 
            pontos+=10; 
            criarExplosao(h.x*20+10,h.y*20+10,"255,68,68"); 
            mc={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*25)}; 
            if(sV > 70) sV -= 2; 
        } else snk.pop();
        
        document.getElementById('score-live').textContent = pontos; 
        timeoutId = setTimeout(loop, sV);
    }

    // GAME OVER NOVO - SEM ALERT
    function gameOver() {
        gameOverAtivo = true;
        clearTimeout(timeoutId);
        cancelAnimationFrame(animFrameId);
        
        if(pontos > recorde) { 
            recorde = pontos; 
            localStorage.setItem("recorde_snake", recorde); 
            document.getElementById('record-live').textContent = "RECORDE: " + recorde; 
        }
        
        // Desenha tela de game over DENTRO do canvas
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, 400, 550);
        
        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        setNeon('#f44', 20);
        ctx.fillText('SISTEMA', 200, 200);
        ctx.fillText('FALHOU', 200, 240);
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
        
        setNeon('#aaa', 5);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('TOQUE PARA VOLTAR', 200, 400);
        resetNeon();
        
        const voltarClick = () => {
            canvas.removeEventListener('click', voltarClick);
            canvas.removeEventListener('touchstart', voltarClick);
            voltarMenu();
        };
        canvas.addEventListener('click', voltarClick);
        canvas.addEventListener('touchstart', voltarClick);
    }

    function handleTouchStart(e) {
        tStartX = e.touches[0].clientX; 
        tStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if(pausado || gameOverAtivo) return; 
        e.preventDefault(); 
        if(mudouDirecaoNesteFrame) return;
        
        const dx = e.touches[0].clientX - tStartX;
        const dy = e.touches[0].clientY - tStartY;
        
        if(Math.abs(dx) > 30 || Math.abs(dy) > 30){
            if(Math.abs(dx) > Math.abs(dy)){ 
                let nX = dx > 0? 1 : -1; 
                if(nX!== -sDx) { sDx = nX; sDy = 0; mudouDirecaoNesteFrame = true; } 
            } else { 
                let nY = dy > 0? 1 : -1; 
                if(nY!== -sDy) { sDy = nY; sDx = 0; mudouDirecaoNesteFrame = true; } 
            } 
            tStartX = e.touches[0].clientX; 
            tStartY = e.touches[0].clientY; 
        }
    }

    canvas.addEventListener('touchstart', handleTouchStart, {passive: true});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});

    loop();

    return {
        pausar: () => {
            pausado =!pausado;
            if(!pausado &&!gameOverAtivo) loop();
            return pausado;
        },
        parar: () => {
            gameOverAtivo = true;
            clearTimeout(timeoutId);
            cancelAnimationFrame(animFrameId);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
        }
    };
}