// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeInteractivity();
});

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

        // Create background layer for hover effect
        createBackgroundLayer(segment);

        // Add hover effect
        segment.addEventListener('mouseenter', () => {
            segment.style.cursor = 'pointer';
            const bg = segment.querySelector('.segment-background');
            if (bg) {
                bg.style.opacity = '1';
            }
        });

        segment.addEventListener('mouseleave', () => {
            const bg = segment.querySelector('.segment-background');
            if (bg && !segment.classList.contains('active')) {
                bg.style.opacity = '0';
            }
        });

        // Add click handler
        segment.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove active class from all segments and hide their backgrounds
            emotionSegments.forEach(s => {
                s.classList.remove('active');
                const bg = s.querySelector('.segment-background');
                if (bg) bg.style.opacity = '0';
            });

            // Add active class to clicked segment
            segment.classList.add('active');

            // Show background for active segment
            const bg = segment.querySelector('.segment-background');
            if (bg) bg.style.opacity = '1';

            // Update info panel
            updateInfoPanel(segmentId);
        });
    });

    // Click outside to reset
    svg.addEventListener('click', () => {
        emotionSegments.forEach(s => {
            s.classList.remove('active');
            const bg = s.querySelector('.segment-background');
            if (bg) bg.style.opacity = '0';
        });
        showWelcomeMessage();
    });
}

// Create a background layer for hover effects
function createBackgroundLayer(segment) {
    // Find all path elements in this segment
    const paths = segment.querySelectorAll('path');
    if (paths.length === 0) return;

    // Create a group for the background
    const bgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bgGroup.classList.add('segment-background');
    bgGroup.style.opacity = '0';
    bgGroup.style.transition = 'opacity 0.2s ease';
    bgGroup.style.pointerEvents = 'none';

    // Clone each path and add to background group
    paths.forEach(path => {
        const bgPath = path.cloneNode(true);
        // Fill with semi-transparent white for highlight effect
        bgPath.style.fill = 'rgba(255, 255, 255, 0.3)';
        bgPath.style.stroke = 'none';
        bgGroup.appendChild(bgPath);
    });

    // Insert background as first child (behind everything else)
    segment.insertBefore(bgGroup, segment.firstChild);
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
