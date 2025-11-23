// Global variables
let quotationsData = [];
let currentEmotionId = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadSVG();
    await loadQuotations();
    initializeInteractivity();
    initializeModal();
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

// Load quotations data
async function loadQuotations() {
    try {
        const response = await fetch('action-quotation.json');
        quotationsData = await response.json();
    } catch (error) {
        console.error('Error loading quotations:', error);
        quotationsData = [];
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

            // Add click handler to background (since it's the visible/clickable area)
            background.addEventListener('click', (e) => {
                handleSegmentClick(e, segment, segmentId, emotionSegments);
            });
        }

        // Also add click handler to segment (for text area if it becomes clickable)
        segment.addEventListener('click', (e) => {
            handleSegmentClick(e, segment, segmentId, emotionSegments);
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

// Handle segment click (separated for reuse)
function handleSegmentClick(e, segment, segmentId, allSegments) {
    e.stopPropagation();

    // Remove active class and text effects from all segments
    allSegments.forEach(s => {
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

    // Store current emotion ID for action handlers
    currentEmotionId = emotionId;

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

    // Add action icons
    html += `
        <div class="action-icons">
            <img src="action-message.png" class="action-icon" id="action-message" title="View guiding question" alt="Message">
            <img src="action-opposite.png" class="action-icon" id="action-opposite" title="View opposite feeling" alt="Opposite">
            <img src="action-overload.png" class="action-icon" id="action-overload" title="View overload risk" alt="Overload">
            <img src="action-quotation.png" class="action-icon" id="action-quotation" title="View quotation" alt="Quotation">
        </div>
    `;

    html += `</div>`;

    infoContent.innerHTML = html;

    // Attach event listeners to action icons
    attachActionListeners();
}

// Show welcome message
function showWelcomeMessage() {
    const infoContent = document.getElementById('info-content');
    currentEmotionId = null;

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

// Attach event listeners to action icons
function attachActionListeners() {
    const messageIcon = document.getElementById('action-message');
    const oppositeIcon = document.getElementById('action-opposite');
    const overloadIcon = document.getElementById('action-overload');
    const quotationIcon = document.getElementById('action-quotation');

    if (messageIcon) messageIcon.addEventListener('click', showMessageAction);
    if (oppositeIcon) oppositeIcon.addEventListener('click', showOppositeAction);
    if (overloadIcon) overloadIcon.addEventListener('click', showOverloadAction);
    if (quotationIcon) quotationIcon.addEventListener('click', showQuotationAction);
}

// Initialize modal functionality
function initializeModal() {
    const modal = document.getElementById('popup-modal');
    const closeBtn = document.querySelector('.modal-close');

    // Close modal when clicking the X
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Show modal with content
function showModal(title, content) {
    const modal = document.getElementById('popup-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <h2>${title}</h2>
        ${content}
    `;

    modal.style.display = 'block';
}

// Action: Show message/question
function showMessageAction() {
    if (!currentEmotionId) return;
    const emotion = emotionsData[currentEmotionId];
    if (!emotion || !emotion.question) return;

    const content = `
        <p><strong>Guiding Question:</strong></p>
        <p>${emotion.question}</p>
    `;

    showModal(emotion.name, content);
}

// Action: Show opposite feeling
function showOppositeAction() {
    if (!currentEmotionId) return;
    const emotion = emotionsData[currentEmotionId];
    if (!emotion || !emotion.oppositeId) return;

    const oppositeEmotion = emotionsData[emotion.oppositeId];
    if (!oppositeEmotion) return;

    // Trigger click on the opposite segment
    const svg = document.querySelector('#svg-wrapper svg');
    const allSegments = svg.querySelectorAll('g[id*="-1-"], g[id*="-2-"], g[id*="-3-"], g[id*="-4-"]');

    // Find the opposite segment
    const oppositeSegment = Array.from(allSegments).find(seg => seg.id === emotion.oppositeId);

    if (oppositeSegment) {
        // Simulate a click on the opposite segment
        handleSegmentClick(new Event('click'), oppositeSegment, emotion.oppositeId, allSegments);
    }
}

// Action: Show overload risk
function showOverloadAction() {
    if (!currentEmotionId) return;
    const emotion = emotionsData[currentEmotionId];
    if (!emotion || !emotion.overloadRisk) return;

    const content = `
        <p><strong>Risk of Overuse:</strong></p>
        <p>${emotion.overloadRisk}</p>
        <p><strong>Balancing Tip:</strong></p>
        <p>${emotion.overloadTip}</p>
    `;

    showModal(emotion.name + ' - Overload', content);
}

// Action: Show quotation
function showQuotationAction() {
    if (!currentEmotionId) return;
    const emotion = emotionsData[currentEmotionId];
    if (!emotion) return;

    // Get quotations for this emotion
    const quotes = quotationsData.filter(q => q.id === currentEmotionId);

    if (quotes.length === 0) {
        showModal(emotion.name + ' - Quotations', '<p>No quotations available for this feeling.</p>');
        return;
    }

    // Display all quotes in compact format
    let quotesHtml = '';
    quotes.forEach(quote => {
        const speaker = quote.speaker ? quote.speaker : '';
        const work = quote.work ? quote.work : '';
        const attribution = speaker && work ? `— ${speaker}, ${work}` :
                          speaker ? `— ${speaker}` :
                          work ? `— ${work}` : '';

        quotesHtml += `
            <p class="quote-compact">
                "${quote.quote_text}" ${attribution}
            </p>
        `;
    });

    showModal(emotion.name + ' - Quotations', quotesHtml);
}
