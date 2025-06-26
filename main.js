document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer = document.getElementById('video-player');
    // FIX: This ID now correctly points directly to the <pre> tag.
    const asciiArtPreTag = document.getElementById('ascii-content');
    // FIX: We now target the .left-panels container for the transition event.
    const leftPanelContainer = document.querySelector('.left-panels');

    // --- 1. TRUE FRAME-BASED ANIMATION SETUP ---

    const asciiURL = 'https://raw.githubusercontent.com/seriousanimation/Star/main/assets/ASCII/example2.html';
    let animationInterval = null;
    let animationFrames = [];
    let currentFrame = 0;

    function playAsciiAnimation() {
        if (animationInterval || animationFrames.length === 0) return;

        animationInterval = setInterval(() => {
            // FIX: Directly set the textContent of the <pre> tag.
            asciiArtPreTag.textContent = animationFrames[currentFrame];
            currentFrame = (currentFrame + 1) % animationFrames.length;
        }, 80);
    }

    function stopAsciiAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    // --- 2. FETCH AND PARSE THE ANIMATION FILE ---
    
    fetch(asciiURL)
        .then(response => response.text())
        .then(htmlContent => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const preTagFromFile = tempDiv.querySelector('pre');
            if (!preTagFromFile) {
                console.error("Could not find a <pre> tag in the fetched HTML.");
                return;
            }
            const frameDelimiter = '\u001e';
            animationFrames = preTagFromFile.textContent.split(frameDelimiter);
            
            // FIX: Directly set the textContent of our page's <pre> tag to the first frame.
            asciiArtPreTag.textContent = animationFrames[0];
            
            console.log(`Successfully loaded ${animationFrames.length} animation frames.`);
        })
        .catch(error => {
            console.error("Failed to fetch ASCII content:", error);
            // FIX: Directly set the error message on the <pre> tag.
            asciiArtPreTag.textContent = "Error loading content.";
        });

    // --- 3. EVENT HANDLERS ---
    
    function calculateAndApplyZoom() {
        const viewportWidth = window.innerWidth;
        const worldWidth = world.scrollWidth;
        if (worldWidth === 0) return;
        const requiredScale = (viewportWidth / worldWidth) * 0.9;
        world.style.transform = `scale(${requiredScale})`;
    }

    function onTransitionEnd(event) {
        // FIX: Ensure we only run this for the container's max-width transition.
        if (event.target === leftPanelContainer && event.propertyName === 'max-width') {
            calculateAndApplyZoom();
            // We no longer need to remove the listener as it's specific.
        }
    }

    mainPanel.addEventListener('click', () => {
        const isBecomingVisible = !world.classList.contains('panels-visible');
        world.classList.toggle('panels-visible');

        if (isBecomingVisible) {
            videoPlayer.play();
            playAsciiAnimation();
        } else {
            videoPlayer.pause();
            stopAsciiAnimation();
            world.style.transform = 'scale(1)';
        }
    });

    // FIX: We attach the transitionend listener once and leave it.
    leftPanelContainer.addEventListener('transitionend', onTransitionEnd);

    window.addEventListener('resize', () => {
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
        }
    });
});
