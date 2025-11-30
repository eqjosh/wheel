// Global variables
let quotationsData = [];
let emotionsData = {};
let currentEmotionId = null;
let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
let localeData = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadSVG();
    await loadLocale(currentLanguage);
    initializeInteractivity();
    initializeModal();
    initializeLanguageSelector();
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

// Load locale data (replaces loadEmotionsData and loadQuotations)
async function loadLocale(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        localeData = await response.json();

        // Convert emotions array to object keyed by emotion id
        emotionsData = {};
        localeData.emotions.forEach(emotion => {
            emotionsData[emotion.id] = {
                name: emotion.name,
                category: emotion.category,
                color: getCategoryColor(emotion.category),
                description: emotion.description,
                relatedFeelings: emotion.relatedFeelings,
                border: emotion.borderInfo || null,
                question: emotion.question,
                overloadRisk: emotion.overloadRisk,
                overloadTip: emotion.overloadTip,
                adaptivePurpose: emotion.adaptivePurpose,
                oppositeId: emotion.oppositeId
            };
        });

        // Store quotes
        quotationsData = localeData.quotes;

        // Update UI text
        updateUIText();

        // Update SVG text elements
        updateSVGText();

        // Refresh the info panel if an emotion is selected
        if (currentEmotionId) {
            updateInfoPanel(currentEmotionId);
        } else {
            showWelcomeMessage();
        }

    } catch (error) {
        console.error('Error loading locale:', error);
        emotionsData = {};
        quotationsData = {};
    }
}

// Update UI text based on current locale
function updateUIText() {
    if (!localeData) return;

    const ui = localeData.ui;
    document.getElementById('page-title').textContent = ui.title;
    document.querySelector('.copyright').innerHTML = `${ui.copyright} <a href="https://emotionrules.com" target="_blank">${ui.copyrightLink}</a>`;
    document.querySelector('.version').textContent = ui.version;
}

// Update SVG text elements with translated content
function updateSVGText() {
    if (!localeData || !emotionsData) return;

    const svg = document.querySelector('#svg-wrapper svg');
    if (!svg) return;

    // Iterate through each emotion and update its SVG text elements
    Object.keys(emotionsData).forEach(emotionId => {
        const emotion = emotionsData[emotionId];
        const emotionGroup = svg.querySelector(`#${emotionId}`);

        if (!emotionGroup) return;

        // Get all text elements in this group
        const textElements = emotionGroup.querySelectorAll('text');
        const tspanElements = emotionGroup.querySelectorAll('text tspan');

        if (tspanElements.length === 0) return;

        // Ensure all text elements have text-anchor attribute set
        textElements.forEach(textEl => {
            textEl.setAttribute('text-anchor', 'middle');
        });

        // Update related feelings and emotion name
        // The pattern is: related feeling(s), then the main emotion name (usually last and largest)
        const relatedFeelings = emotion.relatedFeelings || [];

        // Update the related feelings (first N-1 text elements)
        relatedFeelings.forEach((feeling, index) => {
            if (tspanElements[index]) {
                tspanElements[index].textContent = feeling;
                // Ensure tspan has proper positioning for centered text
                tspanElements[index].setAttribute('x', '0');
                tspanElements[index].setAttribute('y', '0');
                // Dynamically adjust font size for longer text
                adjustTextSize(textElements[index], feeling);
            }
        });

        // Update the main emotion name (last text element)
        const mainNameIndex = tspanElements.length - 1;
        if (tspanElements[mainNameIndex]) {
            tspanElements[mainNameIndex].textContent = emotion.name;
            // Ensure tspan has proper positioning for centered text
            tspanElements[mainNameIndex].setAttribute('x', '0');
            tspanElements[mainNameIndex].setAttribute('y', '0');
            // Dynamically adjust font size for longer text
            adjustTextSize(textElements[mainNameIndex], emotion.name);
        }
    });
}

// Adjust text size based on character length to prevent overflow
function adjustTextSize(textElement, content) {
    if (!textElement || !content) return;

    const baseLength = 12; // Reference length for English words
    const textLength = content.length;

    // Get the original font size from the text element's class
    const computedStyle = window.getComputedStyle(textElement);
    const originalSize = parseFloat(computedStyle.fontSize);

    // Calculate scale factor - reduce size for longer text
    let scaleFactor = 1;
    if (textLength > baseLength) {
        scaleFactor = baseLength / textLength;
        // Don't scale down more than 70% of original size
        scaleFactor = Math.max(scaleFactor, 0.7);
    }

    // Apply the scaled font size
    if (scaleFactor < 1) {
        textElement.style.fontSize = (originalSize * scaleFactor) + 'px';
    } else {
        // Reset to original size if text is short enough
        textElement.style.fontSize = '';
    }
}

// Initialize language selector
function initializeLanguageSelector() {
    const selector = document.getElementById('language-selector');
    selector.value = currentLanguage;

    selector.addEventListener('change', async (e) => {
        currentLanguage = e.target.value;
        localStorage.setItem('preferredLanguage', currentLanguage);
        await loadLocale(currentLanguage);
    });
}

// Get color for emotion category
function getCategoryColor(category) {
    const colorMap = {
        'Joy': '#ffcb09',
        'Trust': '#89c24f',
        'Fear': '#03a54c',
        'Surprise': '#2782c5',
        'Sadness': '#34689d',
        'Disgust': '#8774b3',
        'Anger': '#f05d5f',
        'Anticipation': '#f2913b'
    };
    return colorMap[category] || '#808080';
}

// Get original description for each emotion (from v2.8)
function getOriginalDescription(emotionId) {
    const descriptions = {
        'joy-1-optimistic': 'A feeling of hopefulness and confidence about the future. When you\'re optimistic, you believe that good things will happen and maintain a positive outlook on life.',
        'joy-2-confident': 'A sense of self-assurance arising from appreciation of your abilities or qualities. Confidence empowers you to take action and face challenges.',
        'joy-3-joyful': 'A feeling of great pleasure and happiness. Pure joy is an intense, positive emotion that fills you with delight and contentment.',
        'joy-4-loving': 'A deep feeling of affection, care, and warmth toward someone or something. Love creates connection and a sense of belonging.',
        'trust-1-grateful': 'A warm feeling of thankfulness and appreciation. Gratitude helps you recognize and value the good things in your life.',
        'trust-2-peaceful': 'A state of tranquility and calm, free from worry or disturbance. Peace brings mental and emotional equilibrium.',
        'trust-3-accepted': 'A feeling of being welcomed and valued for who you are. Acceptance creates a sense of belonging and security.',
        'trust-4-hopeful': 'A feeling of expectation and desire for positive outcomes. Hope motivates you to keep moving forward even in difficult times.',
        'fear-1-nervous': 'A state of unease or apprehension about something uncertain. Nervousness is a natural response to situations that feel challenging or unfamiliar.',
        'fear-2-scared': 'An intense feeling of fear or alarm. Being scared is your body\'s way of alerting you to potential danger.',
        'fear-3-anxious': 'A feeling of worry, nervousness, or unease about something with an uncertain outcome. Anxiety can be a signal to prepare or take action.',
        'fear-4-insecure': 'A lack of confidence or certainty about yourself or your place in a situation. Insecurity often stems from self-doubt or fear of rejection.',
        'surprise-1-startled': 'A sudden feeling of shock or alarm caused by something unexpected. Being startled is an immediate, automatic response to surprise.',
        'surprise-2-confused': 'A state of being bewildered or unclear about something. Confusion occurs when information doesn\'t match your expectations or understanding.',
        'surprise-3-amazed': 'A feeling of great wonder and astonishment. Amazement is a positive form of surprise that fills you with awe.',
        'surprise-4-disappointed': 'A feeling of sadness or displeasure when expectations are not met. Disappointment signals a gap between what you hoped for and reality.',
        'sad-1-hurt': 'Emotional pain caused by something or someone. Hurt feelings often arise from perceived rejection, criticism, or loss.',
        'sad-2-depressed': 'A state of deep sadness and low energy. Depression can make everything feel heavy and difficult to manage.',
        'sad-3-lonely': 'A painful feeling of isolation or disconnection from others. Loneliness highlights our need for meaningful connection.',
        'sad-4-ashamed': 'A painful feeling of humiliation or distress caused by believing you\'ve done something wrong or embarrassing. Shame affects how you see yourself.',
        'disgust-1-dislike': 'A feeling of aversion or disapproval toward something or someone. Dislike helps you identify what doesn\'t align with your values.',
        'disgust-2-avoidance': 'A tendency to stay away from something unpleasant or uncomfortable. Avoidance is a protective response to things that feel threatening.',
        'disgust-3-aweful': 'A strong negative feeling about something very unpleasant or disagreeable. Feeling awful signals that something is deeply wrong or distressing.',
        'disgust-4-disapproval': 'A negative judgment or opinion about someone or something. Disapproval reflects a conflict between your values and what you observe.',
        'anger-1-aggressive': 'A forceful and confrontational expression of anger. Aggression is often a response to feeling threatened or frustrated.',
        'anger-2-mad': 'An intense feeling of displeasure or rage. Being mad signals that something has violated your boundaries or expectations.',
        'anger-3-frustrated': 'A feeling of upset or annoyance when unable to achieve something. Frustration arises from blocked goals or unmet needs.',
        'anger-4-critical': 'A tendency to find fault or judge harshly. Being critical can be a form of anger directed at perceived flaws or failures.',
        'anticipation-1-excited': 'A feeling of enthusiastic eagerness about something that\'s going to happen. Excitement energizes you and creates positive anticipation.',
        'anticipation-2-eager': 'A keen desire or readiness to do or experience something. Eagerness drives you forward with enthusiasm and motivation.',
        'anticipation-3-interested': 'A feeling of wanting to learn more or be involved in something. Interest draws your attention and curiosity toward new experiences.',
        'anticipation-4-stressed': 'A state of mental or emotional strain from demanding circumstances. Stress signals that you\'re facing challenges that require energy and resources.'
    };
    return descriptions[emotionId] || '';
}

// Get related feelings for each emotion (from v2.8)
function getRelatedFeelings(emotionId) {
    const feelingsMap = {
        'joy-1-optimistic': ['Positive', 'Inspired', 'Hopeful'],
        'joy-2-confident': ['Proud', 'Self-assured', 'Empowered'],
        'joy-3-joyful': ['Ecstatic', 'Delighted', 'Blissful'],
        'joy-4-loving': ['Embracing', 'Generous', 'Affectionate'],
        'trust-1-grateful': ['Fulfilled', 'Admiration', 'Thankful'],
        'trust-2-peaceful': ['Calm', 'Content', 'Serene'],
        'trust-3-accepted': ['Valued', 'Respected', 'Welcomed'],
        'trust-4-hopeful': ['Longing', 'Expectant', 'Optimistic'],
        'fear-1-nervous': ['Threatened', 'Uneasy', 'Jittery'],
        'fear-2-scared': ['Frightened', 'Terrified', 'Alarmed'],
        'fear-3-anxious': ['Dread', 'Worry', 'Tense'],
        'fear-4-insecure': ['Rejected', 'Inadequate', 'Uncertain'],
        'surprise-1-startled': ['Appalled', 'Shocked', 'Stunned'],
        'surprise-2-confused': ['Disillusioned', 'Perplexed', 'Bewildered'],
        'surprise-3-amazed': ['Astonished', 'Awed', 'Impressed'],
        'surprise-4-disappointed': ['Betrayed', 'Dismayed', 'Let down'],
        'sad-1-hurt': ['Dismayed', 'Threatened', 'Wounded'],
        'sad-2-depressed': ['Bereft', 'Numb', 'Empty'],
        'sad-3-lonely': ['Abandoned', 'Isolated', 'Disconnected'],
        'sad-4-ashamed': ['Remorseful', 'Guilty', 'Embarrassed'],
        'disgust-1-dislike': ['Revolted', 'Withdrawn', 'Repulsed'],
        'disgust-2-avoidance': ['Hesitant', 'Averse', 'Reluctant'],
        'disgust-3-aweful': ['Repelled', 'Detested', 'Horrible'],
        'disgust-4-disapproval': ['Loathing', 'Judgmental', 'Critical'],
        'anger-1-aggressive': ['Hostile', 'Provoked', 'Combative'],
        'anger-2-mad': ['Enraged', 'Furious', 'Livid'],
        'anger-3-frustrated': ['Annoyed', 'Irritated', 'Exasperated'],
        'anger-4-critical': ['Sarcastic', 'Skeptical', 'Judgmental'],
        'anticipation-1-excited': ['Passionate', 'Energized', 'Thrilled'],
        'anticipation-2-eager': ['Enthusiastic', 'Motivated', 'Keen'],
        'anticipation-3-interested': ['Impatient', 'Curious', 'Engaged'],
        'anticipation-4-stressed': ['Overwhelmed', 'Pressured', 'Tense']
    };
    return feelingsMap[emotionId] || [];
}

// Get border information (only for emotions that have borders)
function getBorderInfo(emotionId) {
    const borders = {
        'joy-1-optimistic': 'Optimistic is near Anticipation because it has a component of looking ahead.',
        'joy-4-loving': 'Loving is near Trust because it involves a foundation of care and reliability.',
        'trust-1-grateful': 'Grateful is near Joy because it involves appreciation for positive experiences.',
        'trust-4-hopeful': 'Hopeful is near Fear because it involves uncertainty about the future.',
        'fear-1-nervous': 'Nervous is near Trust because it involves vulnerability and the need for safety.',
        'fear-4-insecure': 'Insecure is near Surprise because it involves unexpected threats to self-worth.',
        'surprise-1-startled': 'Startled is near Fear because it involves a sudden sense of threat or danger.',
        'surprise-4-disappointed': 'Disappointed is near Sadness because it involves loss of hope and unmet expectations.',
        'sad-1-hurt': 'Hurt is near Surprise because it often comes from unexpected emotional wounds.',
        'sad-4-ashamed': 'Ashamed is near Disgust because it involves negative judgment of oneself.',
        'disgust-1-dislike': 'Dislike is near Sadness because it involves emotional withdrawal and rejection.',
        'disgust-4-disapproval': 'Disapproval is near Anger because it involves critical evaluation and potential confrontation.',
        'anger-1-aggressive': 'Aggressive is near Disgust because it involves rejecting or pushing away what\'s unacceptable.',
        'anger-4-critical': 'Critical is near Anticipation because it involves vigilance and preparation against potential problems.',
        'anticipation-1-excited': 'Excited is near Anger because it involves intense energy and readiness for action.',
        'anticipation-4-stressed': 'Stressed is near Joy because it involves high energy focused on achieving positive outcomes.'
    };
    return borders[emotionId] || null;
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

    // Build the HTML with compact related feelings and purpose
    let html = `
        <div class="emotion-info">
            <div class="emotion-category">${emotion.category}</div>
            <h2 class="emotion-title" style="color: ${emotion.color}">${emotion.name}</h2>
            <p class="emotion-description">${emotion.description}</p>

            <div class="purpose-info">
                <p><span class="info-label">${localeData.ui.adaptivePurposeLabel}:</span> ${emotion.adaptivePurpose}</p>
            </div>

            <div class="related-feelings">
                <p><span class="info-label">${localeData.ui.relatedFeelingsLabel}:</span> ${emotion.relatedFeelings.join(', ')}</p>
            </div>
    `;

    // Add border information if it exists
    if (emotion.border) {
        html += `
            <div class="border-info">
                <p><span class="info-label">${localeData.ui.borderInfoLabel}:</span> ${emotion.border}</p>
            </div>
        `;
    }

    // Add explore this feeling section with action icons
    html += `
        <div class="explore-feeling">
            <p class="explore-label">${localeData.ui.exploreThisFeelingLabel}:</p>
            <div class="action-icons">
                <img src="action-message.png" class="action-icon" id="action-message" title="View guiding question" alt="Message">
                <img src="action-overload.png" class="action-icon" id="action-overload" title="View overload risk" alt="Overload">
                <img src="action-quotation.png" class="action-icon" id="action-quotation" title="View quotation" alt="Quotation">
                <img src="action-opposite.png" class="action-icon" id="action-opposite" title="View opposite feeling" alt="Opposite">
            </div>
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

    if (!localeData) {
        infoContent.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to the Emotional Wisdom Wheel</h2>
                <p>This interactive wheel helps you identify and understand different emotions.</p>
                <p><strong>How to use:</strong></p>
                <ul>
                    <li>Hover over any segment to highlight it</li>
                    <li>Click on a segment to learn more about that emotion</li>
                    <li>Explore the 8 core emotions and 32 related feelings</li>
                </ul>
            </div>
        `;
        return;
    }

    const ui = localeData.ui;
    const stepsHtml = ui.howToUseSteps.map(step => `<li>${step}</li>`).join('');

    infoContent.innerHTML = `
        <div class="welcome-message">
            <p>${ui.welcomeMessage}</p>
            <p><strong>${ui.howToUseTitle}</strong></p>
            <ul>
                ${stepsHtml}
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
        <p><strong>Emotional Wisdom Questions:</strong></p>
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
    const quotes = quotationsData[currentEmotionId];

    if (!quotes || quotes.length === 0) {
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
                "${quote.text}" ${attribution}
            </p>
        `;
    });

    showModal(emotion.name + ' - Quotations', quotesHtml);
}
