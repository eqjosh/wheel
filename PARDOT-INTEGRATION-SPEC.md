# Pardot Integration Spec for Emotional Wisdom Wheel

## Overview

Implement subscriber gating using Salesforce Pardot to gate premium content (Wisdom and Examples tabs) behind email subscription. Non-subscribers see the first two tabs (Essentials, Algebra) and Emojis; subscribers unlock Wisdom and Examples tabs.

---

## Project Context

**Repository:** https://github.com/eqjosh/wheel
**Current Version:** v3.1
**Tech Stack:** Vanilla JavaScript, HTML, CSS (no build tools)
**Hosting:** GitHub Pages

### Key Files
- `index.html` - Main HTML structure with tab layout
- `script.js` - Core app logic, tab switching, data loading
- `styles.css` - All styling
- `locales/en.json`, `es.json`, `it.json`, `ja.json` - Localized content

### Current Tab Structure
1. **Essentials** - Definition, Adaptive Purpose (FREE)
2. **Algebra** - Emotional Algebra, Related Feelings, Opposites (FREE)
3. **Wisdom** - Guiding Question, Overload Risk, Balance Tip (GATED)
4. **Examples** - Quotes, Real-Life Stories (GATED)
5. **Emojis** - Emoji picker with copy function (FREE)

---

## Requirements

### User Flow

1. **Non-subscriber visits site:**
   - Can freely use wheel interaction
   - Can access Essentials, Algebra, and Emojis tabs
   - Clicking Wisdom or Examples tab shows gated state with subscription prompt
   - Gated state includes brief preview/teaser of content

2. **User subscribes:**
   - Modal/overlay appears with Pardot form embed
   - Form collects: Email (required), First Name (optional)
   - On successful submission, Pardot sets cookie or returns success
   - All tabs unlock immediately
   - Subscription state persists across sessions (localStorage + Pardot cookie)

3. **Returning subscriber:**
   - Check localStorage flag on page load
   - Optionally verify with Pardot (if API allows)
   - All tabs available immediately

### Pardot Integration Details

**Pardot Form Handler:**
- **Endpoint URL:** `https://eq.6seconds.org/l/446782/2026-02-04/9f5pmx`
- Form will POST to Pardot endpoint
- Success/Error Location: Referring URL (user stays on same page)
- Completion Action: Add to list "Emotion Rules Launch Team"

**Form Fields (all required):**
- `email` → Maps to Pardot "Email" field
- `First Name` → Maps to Pardot "First Name" field
- `Country` → Maps to Pardot "Country" field (use dropdown with exact Pardot values)

**Country Dropdown Values (must match Pardot exactly):**
```
United States, Canada, Afghanistan, Albania, Algeria, Andorra, Angola, Anguilla,
Antarctica, Antigua and Barbuda, Argentina, Armenia, Aruba, Australia, Austria,
Azerbaijan, Bahamas, Bahrain, Bangladesh, Barbados, Belarus, Belgium, Belize,
Benin, Bermuda, Bhutan, Bolivia (Plurinational State of), Bosnia and Herzegovina,
Botswana, Brazil, British Indian Ocean Territory, Virgin Islands (British),
Brunei, Bulgaria, Burkina Faso, Burundi, Cambodia, Cameroon, Cape Verde,
Cayman Islands, Central African Republic, Chad, Chile, China, Christmas Island,
Cocos (Keeling) Islands, Colombia, Comoros, Congo (Democratic Republic of),
Cook Islands, Costa Rica, Croatia, Cuba, Curaçao, Cyprus, Czech Republic,
Côte d'Ivoire, Denmark, Djibouti, Dominica, Dominican Republic, Ecuador, Egypt,
El Salvador, Equatorial Guinea, Eritrea, Estonia, Ethiopia, Falkland Islands,
Faroe Islands, Fiji, Finland, France, French Guiana, French Polynesia,
French Southern Territories, Gabon, Gambia, Georgia, Germany, Ghana, Gibraltar,
Greece, Greenland, Grenada, Guadeloupe, Guam, Guatemala, Guernsey, Guinea,
Guinea-Bissau, Guyana, Haiti, Honduras, Hungary, Iceland, India, Indonesia,
Iran, Iraq, Ireland, Isle of Man, Israel, Italy, Jamaica, Japan, Jersey, Jordan,
Kazakhstan, Kenya, Kiribati, Kuwait, Kyrgyzstan, Lao People's Democratic Republic,
Latvia, Lebanon, Lesotho, Liberia, Libya, Liechtenstein, Lithuania, Luxembourg,
Macao, North Macedonia, Madagascar, Malawi, Malaysia, Maldives, Mali, Malta,
Marshall Islands, Martinique, Mauritania, Mauritius, Mayotte, Mexico, Micronesia,
Moldova (Republic of), Monaco, Mongolia, Montenegro, Montserrat, Morocco,
Mozambique, Myanmar, Namibia, Nauru, Nepal, Netherlands, New Caledonia,
New Zealand, Nicaragua, Niger, Nigeria, Niue, Norfolk Island, Korea (Republic of),
Northern Mariana Islands, Norway, Oman, Pakistan, Palau, Panama, Papua New Guinea,
Paraguay, Peru, Philippines, Pitcairn, Poland, Portugal, Puerto Rico, Qatar,
Romania, Russian Federation, Rwanda, Réunion, Saint Barthélemy,
Saint Helena/Ascension/Tristan da Cunha, Saint Kitts and Nevis, Saint Lucia,
Saint Pierre and Miquelon, Saint Vincent and the Grenadines, Samoa, San Marino,
Sao Tome and Principe, Saudi Arabia, Senegal, Serbia, Seychelles, Sierra Leone,
Singapore, Slovakia, Slovenia, Solomon Islands, Somalia, South Africa, South Sudan,
Spain, Sri Lanka, Sudan, Suriname, Svalbard and Jan Mayen, Swaziland, Sweden,
Switzerland, Syria, Taiwan, Tajikistan, Tanzania (United Republic of), Thailand,
Timor-Leste, Togo, Tokelau, Tonga, Trinidad and Tobago, Tunisia, Turkiye,
Turkmenistan, Turks and Caicos Islands, Tuvalu, Uganda, Ukraine,
United Arab Emirates, United Kingdom, Uruguay, Uzbekistan, Vanuatu, Vatican,
Venezuela (Bolivarian Republic of), Vietnam, Wallis and Futuna, Western Sahara,
Yemen, Zambia, Zimbabwe, Aland Islands, Brunei Darussalam,
Bonaire/Sint Eustatius/Saba, Bouvet Island, Congo, Czechia,
Falkland Islands (Malvinas), South Georgia and South Sandwich Islands,
Heard Island and McDonald Islands, Saint Martin (French part), Palestine,
Sint Maarten (Dutch part), Eswatini, Holy See (Vatican City State), Kosovo
```

**Success Handling:**
- Pardot returns to referring URL (stays on wheel page)
- On return, check URL params or use postMessage for success detection
- Set localStorage flag on successful submission

---

## Technical Implementation

### 1. Subscription State Management

```javascript
// In script.js

const STORAGE_KEY = 'eww_subscriber';

function isSubscriber() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

function setSubscriber(value) {
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
    updateTabAccess();
}

function updateTabAccess() {
    const isSubbed = isSubscriber();
    const gatedTabs = ['wisdom', 'examples'];

    gatedTabs.forEach(tabId => {
        const btn = document.querySelector(`[data-tab="${tabId}"]`);
        const content = document.getElementById(`tab-${tabId}`);

        if (!isSubbed) {
            btn.classList.add('gated');
            // Add lock icon to button
        } else {
            btn.classList.remove('gated');
        }
    });
}
```

### 2. Gated Content UI

When non-subscriber clicks gated tab:

```html
<div class="gated-overlay">
    <div class="gated-content">
        <div class="lock-icon">🔒</div>
        <h3>Unlock Deeper Wisdom</h3>
        <p>Subscribe to access guiding questions, balance tips, and real-life examples for all 32 emotions.</p>
        <button class="subscribe-btn" onclick="showSubscribeModal()">
            Subscribe Free
        </button>
        <p class="preview-teaser">Preview: "What possibilities do you see?..."</p>
    </div>
</div>
```

### 3. Subscription Modal

```html
<div id="subscribeModal" class="modal-overlay" style="display: none;">
    <div class="modal-content subscribe-modal">
        <button class="modal-close" onclick="hideSubscribeModal()">×</button>
        <h2>Unlock Full Access</h2>
        <p>Get free access to wisdom insights and real-life examples.</p>

        <!-- Pardot Form Embed -->
        <form id="pardotForm" action="https://eq.6seconds.org/l/446782/2026-02-04/9f5pmx" method="POST">
            <input type="text" name="First Name" placeholder="First name" required>
            <input type="email" name="email" placeholder="Email address" required>
            <select name="Country" required>
                <option value="">Select your country</option>
                <!-- Full country list populated from COUNTRIES array -->
            </select>
            <button type="submit">Subscribe</button>
        </form>

        <p class="privacy-note">We respect your privacy. Unsubscribe anytime.</p>
    </div>
</div>
```

### 4. Form Submission Handling

**Recommended Approach: iframe with postMessage**

Since Pardot form handler returns to "Referring URL" (stays on our page), we use an iframe approach:

```javascript
// Country list for dropdown
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

// Populate country dropdown
function populateCountryDropdown() {
    const select = document.querySelector('#pardotForm select[name="Country"]');
    PARDOT_COUNTRIES.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
    });
}

// Form submission with hidden iframe (no page refresh)
document.getElementById('pardotForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Create hidden iframe for form submission
    const iframe = document.createElement('iframe');
    iframe.name = 'pardot-iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Set form target to iframe
    this.target = 'pardot-iframe';
    this.submit();

    // Assume success after brief delay (Pardot returns to referring URL)
    setTimeout(() => {
        setSubscriber(true);
        hideSubscribeModal();
        showToast('Welcome! All content is now unlocked.');
        document.body.removeChild(iframe);
    }, 2000);
});
```

**Alternative: Direct form POST (simpler but full page refresh)**
```javascript
// Form submits directly to Pardot, Pardot returns to referring URL
// On page load, check if we just subscribed
document.getElementById('pardotForm').addEventListener('submit', function() {
    // Set pending flag before submit
    sessionStorage.setItem('eww_subscribe_pending', 'true');
});

// On page load
if (sessionStorage.getItem('eww_subscribe_pending')) {
    sessionStorage.removeItem('eww_subscribe_pending');
    setSubscriber(true);
    showToast('Welcome! All content is now unlocked.');
}
```

### 5. Tab Click Handler Updates

```javascript
function handleTabClick(tabId) {
    const gatedTabs = ['wisdom', 'examples'];

    if (gatedTabs.includes(tabId) && !isSubscriber()) {
        showGatedOverlay(tabId);
        return;
    }

    // Existing tab switching logic...
    switchToTab(tabId);
}
```

### 6. Localization Updates

Add to each locale JSON:

```json
"ui": {
    // ... existing keys ...
    "gatedTitle": "Unlock Deeper Wisdom",
    "gatedDescription": "Subscribe to access guiding questions, balance tips, and real-life examples for all 32 emotions.",
    "subscribeButton": "Subscribe Free",
    "subscribeModalTitle": "Unlock Full Access",
    "subscribeModalDescription": "Get free access to wisdom insights and real-life examples.",
    "firstNamePlaceholder": "First name",
    "emailPlaceholder": "Email address",
    "countryPlaceholder": "Select your country",
    "privacyNote": "We respect your privacy. Unsubscribe anytime.",
    "subscribeSuccess": "Welcome! All content is now unlocked.",
    "previewTeaser": "Preview:"
}
```

---

## Styling

```css
/* Gated tab button */
.toolbar-btn.gated::after {
    content: '🔒';
    font-size: 0.7em;
    margin-left: 4px;
    opacity: 0.7;
}

/* Gated overlay */
.gated-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    border-radius: 12px;
    margin: 20px;
}

.gated-content .lock-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.gated-content h3 {
    font-size: 1.4em;
    margin-bottom: 12px;
    color: #333;
}

.gated-content p {
    color: #666;
    margin-bottom: 20px;
    max-width: 300px;
}

.subscribe-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 32px;
    font-size: 1.1em;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.subscribe-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.preview-teaser {
    font-style: italic;
    font-size: 0.9em;
    color: #888;
    margin-top: 20px;
}

/* Subscribe modal */
.subscribe-modal {
    max-width: 400px;
    padding: 32px;
}

.subscribe-modal input {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1em;
}

.subscribe-modal button[type="submit"] {
    width: 100%;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 14px;
    font-size: 1.1em;
    border-radius: 6px;
    cursor: pointer;
}

.privacy-note {
    font-size: 0.8em;
    color: #999;
    margin-top: 16px;
}
```

---

## Pardot Configuration (Confirmed)

| Setting | Value |
|---------|-------|
| **Form Handler URL** | `https://eq.6seconds.org/l/446782/2026-02-04/9f5pmx` |
| **Success Location** | Referring URL (stays on wheel page) |
| **Error Location** | Referring URL |
| **Completion Action** | Add to list "Emotion Rules Launch Team" |
| **Required Fields** | `email`, `First Name`, `Country` |
| **Example Form (countries)** | `https://eq.6seconds.org/l/446782/2026-02-04/9f5pmm` |

---

## Testing Checklist

- [ ] Non-subscriber sees lock icons on Wisdom/Examples tabs
- [ ] Clicking gated tab shows overlay with subscribe prompt
- [ ] Subscribe modal opens correctly
- [ ] Form validation works (email required)
- [ ] Form submits to Pardot successfully
- [ ] Success triggers localStorage flag
- [ ] Tabs unlock immediately after subscription
- [ ] Returning visitor has tabs unlocked on page load
- [ ] Clear localStorage resets to gated state (for testing)
- [ ] Works across all 4 languages
- [ ] Mobile-responsive modal and overlay

---

## Future Enhancements

1. **Pardot tracking** - Add Pardot tracking script for analytics
2. **Progressive profiling** - Collect more info over time
3. **Premium tiers** - Different subscription levels
4. **Content personalization** - Show personalized content based on Pardot data
5. **Re-engagement** - Prompt for additional info after X visits

---

## Implementation Order

1. Add subscription state management (localStorage)
2. Update tab click handlers for gating logic
3. Create gated overlay UI component
4. Create subscribe modal with form
5. Add localization strings
6. Style all new components
7. Integrate Pardot form (once URL provided)
8. Test full flow
9. Deploy as v3.2 or v4.0
