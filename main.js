// --- FIX: We will initialize the background inside window.onload ---
// This event waits for ALL content to load, including other scripts,
// which guarantees the startGenerativeBG function will be available.
window.onload = () => {
    if (typeof startGenerativeBG === 'function') {
        startGenerativeBG();
        console.log("Generative background started successfully.");
    } else {
        console.error("CRITICAL ERROR: The 'startGenerativeBG' function was not found even after the window loaded. Please check the generativebackground.js file.");
    }
};


// --- The rest of your main script starts here, inside DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {

    // NOTE: The background initialization has been moved out of here.
    // The rest of the script is exactly as it was.

    const viewport = document.getElementById('viewport');
    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer1 = document.getElementById('video-player-1');
    const videoPlayer2 = document.getElementById('video-player-2');
    const leftPanelContainer = document.querySelector('.left-panels');
    const wire1 = document.getElementById('wire1');
    const wire2 = document.getElementById('wire2');

    let scale = 1;
    let panY = 0;
    const panSpeed = 1;

    function applyTransform() {
        world.style.transform = `translateY(${panY}px) scale(${scale})`;
    }

    function updateWires() {
        if (!world.classList.contains('panels-visible')) {
            wire1.setAttribute('d', '');
            wire2.setAttribute('d', '');
            return;
        }
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

    function calculateAndApplyZoom() {
        const viewportWidth = window.innerWidth;
        const worldWidth = world.scrollWidth;
        if (worldWidth === 0) return;
        
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
            scale = 1;
            applyTransform();
            updateWires();
        }
    });

    viewport.addEventListener('wheel', (event) => {
        event.preventDefault();
        panY -= event.deltaY * panSpeed;
        const worldHeight = world.scrollHeight;
        const viewportHeight = viewport.clientHeight;
        const maxPanY = 0;
        const minPanY = -(worldHeight * scale - viewportHeight);

        if (panY > maxPanY) panY = maxPanY;
        if (panY < minPanY) panY = minPanY;

        applyTransform();
    }, { passive: false });

    leftPanelContainer.addEventListener('transitionend', onTransitionEnd);

    window.addEventListener('resize', () => {
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
            updateWires();
        }
    });
});
