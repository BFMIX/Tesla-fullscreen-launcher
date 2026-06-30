/* ==========================================================================
   Tesla Fullscreen Launcher - High-Fidelity Application Logic
   Matches the 6 UI views, dialog overlays, and redirection screen transitions
   ========================================================================== */

// Favicon fetch cache to avoid repeated requests for the same URL during a session
const faviconFetchCache = new Set();

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 0. Design System Assets (SVGs)
    // ==========================================================================
    const BRAND_ICONS = {
        youtube: {
            bgClass: 'red-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M23.5 12.4c0 0-.2-1.7-.9-2.5-.9-1-1.9-1-2.4-1.1-3.5-.2-8.7-.2-8.7-.2s-5.2 0-8.7.2c-.5 0-1.5.1-2.4 1.1-.7.8-.9 2.5-.9 2.5S-.1 14.1-.1 15.8v1.6c0 1.7.2 3.4.2 3.4s.2 1.7.9 2.5c.9 1 2.1 1 2.6 1.1 3.5.3 8.7.3 8.7.3s5.2 0 8.7-.3c.5 0 1.5-.1 2.4-1.1.7-.8.9-2.5.9-2.5s.2-1.7.2-3.4v-1.6c.1-1.7-.1-3.4-.1-3.4zM9.5 19.3V12.1l6.9 3.6-6.9 3.6z"/></svg>`
        },
        twitch: {
            bgClass: 'purple-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`
        },
        plex: {
            bgClass: 'gold-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#e5a93b" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5V13h2.5L12 9.5 8.5 13H11v3.5H9v1.5h6v-1.5h-2z"/></svg>`
        },
        netflix: {
            bgClass: 'netflix-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#e50914" d="M5.5 2h3.5l6 14.5V2H18.5v20h-3.5L9 7.5V22H5.5V2z"/></svg>`
        },
        disney: {
            bgClass: 'disney-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.92 12.82c-.17.31-.41.59-.72.84-.53.42-1.2.63-2.02.63-.56 0-1.07-.1-1.54-.31-.44-.2-.8-.47-1.09-.81-.29-.34-.49-.72-.61-1.14l1.24-.49c.17.49.46.88.85 1.16.39.28.84.42 1.35.42.49 0 .89-.12 1.2-.37.31-.25.46-.57.46-.97 0-.31-.1-.58-.3-.8-.2-.22-.52-.42-.96-.6l-.86-.34c-.75-.3-1.3-.64-1.66-1.01s-.54-.86-.54-1.48c0-.52.14-.98.42-1.38.28-.4.67-.71 1.17-.93.5-.22 1.07-.33 1.7-.33.69 0 1.3.14 1.83.42s.91.68 1.15 1.19l-1.21.54c-.17-.38-.42-.67-.75-.87s-.71-.3-1.12-.3c-.41 0-.74.1-1 .31-.26.21-.39.49-.39.84 0 .28.1.51.31.69.21.18.57.36 1.08.56l.77.3c.78.31 1.37.67 1.76 1.09.39.42.59.94.59 1.57 0 .52-.14.99-.42 1.41z"/></svg>`
        },
        iptv: {
            bgClass: 'iptv-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7l7 4z"/></svg>`
        },
        globe: {
            bgClass: 'dark-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
        },
        star: {
            bgClass: 'dark-bg',
            svg: `<svg viewBox="0 0 24 24"><path fill="#FFF" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
        }
    };

    // Preseeded premium favorites
    const DEFAULT_FAVORITES = [
        { id: 'fav-1', name: 'YouTube TV', url: 'https://www.youtube.com', icon: 'youtube', launchMode: 'optimized' },
        { id: 'fav-2', name: 'Twitch Popout', url: 'https://www.twitch.tv', icon: 'twitch', launchMode: 'optimized' },
        { id: 'fav-3', name: 'Plex Web', url: 'https://app.plex.tv/desktop', icon: 'plex', launchMode: 'optimized' },
        { id: 'fav-4', name: 'Netflix', url: 'https://netflix.com', icon: 'netflix', launchMode: 'optimized' },
        { id: 'fav-5', name: 'Disney+', url: 'https://disneyplus.com', icon: 'disney', launchMode: 'optimized' },
        { id: 'fav-6', name: 'IPTV', url: 'https://iptv-smarters.com', icon: 'iptv', launchMode: 'optimized' }
    ];

    // Navigation state history (for back buttons)
    let viewHistory = ['view-accueil'];

    // Active favorite object being processed by context options
    let selectedFavorite = null;
    let editMode = false;

    // ==========================================================================
    // 1. Navigation / View Switcher (Router)
    // ==========================================================================
    function showView(viewId, isBack = false) {
        const views = document.querySelectorAll('.app-view');
        views.forEach(v => v.classList.add('hidden'));

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        if (!isBack && viewId !== viewHistory[viewHistory.length - 1]) {
            viewHistory.push(viewId);
        }
    }

    // Bind back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (viewHistory.length > 1) {
                viewHistory.pop(); // Remove current view
                const prevView = viewHistory[viewHistory.length - 1];
                showView(prevView, true);
            } else {
                showView('view-accueil');
            }
        });
    });

    // Navigation shortcuts
    document.getElementById('nav-to-fav').addEventListener('click', () => showView('view-favoris'));
    document.getElementById('nav-to-hist').addEventListener('click', () => showView('view-history'));
    document.getElementById('nav-to-help').addEventListener('click', () => showView('view-help'));
    document.getElementById('btn-quick-add').addEventListener('click', () => {
        // Clear input form
        document.getElementById('fav-url-input').value = document.getElementById('url-input').value;
        document.getElementById('fav-label-input').value = '';
        showView('view-add-favorite');
    });

    // Time updates in headers
    function updateTime() {
        const timeElements = document.querySelectorAll('.header-time');
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeElements.forEach(el => el.textContent = timeStr);
    }
    setInterval(updateTime, 1000);
    updateTime();

    // ==========================================================================
    // 2. URL Processing Engine & Security Policies
    // ==========================================================================
    function isYouTube(url) {
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            // Matches youtube.com, www.youtube.com, m.youtube.com, youtube-nocookie.com, music.youtube.com, youtu.be
            return hostname.match(/^(www\.)?(m\.)?youtube(-nocookie)?\.(com|be)$/) || hostname === 'youtu.be';
        } catch (e) {
            return url.toLowerCase().match(/youtube(-nocookie)?\.(com|be)/) || url.toLowerCase().includes('youtu.be');
        }
    }

    function normalizeUrl(input) {
        let val = input.trim();
        if (!val) return '';

        const hasSpace = val.includes(' ');
        const hasDot = val.includes('.');

        if (hasSpace || !hasDot) {
            return 'https://www.google.com/search?q=' + encodeURIComponent(val);
        }

        // Ensure we don't double-prefix if http:// or https:// already present
        if (/^https?:\/\//i.test(val)) {
            // Already has a protocol, return as‑is
            return val;
        }

        val = 'https://' + val;
        return val;
    }

    function getOptimizedUrl(url) {
        const normalized = normalizeUrl(url);
        
        // Évite le double wrapping si c'est déjà un lien de redirection YouTube
        if (normalized.startsWith('https://www.youtube.com/redirect?q=')) {
            return normalized;
        }
        
        // Enveloppe systématiquement l'URL dans la redirection YouTube pour forcer le mode plein écran
        return `https://www.youtube.com/redirect?q=${encodeURIComponent(normalized)}`;
    }

    function getHelperLoginUrl(rawUrl) {
        try {
            const url = new URL(normalizeUrl(rawUrl));
            const host = url.hostname.toLowerCase();
            
            if (host.includes('canalplus.com') || host.includes('mycanal.fr')) {
                return 'https://pass.canalplus.com/log/in?dest=' + encodeURIComponent('https://www.canalplus.com/');
            }
            if (host.includes('xhamster.com') || host.includes('xhamster3.com')) {
                return 'https://xhamster.com/login';
            }
            if (host.includes('netflix.com')) {
                return 'https://www.netflix.com/login';
            }
            if (host.includes('disneyplus.com')) {
                return 'https://www.disneyplus.com/login';
            }
            if (host.includes('youtube.com') || host.includes('youtu.be')) {
                return 'https://accounts.google.com/ServiceLogin';
            }
            if (host.includes('plex.tv')) {
                return 'https://app.plex.tv/desktop/#!/login';
            }
            if (host.includes('twitch.tv')) {
                return 'https://www.twitch.tv/login';
            }
            if (host.includes('spotify.com')) {
                return 'https://accounts.spotify.com/login';
            }
            
            // Guess login URL by appending to origin
            return url.origin + '/login';
        } catch (e) {
            return rawUrl;
        }
    }

    // ==========================================================================
    // 3. Execution & Progress Bar Redirection UI
    // ==========================================================================
    function launch(rawUrl, mode) {
        const url = rawUrl.trim();
        if (!url) {
            const inputEl = document.getElementById('url-input');
            inputEl.classList.add('shake-anim');
            inputEl.focus();
            setTimeout(() => inputEl.classList.remove('shake-anim'), 400);
            return;
        }

        const normalized = normalizeUrl(url);
        addToHistory(normalized);

        const target = (mode === 'optimized') ? getOptimizedUrl(normalized) : normalized;

        if (mode === 'optimized') {
            // Trigger View 6: Redirection loader screen with progress bar animation
            showView('view-redirect');
            const progress = document.getElementById('redirect-progress');
            progress.style.width = '0%';
            
            // Trigger visual progress load
            setTimeout(() => {
                progress.style.width = '100%';
            }, 50);

            // Execute redirect after progress completes to make it feel premium
            setTimeout(() => {
                window.location.href = target;
            }, 1600);
        } else {
            // Standard direct top-level navigation (preserves cookies/logins)
            window.location.href = target;
        }
    }

    // 1-Tap Direct Launch via Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const launchUrl = urlParams.get('launch') || urlParams.get('url');
    if (launchUrl) {
        const target = getOptimizedUrl(launchUrl);
        if (target) {
            // Remove parameters from history so Back button goes to clean home screen!
            try {
                const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
            } catch (e) {
                console.error("replaceState failed", e);
            }
            window.location.replace(target);
            return;
        }
    }

    // ==========================================================================
    // 4. Data Storage & Rendering
    // ==========================================================================

    // --- Favorites ---
    function getFavorites() {
        const favs = localStorage.getItem('tesla_launcher_favs_v2');
        if (!favs) {
            localStorage.setItem('tesla_launcher_favs_v2', JSON.stringify(DEFAULT_FAVORITES));
            return DEFAULT_FAVORITES;
        }
        return JSON.parse(favs);
    }

    function saveFavorites(favs) {
        localStorage.setItem('tesla_launcher_favs_v2', JSON.stringify(favs));
        renderFavorites();
    }

    function renderFavorites() {
        const favs = getFavorites();

        // 1. Render Homepage scroll Shortcuts (max 7 items)
        const shortcutContainer = document.getElementById('raccourcis-container');
        shortcutContainer.innerHTML = '';

        favs.slice(0, 7).forEach(fav => {
            const item = document.createElement('div');
            item.className = 'raccourci-item';
            const iconObj = BRAND_ICONS[fav.icon] || BRAND_ICONS.globe;
            let iconUrl = fav.iconUrl || '';
            let hasCustomIcon = !!iconUrl;

            // If no iconUrl and we haven't tried to fetch it yet, initiate fetch
            if (!iconUrl && !faviconFetchCache.has(fav.url)) {
                faviconFetchCache.add(fav.url);
                fetchFavicon(fav.url).then(fetchedIconUrl => {
                    if (fetchedIconUrl) {
                        // Update the favorite in localStorage
                        const favs = getFavorites();
                        const favIndex = favs.findIndex(f => f.id === fav.id);
                        if (favIndex >= 0) {
                            favs[favIndex].iconUrl = fetchedIconUrl;
                            saveFavorites(favs);
                        }
                    }
                });
            }

            const displayName = fav.name || getHostFromURL(fav.url) || 'Site';
            item.innerHTML = `
                <div class="raccourci-icon-wrapper ${hasCustomIcon ? '' : iconObj.bgClass}" ${hasCustomIcon && isSafeUrl(iconUrl) ? `style="background-image:url(${iconUrl});background-size:contain;background-repeat:no-repeat;background-position:center;"` : ''}>
                    ${!hasCustomIcon ? iconObj.svg : ''}
                </div>
                <span class="raccourci-name">${escapeHtml(displayName)}</span>
                <span class="launch-mode-indicator" title="Mode de lancement">${fav.launchMode === 'optimized' ? '🚀' : '↔️'}</span>
            `;

            // Setup click & long-press behaviors
            setupCardInteraction(item, fav);
            shortcutContainer.appendChild(item);
        });

        // 2. Render Full grid on View 2
        const gridContainer = document.getElementById('favorites-grid-full');
        gridContainer.innerHTML = '';

        favs.forEach(fav => {
            const item = document.createElement('div');
            item.className = 'favorite-card';
            const iconObj = BRAND_ICONS[fav.icon] || BRAND_ICONS.globe;
            let iconUrl = fav.iconUrl || '';
            let hasCustomIcon = !!iconUrl;

            // If no iconUrl and we haven't tried to fetch it yet, initiate fetch
            if (!iconUrl && !faviconFetchCache.has(fav.url)) {
                faviconFetchCache.add(fav.url);
                fetchFavicon(fav.url).then(fetchedIconUrl => {
                    if (fetchedIconUrl) {
                        // Update the favorite in localStorage
                        const favs = getFavorites();
                        const favIndex = favs.findIndex(f => f.id === fav.id);
                        if (favIndex >= 0) {
                            favs[favIndex].iconUrl = fetchedIconUrl;
                            saveFavorites(favs);
                        }
                    }
                });
            }

            let displayUrl = fav.url.replace(/^https?:\/\/(www\.)?/i, '');
            if (displayUrl.length > 25) displayUrl = displayUrl.substring(0, 22) + '...';

            item.innerHTML = `
                <div class="favorite-card-icon-bg ${hasCustomIcon ? '' : iconObj.bgClass}" ${hasCustomIcon && isSafeUrl(iconUrl) ? `style="background-image:url(${iconUrl});background-size:contain;background-repeat:no-repeat;background-position:center;"` : ''}>
                    ${!hasCustomIcon ? iconObj.svg : ''}
                </div>
                <div class="favorite-card-details">
                    <span class="favorite-card-title">${escapeHtml(fav.name)}</span>
                    <span class="launch-mode-indicator" title="Mode de lancement">${fav.launchMode === 'optimized' ? '🚀' : '↔️'}</span>
                    <span class="favorite-card-url">${escapeHtml(displayUrl)}</span>
                </div>
                <button class="favorite-card-delete" data-id="${fav.id}">&times;</button>
            `;

            // Delete buttons
            const delBtn = item.querySelector('.favorite-card-delete');
            if (editMode) delBtn.style.display = 'flex';

            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFavorite(fav.id);
            });

            setupCardInteraction(item, fav);
            gridContainer.appendChild(item);
        });
    }

    // Handles Tap vs Long Press gesture for in-car touch screen.
    // Properly ignores taps when the user is scrolling/swiping.
    function setupCardInteraction(element, favorite) {
        let pressTimer = null;
        let isLongPress = false;
        let isScrolling = false;

        // Check if event target is within an element that should not trigger press behavior
        function shouldIgnoreEvent(e) {
            // Ignore events from delete buttons (when in edit mode)
            if (e.target.closest('.favorite-card-delete')) {
                return true;
            }
            // Could add other elements to ignore here in the future
            return false;
        }

        const startPress = (e) => {
            if (shouldIgnoreEvent(e)) return;
            isLongPress = false;
            isScrolling = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                openOptionsModal(favorite);
            }, 600); // 600ms hold triggers options
        };

        const movePress = (e) => {
            if (shouldIgnoreEvent(e)) return;
            isScrolling = true;
            clearTimeout(pressTimer);
        };

        const endPress = (e) => {
            if (shouldIgnoreEvent(e)) return;
            clearTimeout(pressTimer);
            if (isScrolling) return; // Ignore if they were swiping/scrolling

            if (!isLongPress) {
                // Regular tap uses favorite's launch mode
                launch(favorite.url, favorite.launchMode);
            }
        };

        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', endPress);
        element.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        element.addEventListener('touchstart', startPress, { passive: true });
        element.addEventListener('touchmove', movePress, { passive: true });
        element.addEventListener('touchend', endPress, { passive: true });
    }

    async function addFavorite(name, url, iconName) {
        const cleanUrl = normalizeUrl(url);
        if (!cleanUrl) return;

        const cleanName = name.trim() || cleanUrl.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
        const favs = getFavorites();
        const iconUrl = await fetchFavicon(cleanUrl);

        const newFav = {
            id: 'fav-' + Date.now(),
            name: cleanName,
            url: cleanUrl,
            icon: iconName,
            iconUrl: iconUrl,
            launchMode: 'optimized'
        };

        favs.push(newFav);
        saveFavorites(favs);
        showView('view-favoris');
    }

    function deleteFavorite(id) {
        if (!confirm('Voulez-vous vraiment supprimer ce favori ?')) return;
        let favs = getFavorites();
        favs = favs.filter(f => f.id !== id);
        saveFavorites(favs);
    }

    // Toggle favorites edit mode
    document.getElementById('btn-edit-favs').addEventListener('click', function() {
        editMode = !editMode;
        this.classList.toggle('active', editMode);
        this.textContent = editMode ? 'Terminer' : 'Modifier';
        renderFavorites();
    });

    // --- History ---
    function getHistory() {
        const hist = localStorage.getItem('tesla_launcher_history_v2');
        return hist ? JSON.parse(hist) : [];
    }

    function saveHistory(history) {
        localStorage.setItem('tesla_launcher_history_v2', JSON.stringify(history));
        renderHistory();
    }

    function addToHistory(url) {
        const normalized = normalizeUrl(url);
        let history = getHistory();
        history = history.filter(item => item.url !== normalized);
        
        history.unshift({
            url: normalized,
            timestamp: Date.now()
        });

        if (history.length > 12) history = history.slice(0, 12);
        saveHistory(history);
    }

    function deleteHistoryItem(url) {
        if (!confirm('Voulez-vous vraiment supprimer cet élément de l\'historique ?')) return;
        let history = getHistory();
        history = history.filter(item => item.url !== url);
        saveHistory(history);
    }

    function renderHistory() {
        const history = getHistory();
        const container = document.getElementById('history-list-full');
        container.innerHTML = '';

        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="border: 1px dashed var(--border-color); padding: 40px; text-align: center; border-radius: var(--border-radius);">
                    <p style="color: var(--text-secondary); font-size: 13px;">Aucun historique récent. Vos lancements s'afficheront ici.</p>
                </div>
            `;
            return;
        }

        history.forEach(item => {
            const row = document.createElement('div');
            row.className = 'history-row';
            
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let displayUrl = item.url.replace(/^https?:\/\/(www\.)?/i, '');
            if (displayUrl.length > 50) displayUrl = displayUrl.substring(0, 47) + '...';

            row.innerHTML = `
                <div class="history-row-left">
                    <div class="history-row-icon-bg">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 10V7h-2v6h5v-2h-3z"/></svg>
                    </div>
                    <span class="history-row-url">${escapeHtml(displayUrl)}</span>
                </div>
                <div class="history-row-right">
                    <span class="history-row-time">${timeStr}</span>
                    <button class="history-row-delete" title="Supprimer">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            `;

            // Clicking row fills URL input and goes to home screen
            row.addEventListener('click', (e) => {
                if (e.target.closest('.history-row-delete')) return;
                document.getElementById('url-input').value = item.url;
                updateClearButtonState();
                showView('view-accueil');
                document.getElementById('url-input').focus();
            });

            row.querySelector('.history-row-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistoryItem(item.url);
            });

            container.appendChild(row);
        });
    }

    document.getElementById('btn-clear-history-all').addEventListener('click', () => {
        saveHistory([]);
    });

    // ==========================================================================
    // 5. Options Overlay Dialog Modal (View 5 Actions)
    // ==========================================================================
    const modalOptions = document.getElementById('modal-options');
    
    function openOptionsModal(favorite) {
        selectedFavorite = favorite;
        modalOptions.classList.remove('hidden');
    }

    function closeOptionsModal() {
        modalOptions.classList.add('hidden');
        selectedFavorite = null;
    }

    modalOptions.querySelector('.modal-close').addEventListener('click', closeOptionsModal);
    modalOptions.addEventListener('click', (e) => {
        if (e.target === modalOptions) closeOptionsModal();
    });

    // Modal click options triggers
    document.getElementById('opt-direct').addEventListener('click', () => {
        if (selectedFavorite) {
            launch(selectedFavorite.url, 'direct');
            closeOptionsModal();
        }
    });

    document.getElementById('opt-optimized').addEventListener('click', () => {
        if (selectedFavorite) {
            launch(selectedFavorite.url, 'optimized');
            closeOptionsModal();
        }
    });

    document.getElementById('opt-helper-login').addEventListener('click', () => {
        if (selectedFavorite) {
            const helperUrl = getHelperLoginUrl(selectedFavorite.url);
            launch(helperUrl, 'optimized');
            closeOptionsModal();
        }
    });

    document.getElementById('opt-copy').addEventListener('click', () => {
        if (selectedFavorite) {
            const targetUrl = getOptimizedUrl(selectedFavorite.url);
            navigator.clipboard.writeText(targetUrl).then(() => {
                // Short alert
                const originalText = document.getElementById('opt-copy').querySelector('.modal-action-name').textContent;
                document.getElementById('opt-copy').querySelector('.modal-action-name').textContent = 'Lien copié !';
                setTimeout(() => {
                    document.getElementById('opt-copy').querySelector('.modal-action-name').textContent = originalText;
                    closeOptionsModal();
                }, 1000);
            }).catch(() => {
                alert('Impossible de copier le lien.');
            });
        }
    });

    document.getElementById('opt-edit').addEventListener('click', () => {
        if (selectedFavorite) {
            document.getElementById('fav-url-input').value = selectedFavorite.url;
            document.getElementById('fav-label-input').value = selectedFavorite.name;
            
            // Set active icon selector item
            const selectorItems = document.querySelectorAll('.selector-icon-item');
            selectorItems.forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-icon') === selectedFavorite.icon);
            });
            
            // Remove previous version of this favorite on save
            deleteFavorite(selectedFavorite.id);
            
            closeOptionsModal();
            showView('view-add-favorite');
        }
    });

    document.getElementById('opt-delete').addEventListener('click', () => {
        if (selectedFavorite) {
            deleteFavorite(selectedFavorite.id);
            closeOptionsModal();
        }
    });

    // ==========================================================================
    // 6. UI Console Handlers (Home Panel)
    // ==========================================================================
    const urlInput = document.getElementById('url-input');
    const clearBtn = document.getElementById('clear-btn');
    const btnDirect = document.getElementById('btn-direct');
    const btnOptimized = document.getElementById('btn-optimized');
    const assistButtons = document.querySelectorAll('.assist-btn');

    function updateClearButtonState() {
        if (urlInput.value.length > 0) {
            clearBtn.classList.add('visible');
        } else {
            clearBtn.classList.remove('visible');
        }
    }

    urlInput.addEventListener('input', updateClearButtonState);
    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        updateClearButtonState();
        urlInput.focus();
    });

    // Input assist keys
    assistButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const textToAppend = btn.getAttribute('data-value');
            const startPos = urlInput.selectionStart;
            const endPos = urlInput.selectionEnd;
            const currentVal = urlInput.value;
            
            urlInput.value = currentVal.substring(0, startPos) + textToAppend + currentVal.substring(endPos);
            const newCursor = startPos + textToAppend.length;
            urlInput.setSelectionRange(newCursor, newCursor);
            updateClearButtonState();
            urlInput.focus();
        });
    });

    // Launch handlers
    btnDirect.addEventListener('click', () => launch(urlInput.value, 'direct'));
    btnOptimized.addEventListener('click', () => launch(urlInput.value, 'optimized'));
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') launch(urlInput.value, 'optimized');
    });

    // ==========================================================================
    // 7. Favorite Add Form (View 4 Panel)
    // ==========================================================================
    let selectedFormIcon = 'youtube';
    const formIconItems = document.querySelectorAll('.selector-icon-item');
    
    formIconItems.forEach(item => {
        item.addEventListener('click', () => {
            formIconItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedFormIcon = item.getAttribute('data-icon');
        });
    });

    document.getElementById('btn-save-favorite').addEventListener('click', async () => {
        const url = document.getElementById('fav-url-input').value;
        const name = document.getElementById('fav-label-input').value;
        if (!url) {
            const urlFormEl = document.getElementById('fav-url-input');
            urlFormEl.classList.add('shake-anim');
            urlFormEl.focus();
            setTimeout(() => urlFormEl.classList.remove('shake-anim'), 400);
            return;
        }
        await addFavorite(name, url, selectedFormIcon);
    });

    // Helper HTML Escape
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initialize View
    getFavorites();
    renderFavorites();
    renderHistory();
    updateClearButtonState();

    // Helper to extract hostname from URL for display
    function getHostFromURL(url) {
        try {
            const urlObj = new URL(url);
            let host = urlObj.hostname;
            if (host.startsWith('www.')) {
                host = host.slice(4);
            }
            return host;
        } catch {
            return '';
        }
    }

    // Favicon helper
    async function fetchFavicon(url) {
        try {
            const hostname = new URL(url).hostname;
            // Use Google's favicon service
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        } catch (e) {
            // fallback to empty string
            return '';
        }
    }

    function isSafeUrl(url) {
        return typeof url === 'string' && /^https?:\/\//i.test(url);
    }

    // Reset transition screen and go back to home screen on back-button navigation
    window.addEventListener('pageshow', (event) => {
        viewHistory = ['view-accueil'];
        showView('view-accueil');
        const progress = document.getElementById('redirect-progress');
        if (progress) progress.style.width = '0%';
    });

    // Settings Modal Functionality
    const settingsModal = document.getElementById('modal-settings');
    const settingsBtn = document.getElementById('nav-to-settings');
    const settingsCloseBtn = settingsModal.querySelector('.modal-close');

    // Settings defaults
    const defaultSettings = {
        vibrationEnabled: true,
        longPressDuration: 1000, // milliseconds
        timeFormat24h: true
    };

    // Load settings from localStorage or use defaults
    let settings = JSON.parse(localStorage.getItem('teslaLauncherSettings')) || {...defaultSettings};

    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('teslaLauncherSettings', JSON.stringify(settings));
        applySettings();
    }

    // Apply settings to the UI and behavior
    function applySettings() {
        // Update UI controls to match current settings
        document.getElementById('vibration-toggle').checked = settings.vibrationEnabled;
        document.getElementById('long-press-slider').value = settings.longPressDuration;
        document.getElementById('long-press-value').textContent = settings.longPressDuration + 'ms';
        document.getElementById('time-format-toggle').checked = !settings.timeFormat24h; // Checked means 12h format

        // Update header time format if element exists
        const headerTime = document.querySelector('.header-time');
        if (headerTime) {
            updateHeaderTimeDisplay();
        }

        // Apply to any active haptic feedback if needed
        // (Will be used when triggering vibrations)
    }

    // Update header time display based on settings
    function updateHeaderTimeDisplay() {
        const headerTime = document.querySelector('.header-time');
        if (!headerTime) return;

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');

        if (!settings.timeFormat24h) {
            // 12-hour format
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours === 0 ? 12 : hours; // 0 becomes 12
            headerTime.textContent = `${hours}:${minutes} ${ampm}`;
        } else {
            // 24-hour format
            headerTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
    }

    // Trigger haptic feedback if enabled
    function triggerHapticFeedback() {
        if (settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(50); // 50ms vibration
        }
    }

    // Open and close settings modal functions
    function openSettingsModal() {
        // Update modal with current settings before showing
        document.getElementById('vibration-toggle').checked = settings.vibrationEnabled;
        document.getElementById('long-press-slider').value = settings.longPressDuration;
        document.getElementById('long-press-value').textContent = settings.longPressDuration + 'ms';
        document.getElementById('time-format-toggle').checked = !settings.timeFormat24h; // Inverted for UI

        settingsModal.classList.remove('hidden');
    }

    function closeSettingsModal() {
        settingsModal.classList.add('hidden');
    }

    // Event Listeners for Settings Modal
    settingsBtn.addEventListener('click', () => {
        openSettingsModal();
        triggerHapticFeedback(); // Feedback for opening settings
    });

    settingsCloseBtn.addEventListener('click', () => {
        closeSettingsModal();
        triggerHapticFeedback(); // Feedback for closing settings
    });

    // Close modal when clicking outside content
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
            triggerHapticFeedback(); // Feedback for closing settings
        }
    });

    // Vibration toggle
    document.getElementById('vibration-toggle').addEventListener('change', (e) => {
        settings.vibrationEnabled = e.target.checked;
        saveSettings();
        triggerHapticFeedback(); // Feedback for change
    });

    // Long press slider
    const longPressSlider = document.getElementById('long-press-slider');
    const longPressValue = document.getElementById('long-press-value');

    longPressSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        settings.longPressDuration = value;
        longPressValue.textContent = value + 'ms';
        // Save on change (could also use 'change' event for less frequent saves)
        saveSettings();
        triggerHapticFeedback(); // Feedback for change
    });

    // Time format toggle
    document.getElementById('time-format-toggle').addEventListener('change', (e) => {
        // When checked, it's 12h format (so timeFormat24h is false)
        settings.timeFormat24h = !e.target.checked;
        saveSettings();
        triggerHapticFeedback(); // Feedback for change
    });

    // Reset to defaults
    settingsModal.querySelector('.modal-action-row.text-red').addEventListener('click', () => {
        if (confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) {
            settings = {...defaultSettings};
            saveSettings();
            triggerHapticFeedback(); // Feedback for reset
        }
    });

    // Apply settings on load
    applySettings();

    // Update header time every minute
    setInterval(updateHeaderTimeDisplay, 60000);

    // Also update immediately if needed (in case page loads between minutes)
    updateHeaderTimeDisplay();
});
