// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadSVG();
    initializeInteractivity();
});

// Load external SVG file and inject it into the DOM
async function loadSVG() {
    try {
        const response = await fetch('01-Feeling-Wheel-segmented-joy-3.svg');
        const svgText = await response.text();
        const wrapper = document.getElementById('svg-wrapper');
        wrapper.innerHTML = svgText;
    } catch (error) {
        console.error('Error loading SVG:', error);
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

        // Get the corresponding background layer
        const backgroundId = getBackgroundId(segmentId);
        const background = svg.querySelector(`#${backgroundId}`);

        // Initially hide the background
        if (background) {
            background.style.opacity = '0';
            background.style.transition = 'opacity 0.2s ease';
        }

        // Add hover effect
        segment.addEventListener('mouseenter', () => {
            segment.style.cursor = 'pointer';
            if (background) {
                background.style.opacity = '0.4';
            }
        });

        segment.addEventListener('mouseleave', () => {
            if (background && !segment.classList.contains('active')) {
                background.style.opacity = '0';
            }
        });

        // Add click handler
        segment.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove active class from all segments and hide their backgrounds
            emotionSegments.forEach(s => {
                s.classList.remove('active');
                const bgId = getBackgroundId(s.id);
                const bg = svg.querySelector(`#${bgId}`);
                if (bg) bg.style.opacity = '0';
            });

            // Add active class to clicked segment
            segment.classList.add('active');

            // Show background for active segment
            if (background) background.style.opacity = '0.4';

            // Update info panel
            updateInfoPanel(segmentId);
        });
    });

    // Click outside to reset
    svg.addEventListener('click', () => {
        emotionSegments.forEach(s => {
            s.classList.remove('active');
            const bgId = getBackgroundId(s.id);
            const bg = svg.querySelector(`#${bgId}`);
            if (bg) bg.style.opacity = '0';
        });
        showWelcomeMessage();
    });
}

// Map segment IDs to their background layer IDs
function getBackgroundId(segmentId) {
    // joy-1-optimistic -> joy-1-background
    // joy-2-confident -> joy2-background
    // joy-3-joyful -> joy3-background
    // joy-4-loving -> joy4-background

    const match = segmentId.match(/^(.*?)-(1|2|3|4)-/);
    if (match) {
        const emotion = match[1];
        const number = match[2];

        // Special handling for joy segments (they have different naming)
        if (emotion === 'joy') {
            if (number === '1') return 'joy-1-background';
            return `joy${number}-background`;
        }
    }

    return null;
}


// Update the info panel with emotion data
function updateInfoPanel(emotionId) {
    const emotion = emotionsData[emotionId];
    if (!emotion) return;

    const infoContent = document.getElementById('info-content');

    // Build the HTML with compact related feelings and optional border info
    let html = `
        <div class="emotion-info">
            <div class="emotion-category">${emotion.category}</div>
            <h2 class="emotion-title" style="color: ${emotion.color}">${emotion.name}</h2>
            <p class="emotion-description">${emotion.description}</p>

            <div class="related-feelings">
                <h3>Related Feelings</h3>
                <p>${emotion.relatedFeelings.join(', ')}</p>
            </div>
    `;

    // Add border information if it exists
    if (emotion.border) {
        html += `
            <div class="border-info">
                <h3>Border</h3>
                <p>${emotion.border}</p>
            </div>
        `;
    }

    html += `</div>`;

    infoContent.innerHTML = html;
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
