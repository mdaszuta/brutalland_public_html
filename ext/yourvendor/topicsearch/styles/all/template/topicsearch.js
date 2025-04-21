// DOM Elements
const searchBox = document.getElementById('search-box-keywords');
const resultBox = document.getElementById('autocomplete');
let activeIndex = -1;

/**
 * Highlight query matches within a given text, using fuzzy Unicode-aware matching.
 * Handles multi-character mappings (e.g., 'æ' -> 'ae') and accent stripping.
 */
function highlightMatch(text, query) {
    if (!query) return text;

    // Custom character normalization map (lowercase only)
    const charMap = {
		// Lowercase
		'ß': 'ss', 'þ': 'th', 'ƿ': 'w', 'ð': 'd', 'ø': 'o',
		'æ': 'ae', 'œ': 'oe', 'ł': 'l', 'ı': 'i',
		'§': 's', 'µ': 'u', '¡': '!', '¿': '?',
	
		// Uppercase
		'Þ': 'Th', 'Ƿ': 'W', 'Ð': 'D', 'Ø': 'O',
		'Æ': 'Ae', 'Œ': 'Oe', 'Ł': 'L', 'İ': 'I',
		'§': 'S', 'Μ': 'U'
	};

    // Normalize character: apply charMap, strip accents, lowercase
    const normalizeChar = ch => {
        const mapped = charMap[ch] || ch;
        return mapped.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    // Normalize entire text and query
    const normText  = Array.from(text).map(normalizeChar).join('');
    const normQuery = Array.from(query).map(normalizeChar).join('');

    // Find all matching spans in the normalized text
    const spans = [];
    let pos = 0;
    while ((pos = normText.indexOf(normQuery, pos)) !== -1) {
        spans.push([pos, pos + normQuery.length]);
        pos += normQuery.length;
    }

    if (!spans.length) return text;

    // Precompute cumulative lengths of normalized characters at each original index
    const normOffsets = [];
    let cumulative = 0;
    for (let i = 0; i < text.length; i++) {
        cumulative += normalizeChar(text[i]).length;
        normOffsets[i] = cumulative;
    }

    // Map a normalized index back to the original character index
    const origIndex = normIdx => {
        for (let i = 0; i < normOffsets.length; i++) {
            if (normOffsets[i] > normIdx) return i;
        }
        return text.length;
    };

    // Build the final highlighted output
    let output = '';
    let curNorm = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const normalized = normalizeChar(char);
        const spanStart = curNorm;
        const spanEnd = curNorm + normalized.length;
        curNorm = spanEnd;

        // Determine if current character falls within a match span
        let shouldHighlight = false;
        for (const [mStart, mEnd] of spans) {
            const overlapStart = Math.max(spanStart, mStart);
            const overlapEnd   = Math.min(spanEnd, mEnd);
            if (overlapStart < overlapEnd) {
                for (let ni = overlapStart; ni < overlapEnd; ni++) {
                    const queryIdx = ni - mStart;
                    if (
                        queryIdx >= 0 && queryIdx < query.length &&
                        char.toLowerCase() === query[queryIdx].toLowerCase()
                    ) {
                        shouldHighlight = true;
                        break;
                    }
                }
            }
            if (shouldHighlight) break;
        }

        output += shouldHighlight ? `<mark class="marked-fully">${char}</mark>` : char;
    }

    return output;
}

/**
 * Render the autocomplete results into the result box.
 * Highlights query matches within each topic title.
 */
function renderResults(results, query) {
    resultBox.innerHTML = '';

    results.forEach((topic, index) => {
        const item = document.createElement('div');
        const rowClass = (index % 2 === 0) ? 'm-row2' : 'm-row1';

        item.className = `flex ${rowClass} m-list-all autocomplete-item`;
        item.setAttribute('data-index', index);

        item.innerHTML = `
            <div class="m-list-left" onclick="window.location.href='viewtopic.php?t=${topic.id}'">
                <a href="viewtopic.php?t=${topic.id}" tabindex="-1" class="flex topictitle m-list-left-top">
                    ${highlightMatch(topic.title, query)}
                </a>
                <span class="flex meta m-list-left-bottom">
                    <a href="viewforum.php?f=${topic.forum_id}" class="topic-forumtitle">${topic.forum}</a>
                </span>
            </div>
        `;

        resultBox.appendChild(item);
    });

    resultBox.style.display = results.length > 0 ? 'block' : 'none';
}

// Simple cache for storing recent queries
const cache = {};
const maxCacheEntries = 50;

/**
 * Add a result set to the cache, evicting the oldest if needed.
 */
function addToCache(query, results) {
    if (Object.keys(cache).length >= maxCacheEntries) {
        delete cache[Object.keys(cache)[0]]; // Remove oldest
    }
    cache[query] = results;
}

/**
 * Fetch search results via AJAX or serve from cache.
 */
function fetchResults(query) {
    if (cache[query]) {
        renderResults(cache[query], query);
        return;
    }

    const ajaxUrl = (typeof U_TOPICSEARCH_AJAX !== "undefined")
        ? U_TOPICSEARCH_AJAX
        : 'topicsearch/ajax';

    fetch(ajaxUrl + '?q=' + encodeURIComponent(query))
        .then(res => res.json())
        .then(data => {
            addToCache(query, data);
            renderResults(data, query);
        })
        .catch(err => console.error('Search error:', err));
}

// Debounce timer to reduce request spam
let debounceTimer = null;

/**
 * Event: on user input in the search box
 */
searchBox.addEventListener('input', function () {
    const query = this.value.trim();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (query.length < 2) {
        resultBox.style.display = 'none';
        return;
    }

    debounceTimer = setTimeout(() => {
        fetchResults(query);
    }, 150); // 150ms debounce delay
});

// Optional: Keyboard navigation support for result list
/*
searchBox.addEventListener('keydown', function (e) {
    const items = resultBox.querySelectorAll('.autocomplete-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateActive(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateActive(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
            const link = items[activeIndex].querySelector('a');
            if (link) window.location.href = link.href;
        }
    } else if (e.key === 'Escape') {
        resultBox.style.display = 'none';
    }
});
*/

/**
 * Highlight the active result item
 */
/*
function updateActive(items) {
    items.forEach(item => item.classList.remove('active'));
    if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
}
*/
// Optional: Hide results when clicking outside
/*
document.addEventListener('click', (e) => {
    if (!resultBox.contains(e.target) && e.target !== searchBox) {
        resultBox.style.display = 'none';
    }
});
*/