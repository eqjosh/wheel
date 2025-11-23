// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadSVG();
    initializeInteractivity();
});

// Load external SVG file and inject it into the DOM
async function loadSVG() {
    try {
        const response = await fetch('01-Feeling-Wheel-segmented-3.svg');
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

        // Set initial background style - always visible at full opacity
        if (background) {
            background.style.opacity = '1.0';
        }

        // Add click handler
        segment.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove active class and text effects from all segments
            emotionSegments.forEach(s => {
                s.classList.remove('active');
                // Remove text drop shadow
                const texts = s.querySelectorAll('text');
                texts.forEach(t => t.style.filter = '');
            });

            // Add active class to clicked segment
            segment.classList.add('active');

            // Add text drop shadow to active segment
            const texts = segment.querySelectorAll('text');
            texts.forEach(text => {
                text.style.filter = 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.4))';
                text.style.transition = 'filter 0.2s ease';
            });

            // Update info panel
            updateInfoPanel(segmentId);
        });
    });

    // Click outside to reset
    svg.addEventListener('click', () => {
        emotionSegments.forEach(s => {
            s.classList.remove('active');
            // Remove text drop shadow
            const texts = s.querySelectorAll('text');
            texts.forEach(t => t.style.filter = '');
        });
        showWelcomeMessage();
    });
}

// Map segment IDs to their background layer IDs
function getBackgroundId(segmentId) {
    // Examples:
    // joy-1-optimistic -> joy-1-background
    // joy-2-confident -> joy2-background
    // trust-1-grateful -> trust-1-background
    // fear-4-insecure -> fear-4-background

    const match = segmentId.match(/^(.*?)-(1|2|3|4)-/);
    if (match) {
        const emotion = match[1];
        const number = match[2];

        // Special handling for joy segments (they have inconsistent naming)
        if (emotion === 'joy') {
            if (number === '1') return 'joy-1-background';
            return `joy${number}-background`;
        }

        // All other emotions follow consistent pattern: emotion-number-background
        return `${emotion}-${number}-background`;
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
                <p><span class="info-label">Related Feelings:</span> ${emotion.relatedFeelings.join(', ')}</p>
            </div>
    `;

    // Add border information if it exists
    if (emotion.border) {
        html += `
            <div class="border-info">
                <p><span class="info-label">Border:</span> ${emotion.border}</p>
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
