const searchBox = document.getElementById('search-box-keywords');
const resultBox = document.getElementById('autocomplete');
let activeIndex = -1;

function highlightMatch(text, query) {
    const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return text.replace(regex, '<mark>$1</mark>');
}

function renderResults(results, query) {
    resultBox.innerHTML = '';
    results.forEach((topic, index) => {
        const item = document.createElement('div');
		const rowClass = (index % 2 === 0) ? 'm-row2' : 'm-row1';
        item.className = `flex ${rowClass} m-list-all autocomplete-item`;
        item.setAttribute('data-index', index);
		// Note: Use backticks for template literals.
        item.innerHTML = `
			<div class="m-list-left" onclick="window.location.href='viewtopic.php?t=${topic.id}'">
				<a href="viewtopic.php?t=${topic.id}" tabindex="-1" class="flex topictitle m-list-left-top">
					${highlightMatch(topic.title, query)}
				</a>
				<span class="flex meta m-list-left-bottom"><a href="viewforum.php?f=${topic.forum_id}" class="topic-forumtitle">${topic.forum}</a></span>
			</div>
        `;
        resultBox.appendChild(item);
    });
    resultBox.style.display = results.length > 0 ? 'block' : 'none';
}

const cache = {};
const maxCacheEntries = 50;

function addToCache(query, results) {
    if (Object.keys(cache).length >= maxCacheEntries) {
        delete cache[Object.keys(cache)[0]]; // Delete oldest
    }
    cache[query] = results;
}

function fetchResults(query) {
    // Use cached result if available
    if (cache[query]) {
        renderResults(cache[query], query);
        return;
    }

    // Use the URL injected by the PHP extension
    const ajaxUrl = (typeof U_TOPICSEARCH_AJAX !== "undefined") ? U_TOPICSEARCH_AJAX : 'topicsearch/ajax';

    fetch(ajaxUrl + '?q=' + encodeURIComponent(query))
        .then(res => res.json())
        .then(data => {
            addToCache(query, data); // Store in cache
            renderResults(data, query);
        })
        .catch(err => {
            console.error('Search error:', err);
        });
}

let debounceTimer = null;

searchBox.addEventListener('input', function () {
    const query = this.value.trim();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (query.length < 2) {
        resultBox.style.display = 'none';
        return;
    }

    debounceTimer = setTimeout(() => {
        fetchResults(query);
    }, 150); // 150ms delay
});
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

function updateActive(items) {
    items.forEach(item => item.classList.remove('active'));
    if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
}

document.addEventListener('click', (e) => {
    if (!resultBox.contains(e.target) && e.target !== searchBox) {
        resultBox.style.display = 'none';
    }
});

*/