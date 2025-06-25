document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer = document.getElementById('video-player');
    const asciiContainer = document.getElementById('ascii-content');

    // --- GitHub URLs for your assets ---
    const videoURL = 'https://raw.githubusercontent.com/seriousanimation/Star/main/assets/videos/video1.mp4';
    const asciiURL = 'https://raw.githubusercontent.com/seriousanimation/Star/main/assets/ASCII/example2.html';


    // --- Load Content ---

    // Set the video source
    videoPlayer.src = videoURL;

    // Fetch and display the ASCII animation
    fetch(asciiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // FIX: Use .innerHTML instead of .textContent to render the <pre> tag from the source file.
            asciiContainer.innerHTML = data;
        })
        .catch(error => {
            console.error('Error fetching ASCII content:', error);
            asciiContainer.innerHTML = 'Failed to load ASCII content.';
        });


    // --- Click Interaction ---
    mainPanel.addEventListener('click', () => {
        // Toggle the 'panels-visible' class on the world container
        const isVisible = world.classList.toggle('panels-visible');

        // Play/pause video when panels are shown/hidden for better performance
        if (isVisible) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
            videoPlayer.currentTime = 0; // Optional: rewind video when hidden
        }
    });
});
