document.addEventListener('DOMContentLoaded', () => {

    const world = document.getElementById('world');
    const mainPanel = document.getElementById('mainPanel');
    const videoPlayer = document.getElementById('video-player');
    const asciiContainer = document.getElementById('ascii-content');

    // --- GitHub URLs for your assets ---
    // Note: These URLs must point to the *raw* file content.
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
            // We inject the fetched text directly into our <pre> tag
            asciiContainer.textContent = data;
        })
        .catch(error => {
            console.error('Error fetching ASCII content:', error);
            asciiContainer.textContent = 'Failed to load ASCII content.';
        });


    // --- Click Interaction ---
    mainPanel.addEventListener('click', () => {
        // Toggle the 'panels-visible' class on the world container
        world.classList.toggle('panels-visible');

        // Optional: Play/pause video when panels are shown/hidden
        if (world.classList.contains('panels-visible')) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    });
});