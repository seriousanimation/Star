document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer1 = document.getElementById('video-player-1');
    const videoPlayer2 = document.getElementById('video-player-2');
    const leftPanelContainer = document.querySelector('.left-panels');
    
    // CHANGE: Get the SVG path elements
    const wire1 = document.getElementById('wire1');
    const wire2 = document.getElementById('wire2');

    // --- NEW: Function to draw connector wires ---
    function updateWires() {
        if (!world.classList.contains('panels-visible')) {
            return; // Don't draw if panels are hidden
        }

        // Get the bounding boxes of the panels
        const mainRect = mainPanel.getBoundingClientRect();
        const video1Rect = document.querySelector('.video-panel').getBoundingClientRect();
        const video2Rect = document.querySelector('.video-panel-2').getBoundingClientRect();
        const worldRect = world.getBoundingClientRect();

        // Calculate connection points relative to the top-left of the #world div
        const startX = mainRect.left + mainRect.width - worldRect.left;
        const startY = mainRect.top + mainRect.height / 2 - worldRect.top;

        const end1X = video1Rect.left - worldRect.left;
        const end1Y = video1Rect.top + video1Rect.height / 2 - worldRect.top;

        const end2X = video2Rect.left + video2Rect.width - worldRect.left;
        const end2Y = video2Rect.top + video2Rect.height / 2 - worldRect.top;

        // Create the SVG path string for a smooth curve (cubic Bézier)
        // The control points are offset horizontally to create the "S" shape
        const controlOffset = 100;
        const path1_d = `M ${startX},${startY} C ${startX + controlOffset},${startY} ${end1X - controlOffset},${end1Y} ${end1X},${end1Y}`;
        const path2_d = `M ${startX},${startY} C ${startX + controlOffset},${startY} ${end2X - controlOffset},${end2Y} ${end2X},${end2Y}`;

        // Apply the new path data to the SVG elements
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
        if (event.target === leftPanelContainer && event.propertyName === 'max-width') {
            calculateAndApplyZoom();
            // CHANGE: Update the wires after the zoom has been applied
            setTimeout(updateWires, 50); // Small delay to ensure zoom is rendered
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
            world.style.transform = 'scale(1)';
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
