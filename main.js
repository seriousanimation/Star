document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    // CHANGE: Select both video players by their new IDs
    const videoPlayer1 = document.getElementById('video-player-1');
    const videoPlayer2 = document.getElementById('video-player-2');
    
    const leftPanelContainer = document.querySelector('.left-panels');

    // --- All ASCII Animation and Fetching code has been removed ---

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
        }
    }

    mainPanel.addEventListener('click', () => {
        const isBecomingVisible = !world.classList.contains('panels-visible');
        world.classList.toggle('panels-visible');

        if (isBecomingVisible) {
            // CHANGE: Play both videos
            videoPlayer1.play();
            videoPlayer2.play();
        } else {
            // CHANGE: Pause both videos
            videoPlayer1.pause();
            videoPlayer2.pause();
            world.style.transform = 'scale(1)';
        }
    });

    leftPanelContainer.addEventListener('transitionend', onTransitionEnd);

    window.addEventListener('resize', () => {
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
        }
    });
});
