/* Basic Setup */
body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #f0f0f0;
    font-family: Arial, sans-serif;
}

#viewport {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* The "world" is now a flex container */
#world {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px; /* The space between panels when visible */
    transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform-origin: center center;
}

/* --- Panel Styling (Now Proportional) --- */
.panel {
    height: 280px; /* Set a fixed height for all panels */
    flex-shrink: 0; /* Prevent panels from shrinking */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Align content to the top */
    padding: 15px;
    box-sizing: border-box;
    
    background: linear-gradient(to bottom, #ffffff, #e0e0e0);
    border: 1px solid #c0c0c0;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.15);
    transform: translateZ(0); /* GPU layer fix */
}

.panel h2, .panel h3 {
    width: 100%;
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    color: #333;
    border-bottom: 1px solid #ccc;
}

.main-panel {
    position: relative;
    width: 400px; /* The main panel can keep a fixed width */
    cursor: pointer;
    z-index: 20;
}

.main-panel .panel-tab {
    position: absolute;
    right: -30px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 80px;
    background: linear-gradient(to right, #d0b084, #c0a074);
    border-radius: 0 10px 10px 0;
    box-shadow: 5px 3px 10px rgba(0,0,0,0.1);
}

/* --- Content Styling --- */
video, pre {
    display: block;
    width: auto; /* Let the width be determined by the height and aspect ratio */
    height: 100%;
    border-radius: 8px;
    background-color: #000;
}

pre {
    color: #00ff00;
    font-family: 'Courier New', Courier, monospace;
    font-size: 8px; /* Adjust font-size to fit your art */
    line-height: 1.0;
    padding: 10px;
    box-sizing: border-box;
    overflow: hidden;
}

/* --- Hide/Show Animation --- */
.video-panel, .ascii-panel {
    max-width: 0;
    padding: 0;
    border-width: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-width 0.8s ease, padding 0.5s ease, opacity 0.5s ease, border-width 0.5s ease;
}

#world.panels-visible .video-panel,
#world.panels-visible .ascii-panel {
    max-width: 500px; /* Animate to a max-width; actual width is set by content */
    padding: 15px;
    border-width: 1px;
    opacity: 1;
}
