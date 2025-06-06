(function(window, document) {
	"use strict";

	const DEBOUNCE_DELAY_MS = 150;
	const MIN_QUERY_LENGTH = 2;
	const MAX_CACHE_ENTRIES = 50;

	const searchBox = document.getElementById('search-box-keywords');	// The search input element
	const resultBox = document.getElementById('autocomplete');			// The container where autocomplete results are displayed
	let activeIndex = -1;												// Tracks the currently highlighted result for keyboard navigation

	if (!searchBox || !resultBox) { return; }

	// Set ARIA attributes for accessibility
	searchBox.setAttribute('aria-controls', resultBox.id);
	searchBox.setAttribute('aria-autocomplete', 'list');
	searchBox.setAttribute('aria-expanded', 'false');

	let lang, normalizationMap;
	let langInitialized = false;

	/**
	 * Initialize language and normalization map from the script tag.
	 * This is called once when the script loads to avoid repeated parsing.
	 * It sets up the `lang` object and `normalizationMap` for character normalization.
	 * The normalization map is used to handle special character mappings (e.g., 'æ' -> 'ae').
	 * It also extends the map with uppercase versions of single lowercase characters
	 * to ensure case-insensitive matching works correctly.
	 */

	function initLangAndNormalization() {
		if (langInitialized) { return; } // Already initialized

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

	/**
	 * Extends shared normalization map with uppercase versions of single lowercase characters.
	 * This allows matching uppercase characters in user queries against lowercase text.
	 * For example, if 'a' maps to 'ae', it will also add 'A' -> 'Ae'.
	 * This is useful for case-insensitive matching of characters that have special mappings.
	 */

	function extendNormalizationMapWithUppercase(map) {
		for (const [key, value] of Object.entries(map)) {
			// Only single lowercase keys without uppercase counterpart
			if (key.length === 1 && key !== key.toUpperCase()) {
				const uppercaseKey = key.toUpperCase();
				// Only add if not already present
				if (!(uppercaseKey in map)) {
					// Capitalize the first letter of the replacement string
					const uppercaseValue = value.length > 0
						? value[0].toUpperCase() + value.slice(1)
						: value;
					map[uppercaseKey] = uppercaseValue;
				}
			}
		}
	}

	/**
	 * Normalize a single character:
	 * - Apply custom map if present (e.g., 'æ' -> 'ae')
	 * - Use NFD normalization to split accents off base characters
	 * - Remove all combining accent marks with regex replace
	 * - Convert to lowercase for case-insensitive matching
	 */
	const charCache = new Map();

	function normalizeChar(ch) {
		if (charCache.has(ch)) { return charCache.get(ch); }

		const mapped = normalizationMap[ch] || ch;
		const normalized = mapped.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
		charCache.set(ch, normalized);

		return normalized;
	}

	/**
	 * Check if a string contains only ASCII characters.
	 */
	
	function isAscii(str) {
		return /^[\x00-\x7F]*$/.test(str);
	}

	/**
	 * Build a mapping from each position in the normalized query string
	 * to the index of the original query character that produced it.
	 * This should be called once per query and passed to highlightMatch.
	 */
	function buildNormalizedQueryOffsetMap(query) {
		const normalizedQueryPositionToQueryIndex = [];
		let normalizedQueryPosition = 0;
		for (let i = 0; i < query.length; i++) {
			const normalizedCharTmp = normalizeChar(query[i]);
			for (let j = 0; j < normalizedCharTmp.length; j++) {
				normalizedQueryPositionToQueryIndex[normalizedQueryPosition++] = i;
			}
		}
		return normalizedQueryPositionToQueryIndex;
	}

	/**
	 * Highlight query matches within a given text using fuzzy Unicode-aware matching.
	 * Accepts a precomputed normalizedQuery and normalizedQueryOffsetMap for efficiency.
	 */
	function highlightMatch(text, query, normalizedQuery, normalizedQueryOffsetMap) {
		if (!query) { return text; } // No query? Just return original text, nothing to highlight.

		let highlightedText = '';

		if (isAscii(text) && isAscii(query)) {
			const lowercaseText = text.toLowerCase();
			const lowercaseQuery = query.toLowerCase();
			let start = 0;

			while (start < text.length) {
				const index = lowercaseText.indexOf(lowercaseQuery, start);
				if (index === -1) {
					highlightedText += text.slice(start); // no more matches – append the rest untouched
					break;
				}

				highlightedText += text.slice(start, index); // copy segment before the match
				highlightedText += '<mark class="posthilit">' + text.slice(index, index + query.length) + '</mark>'; // wrap the matched segment
				start = index + query.length; // move past this match
			}
			return highlightedText;
		}

		const normalizedChars = []; // Normalized string per original char
		let normalizedText = '';

		for (let i = 0; i < text.length; i++) {
			const normalizedCharTmp = normalizeChar(text[i]);
			normalizedChars[i] = normalizedCharTmp;
			normalizedText += normalizedCharTmp;
		}

		// Identify match spans in normalizedText
		const matchSpans = [];
		let position = 0;
		while ((position = normalizedText.indexOf(normalizedQuery, position)) !== -1) {
			matchSpans.push([position, position + normalizedQuery.length]); // Store match range
			position += normalizedQuery.length; // Move past this match
		}

		// If nothing matched, return the original text unmodified
		if (!matchSpans.length) { return text; }

		/**
		 * Iterate over the original text and highlight matches.
		 * For each character in the original text, we check if it overlaps with any match spans.
		 * If it does, we determine if it's an exact match or a normalization match.
		 * We then wrap the matched characters in <mark> tags for highlighting.
		 * This allows us to handle both exact matches and normalization matches (e.g., 'æ' vs 'ae').
		 */
		let normalizedTextOffset = 0;

		for (let i = 0; i < text.length; i++) {
			const originalChar = text[i];
			const spanStart = normalizedTextOffset;
			const spanEnd = normalizedTextOffset + normalizedChars[i].length; // normalizedChars[i] is a normalized version of this char (may be > 1 char)
			normalizedTextOffset = spanEnd; // Advance cursor in normalized space

			let highlightType = null; // null, 'exact', or 'normalized'

			for (const [matchStart, matchEnd] of matchSpans) {
				const overlapStart = Math.max(spanStart, matchStart);
				const overlapEnd = Math.min(spanEnd, matchEnd);

				for (let normalizedTextPosition = overlapStart; normalizedTextPosition < overlapEnd; normalizedTextPosition++) {
					const normalizedQueryPosition = normalizedTextPosition - matchStart;
					const queryIndex = normalizedQueryOffsetMap[normalizedQueryPosition];
					if (
						(queryIndex >= 0 && queryIndex < query.length) &&
						(originalChar === query[queryIndex] || originalChar.toLowerCase() === query[queryIndex].toLowerCase())
					) {
						highlightType = 'exact';
						break;
					} else {
						highlightType = 'normalized'; // It's a normalization match (e.g., 'æ' vs 'ae')
					}
				}
				if (highlightType) { break; }
			}

			if (highlightType === 'exact') {
				highlightedText += `<mark class="posthilit">${originalChar}</mark>`;
			} else if (highlightType === 'normalized') {
				highlightedText += `<mark class="posthilit marked-by-normalization">${originalChar}</mark>`;
			} else {
				highlightedText += originalChar;
			}
		}

		return highlightedText;
	}

	/**
	 * Render the autocomplete results into the result box.
	 * Each result shows topic title and forum name.
	 * This function is called after fetching results from the server or using cached data.
	 * It handles the following:
	 * - Resets the active index for keyboard navigation
	 * - Clears previous results
	 * - Creates a document fragment to minimize DOM reflows
	 * - Iterates over the results, creating a new item for each topic
	 * - Applies alternating row styles for better readability
	 * - Highlights matches in topic titles using the `highlightMatch` function
	 * - Sets up click handlers for navigating to topic and forum pages
	 * - Updates the result box visibility based on the number of results
	 * - Announces the number of results to screen readers
	 */
	function renderResults(results, query) {
		if (!Array.isArray(results)) {
			console.warn("Unexpected data format from server:", results);
			return;
		}

		resetActiveIndex();
		resultBox.innerHTML = ''; // Clear previous results

		const fragment = document.createDocumentFragment(); // Use fragment to minimize DOM reflows
		const normalizedQuery = Array.from(query).map(normalizeChar).join('');
		const normalizedQueryOffsetMap = buildNormalizedQueryOffsetMap(query);

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

			item.id = `autocomplete-item-${index}`;
			item.setAttribute('role', 'option');
			item.setAttribute('aria-selected', activeIndex === index ? 'true' : 'false');
			item.setAttribute('data-index', index); // For keyboard navigation

			item.innerHTML = `
				<div class="m-list-left" onclick="window.location.href='${topicUrl}'" title="${topicTooltip}">
					<a href="${topicUrl}" tabindex="-1" class="flex topictitle ${readClass} m-list-left-top">
						${highlightMatch(topic.title, query, normalizedQuery, normalizedQueryOffsetMap)}
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

			fragment.appendChild(item); // Append to fragment, not DOM
		});

		resultBox.appendChild(fragment); // Append to DOM once

		resultBox.style.display = results.length > 0 ? 'block' : 'none'; // Show or hide box
		searchBox.setAttribute('aria-expanded', results.length > 0 ? 'true' : 'false');

		// Announce results to screen readers
		const statusBox = document.getElementById('autocomplete-status');
		if (statusBox) {
			const topTitle = results[0]?.title ?? '';
			statusBox.textContent =
				results.length === 0 ? 'No topics found.'
				: results.length === 1 ? `1 topic found: ${topTitle}. Use arrow keys to navigate.`
				: `${results.length} topics found. Use arrow keys to navigate. Top result: ${topTitle}.`;
		}
	}

	// Simple in-memory cache using Map to preserve insertion order
	const cache = new Map();

	/**
	 * Add a query and its result set to the cache.
	 * If the cache exceeds the maximum size, evict the oldest entry.
	 * This keeps the cache size manageable and ensures we don't use too much memory.
	 */
	function addToCache(query, results) {
		cache.set(query, results);
		if (cache.size > MAX_CACHE_ENTRIES) {
			const firstKey = cache.keys().next().value;
			cache.delete(firstKey); // Evict the oldest cached query
		}
	}

	/**
	 * Fetch results from the server or use cache if available.
	 * This function is responsible for:
	 * - Checking if the query is already cached
	 * - If cached, rendering results immediately
	 * - If not cached, making an AJAX request to fetch results
	 * - Handling aborts for previous requests
	 */
	let abortController = null;
	let currentVersion = 0; // Tracks the latest request version

	function fetchResults(query) {
		const version = ++currentVersion; // Bump version for every new query
		const startTime = performance.now();

		if (cache.has(query)) {
			if (query.length >= MIN_QUERY_LENGTH) {
				renderResults(cache.get(query), query);
			} else {
				hideResultsBox();
			}
			console.log(`(cached) Fetch + render: ${performance.now() - startTime} ms`);
			return;
		}

		if (abortController) {
			abortController.abort(); // Abort previous fetch if still ongoing
		}

		abortController = new AbortController();

		const ajaxUrl = (typeof U_TOPICSEARCH_AJAX !== "undefined") ? U_TOPICSEARCH_AJAX : 'topicsearch/ajax';

		fetch(ajaxUrl + '?q=' + encodeURIComponent(query), {
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			},
			signal: abortController.signal, // Pass the abort signal
		})
		.then(res => {
			if (!res.ok) { throw new Error(`HTTP error ${res.status}`); }
			return res.json();
		})
		.then(data => {
			if (!Array.isArray(data)) {
				console.warn("Unexpected search result format", data);
				return;
			}

			//  Only render if this is the latest version and check if query is still long enough before rendering:
			if (version === currentVersion && searchBox.value.trim() === query && query.length >= MIN_QUERY_LENGTH) {
				addToCache(query, data);
				renderResults(data, query);
				console.log(`(ajax) Fetch + render: ${performance.now() - startTime} ms`);
			} else {
				console.log(`Ignored stale or invalid result for query: ${query}`);
				if (searchBox.value.trim().length < MIN_QUERY_LENGTH) {
					hideResultsBox();
				}
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

	/**
	 * Event handler: triggers when user types in the search box.
	 * Debounces the input and fetches results if query is long enough.
	 */
	let debounceTimer = null; // Debounce timer ID used to delay fetch calls during fast typing

	searchBox.addEventListener('input', function () {
		const query = this.value.trim();

		if (debounceTimer) { clearTimeout(debounceTimer); } // Clear previous timer

		if (query.length < MIN_QUERY_LENGTH) {
			hideResultsBox();
			return;
		}

		debounceTimer = setTimeout(() => {
			initLangAndNormalization();
			fetchResults(query);
		}, DEBOUNCE_DELAY_MS); // Wait DEBOUNCE_DELAY_MS after user stops typing
	});

	/**
	 * Keyboard navigation handler:
	 * - ArrowDown/ArrowUp: Navigate through results
	 * - Enter: Select the currently highlighted result
	 * - Escape: Clear the search box and hide results
	 * - Reset active index when input changes or search box is clicked
	 */
	searchBox.addEventListener('keydown', function (e) {
		const items = resultBox.querySelectorAll('.autocomplete-item');
		if (!items.length) { return; }

		if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && resultBox.style.display !== 'none') {
			e.preventDefault();
			activeIndex = (e.key === 'ArrowDown')
				? (activeIndex + 1) % items.length
				: (activeIndex - 1 + items.length) % items.length;
			updateActive(items);
		} else if (e.key === 'Enter' && activeIndex >= 0) {
			e.preventDefault();
			if (items[activeIndex]) {
				const link = items[activeIndex].querySelector('a');
				if (link) { window.location.href = link.href; }
			}
		} else if (e.key === 'Escape') {
				searchBox.value = '';
				hideResultsBox();
				resetActiveIndex();
				if (debounceTimer) {
					clearTimeout(debounceTimer);
				}
		}
	});

	/**
	 * Update active item:
	 * - Highlights the currently active result item
	 * - Scrolls it into view if necessary
	 * - Sets aria-selected attribute for accessibility
	 * - Updates aria-activedescendant attribute on the search box
	 * This function is called whenever the active index changes due to keyboard navigation.
	 * It ensures that the user can see which result is currently selected,
	 * and it provides a smooth user experience by scrolling the active item into view.
	 * It also updates ARIA attributes to improve accessibility for screen readers.
	 */
	function updateActive(items) {
		items.forEach((item, index) => {
			item.classList.remove('active');
			item.setAttribute('aria-selected', 'false');
		});
		if (activeIndex >= 0 && items[activeIndex]) {
			const activeItem = items[activeIndex];
			activeItem.classList.add('active');
			activeItem.setAttribute('aria-selected', 'true');
			activeItem.scrollIntoView({ block: 'nearest' });

			searchBox.setAttribute('aria-activedescendant', activeItem.id);
		} else {
			searchBox.removeAttribute('aria-activedescendant');
		}
	}

	/**
	 * Reset active index when input changes or search box is clicked.
	 * This clears the 'active' class and aria-selected attributes from all items.
	 * It ensures that the autocomplete results are in a clean state when the user starts typing again.
	 * This is important for accessibility and user experience, as it prevents stale state from previous searches.
	 */
	function resetActiveIndex() {
		const activeItems = resultBox.querySelectorAll('.autocomplete-item.active, .autocomplete-item[aria-selected="true"]');
		activeItems.forEach(item => {
			item.classList.remove('active');
			item.setAttribute('aria-selected', 'false');
		});
		activeIndex = -1;
		searchBox.removeAttribute('aria-activedescendant');
	}

	searchBox.addEventListener('input', resetActiveIndex);
	searchBox.addEventListener('click', resetActiveIndex);

	/**
	 * Click handler: hides the result box if clicked outside of it or the search box.
	 * This is important for user experience, as it allows users to dismiss the results easily.
	 * It also ensures that the results box does not remain open when the user clicks elsewhere on the page.
	 */
	document.addEventListener('click', (e) => {
		if (!resultBox.contains(e.target) && e.target !== searchBox) {
			hideResultsBox();
			if (debounceTimer) { clearTimeout(debounceTimer); }
		}
	});

	/**
	 * Hide results box:
	 * - Sets display to 'none' to hide the results box
	 * - Updates ARIA attributes to indicate the box is closed
	 * This function is called when the user clears the search box or clicks outside the results box.
	 */
	function hideResultsBox() {
		resultBox.style.display = 'none';
		searchBox.setAttribute('aria-expanded', 'false');
	}

})(window, document);