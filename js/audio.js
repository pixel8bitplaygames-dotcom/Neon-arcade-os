let audioCtx;

function initAudio() { 
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
    if (audioCtx.state === 'suspended') audioCtx.resume(); 
}

function bip(f, t, d, v=0.05) { 
    if(!audioCtx) return; 
    try { 
        const o = audioCtx.createOscillator(), g = audioCtx.createGain(); 
        o.type = t; 
        o.frequency.setValueAtTime(f, audioCtx.currentTime); 
        g.gain.setValueAtTime(v, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d); 
        o.connect(g); 
        g.connect(audioCtx.destination); 
        o.start(); 
        o.stop(audioCtx.currentTime + d); 
    } catch(e){} 
}
