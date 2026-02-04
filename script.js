// Global variables
let quotationsData = {};
let emotionsData = {};
let emojiData = {};
let currentEmotionId = null;
let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
let localeData = null;
let activeTab = 'essentials';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadSVG();
    await loadLocale(currentLanguage);
    await loadEmojiData();
    initializeInteractivity();
    initializeLanguageSelector();
    initializeToolbar();
    initializeCursorGlow();
    initializeRandomButton();
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

// Load emoji data
async function loadEmojiData() {
    try {
        const response = await fetch('emoji-data.json');
        const data = await response.json();
        emojiData = data.emotions;
    } catch (error) {
        console.error('Error loading emoji data:', error);
        emojiData = {};
    }
}

// Load locale data
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

    Object.keys(emotionsData).forEach(emotionId => {
        const emotion = emotionsData[emotionId];
        const emotionGroup = svg.querySelector(`#${emotionId}`);

        if (!emotionGroup) return;

        const textElements = emotionGroup.querySelectorAll('text tspan');
        if (textElements.length === 0) return;

        const relatedFeelings = emotion.relatedFeelings || [];

        relatedFeelings.forEach((feeling, index) => {
            if (textElements[index]) {
                textElements[index].textContent = feeling;
            }
        });

        const mainNameIndex = textElements.length - 1;
        if (textElements[mainNameIndex]) {
            textElements[mainNameIndex].textContent = emotion.name;
        }
    });
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

// Initialize toolbar tab switching
function initializeToolbar() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');

    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    activeTab = tabName;

    // Update button states
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Initialize cursor glow effect
function initializeCursorGlow() {
    const wheelSection = document.querySelector('.wheel-section');
    const cursorGlow = document.getElementById('cursorGlow');

    if (!wheelSection || !cursorGlow) return;

    wheelSection.addEventListener('mousemove', (e) => {
        const rect = wheelSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cursorGlow.style.left = `${x}px`;
        cursorGlow.style.top = `${y}px`;
        cursorGlow.style.opacity = '1';
    });

    wheelSection.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
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

// Get opposite emotion ID (wheel opposites)
function getOppositeId(emotionId) {
    const oppositeMap = {
        'joy-1-optimistic': 'sad-1-hurt',
        'joy-2-confident': 'sad-2-depressed',
        'joy-3-joyful': 'sad-3-lonely',
        'joy-4-loving': 'sad-4-ashamed',
        'trust-1-grateful': 'disgust-1-dislike',
        'trust-2-peaceful': 'disgust-2-avoidance',
        'trust-3-accepted': 'disgust-3-aweful',
        'trust-4-hopeful': 'disgust-4-disapproval',
        'fear-1-nervous': 'anger-1-aggressive',
        'fear-2-scared': 'anger-2-mad',
        'fear-3-anxious': 'anger-3-frustrated',
        'fear-4-insecure': 'anger-4-critical',
        'surprise-1-startled': 'anticipation-1-excited',
        'surprise-2-confused': 'anticipation-2-eager',
        'surprise-3-amazed': 'anticipation-3-interested',
        'surprise-4-disappointed': 'anticipation-4-stressed',
        'sad-1-hurt': 'joy-1-optimistic',
        'sad-2-depressed': 'joy-2-confident',
        'sad-3-lonely': 'joy-3-joyful',
        'sad-4-ashamed': 'joy-4-loving',
        'disgust-1-dislike': 'trust-1-grateful',
        'disgust-2-avoidance': 'trust-2-peaceful',
        'disgust-3-aweful': 'trust-3-accepted',
        'disgust-4-disapproval': 'trust-4-hopeful',
        'anger-1-aggressive': 'fear-1-nervous',
        'anger-2-mad': 'fear-2-scared',
        'anger-3-frustrated': 'fear-3-anxious',
        'anger-4-critical': 'fear-4-insecure',
        'anticipation-1-excited': 'surprise-1-startled',
        'anticipation-2-eager': 'surprise-2-confused',
        'anticipation-3-interested': 'surprise-3-amazed',
        'anticipation-4-stressed': 'surprise-4-disappointed'
    };
    return oppositeMap[emotionId] || null;
}

// Get category class name
function getCategoryClass(category) {
    const classMap = {
        'Joy': 'joy',
        'Trust': 'trust',
        'Fear': 'fear',
        'Surprise': 'surprise',
        'Sadness': 'sadness',
        'Disgust': 'disgust',
        'Anger': 'anger',
        'Anticipation': 'anticipation'
    };
    return classMap[category] || '';
}

// Initialize click and hover handlers
function initializeInteractivity() {
    const svg = document.querySelector('#svg-wrapper svg');
    if (!svg) return;

    const emotionSegments = svg.querySelectorAll('g[id*="-1-"], g[id*="-2-"], g[id*="-3-"], g[id*="-4-"]');

    emotionSegments.forEach(segment => {
        const segmentId = segment.id;

        if (!emotionsData[segmentId]) return;

        const backgroundId = getBackgroundId(segmentId);
        const background = svg.querySelector(`#${backgroundId}`);

        if (background) {
            background.style.opacity = '1.0';

            background.addEventListener('click', (e) => {
                handleSegmentClick(e, segment, segmentId, emotionSegments);
            });
        }

        segment.addEventListener('click', (e) => {
            handleSegmentClick(e, segment, segmentId, emotionSegments);
        });
    });

    // Click outside to reset
    svg.addEventListener('click', (e) => {
        // Only reset if clicking on the SVG background, not a segment
        if (e.target === svg || e.target.tagName === 'svg') {
            resetSelection(emotionSegments);
        }
    });
}

// Handle segment click
function handleSegmentClick(e, segment, segmentId, allSegments) {
    e.stopPropagation();

    // Remove active class from all segments
    allSegments.forEach(s => {
        s.classList.remove('active');
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

    // Position selection marker
    positionSelectionMarker(segment);

    // Update info panel
    updateInfoPanel(segmentId);
}

// Position selection marker on wheel
function positionSelectionMarker(segment) {
    const marker = document.getElementById('selectionMarker');
    const svg = document.querySelector('#svg-wrapper svg');
    const wheelSection = document.querySelector('.wheel-section');

    if (!marker || !svg || !segment || !wheelSection) return;

    // Get the bounding box of the segment
    const segmentRect = segment.getBoundingClientRect();
    const wheelRect = wheelSection.getBoundingClientRect();

    // Calculate center of the segment relative to wheel section
    const centerX = segmentRect.left + segmentRect.width / 2 - wheelRect.left;
    const centerY = segmentRect.top + segmentRect.height / 2 - wheelRect.top;

    // Position the marker
    marker.style.left = `${centerX}px`;
    marker.style.top = `${centerY}px`;
    marker.classList.add('visible');
}

// Hide selection marker
function hideSelectionMarker() {
    const marker = document.getElementById('selectionMarker');
    if (marker) {
        marker.classList.remove('visible');
    }
}

// Reset selection state
function resetSelection(allSegments) {
    allSegments.forEach(s => {
        s.classList.remove('active');
        const texts = s.querySelectorAll('text');
        texts.forEach(t => t.style.filter = '');
    });

    hideSelectionMarker();
    showWelcomeMessage();
    currentEmotionId = null;
}

// Map segment IDs to their background layer IDs
function getBackgroundId(segmentId) {
    const match = segmentId.match(/^(.*?)-(1|2|3|4)-/);
    if (match) {
        const emotion = match[1];
        const number = match[2];

        if (emotion === 'joy') {
            if (number === '1') return 'joy-1-background';
            return `joy${number}-background`;
        }

        return `${emotion}-${number}-background`;
    }

    return null;
}

// Update the info panel with emotion data
function updateInfoPanel(emotionId) {
    const emotion = emotionsData[emotionId];
    if (!emotion) return;

    currentEmotionId = emotionId;
    const emoji = emojiData[emotionId];

    // Show the header and toolbar
    const emotionHeader = document.getElementById('emotionHeader');
    const toolbar = document.getElementById('toolbar');
    const welcomeMessage = document.getElementById('welcome-message');

    if (emotionHeader) {
        emotionHeader.style.display = 'block';
        // Remove all category classes and add the current one
        emotionHeader.className = 'emotion-header ' + getCategoryClass(emotion.category);
    }
    if (toolbar) toolbar.style.display = 'flex';
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    // Update header content
    document.getElementById('emotionCategory').textContent = emotion.category;
    document.getElementById('emotionName').textContent = emotion.name;
    document.getElementById('mainEmoji').textContent = emoji ? emoji.emoji : '';

    // Populate all tabs
    populateEssentialsTab(emotion);
    populateAlgebraTab(emotion, emotionId);
    populateWisdomTab(emotion);
    populateExamplesTab(emotionId);
    populateEmojisTab(emotionId, emotion);

    // Ensure active tab is shown
    switchTab(activeTab);
}

// Populate Essentials tab
function populateEssentialsTab(emotion) {
    document.getElementById('definitionText').textContent = emotion.description;
    document.getElementById('purposeText').textContent = emotion.adaptivePurpose;
}

// Populate Algebra tab
function populateAlgebraTab(emotion, emotionId) {
    const emoji = emojiData[emotionId];

    // Emotional Algebra text
    const algebraText = document.getElementById('algebraText');
    if (emoji && emoji.emotionalAlgebra) {
        algebraText.textContent = emoji.emotionalAlgebra;
    } else if (emotion.border) {
        algebraText.textContent = emotion.border;
    } else {
        algebraText.textContent = `${emotion.name} is a core expression of ${emotion.category}.`;
    }

    // Related feelings list
    const relatedList = document.getElementById('relatedFeelingsList');
    relatedList.innerHTML = '';

    if (emotion.relatedFeelings && emotion.relatedFeelings.length > 0) {
        emotion.relatedFeelings.forEach(feeling => {
            const feelingEmoji = emoji && emoji.relatedEmojis ? emoji.relatedEmojis[feeling] : '';
            const chip = document.createElement('span');
            chip.className = 'feeling-chip';
            chip.innerHTML = `${feelingEmoji ? feelingEmoji + ' ' : ''}${feeling}`;
            relatedList.appendChild(chip);
        });
    }

    // Explore grid (opposite and related emotions)
    const exploreGrid = document.getElementById('exploreGrid');
    const oppositeCard = document.getElementById('oppositeCard');
    exploreGrid.innerHTML = '';
    oppositeCard.innerHTML = '';

    // Find adjacent emotions on the wheel
    const adjacentEmotions = getAdjacentEmotions(emotionId);

    adjacentEmotions.forEach(adjId => {
        const adjEmotion = emotionsData[adjId];
        if (adjEmotion) {
            const adjEmoji = emojiData[adjId];
            const card = document.createElement('div');
            card.className = 'explore-card';
            card.innerHTML = `
                <span class="explore-emoji">${adjEmoji ? adjEmoji.emoji : ''}</span>
                <span class="explore-name">${adjEmotion.name}</span>
            `;
            card.addEventListener('click', () => navigateToEmotion(adjId));
            exploreGrid.appendChild(card);
        }
    });

    // Opposite emotion - use getOppositeId function as fallback
    const oppositeId = emotion.oppositeId || getOppositeId(emotionId);
    if (oppositeId) {
        const oppositeEmotion = emotionsData[oppositeId];
        if (oppositeEmotion) {
            const oppEmoji = emojiData[oppositeId];
            oppositeCard.innerHTML = `
                <div class="opposite-label">Opposite Feeling</div>
                <div class="opposite-content">
                    <span class="opposite-emoji">${oppEmoji ? oppEmoji.emoji : ''}</span>
                    <span class="opposite-name">${oppositeEmotion.name}</span>
                </div>
            `;
            oppositeCard.style.cursor = 'pointer';
            oppositeCard.addEventListener('click', () => navigateToEmotion(oppositeId));
        }
    }
}

// Get adjacent emotions on the wheel
function getAdjacentEmotions(emotionId) {
    const allIds = Object.keys(emotionsData);
    const currentIndex = allIds.indexOf(emotionId);

    if (currentIndex === -1) return [];

    const adjacent = [];

    // Get previous emotion (wrapping around)
    const prevIndex = (currentIndex - 1 + allIds.length) % allIds.length;
    adjacent.push(allIds[prevIndex]);

    // Get next emotion (wrapping around)
    const nextIndex = (currentIndex + 1) % allIds.length;
    adjacent.push(allIds[nextIndex]);

    return adjacent;
}

// Navigate to a different emotion
function navigateToEmotion(emotionId) {
    const svg = document.querySelector('#svg-wrapper svg');
    if (!svg) return;

    const allSegments = svg.querySelectorAll('g[id*="-1-"], g[id*="-2-"], g[id*="-3-"], g[id*="-4-"]');
    const targetSegment = Array.from(allSegments).find(seg => seg.id === emotionId);

    if (targetSegment) {
        handleSegmentClick(new Event('click'), targetSegment, emotionId, allSegments);
    }
}

// Populate Wisdom tab
function populateWisdomTab(emotion) {
    document.getElementById('wisdomQuestion').textContent = emotion.question || '';
    document.getElementById('wisdomRisk').textContent = emotion.overloadRisk || '';
    document.getElementById('wisdomTip').textContent = emotion.overloadTip || '';
}

// Populate Examples tab
function populateExamplesTab(emotionId) {
    const quotesContainer = document.getElementById('quotesContainer');
    const storyCard = document.getElementById('storyCard');
    const storyText = document.getElementById('storyText');

    quotesContainer.innerHTML = '';

    const quotes = quotationsData[emotionId];

    if (quotes && quotes.length > 0) {
        quotes.forEach(quote => {
            const quoteCard = document.createElement('div');
            quoteCard.className = 'quote-card';

            const attribution = [];
            if (quote.speaker) attribution.push(quote.speaker);
            if (quote.work) attribution.push(quote.work);

            quoteCard.innerHTML = `
                <p class="quote-text">"${quote.text}"</p>
                ${attribution.length > 0 ? `<p class="quote-attribution">— ${attribution.join(', ')}</p>` : ''}
            `;
            quotesContainer.appendChild(quoteCard);
        });
    } else {
        quotesContainer.innerHTML = '<p class="no-content">No quotations available for this feeling.</p>';
    }

    // Story example (placeholder - can be populated from data if available)
    storyText.textContent = 'Real-life examples coming soon.';
}

// Populate Emojis tab
function populateEmojisTab(emotionId, emotion) {
    const emojiGrid = document.getElementById('emojiGrid');
    emojiGrid.innerHTML = '';

    const emoji = emojiData[emotionId];
    if (!emoji) {
        emojiGrid.innerHTML = '<p class="no-content">No emoji data available.</p>';
        return;
    }

    // Main emoji
    const mainCard = createEmojiCard(emotion.name, emoji.emoji);
    emojiGrid.appendChild(mainCard);

    // Related feeling emojis
    if (emoji.relatedEmojis) {
        Object.entries(emoji.relatedEmojis).forEach(([feeling, emojiStr]) => {
            const card = createEmojiCard(feeling, emojiStr);
            emojiGrid.appendChild(card);
        });
    }
}

// Create an emoji card element
function createEmojiCard(label, emojiStr) {
    const card = document.createElement('div');
    card.className = 'emoji-card';
    card.innerHTML = `
        <div class="emoji-display">${emojiStr}</div>
        <div class="emoji-label">${label}</div>
        <button class="copy-emoji-btn" data-emoji="${emojiStr}">Copy</button>
    `;

    const copyBtn = card.querySelector('.copy-emoji-btn');
    copyBtn.addEventListener('click', () => copyEmoji(emojiStr));

    return card;
}

// Copy emoji to clipboard
function copyEmoji(emoji) {
    navigator.clipboard.writeText(emoji).then(() => {
        showToast('Copied!');
    }).catch(err => {
        console.error('Failed to copy emoji:', err);
        showToast('Failed to copy');
    });
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
}

// Show welcome message
function showWelcomeMessage() {
    const emotionHeader = document.getElementById('emotionHeader');
    const toolbar = document.getElementById('toolbar');
    const welcomeMessage = document.getElementById('welcome-message');

    if (emotionHeader) emotionHeader.style.display = 'none';
    if (toolbar) toolbar.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'block';

    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
}

// Initialize random feeling button
function initializeRandomButton() {
    const btn = document.getElementById('randomFeelingBtn');
    if (btn) {
        btn.addEventListener('click', selectRandomFeeling);
    }
}

// Select a random feeling from the wheel
function selectRandomFeeling() {
    const emotionIds = Object.keys(emotionsData);
    if (emotionIds.length === 0) return;

    const randomId = emotionIds[Math.floor(Math.random() * emotionIds.length)];
    navigateToEmotion(randomId);
}
