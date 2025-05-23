(function(window, document) {
	const searchBox = document.getElementById('search-box-keywords');	// The search input element
	const resultBox = document.getElementById('autocomplete');			// The container where autocomplete results are displayed
	let activeIndex = -1;												// Tracks the currently highlighted result for keyboard navigation

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
					out += text.slice(i); // no more matches – append the rest untouched
					break;
				}

				out += text.slice(i, idx); // copy segment before the match
				out += '<mark class="posthilit">' + text.slice(idx, idx + query.length) + '</mark>'; // wrap the matched segment
				i = idx + query.length; // move past this match
			}
			return out;
		}

		// Use the shared normalization map from backend
		const charMap = normalizationMap;
		const charCache = new Map();

		/**
		 * Normalize a single character:
		 * - Apply custom map if present (e.g., 'æ' -> 'ae')
		 * - Use NFD normalization to split accents off base characters
		 * - Remove all combining accent marks
		 * - Convert to lowercase for case-insensitive matching
		 */
		const normalizeChar = ch => {
			if (charCache.has(ch)) {
				return charCache.get(ch);
			}

			const mapped = charMap[ch] || ch;
			const normalized = mapped.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
			charCache.set(ch, normalized);
			return normalized;
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
						if (queryIdx >= 0 && queryIdx < query.length) {
							if (char === query[queryIdx]) {
								highlightType = 'perfect';
								break;
							} else if (char.toLowerCase() === query[queryIdx].toLowerCase()) {
								highlightType = 'perfect';
								break;
							} else {
								highlightType = 'normalized'; // It's a normalization match (e.g., 'æ' vs 'ae')
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
		}

		activeIndex = -1; // Reset active index
		resultBox.innerHTML = ''; // Clear previous results

		const fragment = document.createDocumentFragment(); // Use fragment to minimize DOM reflows

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

			fragment.appendChild(item); // Append to fragment, not DOM
		});

		resultBox.appendChild(fragment); // Append to DOM once

		resultBox.style.display = results.length > 0 ? 'block' : 'none'; // Show or hide box

		// Announce results to screen readers
		const statusBox = document.getElementById('autocomplete-status');
		if (statusBox) {
			statusBox.textContent =
				results.length === 0 ? 'No topics found.'
				: results.length === 1 ? '1 topic found.'
				: results.length + ' topics found.';
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
	let currentVersion = 0; // Tracks the latest request version

	function fetchResults(query) {
		const version = ++currentVersion; // Bump version for every new query
		const startTime = performance.now();

		if (cache.has(query)) {
			if (query.length >= 2) {
				renderResults(cache.get(query), query);
			} else {
				resultBox.style.display = 'none';
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
			if (!res.ok) throw new Error(`HTTP error ${res.status}`);
			return res.json();
		})
		.then(data => {
			if (!Array.isArray(data)) {
				console.warn("Unexpected search result format", data);
				return;
			}

			//  Only render if this is the latest version and check if query is still long enough before rendering:
			if (version === currentVersion && searchBox.value.trim() === query && query.length >= 2) {
				addToCache(query, data);
				renderResults(data, query);
				console.log(`(ajax) Fetch + render: ${performance.now() - startTime} ms`);
			} else {
				console.log(`Ignored stale or invalid result for query: ${query}`);
				if (searchBox.value.trim().length < 2) {
					resultBox.style.display = 'none';
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

		if (debounceTimer) clearTimeout(debounceTimer); // Clear previous timer

		if (query.length < 2) {
			resultBox.style.display = 'none';
			return;
		}

		debounceTimer = setTimeout(() => {
			initLangAndNormalization();
			fetchResults(query);
		}, 150); // Wait 150ms after user stops typing
	});

	// After: normalizationMap

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