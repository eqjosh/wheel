// Load SVG and initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSVG();
});

// Load the SVG file
async function loadSVG() {
    try {
        const response = await fetch('01-Feeling-Wheel-segmented.svg');
        const svgText = await response.text();

        const svgWrapper = document.getElementById('svg-wrapper');
        svgWrapper.innerHTML = svgText;

        // Initialize interactivity after SVG is loaded
        initializeInteractivity();
    } catch (error) {
        console.error('Error loading SVG:', error);
        document.getElementById('svg-wrapper').innerHTML = '<p>Error loading emotion wheel. Please refresh the page.</p>';
    }
}

// Initialize click and hover handlers
function initializeInteractivity() {
    const svg = document.querySelector('#svg-wrapper svg');
    if (!svg) return;

    // Get all emotion segment groups
    const emotionSegments = svg.querySelectorAll('g[id*="-1-"], g[id*="-2-"], g[id*="-3-"], g[id*="-4-"]');

    emotionSegments.forEach(segment => {
        const segmentId = segment.id;

        // Skip if no data for this segment
        if (!emotionsData[segmentId]) return;

        // Add hover effect
        segment.addEventListener('mouseenter', () => {
            segment.style.cursor = 'pointer';
        });

        // Add click handler
        segment.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove active class from all segments
            emotionSegments.forEach(s => s.classList.remove('active'));

            // Add active class to clicked segment
            segment.classList.add('active');

            // Update info panel
            updateInfoPanel(segmentId);
        });
    });

    // Click outside to reset
    svg.addEventListener('click', () => {
        emotionSegments.forEach(s => s.classList.remove('active'));
        showWelcomeMessage();
    });
}

// Update the info panel with emotion data
function updateInfoPanel(emotionId) {
    const emotion = emotionsData[emotionId];
    if (!emotion) return;

    const infoContent = document.getElementById('info-content');

    infoContent.innerHTML = `
        <div class="emotion-info">
            <div class="emotion-category">${emotion.category}</div>
            <h2 class="emotion-title" style="color: ${emotion.color}">${emotion.name}</h2>
            <p class="emotion-description">${emotion.description}</p>

            <div class="related-feelings">
                <h3>Related Feelings</h3>
                <ul>
                    ${emotion.relatedFeelings.map(feeling => `<li>${feeling}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

// Show welcome message
function showWelcomeMessage() {
    const infoContent = document.getElementById('info-content');

    infoContent.innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to the Emotion Wheel</h2>
            <p>This interactive wheel helps you identify and understand different emotions.</p>
            <p><strong>How to use:</strong></p>
            <ul>
                <li>Hover over any segment to highlight it</li>
                <li>Click on a segment to learn more about that emotion</li>
                <li>Explore the 8 core emotions and 32 related feelings</li>
            </ul>
        </div>
    `;
}
