const GameGalaxy = {
    nave: { x: 0, y: 0, w: 30, h: 30, speed: 5 },
    tiros: [],
    asteroides: [],
    estrelas: [],
    powerups: [], // NOVO: array dos raios
    vivo: true,
    spawnTimer: 0,
    fireRate: 20, // NOVO: controla velocidade do tiro
    fireTimer: 0,
    powerTimer: 0, // NOVO: duração do power-up

    iniciar() {
        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        this.nave.x = cw / 2;
        this.nave.y = ch - 60;
        this.tiros = [];
        this.asteroides = [];
        this.estrelas = [];
        this.powerups = []; // Limpa raios
        this.vivo = true;
        this.spawnTimer = 0;
        this.fireRate = 20; // Tiro normal: a cada 20 frames
        this.fireTimer = 0;
        this.powerTimer = 0;

        // Cria estrelas de fundo
        for (let i = 0; i < 50; i++) {
            this.estrelas.push({
                x: Math.random() * cw,
                y: Math.random() * ch,
                size: Math.random() * 2,
                speed: Math.random() * 2 + 1
            });
        }

        window.score = 0;
        atualizarPlacar();
    },

    atualizar() {
        if (!this.vivo) return;

        const cw = Engine.canvas.width;
        const ch = Engine.canvas.height;

        // Move nave
        if (Engine.keys['ArrowLeft'] && this.nave.x > 0) this.nave.x -= this.nave.speed;
        if (Engine.keys['ArrowRight'] && this.nave.x < cw - this.nave.w) this.nave.x += this.nave.speed;
        if (Engine.keys['ArrowUp'] && this.nave.y > 0) this.nave.y -= this.nave.speed;
        if (Engine.keys['ArrowDown'] && this.nave.y < ch - this.nave.h) this.nave.y += this.nave.speed;

        // Lógica de tiro com fireRate
        this.fireTimer++;
        if ((Engine.keys[' '] || Engine.keys['Space']) && this.fireTimer >= this.fireRate) {
            this.fireTimer = 0;
            this.tiros.push({
                x: this.nave.x + this.nave.w / 2,
                y: this.nave.y,
                speed: 8,
                w: 3,
                h: 10
            });
            if (typeof AudioEngine!== 'undefined') AudioEngine.play('shoot');
        }

        // Diminui duração do power-up
        if (this.powerTimer > 0) {
            this.powerTimer--;
            if (this.powerTimer === 0) {
                this.fireRate = 20; // Volta ao normal
            }
        }

        // Atualiza tiros
        this.tiros = this.tiros.filter(tiro => {
            tiro.y -= tiro.speed;
            return tiro.y > 0;
        });

        // Spawna asteroides
        this.spawnTimer++;
        if (this.spawnTimer > 60) {
            this.spawnTimer = 0;
            this.asteroides.push({
                x: Math.random() * (cw - 30),
                y: -30,
                w: 30,
                h: 30,
                speed: Math.random() * 2 + 2,
                rot: 0,
                rotSpeed: Math.random() * 0.1 - 0.05
            });

            // 10% de chance de spawnar power-up de raio
            if (Math.random() < 0.1) {
                this.powerups.push({
                    x: Math.random() * (cw - 20),
                    y: -20,
                    w: 20,
                    h: 20,
                    speed: 2,
                    tipo: 'raio'
                });
            }
        }

        // Atualiza power-ups
        this.powerups = this.powerups.filter(power => {
            power.y += power.speed;

            // Colisão com nave
            if (power.x < this.nave.x + this.nave.w &&
                power.x + power.w > this.nave.x &&
                power.y < this.nave.y + this.nave.h &&
                power.y + power.h > this.nave.y) {

                // ATIVA O RAIO!
                this.fireRate = 8; // Tiro rápido
                this.powerTimer = 300; // 5 segundos de duração

                if (typeof AudioEngine!== 'undefined') AudioEngine.play('pickup');
                if (typeof Engine.criarParticulas!== 'undefined') {
                    Engine.criarParticulas(power.x + power.w/2, power.y + power.h/2, '#FFD700', 15);
                }
                return false; // Remove o power-up
            }

            return power.y < ch + 50;
        });

        // Atualiza asteroides
        this.asteroides = this.asteroides.filter(ast => {
            ast.y += ast.speed;
            ast.rot += ast.rotSpeed;

            // Colisão com nave
            if (ast.x < this.nave.x + this.nave.w &&
                ast.x + ast.w > this.nave.x &&
                ast.y < this.nave.y + this.nave.h &&
                ast.y + ast.h > this.nave.y) {
                this.morrer();
                return false;
            }

            // Colisão com tiros
            for (let i = this.tiros.length - 1; i >= 0; i--) {
                let tiro = this.tiros[i];
                if (tiro.x < ast.x + ast.w &&
                    tiro.x + tiro.w > ast.x &&
                    tiro.y < ast.y + ast.h &&
                    tiro.y + tiro.h > ast.y) {

                    this.tiros.splice(i, 1);
                    window.score += 10;
                    atualizarPlacar();

                    if (typeof AudioEngine!== 'undefined') AudioEngine.play('explosion');
                    if (typeof Engine.criarParticulas!== 'undefined') {
                        Engine.criarParticulas(ast.x + ast.w/2, ast.y + ast.h/2, '#ff6b00', 12);
                    }
                    return false;
                }
            }

            return ast.y < ch + 50;
        });

        // Atualiza estrelas
        this.estrelas.forEach(estrela => {
            estrela.y += estrela.speed;
            if (estrela.y > ch) {
                estrela.y = 0;
                estrela.x = Math.random() * cw;
            }
        });
    },

    desenhar() {
        // Desenha estrelas
        Engine.ctx.fillStyle = '#ffffff';
        this.estrelas.forEach(estrela => {
            Engine.ctx.globalAlpha = estrela.size / 2;
            Engine.ctx.fillRect(estrela.x, estrela.y, estrela.size);
        });
        Engine.ctx.globalAlpha = 1;

        // Desenha nave - brilha dourado se tiver power-up
        if (this.powerTimer > 0) {
            Engine.ctx.fillStyle = '#FFD700';
            Engine.ctx.shadowColor = '#FFD700';
        } else {
            Engine.ctx.fillStyle = '#00feff';
            Engine.ctx.shadowColor = '#00feff';
        }
        Engine.ctx.shadowBlur = 15;
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(this.nave.x + this.nave.w/2, this.nave.y);
        Engine.ctx.lineTo(this.nave.x, this.nave.y + this.nave.h);
        Engine.ctx.lineTo(this.nave.x + this.nave.w, this.nave.y + this.nave.h);
        Engine.ctx.closePath();
        Engine.ctx.fill();

        // Desenha tiros - ficam dourados com power-up
        if (this.powerTimer > 0) {
            Engine.ctx.fillStyle = '#FFD700';
            Engine.ctx.shadowColor = '#FFD700';
        } else {
            Engine.ctx.fillStyle = '#39ff14';
            Engine.ctx.shadowColor = '#39ff14';
        }
        this.tiros.forEach(tiro => {
            Engine.ctx.fillRect(tiro.x, tiro.y, tiro.w, tiro.h);
        });

        // Desenha asteroides
        Engine.ctx.fillStyle = '#ff6b00';
        Engine.ctx.shadowColor = '#ff6b00';
        this.asteroides.forEach(ast => {
            Engine.ctx.save();
            Engine.ctx.translate(ast.x + ast.w/2, ast.y + ast.h/2);
            Engine.ctx.rotate(ast.rot);
            Engine.ctx.fillRect(-ast.w/2, -ast.h/2, ast.w, ast.h);
            Engine.ctx.restore();
        });

        // NOVO: Desenha power-up de RAIO DOURADO
        this.powerups.forEach(power => {
            Engine.ctx.save();
            Engine.ctx.translate(power.x + power.w/2, power.y + power.h/2);

            // Glow dourado
            Engine.ctx.shadowColor = '#FFD700';
            Engine.ctx.shadowBlur = 20;
            Engine.ctx.strokeStyle = '#FFD700';
            Engine.ctx.fillStyle = '#FFD700';
            Engine.ctx.lineWidth = 3;

            // Desenha formato de raio ⚡
            Engine.ctx.beginPath();
            Engine.ctx.moveTo(-5, -8);
            Engine.ctx.lineTo(2, -2);
            Engine.ctx.lineTo(-2, -2);
            Engine.ctx.lineTo(5, 8);
            Engine.ctx.lineTo(-2, 2);
            Engine.ctx.lineTo(2, 2);
            Engine.ctx.closePath();
            Engine.ctx.fill();
            Engine.ctx.stroke();

            Engine.ctx.restore();
        });
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

window.initGalaxy = () => GameGalaxy.iniciar();
window.updateGalaxy = () => GameGalaxy.atualizar();
window.drawGalaxy = () => GameGalaxy.desenhar();
window.handleInputGalaxy = (key) => GameGalaxy.input(key);