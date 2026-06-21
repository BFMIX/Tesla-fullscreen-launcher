/* ==========================================================================
   Tesla Fullscreen Launcher - High-Fidelity Application Logic
   Matches the 6 UI views, dialog overlays, and redirection screen transitions
   ========================================================================== */

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
        { id: 'fav-1', name: 'YouTube TV', url: 'https://www.youtube.com', icon: 'youtube' },
        { id: 'fav-2', name: 'Twitch Popout', url: 'https://www.twitch.tv', icon: 'twitch' },
        { id: 'fav-3', name: 'Plex Web', url: 'https://app.plex.tv/desktop', icon: 'plex' },
        { id: 'fav-4', name: 'Netflix', url: 'https://netflix.com', icon: 'netflix' },
        { id: 'fav-5', name: 'Disney+', url: 'https://disneyplus.com', icon: 'disney' },
        { id: 'fav-6', name: 'IPTV', url: 'https://iptv-smarters.com', icon: 'iptv' }
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
            return hostname.includes('youtube.com') || hostname === 'youtu.be';
        } catch (e) {
            return url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be');
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

        if (!/^https?:\/\//i.test(val)) {
            val = 'https://' + val;
        }

        return val;
    }

    function getOptimizedUrl(url) {
        const normalized = normalizeUrl(url);
        if (isYouTube(normalized)) {
            return `https://www.youtube.com/redirect?q=${encodeURIComponent(normalized)}`;
        }
        return normalized;
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
            
            item.innerHTML = `
                <div class="raccourci-icon-wrapper ${iconObj.bgClass}">
                    ${iconObj.svg}
                </div>
                <span class="raccourci-name">${escapeHtml(fav.name)}</span>
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
            
            let displayUrl = fav.url.replace(/^https?:\/\/(www\.)?/i, '');
            if (displayUrl.length > 25) displayUrl = displayUrl.substring(0, 22) + '...';

            item.innerHTML = `
                <div class="favorite-card-icon-bg ${iconObj.bgClass}">
                    ${iconObj.svg}
                </div>
                <div class="favorite-card-details">
                    <span class="favorite-card-title">${escapeHtml(fav.name)}</span>
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

    // Handles Tap vs Long Press gesture for in-car touch screen
    function setupCardInteraction(element, favorite) {
        let pressTimer = null;
        let isLongPress = false;

        const startPress = () => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                openOptionsModal(favorite);
            }, 600); // 600ms hold triggers options
        };

        const endPress = (e) => {
            clearTimeout(pressTimer);
            if (!isLongPress && e.type !== 'touchmove') {
                // Regular tap triggers optimized launch directly
                launch(favorite.url, 'optimized');
            }
        };

        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', endPress);
        element.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        element.addEventListener('touchstart', startPress, { passive: true });
        element.addEventListener('touchend', endPress, { passive: true });
        element.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });
    }

    function addFavorite(name, url, iconName) {
        const cleanUrl = normalizeUrl(url);
        if (!cleanUrl) return;

        const cleanName = name.trim() || cleanUrl.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
        const favs = getFavorites();
        
        const newFav = {
            id: 'fav-' + Date.now(),
            name: cleanName,
            url: cleanUrl,
            icon: iconName
        };

        favs.push(newFav);
        saveFavorites(favs);
        showView('view-favoris');
    }

    function deleteFavorite(id) {
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

    document.getElementById('btn-save-favorite').addEventListener('click', () => {
        const url = document.getElementById('fav-url-input').value;
        const name = document.getElementById('fav-label-input').value;
        if (!url) {
            const urlFormEl = document.getElementById('fav-url-input');
            urlFormEl.classList.add('shake-anim');
            urlFormEl.focus();
            setTimeout(() => urlFormEl.classList.remove('shake-anim'), 400);
            return;
        }
        addFavorite(name, url, selectedFormIcon);
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
});
