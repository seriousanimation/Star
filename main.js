document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer = document.getElementById('video-player');
    const asciiContainer = document.getElementById('ascii-content');
    const sidePanel = document.querySelector('.video-panel'); // A panel to watch for animation end

    // --- ASCII ANIMATION SETUP ---
    const asciiFrames = [
        `
        /\\
       /  \\
      /    \\
     |      |
     |      |
    /|      |\\
   / |      | \\
  /  |      |  \\
 |  /|      |\\  |
 | / |      | \\ |
 |/  |      |  \\|
 *------------*
 /    /\\    \\
/    /  \\    \\
*---*----*---*
    `,
        `

        /\\
       /  \\
      /    \\
     |      |
    /|      |\\
   / |      | \\
  /  |      |  \\
 |  /|      |\\  |
 | / |      | \\ |
 |/  |      |  \\|
 *------------*
 /    /\\    \\
/    /  \\    \\
*---*----*---*
    `,
        `
        /\\
       /  \\
      /    \\
     |      |
     |      |
    /|      |\\
   / |      | \\
  /  |      |  \\
 |  /|      |\\  |
 | / |      | \\ |
 |/  |      |  \\|
 *------------*
/炽/\\炽\\
/    /  \\    \\
*---*----*---*
    `
    ];
    let animationInterval = null;
    let currentFrame = 0;

    function playAsciiAnimation() {
        if (animationInterval) return;
        animationInterval = setInterval(() => {
            asciiContainer.textContent = asciiFrames[currentFrame];
            currentFrame = (currentFrame + 1) % asciiFrames.length;
        }, 150);
    }

    function stopAsciiAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
    }

    // --- DYNAMIC ZOOM-TO-FIT ---
    function calculateAndApplyZoom() {
        const viewportWidth = window.innerWidth;
        const worldWidth = world.scrollWidth;
        
        // Don't try to calculate if the world has no width
        if (worldWidth === 0) return;

        const requiredScale = (viewportWidth / worldWidth) * 0.9;
        world.style.transform = `scale(${requiredScale})`;
    }
    
    // --- EVENT HANDLERS ---
    
    // This function runs when the slide-out animation is finished
    function onTransitionEnd(event) {
        // We only care when the 'max-width' animation finishes
        if (event.propertyName === 'max-width') {
            calculateAndApplyZoom();
            // Important: Remove the listener so it doesn't fire again
            sidePanel.removeEventListener('transitionend', onTransitionEnd);
        }
    }

    mainPanel.addEventListener('click', () => {
        // Check the state BEFORE we toggle the class
        const isBecomingVisible = !world.classList.contains('panels-visible');
        world.classList.toggle('panels-visible');

        if (isBecomingVisible) {
            // If panels are sliding OUT:
            videoPlayer.play();
            playAsciiAnimation();
            // Add a one-time event listener to run the zoom calculation
            // precisely when the slide-out animation has finished.
            sidePanel.addEventListener('transitionend', onTransitionEnd);
        } else {
            // If panels are sliding IN:
            videoPlayer.pause();
            stopAsciiAnimation();
            // Immediately reset the zoom to 1
            world.style.transform = 'scale(1)';
        }
    });

    window.addEventListener('resize', () => {
        // Only recalculate the zoom on resize IF the panels are already visible
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
        }
    });
});
