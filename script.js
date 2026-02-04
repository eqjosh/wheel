// Global variables
let quotationsData = {};
let emotionsData = {};
let emojiData = {};
let currentEmotionId = null;
let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
let localeData = null;
let activeTab = 'essentials';

// Subscriber state
const SUBSCRIBER_KEY = 'eww_subscriber';
const GATED_TABS = ['wisdom', 'examples'];

// Pardot country list (must match exactly)
const PARDOT_COUNTRIES = [
    "United States", "Canada", "Afghanistan", "Albania", "Algeria", "Andorra",
    "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina",
    "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bermuda", "Bhutan", "Bolivia (Plurinational State of)",
    "Bosnia and Herzegovina", "Botswana", "Brazil", "British Indian Ocean Territory",
    "Virgin Islands (British)", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Central African Republic",
    "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands",
    "Colombia", "Comoros", "Congo (Democratic Republic of)", "Cook Islands",
    "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czech Republic",
    "Côte d'Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France",
    "French Guiana", "French Polynesia", "French Southern Territories", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland",
    "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
    "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy",
    "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon",
    "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Macao", "North Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius",
    "Mayotte", "Mexico", "Micronesia", "Moldova (Republic of)", "Monaco", "Mongolia",
    "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua",
    "Niger", "Nigeria", "Niue", "Norfolk Island", "Korea (Republic of)",
    "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland",
    "Portugal", "Puerto Rico", "Qatar", "Romania", "Russian Federation", "Rwanda",
    "Réunion", "Saint Barthélemy", "Saint Helena/Ascension/Tristan da Cunha",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
    "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Swaziland",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania (United Republic of)", "Thailand", "Timor-Leste", "Togo", "Tokelau",
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkiye", "Turkmenistan",
    "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican",
    "Venezuela (Bolivarian Republic of)", "Vietnam", "Wallis and Futuna",
    "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Aland Islands",
    "Brunei Darussalam", "Bonaire/Sint Eustatius/Saba", "Bouvet Island", "Congo",
    "Czechia", "Falkland Islands (Malvinas)", "South Georgia and South Sandwich Islands",
    "Heard Island and McDonald Islands", "Saint Martin (French part)", "Palestine",
    "Sint Maarten (Dutch part)", "Eswatini", "Holy See (Vatican City State)", "Kosovo"
];

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
    initializeSubscriberSystem();
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
                oppositeId: emotion.oppositeId,
                story: emotion.story
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

    // Update toolbar tab labels
    const tabButtons = document.querySelectorAll('.toolbar-btn');
    tabButtons.forEach(btn => {
        const tab = btn.dataset.tab;
        const icon = btn.querySelector('.icon').textContent;
        if (tab === 'essentials' && ui.tabEssentials) {
            btn.innerHTML = `<span class="icon">${icon}</span> ${ui.tabEssentials}`;
        } else if (tab === 'algebra' && ui.tabAlgebra) {
            btn.innerHTML = `<span class="icon">${icon}</span> ${ui.tabAlgebra}`;
        } else if (tab === 'wisdom' && ui.tabWisdom) {
            btn.innerHTML = `<span class="icon">${icon}</span> ${ui.tabWisdom}`;
        } else if (tab === 'examples' && ui.tabExamples) {
            btn.innerHTML = `<span class="icon">${icon}</span> ${ui.tabExamples}`;
        } else if (tab === 'emojis' && ui.tabEmojis) {
            btn.innerHTML = `<span class="icon">${icon}</span> ${ui.tabEmojis}`;
        }
    });

    // Update section labels
    const definitionLabel = document.querySelector('#tab-essentials .definition-block .section-label');
    if (definitionLabel && ui.definitionLabel) definitionLabel.textContent = ui.definitionLabel;

    const purposeLabel = document.querySelector('#tab-essentials .purpose-block .section-label');
    if (purposeLabel && ui.adaptivePurposeLabel) purposeLabel.textContent = ui.adaptivePurposeLabel;

    const algebraLabels = document.querySelectorAll('#tab-algebra .section-label');
    if (algebraLabels[0] && ui.emotionalAlgebraLabel) algebraLabels[0].textContent = ui.emotionalAlgebraLabel;
    if (algebraLabels[1] && ui.relatedFeelingsLabel) algebraLabels[1].textContent = ui.relatedFeelingsLabel;
    if (algebraLabels[2] && ui.exploreRelatedLabel) algebraLabels[2].textContent = ui.exploreRelatedLabel;

    const wisdomLabels = document.querySelectorAll('#tab-wisdom .section-label');
    if (wisdomLabels[0] && ui.guidingQuestionLabel) wisdomLabels[0].textContent = ui.guidingQuestionLabel;
    if (wisdomLabels[1] && ui.overloadRiskLabel) wisdomLabels[1].textContent = ui.overloadRiskLabel;
    if (wisdomLabels[2] && ui.overloadTipLabel) wisdomLabels[2].textContent = ui.overloadTipLabel;

    const storyLabel = document.querySelector('#storyCard .story-label');
    if (storyLabel && ui.realLifeExampleLabel) storyLabel.textContent = ui.realLifeExampleLabel;

    // Update random feeling button
    const randomBtn = document.getElementById('randomFeelingBtn');
    if (randomBtn && ui.randomFeelingButton) randomBtn.textContent = ui.randomFeelingButton;

    // Update welcome message
    const welcomeMsg = document.querySelector('#welcome-message p:first-child');
    if (welcomeMsg && ui.welcomeMessage) welcomeMsg.textContent = ui.welcomeMessage;

    const howToUseTitle = document.querySelector('#welcome-message p:nth-child(2) strong');
    if (howToUseTitle && ui.howToUseTitle) howToUseTitle.textContent = ui.howToUseTitle;
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
    // Check if tab is gated and user is not a subscriber
    if (isGatedTab(tabName) && !isSubscriber()) {
        activeTab = tabName; // Store intended tab for after subscription
        showSubscribeModal();
        return;
    }

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
        const noQuotesText = localeData?.ui?.noQuotes || 'No quotations available for this feeling.';
        quotesContainer.innerHTML = `<p class="no-content">${noQuotesText}</p>`;
    }

    // Story example from emotion data
    const emotion = emotionsData[emotionId];
    if (emotion && emotion.story) {
        storyText.textContent = emotion.story;
        storyCard.style.display = 'block';
    } else {
        const comingSoonText = localeData?.ui?.comingSoon || 'Real-life examples coming soon.';
        storyText.textContent = comingSoonText;
        storyCard.style.display = 'block';
    }
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
    const copyText = localeData?.ui?.copyButton || 'Copy';
    card.innerHTML = `
        <div class="emoji-display">${emojiStr}</div>
        <div class="emoji-label">${label}</div>
        <button class="copy-emoji-btn" data-emoji="${emojiStr}">${copyText}</button>
    `;

    const copyBtn = card.querySelector('.copy-emoji-btn');
    copyBtn.addEventListener('click', () => copyEmoji(emojiStr));

    return card;
}

// Copy emoji to clipboard
function copyEmoji(emoji) {
    const copiedText = localeData?.ui?.copiedToast || 'Copied!';
    navigator.clipboard.writeText(emoji).then(() => {
        showToast(copiedText);
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

// ===== SUBSCRIBER GATING =====

// Check if user is a subscriber
function isSubscriber() {
    return localStorage.getItem(SUBSCRIBER_KEY) === 'true';
}

// Set subscriber status
function setSubscriber(status) {
    localStorage.setItem(SUBSCRIBER_KEY, status ? 'true' : 'false');
    updateGatedTabsUI();
}

// Check if a tab is gated
function isGatedTab(tabName) {
    return GATED_TABS.includes(tabName);
}

// Update UI for gated tabs based on subscriber status
function updateGatedTabsUI() {
    const subscriber = isSubscriber();

    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        const tab = btn.dataset.tab;
        if (isGatedTab(tab)) {
            if (subscriber) {
                btn.classList.remove('gated');
                btn.querySelector('.lock-icon')?.remove();
            } else {
                btn.classList.add('gated');
                if (!btn.querySelector('.lock-icon')) {
                    const lockIcon = document.createElement('span');
                    lockIcon.className = 'lock-icon';
                    lockIcon.textContent = '🔒';
                    btn.appendChild(lockIcon);
                }
            }
        }
    });
}

// Show subscribe modal
function showSubscribeModal() {
    let modal = document.getElementById('subscribeModal');

    if (!modal) {
        modal = createSubscribeModal();
        document.body.appendChild(modal);
    }

    // Update modal text with current locale
    updateSubscribeModalText();

    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

// Hide subscribe modal
function hideSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    if (modal) {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
}

// Create the subscribe modal HTML
function createSubscribeModal() {
    const modal = document.createElement('div');
    modal.id = 'subscribeModal';
    modal.className = 'subscribe-modal';

    modal.innerHTML = `
        <div class="subscribe-modal-backdrop" onclick="hideSubscribeModal()"></div>
        <div class="subscribe-modal-content">
            <button class="subscribe-modal-close" onclick="hideSubscribeModal()">&times;</button>
            <div class="subscribe-modal-header">
                <span class="subscribe-modal-icon">✨</span>
                <h2 id="subscribeModalTitle">Unlock Full Access</h2>
            </div>
            <p id="subscribeModalDescription" class="subscribe-modal-description">
                Get free access to wisdom insights and real-life examples for all 32 emotions.
            </p>
            <form id="pardotSubscribeForm" class="subscribe-form">
                <div class="form-group">
                    <input type="text" name="First Name" id="subscribeFirstName" required placeholder="First name">
                </div>
                <div class="form-group">
                    <input type="email" name="email" id="subscribeEmail" required placeholder="Email address">
                </div>
                <div class="form-group">
                    <select name="Country" id="subscribeCountry" required>
                        <option value="">Select your country</option>
                    </select>
                </div>
                <button type="submit" class="subscribe-submit-btn">
                    <span id="subscribeButtonText">Subscribe Free</span>
                </button>
            </form>
            <p id="subscribePrivacyNote" class="subscribe-privacy">
                We respect your privacy. Unsubscribe anytime.
            </p>
        </div>
    `;

    // Populate country dropdown
    const countrySelect = modal.querySelector('#subscribeCountry');
    PARDOT_COUNTRIES.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });

    // Add form submit handler
    const form = modal.querySelector('#pardotSubscribeForm');
    form.addEventListener('submit', handleSubscribeFormSubmit);

    return modal;
}

// Update subscribe modal text based on current locale
function updateSubscribeModalText() {
    const ui = localeData?.ui || {};

    const titleEl = document.getElementById('subscribeModalTitle');
    const descEl = document.getElementById('subscribeModalDescription');
    const btnTextEl = document.getElementById('subscribeButtonText');
    const privacyEl = document.getElementById('subscribePrivacyNote');
    const firstNameInput = document.getElementById('subscribeFirstName');
    const emailInput = document.getElementById('subscribeEmail');
    const countrySelect = document.getElementById('subscribeCountry');

    if (titleEl) titleEl.textContent = ui.subscribeModalTitle || 'Unlock Full Access';
    if (descEl) descEl.textContent = ui.subscribeModalDescription || 'Get free access to wisdom insights and real-life examples for all 32 emotions.';
    if (btnTextEl) btnTextEl.textContent = ui.subscribeButton || 'Subscribe Free';
    if (privacyEl) privacyEl.textContent = ui.privacyNote || 'We respect your privacy. Unsubscribe anytime.';
    if (firstNameInput) firstNameInput.placeholder = ui.firstNamePlaceholder || 'First name';
    if (emailInput) emailInput.placeholder = ui.emailPlaceholder || 'Email address';
    if (countrySelect) countrySelect.options[0].textContent = ui.countryPlaceholder || 'Select your country';
}

// Handle subscribe form submission
function handleSubscribeFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.subscribe-submit-btn');
    const originalBtnText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Subscribing...';

    // Create hidden iframe for form submission (no page redirect)
    const iframe = document.createElement('iframe');
    iframe.name = 'pardot-submit-iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create a temporary form to submit to Pardot
    const pardotForm = document.createElement('form');
    pardotForm.action = 'https://eq.6seconds.org/l/446782/2026-02-04/9f5pmx';
    pardotForm.method = 'POST';
    pardotForm.target = 'pardot-submit-iframe';
    pardotForm.style.display = 'none';

    // Copy form data
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        pardotForm.appendChild(input);
    }

    document.body.appendChild(pardotForm);
    pardotForm.submit();

    // Assume success after brief delay (Pardot returns to referring URL in iframe)
    setTimeout(() => {
        // Clean up
        document.body.removeChild(iframe);
        document.body.removeChild(pardotForm);

        // Mark as subscriber
        setSubscriber(true);

        // Hide modal
        hideSubscribeModal();

        // Show success toast
        const successText = localeData?.ui?.subscribeSuccess || 'Welcome! All content is now unlocked.';
        showToast(successText);

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // If user was trying to access a gated tab, switch to it now
        if (isGatedTab(activeTab)) {
            switchTab(activeTab);
        }
    }, 2000);
}

// Initialize subscriber system
function initializeSubscriberSystem() {
    // Update gated tabs UI based on current status
    updateGatedTabsUI();

    // Check if we just returned from a subscription (via direct form POST fallback)
    if (sessionStorage.getItem('eww_subscribe_pending')) {
        sessionStorage.removeItem('eww_subscribe_pending');
        setSubscriber(true);
        const successText = localeData?.ui?.subscribeSuccess || 'Welcome! All content is now unlocked.';
        showToast(successText);
    }
}
