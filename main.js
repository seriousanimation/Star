document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer = document.getElementById('video-player');
    const asciiContainer = document.getElementById('ascii-content');
    const sidePanel = document.querySelector('.video-panel');

    // --- 1. TRUE FRAME-BASED ANIMATION SETUP ---

    const asciiURL = 'https://raw.githubusercontent.com/seriousanimation/Star/main/assets/ASCII/example2.html';
    let animationInterval = null;
    let animationFrames = []; // This will hold the 191 frames from your file.
    let currentFrame = 0;

    // This function runs the animation loop.
    function playAsciiAnimation() {
        // Don't start if it's already running or if there are no frames.
        if (animationInterval || animationFrames.length === 0) return;

        animationInterval = setInterval(() => {
            // Set the content of the <pre> tag to the next frame.
            // The <pre> tag is inside the asciiContainer div.
            asciiContainer.querySelector('pre').textContent = animationFrames[currentFrame];
            currentFrame = (currentFrame + 1) % animationFrames.length; // Loop back to the start.
        }, 80); // Adjust speed in milliseconds (e.g., 80ms is ~12fps)
    }

    function stopAsciiAnimation() {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    // --- 2. FETCH AND PARSE THE ANIMATION FILE ---
    
    fetch(asciiURL)
        .then(response => response.text())
        .then(htmlContent => {
            // Create a temporary div to safely parse the fetched HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            // Find the <pre> tag within the loaded content
            const preTag = tempDiv.querySelector('pre');
            if (!preTag) {
                console.error("Could not find a <pre> tag in the fetched HTML.");
                return;
            }

            // This is the special, invisible character that separates your 191 frames.
            const frameDelimiter = '\u001e';
            
            // Split the single block of text into an array of frames.
            animationFrames = preTag.textContent.split(frameDelimiter);
            
            // Prepare the display by showing the first frame initially.
            // First, make sure our on-page container has a <pre> tag.
            if (!asciiContainer.querySelector('pre')) {
                 asciiContainer.appendChild(document.createElement('pre'));
            }
            asciiContainer.querySelector('pre').textContent = animationFrames[0];
            
            console.log(`Successfully loaded ${animationFrames.length} animation frames.`);
        })
        .catch(error => {
            console.error("Failed to fetch ASCII content:", error);
            asciiContainer.innerHTML = "<pre>Error loading content.</pre>";
        });


    // --- 3. EVENT HANDLERS (No changes needed here) ---
    
    function calculateAndApplyZoom() {
        const viewportWidth = window.innerWidth;
        const worldWidth = world.scrollWidth;
        if (worldWidth === 0) return;
        const requiredScale = (viewportWidth / worldWidth) * 0.9;
        world.style.transform = `scale(${requiredScale})`;
    }

    function onTransitionEnd(event) {
        if (event.propertyName === 'max-width') {
            calculateAndApplyZoom();
            sidePanel.removeEventListener('transitionend', onTransitionEnd);
        }
    }

    mainPanel.addEventListener('click', () => {
        const isBecomingVisible = !world.classList.contains('panels-visible');
        world.classList.toggle('panels-visible');

        if (isBecomingVisible) {
            videoPlayer.play();
            playAsciiAnimation();
            sidePanel.addEventListener('transitionend', onTransitionEnd);
        } else {
            videoPlayer.pause();
            stopAsciiAnimation();
            world.style.transform = 'scale(1)';
        }
    });

    window.addEventListener('resize', () => {
        if (world.classList.contains('panels-visible')) {
            calculateAndApplyZoom();
        }
    });
});
