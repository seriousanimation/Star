/**
 * Generative Waves Background
 *
 * This script creates a canvas-based animated background with flowing lines
 * that respond to mouse movement. It's designed to be modular.
 *
 * How to use:
 * 1. Include this script in your HTML file.
 * 2. Add a <canvas id="background-canvas"></canvas> element to your HTML.
 * 3. In your main JavaScript file, after the DOM has loaded, call:
 * GenerativeBackground.init('background-canvas');
 * 4. To control the zoom level from your main script, call:
 * GenerativeBackground.setZoom(newZoomValue);
 */
const GenerativeBackground = (function() {

    // --- Private Variables ---
    let canvas, ctx;
    let width, height;
    let waves = [];
    let time = 0;
    
    const mouse = { x: null, y: null, maxDistance: 300 }; 
    let zoom = 1; // This will be controlled externally

    // --- Perlin Noise Implementation (unchanged) ---
    const PerlinNoise = {
        p: [],
        permutation: [151,160,137,91,90,15,
        131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
        190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
        88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
        77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
        102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
        135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
        5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
        223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
        129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
        251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
        49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
        138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],
        init: function() {
            this.p = new Array(512);
            for (let i=0; i < 256 ; i++) this.p[256+i] = this.p[i] = this.permutation[i];
        },
        noise: function(x, y = 0, z = 0) {
            if (!this.p.length) this.init();
            let X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
            x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
            let u = this.fade(x), v = this.fade(y), w = this.fade(z);
            let A = this.p[X]+Y, AA = this.p[A]+Z, AB = this.p[A+1]+Z;
            let B = this.p[X+1]+Y, BA = this.p[B]+Z, BB = this.p[B+1]+Z;
            return this.scale(this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
                                                           this.grad(this.p[BA], x-1, y, z)),
                                                   this.lerp(u, this.grad(this.p[AB], x, y-1, z),
                                                           this.grad(this.p[BB], x-1, y-1, z))),
                                           this.lerp(v, this.lerp(u, this.grad(this.p[AA+1], x, y, z-1),
                                                           this.grad(this.p[BA+1], x-1, y, z-1)),
                                                   this.lerp(u, this.grad(this.p[AB+1], x, y-1, z-1),
                                                           this.grad(this.p[BB+1], x-1, y-1, z-1)))));
        },
        fade: t => t * t * t * (t * (t * 6 - 15) + 10),
        lerp: (t, a, b) => a + t * (b - a),
        grad: (hash, x, y, z) => {
            let h = hash & 15;
            let u = h < 8 ? x : y;
            let v = h < 4 ? y : h === 12 || h === 14 ? x : z;
            return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
        },
        scale: n => (1 + n) / 2
    };

    // --- Configuration ---
    const waveConfig = {
        count: 9,
        colors: ['#d39c6c', '#dcab7f', '#e5ba92', '#FFFF33', '#eec8a5', '#A7FCFF', '#f3d2b3', '#f7dcc1', '#fbe6cf'],
        lineWidths: [0.5, 1, 1.5, 0.7, 2, 3, 4, 5, 6],
        layout: { frequency: 0.0015, amplitude: 350 },
        animation: { frequency: 0.008, amplitude: 40, speed: 0.002 }
    };

    // --- Core Functions ---
    function setupCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        mouse.x = width / 2;
        mouse.y = height / 2;
    }

    function createWaves() {
        waves = [];
        for (let i = 0; i < waveConfig.count; i++) {
            waves.push({
                seed: i * 10,
                // ROTATION CHANGE: Waves are now positioned horizontally
                baseX: width * (i + 1) / (waveConfig.count + 1),
                color: waveConfig.colors[i % waveConfig.colors.length],
                lineWidth: waveConfig.lineWidths[i % waveConfig.lineWidths.length]
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2, -height / 2);
        time += waveConfig.animation.speed;
        waves.forEach(drawWave);
        ctx.restore();
        requestAnimationFrame(animate);
    }

    // --- ROTATION CHANGE: The main drawing logic is now vertical ---
    function drawWave(wave) {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.lineWidth;
        
        // Adjust the drawing area to cover the full vertical space when zoomed
        const requiredHeight = height / zoom;
        const startY = (height / 2) - (requiredHeight / 2) - 50;
        const endY = (height / 2) + (requiredHeight / 2) + 50;

        // Loop vertically
        for (let y = startY; y < endY; y += 5) {
            // 1. Calculate layout based on Y position
            const layoutNoise = PerlinNoise.noise(wave.seed, y * waveConfig.layout.frequency);
            const layoutX = wave.baseX + (layoutNoise - 0.5) * waveConfig.layout.amplitude;

            // 2. Calculate animation wiggle based on Y position and time
            const animNoise = PerlinNoise.noise(wave.seed, y * waveConfig.animation.frequency, time);
            const animX = (animNoise - 0.5) * waveConfig.animation.amplitude;
            
            const baseX = layoutX + animX;

            // 3. Calculate mouse perturbation
            const dx = baseX - mouse.x;
            const dy = y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            let perturbation = 0;
            
            if (distance < mouse.maxDistance) {
                const force = (Math.cos(distance / mouse.maxDistance * Math.PI) + 1) / 2;
                // Perturbation now affects X position
                perturbation = -(dx / distance) * force * 25; 
            }

            const finalX = baseX + perturbation;

            if (y === startY) {
                ctx.moveTo(finalX, y);
            } else {
                ctx.lineTo(finalX, y);
            }
        }
        ctx.stroke();
    }

    // --- Event Handlers ---
    function handleMouseMove(e) {
        // Un-zoom the mouse coordinates so perturbation works correctly with zoom
        const rect = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left - width / 2) / zoom + width / 2;
        mouse.y = (e.clientY - rect.top - height / 2) / zoom + height / 2;
    }

    function handleResize() {
        setupCanvas();
        createWaves();
    }

    // --- Public Interface ---
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error("GenerativeBackground Error: Canvas element with specified ID not found.");
            return;
        }
        ctx = canvas.getContext('2d');
        
        setupCanvas();
        createWaves();

        // Remove the wheel listener, zoom is now externally controlled
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        
        animate();
    }

    function setZoom(newZoomValue) {
        zoom = newZoomValue;
    }

    // Expose only the necessary functions to the public scope
    return {
        init: init,
        setZoom: setZoom
    };
})();
