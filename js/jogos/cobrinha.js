const GameSnake = {
    cobra: [],
    direcao: { x: 1, y: 0 },
    proximaDirecao: { x: 1, y: 0 },
    comida: { x: 0, y: 0 },
    grid: 20,
    vivo: true,
    tick: 0,

    iniciar() {
        this.cobra = [{ x: 10, y: 10 }];
        this.direcao = { x: 1, y: 0 };
        this.proximaDirecao = { x: 1, y: 0 };
        this.gerarComida();
        this.vivo = true;
        this.tick = 0;
        window.score = 0;
        atualizarPlacar();
    },

    gerarComida() {
        const cols = Math.floor(Engine.canvas.width / this.grid);
        const rows = Math.floor(Engine.canvas.height / this.grid);
        do {
            this.comida = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows)
            };
        } while (this.cobra.some(s => s.x === this.comida.x && s.y === this.comida.y));
    },

    atualizar() {
        if (!this.vivo) return;

        this.tick++;
        if (this.tick % 8!== 0) return; // Controla velocidade

        this.direcao = {...this.proximaDirecao };
        const cabeca = {
            x: this.cobra[0].x + this.direcao.x,
            y: this.cobra[0].y + this.direcao.y
        };

        // Bateu na parede
        const cols = Math.floor(Engine.canvas.width / this.grid);
        const rows = Math.floor(Engine.canvas.height / this.grid);
        if (cabeca.x < 0 || cabeca.x >= cols || cabeca.y < 0 || cabeca.y >= rows) {
            this.morrer();
            return;
        }

        // Bateu no corpo
        if (this.cobra.some(s => s.x === cabeca.x && s.y === cabeca.y)) {
            this.morrer();
            return;
        }

        this.cobra.unshift(cabeca);

        // Comeu a comida
        if (cabeca.x === this.comida.x && cabeca.y === this.comida.y) {
            window.score += 10;
            atualizarPlacar();
            this.gerarComida();
            // Toca som se tiver
            if (typeof AudioEngine!== 'undefined') AudioEngine.play('pickup');
        } else {
            this.cobra.pop();
        }
    },

    desenhar() {
        const g = this.grid;

        // Desenha comida
        Engine.ctx.fillStyle = '#39ff14';
        Engine.ctx.shadowColor = '#39ff14';
        Engine.ctx.shadowBlur = 15;
        Engine.ctx.fillRect(this.comida.x * g + 2, this.comida.y * g + 2, g - 4, g - 4);
        Engine.ctx.shadowBlur = 0;

        // Desenha cobra
        this.cobra.forEach((seg, i) => {
            if (i === 0) {
                // Cabeça
                Engine.ctx.fillStyle = '#00feff';
                Engine.ctx.shadowColor = '#00feff';
            } else {
                // Corpo
                Engine.ctx.fillStyle = '#00aaff';
                Engine.ctx.shadowColor = '#00feff';
            }
            Engine.ctx.shadowBlur = 10;
            Engine.ctx.fillRect(seg.x * g + 1, seg.y * g + 1, g - 2, g - 2);
        });
        Engine.ctx.shadowBlur = 0;
    },

    input(key) {
        if (key === 'ArrowUp' && this.direcao.y === 0) this.proximaDirecao = { x: 0, y: -1 };
        if (key === 'ArrowDown' && this.direcao.y === 0) this.proximaDirecao = { x: 0, y: 1 };
        if (key === 'ArrowLeft' && this.direcao.x === 0) this.proximaDirecao = { x: -1, y: 0 };
        if (key === 'ArrowRight' && this.direcao.x === 0) this.proximaDirecao = { x: 1, y: 0 };
    },

    morrer() {
        this.vivo = false;
        if (typeof AudioEngine!== 'undefined') AudioEngine.play('gameover');
        mostrarGameOver();
    }
};

window.initSnake = () => GameSnake.iniciar();
window.updateSnake = () => GameSnake.atualizar();
window.drawSnake = () => GameSnake.desenhar();
window.handleInputSnake = (key) => GameSnake.input(key);
