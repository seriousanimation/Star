document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer1 = document.getElementById('video-player-1');
    const videoPlayer2 = document.getElementById('video-player-2');
    const leftPanelContainer = document.querySelector('.left-panels');
    
    const wire1 = document.getElementById('wire1');
    const wire2 = document.getElementById('wire2');

    // --- Function to draw connector wires ---
    function updateWires() {
        // Hide wires if panels are not visible
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


    // --- EVENT HANDLERS ---
    function calculateAndApplyZoom() {
        const viewportWidth = window.innerWidth;
        const worldWidth = world.scrollWidth;
        if (worldWidth === 0) return;
        const requiredScale = (viewportWidth / worldWidth) * 0.9;
        world.style.transform = `scale(${requiredScale})`;
    }

    function onTransitionEnd(event) {
        // FIX: Only calculate zoom and wires AFTER the transition has finished AND the panels are visible.
        // This prevents the function from running when the panels are retracting.
        if (world.classList.contains('panels-visible') && event.target === leftPanelContainer && event.propertyName === 'max-width') {
            calculateAndApplyZoom();
            setTimeout(updateWires, 50); // Small delay to ensure zoom is rendered before drawing wires
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
            // Reset the zoom to its default state immediately.
            world.style.transform = 'scale(1)';
            // Hide the wires immediately.
            updateWires();
        }
    });

    leftPanelContainer.addEventListener('transitionend', onTransitionEnd);

    window.addEventListener('resize', () => {
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
            updateWires();
        }
    });
});
