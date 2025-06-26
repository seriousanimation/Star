document.addEventListener('DOMContentLoaded', () => {

    const viewport = document.getElementById('viewport');
    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer1 = document.getElementById('video-player-1');
    const videoPlayer2 = document.getElementById('video-player-2');
    const leftPanelContainer = document.querySelector('.left-panels');
    const wire1 = document.getElementById('wire1');
    const wire2 = document.getElementById('wire2');

    // --- CHANGE: State variables for panning and scaling ---
    let scale = 1;
    let panY = 0;
    const panSpeed = 1; // Adjust the speed of the "scroll"

    // --- NEW: Central function to apply all transforms ---
    function applyTransform() {
        world.style.transform = `translateY(${panY}px) scale(${scale})`;
    }

    // --- Function to draw connector wires ---
    function updateWires() {
        if (!world.classList.contains('panels-visible')) {
            wire1.setAttribute('d', '');
            wire2.setAttribute('d', '');
            return;
        }
        // This function's logic remains the same...
        const mainRect = mainPanel.getBoundingClientRect();
        const video1Rect = document.querySelector('.video-panel').getBoundingClientRect();
        const video2Rect = document.querySelector('.video-panel-2').getBoundingClientRect();
        const worldRect = world.getBoundingClientRect();

        const startX = mainRect.left + mainRect.width - worldRect.left;
        const startY = mainRect.top + mainRect.height / 2 - worldRect.top;
        const end1X = video1Rect.left - worldRect.left;
        const end1Y = video1Rect.top + video1Rect.height / 2 - worldRect.top;
        const end2X = video2Rect.left + video2Rect.width - worldRect.left;
        const end2Y = video2Rect.top + video2Rect.height / 2 - worldRect.top;

        const controlOffset = 100;
        const path1_d = `M ${startX},${startY} C ${startX + controlOffset},${startY} ${end1X - controlOffset},${end1Y} ${end1X},${end1Y}`;
        const path2_d = `M ${startX},${startY} C ${startX + controlOffset},${startY} ${end2X - controlOffset},${end2Y} ${end2X},${end2Y}`;

        wire1.setAttribute('d', path1_d);
        wire2.setAttribute('d', path2_d);
    }


    // --- EVENT HANDLERS ---
    function calculateAndApplyZoom() {
        const viewportWidth = window.innerWidth;
        const worldWidth = world.scrollWidth;
        if (worldWidth === 0) return;
        
        // CHANGE: Update the scale variable, then apply it
        scale = (viewportWidth / worldWidth) * 0.9;
        applyTransform();
    }

    function onTransitionEnd(event) {
        if (world.classList.contains('panels-visible') && event.target === leftPanelContainer && event.propertyName === 'max-width') {
            calculateAndApplyZoom();
            setTimeout(updateWires, 50);
        }
    }

    mainPanel.addEventListener('click', () => {
        const isBecomingVisible = !world.classList.contains('panels-visible');
        world.classList.toggle('panels-visible');

        if (isBecomingVisible) {
            videoPlayer1.play();
            videoPlayer2.play();
        } else {
            videoPlayer1.pause();
            videoPlayer2.pause();
            // CHANGE: Reset scale, then apply transform
            scale = 1;
            applyTransform();
            updateWires();
        }
    });

    // --- NEW: Mouse wheel listener for vertical panning ---
    viewport.addEventListener('wheel', (event) => {
        // Prevent the browser's default page scroll
        event.preventDefault();

        panY -= event.deltaY * panSpeed;
        
        // Optional: Add clamping to prevent scrolling too far
        const worldHeight = world.scrollHeight;
        const viewportHeight = viewport.clientHeight;
        const maxPanY = 0; // Can't scroll past the top
        const minPanY = -(worldHeight * scale - viewportHeight); // Can't scroll past the bottom

        if (panY > maxPanY) panY = maxPanY;
        if (panY < minPanY) panY = minPanY;

        applyTransform();
    }, { passive: false }); // passive:false is needed for preventDefault() to work reliably


    leftPanelContainer.addEventListener('transitionend', onTransitionEnd);

    window.addEventListener('resize', () => {
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
            updateWires();
        }
    });
});
