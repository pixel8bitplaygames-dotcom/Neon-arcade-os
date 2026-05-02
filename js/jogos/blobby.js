const GameBlobby = {
    blobby: { x: 0, y: 0, w: 40, h: 40, vy: 0, gravity: 0.6, jump: -10 },
    plataformas: [],
    vivo: true,
    scroll: 0,

    iniciar() {
        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        this.blobby.x = cw / 2;
        this.blobby.y = ch / 2;
        this.blobby.vy = 0;
        this.vivo = true;
        this.scroll = 0;

        // Plataforma inicial
        this.plataformas = [{
            x: cw / 2 - 40,
            y: ch - 100,
            w: 80,
            h: 15
        }];

        // Gera plataformas
        for (let i = 1; i < 10; i++) {
            this.plataformas.push({
                x: Math.random() * (cw - 80),
                y: ch - 100 - i * 80,
                w: 80,
                h: 15
            });
        }

        window.score = 0;
        atualizarPlacar();
    },

    atualizar() {
        if (!this.vivo) return;

        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        // Física do blobby
        this.blobby.vy += this.blobby.gravity;
        this.blobby.y += this.blobby.vy;

        // Move lateral
        if (Engine.keys['ArrowLeft'] && this.blobby.x > 0) this.blobby.x -= 5;
        if (Engine.keys['ArrowRight'] && this.blobby.x < cw - this.blobby.w) this.blobby.x += 5;

        // Teleporta nas bordas
        if (this.blobby.x < 0) this.blobby.x = cw - this.blobby.w;
        if (this.blobby.x > cw) this.blobby.x = 0;

        // Colisão com plataformas
        this.plataformas.forEach(plat => {
            if (this.blobby.vy > 0 && // Caindo
                this.blobby.x + this.blobby.w > plat.x &&
                this.blobby.x < plat.x + plat.w &&
                this.blobby.y + this.blobby.h > plat.y &&
                this.blobby.y + this.blobby.h < plat.y + plat.h + 10) {

                this.blobby.vy = this.blobby.jump;
                if (typeof AudioEngine!== 'undefined') AudioEngine.play('jump');
            }
        });

        // Scroll da câmera quando sobe
        if (this.blobby.y < ch / 2) {
            let diff = ch / 2 - this.blobby.y;
            this.blobby.y = ch / 2;
            this.scroll += diff;
            window.score += Math.floor(diff / 10);
            atualizarPlacar();

            this.plataformas.forEach(plat => {
                plat.y += diff;
            });
        }

        // Gera novas plataformas em cima
        this.plataformas = this.plataformas.filter(plat => {
            if (plat.y > ch + 50) {
                return false;
            }
            return true;
        });

        while (this.plataformas.length < 10) {
            let lastY = Math.min(...this.plataformas.map(p => p.y));
            this.plataformas.push({
                x: Math.random() * (cw - 80),
                y: lastY - 80,
                w: 80,
                h: 15
            });
        }

        // Caiu
        if (this.blobby.y > ch) {
            this.morrer();
        }
    },

    desenhar() {
        // Desenha plataformas
        Engine.ctx.fillStyle = '#ff00ff';
        Engine.ctx.shadowColor = '#ff00ff';
        Engine.ctx.shadowBlur = 15;
        this.plataformas.forEach(plat => {
            Engine.ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        });

        // Desenha blobby
        Engine.ctx.fillStyle = '#00feff';
        Engine.ctx.shadowColor = '#00feff';
        Engine.ctx.beginPath();
        Engine.ctx.arc(this.blobby.x + this.blobby.w/2, this.blobby.y + this.blobby.h/2, this.blobby.w/2, 0, Math.PI * 2);
        Engine.ctx.fill();

        Engine.ctx.shadowBlur = 0;
    },

    input(key) {
        // Movimento já tá no atualizar()
    },

    morrer() {
        this.vivo = false;
        if (typeof AudioEngine!== 'undefined') AudioEngine.play('gameover');
        mostrarGameOver();
    }
};

window.initBlobby = () => GameBlobby.iniciar();
window.updateBlobby = () => GameBlobby.atualizar();
window.drawBlobby = () => GameBlobby.desenhar();
window.handleInputBlobby = (key) => GameBlobby.input(key);