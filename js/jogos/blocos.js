const GameBreakout = {
    paddle: { x: 0, y: 0, w: 80, h: 10, speed: 8 },
    bola: { x: 0, y: 0, vx: 4, vy: -4, r: 6 },
    blocos: [],
    linhas: 5,
    colunas: 8,
    vivo: true,

    iniciar() {
        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;
        
        this.paddle.x = cw / 2 - this.paddle.w / 2;
        this.paddle.y = ch - 30;
        this.bola.x = cw / 2;
        this.bola.y = ch - 50;
        this.bola.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.bola.vy = -4;
        
        // Cria blocos
        this.blocos = [];
        const blocoW = cw / this.colunas - 10;
        const blocoH = 20;
        for (let i = 0; i < this.linhas; i++) {
            for (let j = 0; j < this.colunas; j++) {
                this.blocos.push({
                    x: j * (blocoW + 10) + 5,
                    y: i * (blocoH + 10) + 50,
                    w: blocoW,
                    h: blocoH,
                    vivo: true,
                    cor: `hsl(${i * 60}, 100%, 50%)`
                });
            }
        }
        
        this.vivo = true;
        window.score = 0;
        atualizarPlacar();
    },

    atualizar() {
        if (!this.vivo) return;
        
        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        // Move paddle
        if (Engine.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (Engine.keys['ArrowRight'] && this.paddle.x < cw - this.paddle.w) {
            this.paddle.x += this.paddle.speed;
        }

        // Move bola
        this.bola.x += this.bola.vx;
        this.bola.y += this.bola.vy;

        // Bate nas paredes
        if (this.bola.x - this.bola.r < 0 || this.bola.x + this.bola.r > cw) {
            this.bola.vx *= -1;
        }
        if (this.bola.y - this.bola.r < 0) {
            this.bola.vy *= -1;
        }

        // Bate no paddle
        if (this.bola.y + this.bola.r > this.paddle.y &&
            this.bola.x > this.paddle.x &&
            this.bola.x < this.paddle.x + this.paddle.w &&
            this.bola.vy > 0) {
            this.bola.vy *= -1;
            let hitPos = (this.bola.x - this.paddle.x) / this.paddle.w;
            this.bola.vx = 8 * (hitPos - 0.5);
        }

        // Bate nos blocos
        this.blocos.forEach(bloco => {
            if (!bloco.vivo) return;
            
            if (this.bola.x + this.bola.r > bloco.x &&
                this.bola.x - this.bola.r < bloco.x + bloco.w &&
                this.bola.y + this.bola.r > bloco.y &&
                this.bola.y - this.bola.r < bloco.y + bloco.h) {
                
                bloco.vivo = false;
                this.bola.vy *= -1;
                window.score += 10;
                atualizarPlacar();
                
                if (typeof AudioEngine!== 'undefined') AudioEngine.play('pickup');
                if (typeof Engine.criarParticulas!== 'undefined') {
                    Engine.criarParticulas(bloco.x + bloco.w/2, bloco.y + bloco.h/2, bloco.cor, 8);
                }
            }
        });

        // Caiu no chão
        if (this.bola.y - this.bola.r > ch) {
            this.morrer();
        }

        // Ganhou
        if (this.blocos.every(b => !b.vivo)) {
            this.vivo = false;
            if (typeof AudioEngine!== 'undefined') AudioEngine.play('pickup');
            setTimeout(() => mostrarGameOver(), 500);
        }
    },

    desenhar() {
        // Desenha paddle
        Engine.ctx.fillStyle = '#00feff';
        Engine.ctx.shadowColor = '#00feff';
        Engine.ctx.shadowBlur = 15;
        Engine.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
        
        // Desenha bola
        Engine.ctx.beginPath();
        Engine.ctx.arc(this.bola.x, this.bola.y, this.bola.r, 0, Math.PI * 2);
        Engine.ctx.fillStyle = '#ff00ff';
        Engine.ctx.shadowColor = '#ff00ff';
        Engine.ctx.fill();
        
        // Desenha blocos
        this.blocos.forEach(bloco => {
            if (!bloco.vivo) return;
            Engine.ctx.fillStyle = bloco.cor;
            Engine.ctx.shadowColor = bloco.cor;
            Engine.ctx.shadowBlur = 10;
            Engine.ctx.fillRect(bloco.x, bloco.y, bloco.w, bloco.h);
        });
        Engine.ctx.shadowBlur = 0;
    },

    input(key) {},

    morrer() {
        this.vivo = false;
        if (typeof AudioEngine!== 'undefined') AudioEngine.play('gameover');
        mostrarGameOver();
    }
};

window.initBreakout = () => GameBreakout.iniciar();
window.updateBreakout = () => GameBreakout.atualizar();
window.drawBreakout = () => GameBreakout.desenhar();
window.handleInputBreakout = (key) => GameBreakout.input(key);