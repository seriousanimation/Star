document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer = document.getElementById('video-player');
    const asciiContainer = document.getElementById('ascii-content');

    // --- 1. ASCII ANIMATION SETUP ---

    // For a real animation, you need frames. Since you don't have a source,
    // I've created this sample rocket animation. You should replace this
    // with your own frames, perhaps loaded from a JSON file.
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
        if (animationInterval) return; // Don't start if already running

        animationInterval = setInterval(() => {
            asciiContainer.textContent = asciiFrames[currentFrame];
            currentFrame = (currentFrame + 1) % asciiFrames.length;
        }, 150); // Change 150ms to control animation speed
    }

    function stopAsciiAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
    }

    // --- 2. DYNAMIC ZOOM-TO-FIT ---

    function calculateAndApplyZoom() {
        if (!world.classList.contains('panels-visible')) {
            world.style.transform = 'scale(1)';
            return;
        }

        const viewportWidth = window.innerWidth;
        // Get the total width of all panels and gaps
        const worldWidth = world.scrollWidth; 
        
        // Calculate the scale needed to fit the world in the viewport
        // The 0.9 provides a 10% padding around the edges
        const requiredScale = (viewportWidth / worldWidth) * 0.9;

        world.style.transform = `scale(${requiredScale})`;
    }

    // --- 3. CLICK AND RESIZE HANDLERS ---

    mainPanel.addEventListener('click', () => {
        const isVisible = world.classList.toggle('panels-visible');

        if (isVisible) {
            videoPlayer.play();
            playAsciiAnimation();
        } else {
            videoPlayer.pause();
            stopAsciiAnimation();
        }
        
        // We need to wait for the CSS transition to finish before calculating the zoom
        setTimeout(calculateAndApplyZoom, 50); 
    });

    window.addEventListener('resize', calculateAndApplyZoom);
});
