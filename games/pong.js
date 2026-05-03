function iniciarPong(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let gameOver = false;
    let pausado = false;

    // Jogadores
    const player1 = {
        x: 20,
        y: H / 2 - 40,
        w: 15,
        h: 80,
        score: 0,
        cor: '#0ff'
    };

    const player2 = {
        x: W - 35,
        y: H / 2 - 40,
        w: 15,
        h: 80,
        score: 0,
        cor: '#f0f'
    };

    // Bola
    const bola = {
        x: W / 2,
        y: H / 2,
        w: 12,
        h: 12,
        vx: 5,
        vy: 3,
        speed: 5
    };

    // HUD
    document.getElementById('score-live').textContent = `${player1.score} - ${player2.score}`;
    document.getElementById('record-live').textContent = `PONG NEON`;

    // Controles
    let toque1Y = null;
    let toque2Y = null;

    canvas.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            const x = e.touches[i].clientX - canvas.getBoundingClientRect().left;
            const y = e.touches[i].clientY - canvas.getBoundingClientRect().top;
            if (x < W / 2) toque1Y = y;
            else toque2Y = y;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            const x = e.touches[i].clientX - canvas.getBoundingClientRect().left;
            const y = e.touches[i].clientY - canvas.getBoundingClientRect().top;
            if (x < W / 2) toque1Y = y;
            else toque2Y = y;
        }
    });

    canvas.addEventListener('touchend', () => {
        toque1Y = null;
        toque2Y = null;
    });

    // Teclado pra PC
    const teclas = {};
    window.addEventListener('keydown', (e) => teclas[e.key] = true);
    window.addEventListener('keyup', (e) => teclas[e.key] = false);

    // Reset bola
    function resetBola() {
        bola.x = W / 2;
        bola.y = H / 2;
        bola.vx = (Math.random() > 0.5? 1 : -1) * bola.speed;
        bola.vy = (Math.random() - 0.5) * bola.speed;
    }

    // Update
    function update() {
        if (gameOver || pausado) return;

        // Mover players - Mobile
        if (toque1Y!== null) {
            player1.y = toque1Y - player1.h / 2;
        }
        if (toque2Y!== null) {
            player2.y = toque2Y - player2.h / 2;
        }

        // Mover players - PC
        if (teclas['w'] || teclas['W']) player1.y -= 7;
        if (teclas['s'] || teclas['S']) player1.y += 7;
        if (teclas['ArrowUp']) player2.y -= 7;
        if (teclas['ArrowDown']) player2.y += 7;

        // Limite players
        player1.y = Math.max(0, Math.min(H - player1.h, player1.y));
        player2.y