(function(window, document) {
    const searchBox = document.getElementById('search-box-keywords'); // The search input element
    const resultBox = document.getElementById('autocomplete');        // The container where autocomplete results are displayed
    let activeIndex = -1;                                             // Tracks the currently highlighted result for keyboard navigation

    let lang, normalizationMap;
    let langInitialized = false;

    function initLangAndNormalization() {
        if (langInitialized) return;
        lang = {};
        normalizationMap = {};
        try {
            const langScript = document.getElementById('topicsearch-lang');
            if (langScript) {
                lang = JSON.parse(langScript.textContent);
                normalizationMap = lang.normalizationMap || {};
                extendNormalizationMapWithUppercase(normalizationMap);
            }
        } catch (e) {
            console.warn('Failed to parse topic search language and normalization map JSON:', e);
        }
        langInitialized = true;
    }

    function isAscii(str) {
        return /^[\x00-\x7F]*$/.test(str);
    }

    /**
     * Highlight query matches within a given text using fuzzy Unicode-aware matching.
     * This handles special cases like character decomposition (accents) and multi-letter mappings
     * (e.g., 'æ' becoming 'ae') so that user queries like "aegir" will still match "Ægir".
     */
    function highlightMatch(text, query) {
        if (!query) return text; // No query? Just return original text, nothing to highlight.

        if (isAscii(text) && isAscii(query)) {
            const lowercaseText = text.toLowerCase();
            const lowercaseQuery = query.toLowerCase();
            let i = 0;
            let out = '';

            while (i < text.length) {
                const idx = lowercaseText.indexOf(lowercaseQuery, i);
                if (idx === -1) {
                    // no more matches – append the rest untouched
                    out += text.slice(i);
                    break;
                }

                // copy segment before the match
                out += text.slice(i, idx);
                // wrap the matched segment
                out += '<mark class="posthilit">' + text.slice(idx, idx + query.length) + '</mark>';
                // move past this match
                i = idx + query.length;
            }
            return out;
        }

        // Use the shared normalization map from backend
        const charMap = normalizationMap;

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

        // Preprocess: normalize text once, store per-char normalized chunks and offset map
        const normChunks = [];
        const normOffsets = [];
        let normText = '';
        let cumulative = 0;

        for (let i = 0; i < text.length; i++) {
            const norm = normalizeChar(text[i]);
            normChunks[i] = norm;
            normText += norm;
            cumulative += norm.length;
            normOffsets[i] = cumulative;
        }

        const normQuery = Array.from(query).map(normalizeChar).join('');

        // Find match spans in normalized string
        const spans = [];
        let pos = 0;
        while ((pos = normText.indexOf(normQuery, pos)) !== -1) {
            spans.push([pos, pos + normQuery.length]); // Store match range
            pos += normQuery.length; // Move past this match
        }

        // If nothing matched, return the original text unmodified
        if (!spans.length) return text;

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
            const normalized = normChunks[i]; // Normalized version of this char (may be > 1 char)
            const spanStart = curNorm;
            const spanEnd = curNorm + normalized.length;
            curNorm = spanEnd; // Advance cursor in normalized space

            let highlightType = null; // null, 'perfect', or 'normalized'

            // Check each match span to see if this character overlaps it
            for (const [mStart, mEnd] of spans) {
                const overlapStart = Math.max(spanStart, mStart);
                const overlapEnd = Math.min(spanEnd, mEnd);

                if (overlapStart < overlapEnd) {
                    for (let ni = overlapStart; ni < overlapEnd; ni++) {
                        const queryIdx = ni - mStart;
                        if (
                            queryIdx >= 0 && queryIdx < query.length
                        ) {
                            if (char === query[queryIdx]) {
                                highlightType = 'perfect';
                                break;
                            } else if (char.toLowerCase() === query[queryIdx].toLowerCase()) {
                                highlightType = 'perfect';
                                break;
                            } else {
                                // It's a normalization match (e.g., 'æ' vs 'ae')
                                highlightType = 'normalized';
                            }
                        }
                    }
                }
                if (highlightType) break;
            }

            if (highlightType === 'perfect') {
                output += `<mark class="posthilit">${char}</mark>`;
            } else if (highlightType === 'normalized') {
                output += `<mark class="posthilit marked-by-normalization">${char}</mark>`;
            } else {
                output += char;
            }
        }

        return output;
    }

    /**
     * Render the autocomplete results into the result box.
     * Each result shows topic title and forum name.
     */
    function renderResults(results, query) {
    	if (!Array.isArray(results)) {
    		console.warn("Unexpected data format from server:", results);
    		return;
    	} // Defensive check
        resultBox.innerHTML = ''; // Clear previous results

        results.forEach((topic, index) => {
            const item = document.createElement('div');
            const rowClass = (index % 2 === 0) ? 'm-row2' : 'm-row1'; // Alternate row styling
            const readClass = topic.unread ? 'unread' : 'read';

            const topicUrl = topic.unread ? `./viewtopic.php?t=${topic.id}&amp;view=unread#unread` : `./viewtopic.php?t=${topic.id}`;
            const forumUrl = `./viewforum.php?f=${topic.forum_id}`;
            const lastPostUrl = `./viewtopic.php?p=${topic.topic_last_post_id}#p${topic.topic_last_post_id}`;

            const topicTooltip = topic.unread ? `${lang.viewNewestPost}` : `${lang.viewTopic}`;
            const jumpToForumSmall = lang.jumpTo + " " + lang.forumSmall;

            item.className = `flex ${rowClass} m-list-all autocomplete-item`;
            item.setAttribute('data-index', index); // For keyboard navigation
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', activeIndex === index ? 'true' : 'false');

            item.innerHTML = `
                <div class="m-list-left" onclick="window.location.href='${topicUrl}'" title="${topicTooltip}">
                    <a href="${topicUrl}" tabindex="-1" class="flex topictitle ${readClass} m-list-left-top">
                        ${highlightMatch(topic.title, query)}
                    </a>
                    <span class="flex meta m-list-left-bottom">
                        <a href="${forumUrl}" class="topic-forumtitle ${readClass}" title="${jumpToForumSmall}">${topic.forum}</a>
                    </span>
                </div>
    			<span class="flex meta m-list-right lastpost" onclick="window.location.href='${lastPostUrl}'" title="${lang.goToLastPost}">
    				<div class="m-list-right-top"><a href="${lastPostUrl}"><i class="fa fa-fast-forward fa-lg"></i></a></div>
    				<div class="m-list-right-bottom"></div>
    			</span>
            `;

            resultBox.appendChild(item);
        });

        resultBox.style.display = results.length > 0 ? 'block' : 'none'; // Show or hide box

        // Announce results to screen readers
        const statusBox = document.getElementById('autocomplete-status');
        if (statusBox) {
            if (results.length === 0) {
                statusBox.textContent = 'No topics found.';
            } else if (results.length === 1) {
                statusBox.textContent = '1 topic found.';
            } else {
                statusBox.textContent = results.length + ' topics found.';
            }
        }
    }

    // Simple in-memory cache using Map to preserve insertion order
    const cache = new Map();
    const maxCacheEntries = 50;

    /**
     * Add a query and its result set to the cache.
     * If full, evict the oldest query to stay within size limit.
     */
    function addToCache(query, results) {
        cache.set(query, results);
        if (cache.size > maxCacheEntries) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey); // Evict the oldest cached query
        }
    }

    /**
     * Fetch results from server or use cache if available.
     * Calls `renderResults` when data is ready.
     */
	let abortController = null;
	let currentVersion = 0; // 🔄 Tracks the latest request version

	function fetchResults(query) {
		// 🔄 Bump version for every new query
		const version = ++currentVersion;

		if (cache.has(query)) {
			renderResults(cache.get(query), query);
			return;
		}

		// 🚫 Abort previous fetch if still ongoing
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();

		const ajaxUrl = (typeof U_TOPICSEARCH_AJAX !== "undefined")
			? U_TOPICSEARCH_AJAX // Use template-provided URL if available
			: 'topicsearch/ajax'; // Default fallback

		fetch(ajaxUrl + '?q=' + encodeURIComponent(query), {
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			},
			signal: abortController.signal, // 🔑 Pass the abort signal
		})
		.then(res => {
			if (!res.ok) throw new Error(`HTTP error ${res.status}`);
			return res.json();
		})
		.then(data => {
			if (!Array.isArray(data)) {
				console.warn("Unexpected search result format", data);
				return;
			}

			// ✅ Only render if this is the latest version
			if (version === currentVersion) {
				addToCache(query, data);
				renderResults(data, query);
			} else {
				console.log(`Ignored out-of-date result for query: ${query}`);
			}
		})
		.catch(err => {
			if (err.name === 'AbortError') {
				console.log('Fetch aborted for query:', query);
			} else {
				console.error("Error fetching search results:", err);
			}
		});
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
            // Initialize lang/normalization only when actually fetching
            initLangAndNormalization();

            const stoperStart = performance.now();
            fetchResults(query);
            const stoperEnd = performance.now();
            console.log(`Execution time of fetching topics list: ${stoperEnd - stoperStart} ms`);
        }, 150); // Wait 150ms after user stops typing
    });

    // After: normalizationMap

    function extendNormalizationMapWithUppercase(map) {
        const normalizationMapUppercaseChars = {};
        for (const [key, value] of Object.entries(map)) {
            // If key is a single lowercase letter with an uppercase variant
            if (key.length === 1 && key !== key.toUpperCase()) {
                const uppercaseKey = key.toUpperCase();
                // Only add if not already present
                if (!(uppercaseKey in map)) {
                    // Capitalize the first letter of the replacement (if it's a letter)
                    let uppercaseValue = value;
                    if (value.length > 0) {
                        uppercaseValue = value[0].toUpperCase() + value.slice(1);
                    }
                    normalizationMapUppercaseChars[uppercaseKey] = uppercaseValue;
                }
            }
        }
        Object.assign(map, normalizationMapUppercaseChars);
    }

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

    document.addEventListener('click', (e) => {
        if (!resultBox.contains(e.target) && e.target !== searchBox) {
            resultBox.style.display = 'none';
        }
    });

    resultBox.setAttribute('role', 'listbox');
    searchBox.setAttribute('aria-controls', resultBox.id);
    searchBox.setAttribute('aria-autocomplete', 'list');

})(window, document);