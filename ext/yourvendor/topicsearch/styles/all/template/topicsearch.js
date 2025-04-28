// DOM Elements
const searchBox = document.getElementById('search-box-keywords'); // The search input element
const resultBox = document.getElementById('autocomplete');        // The container where autocomplete results are displayed
let activeIndex = -1;                                             // Tracks the currently highlighted result for keyboard navigation

/**
 * Highlight query matches within a given text using fuzzy Unicode-aware matching.
 * This handles special cases like character decomposition (accents) and multi-letter mappings
 * (e.g., 'æ' becoming 'ae') so that user queries like "aegir" will still match "Ægir".
 */
function highlightMatch(text, query) {
    if (!query) return text; // No query? Just return original text, nothing to highlight.

    // Custom character normalization map to handle special characters and ligatures
    const charMap = {
        // Lowercase equivalents
        'ß': 'ss', 'þ': 'th', 'ƿ': 'w', 'ð': 'd', 'ø': 'o',
        'æ': 'ae', 'œ': 'oe', 'ł': 'l', 'ı': 'i',
        '§': 's', 'µ': 'u', '¡': '!', '¿': '?',

        // Uppercase equivalents
        'Þ': 'Th', 'Ƿ': 'W', 'Ð': 'D', 'Ø': 'O',
        'Æ': 'Ae', 'Œ': 'Oe', 'Ł': 'L', 'İ': 'I',
        '§': 'S', 'Μ': 'U'
    };

    /**
     * Normalize a single character:
     * - Apply custom map if present (e.g., 'æ' -> 'ae')
     * - Use NFD normalization to split accents off base characters
     * - Remove all combining accent marks
     * - Convert to lowercase for case-insensitive matching
     */
    const normalizeChar = ch => {
        const mapped = charMap[ch] || ch;
        return mapped.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    // Normalize the entire input text and the query
    const normText  = Array.from(text).map(normalizeChar).join('');
    const normQuery = Array.from(query).map(normalizeChar).join('');

    // Find all matching spans (start and end indexes) of the normalized query in the normalized text
    const spans = [];
    let pos = 0;
    while ((pos = normText.indexOf(normQuery, pos)) !== -1) {
        spans.push([pos, pos + normQuery.length]); // Store match range
        pos += normQuery.length; // Move past this match
    }

    // If nothing matched, return the original text unmodified
    if (!spans.length) return text;

    /**
     * We now need to map character positions from the normalized version back to the original.
     * Because characters like 'æ' become two characters ('ae') in the normalized form, we
     * build an offset map to help track how far each character expands.
     */
    const normOffsets = []; // Array of cumulative normalized character lengths
    let cumulative = 0;
    for (let i = 0; i < text.length; i++) {
        cumulative += normalizeChar(text[i]).length; // Count characters added by normalization
        normOffsets[i] = cumulative;
    }

    /**
     * Helper: Convert an index in normalized text to an index in the original string.
     * This allows us to know which character in the original text corresponds to a position
     * in the normalized string where a match was found.
     */
    const origIndex = normIdx => {
        for (let i = 0; i < normOffsets.length; i++) {
            if (normOffsets[i] > normIdx) return i;
        }
        return text.length;
    };

    /**
     * Final rendering: go through the original text and check if each character
     * overlaps a matching normalized span.
     */
    let output = '';
    let curNorm = 0; // Position in normalized text

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const normalized = normalizeChar(char); // Normalized version of this char (may be > 1 char)
        const spanStart = curNorm;
        const spanEnd = curNorm + normalized.length;
        curNorm = spanEnd; // Advance cursor in normalized space

        let shouldHighlight = false;

        // Check each match span to see if this character overlaps it
        for (const [mStart, mEnd] of spans) {
            const overlapStart = Math.max(spanStart, mStart);
            const overlapEnd   = Math.min(spanEnd, mEnd);

            if (overlapStart < overlapEnd) {
                // Within a match span: double-check that the original char roughly aligns with query char
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

        // Wrap matched character in <mark>, else just append raw char
        output += shouldHighlight ? `<mark class="marked-fully">${char}</mark>` : char;
    }

    return output;
}

/**
 * Render the autocomplete results into the result box.
 * Each result shows topic title and forum name.
 */
function renderResults(results, query) {
    resultBox.innerHTML = ''; // Clear previous results

    results.forEach((topic, index) => {
        const item = document.createElement('div');
        const rowClass = (index % 2 === 0) ? 'm-row2' : 'm-row1'; // Alternate row styling
        const readClass = topic.unread ? 'unread' : 'read';
        const topicUrl = topic.unread ? `viewtopic.php?t=${topic.id}&amp;view=unread#unread` : `viewtopic.php?t=${topic.id}`;

        item.className = `flex ${rowClass} m-list-all autocomplete-item`;
        item.setAttribute('data-index', index); // For keyboard navigation

        item.innerHTML = `
            <div class="m-list-left" onclick="window.location.href='${topicUrl}'">
                <a href="${topicUrl}" tabindex="-1" class="flex topictitle ${readClass} m-list-left-top">
                    ${highlightMatch(topic.title, query)}
                </a>
                <span class="flex meta m-list-left-bottom">
                    <a href="viewforum.php?f=${topic.forum_id}" class="topic-forumtitle ${readClass}">${topic.forum}</a>
                </span>
            </div>
			<span class="flex meta m-list-right lastpost" onclick="window.location.href='viewtopic.php?p=${topic.topic_last_post_id}#p${topic.topic_last_post_id}'" title="{L_GOTO_LAST_POST}">
				<div class="m-list-right-top"><a href="viewtopic.php?p=${topic.topic_last_post_id}#p${topic.topic_last_post_id}"><i class="fa fa-fast-forward fa-lg"></i></a></div>
				<div class="m-list-right-bottom"></div>
			</span>
        `;

        resultBox.appendChild(item);
    });

    resultBox.style.display = results.length > 0 ? 'block' : 'none'; // Show or hide box
}

// Simple in-memory cache for previously fetched query results
const cache = {};
const maxCacheEntries = 50;

/**
 * Add a query and its result set to the cache.
 * If full, evict the oldest query to stay within size limit.
 */
function addToCache(query, results) {
    if (Object.keys(cache).length >= maxCacheEntries) {
        delete cache[Object.keys(cache)[0]]; // Remove the oldest cached query
    }
    cache[query] = results;
}

/**
 * Fetch results from server or use cache if available.
 * Calls `renderResults` when data is ready.
 */
function fetchResults(query) {
    if (cache[query]) {
        renderResults(cache[query], query);
        return;
    }

    const ajaxUrl = (typeof U_TOPICSEARCH_AJAX !== "undefined")
        ? U_TOPICSEARCH_AJAX // Use template-provided URL if available
        : 'topicsearch/ajax'; // Default fallback

    fetch(ajaxUrl + '?q=' + encodeURIComponent(query))
        .then(res => res.json())
        .then(data => {
            addToCache(query, data);
            renderResults(data, query);
        })
        .catch(err => console.error('Search error:', err));
}

// Debounce timer ID used to delay fetch calls during fast typing
let debounceTimer = null;

/**
 * Event handler: triggers when user types in the search box.
 * Debounces the input and fetches results if query is long enough.
 */
searchBox.addEventListener('input', function () {
    const query = this.value.trim();

    if (debounceTimer) clearTimeout(debounceTimer); // Clear previous timer

    if (query.length < 2) {
        resultBox.style.display = 'none'; // Too short: hide results
        return;
    }

    debounceTimer = setTimeout(() => {
        fetchResults(query);
    }, 150); // Wait 150ms after user stops typing
});

// ------------------------
// OPTIONAL: Keyboard Navigation
// ------------------------
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
 * Highlight the currently active result item.
 * Scrolls it into view.
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

// ------------------------
// OPTIONAL: Hide results when clicking outside
// ------------------------
/*
document.addEventListener('click', (e) => {
    if (!resultBox.contains(e.target) && e.target !== searchBox) {
        resultBox.style.display = 'none';
    }
});
*/