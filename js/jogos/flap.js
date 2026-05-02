const GameFlap = {
    passaro: { x: 80, y: 0, w: 25, h: 25, vy: 0, gravity: 0.5, jump: -8 },
    canos: [],
    chao: { y: 0, h: 80 },
    vivo: true,
    spawnTimer: 0,
    espacoCano: 150,

    iniciar() {
        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        this.passaro.x = 80;
        this.passaro.y = ch / 2;
        this.passaro.vy = 0;
        this.canos = [];
        this.chao.y = ch - this.chao.h;
        this.vivo = true;
        this.spawnTimer = 0;

        window.score = 0;
        atualizarPlacar();
    },

    atualizar() {
        if (!this.vivo) return;

        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        // Física do pássaro
        this.passaro.vy += this.passaro.gravity;
        this.passaro.y += this.passaro.vy;

        // Bate no chão ou teto
        if (this.passaro.y + this.passaro.h > this.chao.y || this.passaro.y < 0) {
            this.morrer();
            return;
        }

        // Spawna canos
        this.spawnTimer++;
        if (this.spawnTimer > 90) {
            this.spawnTimer = 0;
            const alturaBuraco = this.espacoCano;
            const alturaCano = Math.random() * (ch - this.chao.h - alturaBuraco - 100) + 50;

            this.canos.push({
                x: cw,
                y: 0,
                w: 50,
                h: alturaCano,
                passou: false
            });
            this.canos.push({
                x: cw,
                y: alturaCano + alturaBuraco,
                w: 50,
                h: ch - alturaCano - alturaBuraco - this.chao.h,
                passou: false
            });
        }

        // Atualiza canos
        this.canos = this.canos.filter(cano => {
            cano.x -= 3;

            // Colisão com pássaro
            if (this.passaro.x + this.passaro.w > cano.x &&
                this.passaro.x < cano.x + cano.w &&
                this.passaro.y + this.passaro.h > cano.y &&
                this.passaro.y < cano.y + cano.h) {
                this.morrer();
                return false;
            }

            // Pontua quando passa
            if (!cano.passou && cano.x + cano.w < this.passaro.x) {
                cano.passou = true;
                if (cano.y === 0) { // Só conta 1x por par de canos
                    window.score += 1;
                    atualizarPlacar();
                    if (typeof AudioEngine!== 'undefined') AudioEngine.play('pickup');
                }
            }

            return cano.x + cano.w > 0;
        });
    },

    desenhar() {
        const ch = Engine.canvas.height;

        // Desenha canos
        Engine.ctx.fillStyle = '#00ff88';
        Engine.ctx.shadowColor = '#00ff88';
        Engine.ctx.shadowBlur = 15;
        this.canos.forEach(cano => {
            Engine.ctx.fillRect(cano.x, cano.y, cano.w, cano.h);
        });

        // Desenha chão
        Engine.ctx.fillStyle = '#8B4513';
        Engine.ctx.shadowColor = '#00feff';
        Engine.ctx.fillRect(0, this.chao.y, Engine.canvas.width, this.chao.h);

        // Desenha pássaro
        Engine.ctx.fillStyle = '#ffff00';
        Engine.ctx.shadowColor = '#ffff00';
        Engine.ctx.beginPath();
        Engine.ctx.arc(this.passaro.x + this.passaro.w/2, this.passaro.y + this.passaro.h/2, this.passaro.w/2, 0, Math.PI * 2);
        Engine.ctx.fill();
        
        // Olho
        Engine.ctx.fillStyle = '#000';
        Engine.ctx.beginPath();
        Engine.ctx.arc(this.passaro.x + this.passaro.w/2 + 5, this.passaro.y + this.passaro.h/2 - 3, 3, 0, Math.PI * 2);
        Engine.ctx.fill();

        Engine.ctx.shadowBlur = 0;
    },

    input(key) {
        if (key === ' ' || key === 'Space' || key === 'ArrowUp') {
            if (this.vivo) {
                this.passaro.vy = this.passaro.jump;
                if (typeof AudioEngine!== 'undefined') AudioEngine.play('jump');
            }
        }
    },

    morrer() {
        this.vivo = false;
        if (typeof AudioEngine!== 'undefined') AudioEngine.play('gameover');
        mostrarGameOver();
    }
};

window.initFlap = () => GameFlap.iniciar();
window.updateFlap = () => GameFlap.atualizar();
window.drawFlap = () => GameFlap.desenhar();
window.handleInputFlap = (key) => GameFlap.input(key);