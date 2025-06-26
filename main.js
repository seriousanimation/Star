// This function needs to be defined globally so other scripts can find it.
// We will call it when the window is fully loaded.
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

    // --- MAIN TRANSFORM FUNCTION ---
    function applyTransform() {
        world.style.transform = `translateY(${panY}px) scale(${scale})`;
    }

    // --- WIRE DRAWING LOGIC ---
    function updateWires(row, show = false) {
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

    // --- ZOOM AND FOCUS LOGIC ---
    function focusOnRow(row) {
        isZoomed = true;
        activeRow = row;

        const viewportHeight = viewport.clientHeight;
        const rowRect = row.getBoundingClientRect();
        const worldRect = world.getBoundingClientRect();
        
        // Calculate Y position to center the row
        const targetY = (viewportHeight / 2) - (rowRect.top - worldRect.top + rowRect.height / 2);
        panY = targetY;

        // CHANGE: The zoom calculation is REMOVED from this function.
        // We only apply the pan transform for now. The zoom will be handled later.
        applyTransform();
    }

    function resetFocus() {
        isZoomed = false;
        activeRow = null;
        panY = 0;
        scale = 1;
        applyTransform();
    }
    
    // --- SETUP EVENT LISTENERS FOR EACH ROW ---
    topicRows.forEach(row => {
        const mainPanel = row.querySelector('.main-panel');
        const videos = row.querySelectorAll('.topic-video');
        const leftPanelContainer = row.querySelector('.left-panels');

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
            } else {
                videos.forEach(video => video.pause());
                resetFocus();
                updateWires(row, false);
            }
        });

        // Listen for the animation to end to perform final actions
        leftPanelContainer.addEventListener('transitionend', (event) => {
            if (row.classList.contains('panels-visible') && event.propertyName === 'max-width') {
                // CHANGE: The zoom calculation logic is now HERE.
                // It runs only after the panels have finished expanding.
                const viewportWidth = viewport.clientWidth;
                const rowWidth = row.scrollWidth;
                scale = (viewportWidth / rowWidth) * 0.9;
                applyTransform();

                // Update wires after the final zoom is applied
                updateWires(row, true);
            }
        });
    });

    // --- MOUSE WHEEL PANNING ---
    viewport.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (isZoomed) return;

        panY -= event.deltaY;
        
        const worldHeight = world.scrollHeight;
        const viewportHeight = viewport.clientHeight;
        const maxPanY = 0;
        const minPanY = -(worldHeight - viewportHeight);

        if (panY > maxPanY) panY = maxPanY;
        if (panY < minPanY) panY = minPanY;

        applyTransform();
    }, { passive: false });

    // --- RESIZE HANDLER ---
    window.addEventListener('resize', () => {
        if (isZoomed && activeRow) {
            // Re-center and re-calculate zoom on resize
            focusOnRow(activeRow);
            const viewportWidth = viewport.clientWidth;
            const rowWidth = activeRow.scrollWidth;
            scale = (viewportWidth / rowWidth) * 0.9;
            applyTransform();
        }
    });
});
