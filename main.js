function startGenerativeBG() {
    // Implementation from your generativebackground.js file
}
window.onload = () => {
    // This check is in case the background script fails to load.
    if (typeof startGenerativeBG === 'function') {
        startGenerativeBG();
    }
};

document.addEventListener('DOMContentLoaded', () => {

    const viewport = document.getElementById('viewport');
    const world = document.getElementById('world');
    const topicRows = document.querySelectorAll('.topic-row');
    const wires = document.querySelectorAll('.connector-wire');

    let scale = 1;
    let panY = 0;
    let isZoomed = false;
    let activeRow = null;
    let currentTopicIndex = 0;
    let isNavigating = false;

    // --- MAIN TRANSFORM AND STATE FUNCTIONS ---
    function applyTransform() {
        // We add a 'no-transition' class during instant pans to prevent animation
        world.classList.add('no-transition');
        world.style.transform = `translateY(${panY}px) scale(${scale})`;
        // Force the browser to apply the style, then remove the class to re-enable transitions
        world.offsetHeight; // This is a trick to trigger a browser repaint
        world.classList.remove('no-transition');
    }
    
    function applyAnimatedTransform() {
        // This version applies the transform and relies on the CSS transition
        world.style.transform = `translateY(${panY}px) scale(${scale})`;
    }

    function updateWires(row, show = false) {
        // ... (This function's internal logic is unchanged)
        const mainPanel = row.querySelector('.main-panel');
        const leftVideoPanel = row.querySelector('.video-panel');
        const rightVideoPanel = row.querySelector('.video-panel-2');
        const wireLeft = wires[(Array.from(topicRows).indexOf(row) * 2)];
        const wireRight = wires[(Array.from(topicRows).indexOf(row) * 2) + 1];

        if (!show) {
            wireLeft.classList.remove('visible');
            wireRight.classList.remove('visible');
            return;
        }

        const mainRect = mainPanel.getBoundingClientRect();
        const leftRect = leftVideoPanel.getBoundingClientRect();
        const rightRect = rightVideoPanel.getBoundingClientRect();
        const worldRect = world.getBoundingClientRect();

        const startX = mainRect.left + mainRect.width / 2 - worldRect.left;
        const startY = mainRect.top + mainRect.height / 2 - worldRect.top;
        const end1X = leftRect.left + leftRect.width / 2 - worldRect.left;
        const end1Y = leftRect.top + leftRect.height / 2 - worldRect.top;
        const end2X = rightRect.left + rightRect.width / 2 - worldRect.left;
        const end2Y = rightRect.top + rightRect.height / 2 - worldRect.top;

        const controlOffset = 150;
        const path1_d = `M ${startX},${startY} C ${startX - controlOffset},${startY} ${end1X + controlOffset},${end1Y} ${end1X},${end1Y}`;
        const path2_d = `M ${startX},${startY} C ${startX + controlOffset},${startY} ${end2X - controlOffset},${end2Y} ${end2X},${end2Y}`;

        wireLeft.setAttribute('d', path1_d);
        wireRight.setAttribute('d', path2_d);
        wireLeft.classList.add('visible');
        wireRight.classList.add('visible');
    }

    function focusOnRow(row) {
        isZoomed = true;
        activeRow = row;
        const rowRect = row.getBoundingClientRect();
        const worldRect = world.getBoundingClientRect();
        panY = (viewport.clientHeight / 2) - (rowRect.top - worldRect.top + rowRect.height / 2);
        
        const viewportWidth = viewport.clientWidth;
        const rowWidth = row.scrollWidth;
        scale = (viewportWidth / rowWidth) * 0.9;

        applyAnimatedTransform();
    }

    function resetFocus() {
        isZoomed = false;
        if (activeRow) {
            activeRow.classList.remove('panels-visible');
            updateWires(activeRow, false);
            activeRow = null;
        }
        scale = 1;
    }
    
    function navigateToTopic(index) {
        if (index < 0 || index >= topicRows.length) return;
        
        const wasZoomed = isZoomed;
        if (wasZoomed) {
            resetFocus();
        }

        currentTopicIndex = index;
        const targetRow = topicRows[index];
        const targetY = (viewport.clientHeight / 2) - (targetRow.offsetTop + targetRow.offsetHeight / 2);

        // If we were zoomed, wait for the zoom-out to finish before panning.
        // Otherwise, pan immediately.
        if (wasZoomed) {
             // First, apply the zoom-out while keeping the current pan
            applyAnimatedTransform();
            setTimeout(() => {
                panY = targetY;
                applyAnimatedTransform();
            }, 500); // A shorter delay feels more responsive
        } else {
            panY = targetY;
            applyAnimatedTransform();
        }
    }
    
    // --- SETUP INITIAL STATE AND EVENT LISTENERS ---
    
    function setInitialPosition() {
        currentTopicIndex = 0;
        const initialRow = topicRows[0];
        // Instantly pan to the first topic on page load without animation
        panY = (viewport.clientHeight / 2) - (initialRow.offsetTop + initialRow.offsetHeight / 2);
        applyTransform();
    }
    
    // Call this once the page structure is ready
    setInitialPosition();

    topicRows.forEach((row, index) => {
        const mainPanel = row.querySelector('.main-panel');
        const videos = row.querySelectorAll('.topic-video');
        
        mainPanel.addEventListener('click', () => {
            const isBecomingVisible = !row.classList.contains('panels-visible');
            
            if (activeRow && activeRow !== row) {
                activeRow.classList.remove('panels-visible');
                updateWires(activeRow, false);
            }

            row.classList.toggle('panels-visible');

            if (isBecomingVisible) {
                videos.forEach(video => video.play());
                focusOnRow(row);
                currentTopicIndex = index;
            } else {
                videos.forEach(video => video.pause());
                resetFocus();
                navigateToTopic(index);
            }
        });

        row.addEventListener('transitionend', (event) => {
            if (row.classList.contains('panels-visible') && event.propertyName === 'max-width') {
                updateWires(row, true);
            }
        });
    });

    function handleNavigation(direction) {
        if (isNavigating) return;
        isNavigating = true;
        
        const nextIndex = currentTopicIndex + direction;
        navigateToTopic(nextIndex);
        
        setTimeout(() => { isNavigating = false; }, 800);
    }

    viewport.addEventListener('wheel', (event) => {
        event.preventDefault();
        handleNavigation(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener('keydown', (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            handleNavigation(1);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            handleNavigation(-1);
        }
    });

    window.addEventListener('resize', () => {
        if (isZoomed && activeRow) {
            focusOnRow(activeRow);
        } else {
            navigateToTopic(currentTopicIndex);
        }
    });
});
