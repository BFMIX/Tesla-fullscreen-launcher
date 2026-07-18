/* ==========================================================================
   Tesla Fullscreen Launcher - High-Fidelity Application Logic (Premium HMI)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Default configuration for initial launcher favorites (v4)
    const DEFAULT_FAVORITES = [
        { id: 'fav-plex', name: 'Plex', url: 'https://app.plex.tv/desktop', icon: 'globe', lastContext: 'Just now', lastUrl: 'https://app.plex.tv/desktop', launchMode: 'optimized', lastOpened: 600000 },
        { id: 'fav-youtube', name: 'YouTube', url: 'https://www.youtube.com', icon: 'globe', lastContext: '5 min ago', lastUrl: 'https://www.youtube.com', launchMode: 'optimized', lastOpened: 500000 },
        { id: 'fav-netflix', name: 'Netflix', url: 'https://www.netflix.com', icon: 'globe', lastContext: '22 min ago', lastUrl: 'https://www.netflix.com', launchMode: 'optimized', lastOpened: 400000 },
        { id: 'fav-disney', name: 'Disney+', url: 'https://www.disneyplus.com', icon: 'globe', lastContext: '1 h ago', lastUrl: 'https://www.disneyplus.com', launchMode: 'optimized', lastOpened: 300000 },
        { id: 'fav-twitch', name: 'Twitch', url: 'https://www.twitch.tv', icon: 'globe', lastContext: '2 h ago', lastUrl: 'https://www.twitch.tv', launchMode: 'optimized', lastOpened: 200000 },
        { id: 'fav-reddit', name: 'Reddit', url: 'https://www.reddit.com', icon: 'globe', lastContext: '3 h ago', lastUrl: 'https://www.reddit.com', launchMode: 'optimized', lastOpened: 100000 }
    ];

    // Default configuration for initial quick apps
    const DEFAULT_QUICK_APPS = [
        { id: 'qa-youtube', name: 'YouTube', url: 'https://www.youtube.com', icon: 'globe', lastOpened: 0 },
        { id: 'qa-netflix', name: 'Netflix', url: 'https://www.netflix.com', icon: 'globe', lastOpened: 0 },
        { id: 'qa-disney', name: 'Disney+', url: 'https://www.disneyplus.com', icon: 'globe', lastOpened: 0 },
        { id: 'qa-prime', name: 'Prime Video', url: 'https://www.primevideo.com', icon: 'globe', lastOpened: 0 },
        { id: 'qa-hbo', name: 'HBO Max', url: 'https://www.max.com', icon: 'globe', lastOpened: 0 },
        { id: 'qa-plex', name: 'Plex', url: 'https://app.plex.tv/desktop', icon: 'globe', lastOpened: 0 },
        { id: 'qa-apple', name: 'Apple TV', url: 'https://tv.apple.com', icon: 'globe', lastOpened: 0 },
        { id: 'qa-paramount', name: 'Paramount+', url: 'https://www.paramountplus.com', icon: 'globe', lastOpened: 0 }
    ];

    let selectedItem = null;
    let selectedIsQuickApp = false;
    let selectedIsRecent = false;
    
    let editModeFavorites = false;
    let editModeQuickApps = false;

    // Settings defaults
    const defaultSettings = {
        vibrationEnabled: true,
        longPressDuration: 800, // snappier touch holds
        timeFormat24h: true,
        theme: 'auto'
    };

    function loadSettings() {
        try {
            return {
                ...defaultSettings,
                ...(JSON.parse(localStorage.getItem('teslaLauncherSettings_v4')) || {})
            };
        } catch (e) {
            return {...defaultSettings};
        }
    }

    let settings = loadSettings();
    const systemThemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

    // ==========================================================================
    // Helper & Redirection Functions
    // ==========================================================================

    function triggerHapticFeedback() {
        if (settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(30); // Subtler 30ms haptic
        }
    }

    function isSafeUrl(url) {
        return typeof url === 'string' && /^https?:\/\//i.test(url);
    }

    function normalizeUrl(input) {
        let val = input.trim();
        if (!val) return '';

        const hasSpace = val.includes(' ');
        const hasDot = val.includes('.');

        if (hasSpace || !hasDot) {
            return 'https://www.google.com/search?q=' + encodeURIComponent(val);
        }

        if (/^https?:\/\//i.test(val)) {
            return val;
        }

        return 'https://' + val;
    }

    function getOptimizedUrl(url) {
        const normalized = normalizeUrl(url);
        if (normalized.startsWith('https://www.youtube.com/redirect?q=')) {
            return normalized;
        }
        // Redirect helper to break Tesla browser window out to fullscreen
        return `https://www.youtube.com/redirect?q=${encodeURIComponent(normalized)}`;
    }

    function getHelperLoginUrl(rawUrl) {
        try {
            const url = new URL(normalizeUrl(rawUrl));
            const host = url.hostname.toLowerCase();
            
            if (host.includes('canalplus.com') || host.includes('mycanal.fr')) {
                return 'https://pass.canalplus.com/log/in?dest=' + encodeURIComponent('https://www.canalplus.com/');
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
            
            return url.origin + '/login';
        } catch (e) {
            return rawUrl;
        }
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getResolvedTheme() {
        if (settings.theme === 'auto') {
            return systemThemeQuery && systemThemeQuery.matches ? 'light' : 'dark';
        }

        return settings.theme || 'dark';
    }

    /* REVIEW-001 #6 — Request highest practical resolution (256px)
       and provide lightweight onerror fallback chain. */
    function getFaviconUrl(url) {
        try {
            const hostname = new URL(normalizeUrl(url)).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
        } catch (e) {
            return 'asset/icon.png';
        }
    }

    window.faviconFallback = function(img) {
        if (!img.dataset.retried) {
            img.dataset.retried = '1';
            const src = img.src;
            if (src.includes('sz=256')) {
                img.src = src.replace('sz=256', 'sz=64');
                return;
            }
        }
        img.src = 'asset/icon.png';
    };

    // ==========================================================================
    // Smart Memory State Engine
    // ==========================================================================

    function updateSmartCardContext(url) {
        try {
            const normalized = normalizeUrl(url);
            const urlObj = new URL(normalized);
            const host = urlObj.hostname.toLowerCase();
            
            // Check favorites first
            let favs = getFavorites();
            let favUpdated = false;

            favs.forEach(fav => {
                const favHost = new URL(normalizeUrl(fav.url)).hostname.toLowerCase();
                if (host === favHost || host.endsWith('.' + favHost) || favHost.endsWith('.' + host)) {
                    fav.lastUrl = normalized;
                    fav.lastOpened = Date.now(); // update opened timestamp for sorting
                    
                    if (host.includes('twitch.tv')) {
                        const channel = urlObj.pathname.split('/').filter(Boolean)[0];
                        fav.lastContext = channel ? `Last channel: ${channel}` : 'Last channel';
                    } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
                        let videoId = '';
                        if (host.includes('youtu.be')) {
                            videoId = urlObj.pathname.split('/').filter(Boolean)[0];
                        } else {
                            videoId = urlObj.searchParams.get('v');
                        }
                        fav.lastContext = videoId ? `Last video: ${videoId}` : 'Last video';
                    } else if (host.includes('plex.tv')) {
                        fav.lastContext = 'Last server';
                    } else if (host.includes('jellyfin')) {
                        fav.lastContext = 'Last session';
                    } else if (host.includes('netflix.com')) {
                        fav.lastContext = 'Last watch';
                    } else {
                        let path = urlObj.pathname + urlObj.search;
                        if (path.length > 20) path = path.substring(0, 17) + '...';
                        fav.lastContext = path !== '/' ? `Last: ${path}` : 'Last launched';
                    }
                    favUpdated = true;
                }
            });

            if (favUpdated) {
                localStorage.setItem('tesla_launcher_favs_v4', JSON.stringify(favs));
                renderFavorites();
                return;
            }

            // Check Quick Apps next
            let apps = getQuickApps();
            let appUpdated = false;

            apps.forEach(app => {
                const appHost = new URL(normalizeUrl(app.url)).hostname.toLowerCase();
                if (host === appHost || host.endsWith('.' + appHost) || appHost.endsWith('.' + host)) {
                    app.lastOpened = Date.now(); // bump timestamp
                    appUpdated = true;
                }
            });

            if (appUpdated) {
                localStorage.setItem('tesla_launcher_quick_apps_v6', JSON.stringify(apps));
                renderQuickApps();
                return;
            }

            // Otherwise, add to Recents (which will also sort them dynamically)
            addRecentLaunch(normalized);
        } catch (e) {
            console.error("Error updating smart card context", e);
        }
    }

    // ==========================================================================
    // Launch Handlers
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
        
        // Update context memory and dynamic sorting timestamps
        updateSmartCardContext(normalized);

        const target = (mode === 'optimized') ? getOptimizedUrl(normalized) : normalized;

        if (mode === 'optimized') {
            // Trigger fullscreen redirection overlay
            const redirectScreen = document.getElementById('view-redirect');
            redirectScreen.classList.remove('hidden');
            
            const progress = document.getElementById('redirect-progress');
            progress.style.width = '0%';
            
            setTimeout(() => {
                progress.style.width = '100%';
            }, 50);

            // Execute redirect after 1.4s bar completion
            setTimeout(() => {
                window.location.href = target;
            }, 1400);
        } else {
            // Direct load preserving normal cookies
            window.location.href = target;
        }
    }

    // Direct url loading param support
    const urlParams = new URLSearchParams(window.location.search);
    const launchUrl = urlParams.get('launch') || urlParams.get('url');
    if (launchUrl) {
        const target = getOptimizedUrl(launchUrl);
        if (target) {
            try {
                const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
            } catch (e) {}
            window.location.replace(target);
            return;
        }
    }

    // ==========================================================================
    // LocalStorage Data Controllers
    // ==========================================================================

    // --- Favorites ---
    function getFavorites() {
        const favsKeyV4 = 'tesla_launcher_favs_v4';
        const favs = localStorage.getItem(favsKeyV4);
        if (favs) {
            return JSON.parse(favs);
        }

        // Migrate from old schemas (v3, v2) if they exist, keeping user custom favorites
        const oldKeys = ['tesla_launcher_favs_v3', 'tesla_launcher_favs_v2'];
        let oldFavs = null;
        for (const key of oldKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                oldFavs = JSON.parse(data);
                break;
            }
        }

        if (oldFavs) {
            const oldDefaultIds = ['fav-1', 'fav-2', 'fav-3', 'fav-4', 'fav-5', 'fav-6'];
            const userCustomFavs = oldFavs.filter(fav => !oldDefaultIds.includes(fav.id));
            const mergedFavs = [...DEFAULT_FAVORITES];

            userCustomFavs.forEach(userFav => {
                try {
                    const userHost = new URL(userFav.url).hostname.toLowerCase();
                    const alreadyExists = mergedFavs.some(defFav => {
                        const defHost = new URL(defFav.url).hostname.toLowerCase();
                        return userHost === defHost;
                    });
                    if (!alreadyExists) {
                        mergedFavs.push({
                            ...userFav,
                            lastOpened: userFav.lastOpened || 0
                        });
                    }
                } catch (e) {
                    mergedFavs.push({
                        ...userFav,
                        lastOpened: 0
                    });
                }
            });

            localStorage.setItem(favsKeyV4, JSON.stringify(mergedFavs));
            return mergedFavs;
        }

        localStorage.setItem(favsKeyV4, JSON.stringify(DEFAULT_FAVORITES));
        return DEFAULT_FAVORITES;
    }

    function saveFavorites(favs) {
        localStorage.setItem('tesla_launcher_favs_v4', JSON.stringify(favs));
        renderFavorites();
    }

    // --- Quick Apps ---
    function getQuickApps() {
        const appsKeyV6 = 'tesla_launcher_quick_apps_v6';
        const appsStr = localStorage.getItem(appsKeyV6);
        let appsList = [];
        if (appsStr) {
            appsList = JSON.parse(appsStr);
        } else {
            localStorage.setItem(appsKeyV6, JSON.stringify(DEFAULT_QUICK_APPS));
            appsList = [...DEFAULT_QUICK_APPS];
        }
        
        // Enforce: IPTV is always last in the list
        const iptvIndex = appsList.findIndex(a => a.id === 'qa-iptv');
        if (iptvIndex > -1) {
            const iptvItem = appsList.splice(iptvIndex, 1)[0];
            appsList.push(iptvItem);
        }
        return appsList;
    }

    function saveQuickApps(apps) {
        localStorage.setItem('tesla_launcher_quick_apps_v6', JSON.stringify(apps));
        renderQuickApps();
    }

    // --- Recents ---
    function getRecentLaunches() {
        const recents = localStorage.getItem('tesla_launcher_recent_launches_v3');
        return recents ? JSON.parse(recents) : [];
    }

    function addRecentLaunch(url) {
        let recents = getRecentLaunches();
        recents = recents.filter(item => item.url !== url);
        
        recents.unshift({
            id: 'recent-' + Date.now(),
            url: url,
            name: url.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0],
            timestamp: Date.now()
        });

        if (recents.length > 5) recents = recents.slice(0, 5);
        localStorage.setItem('tesla_launcher_recent_launches_v3', JSON.stringify(recents));
        renderFavorites();
    }

    function deleteRecentLaunch(id) {
        let recents = getRecentLaunches();
        recents = recents.filter(item => item.id !== id);
        localStorage.setItem('tesla_launcher_recent_launches_v3', JSON.stringify(recents));
        renderFavorites();
    }

    // ==========================================================================
    // UI Render Engine
    // ==========================================================================

    // --- Favorites & Recents Dynamic Sorting Render ---
    function renderFavorites() {
        const carousel = document.getElementById('favorites-carousel');
        if (!carousel) return;
        carousel.innerHTML = '';

        const favs = getFavorites();
        const recents = getRecentLaunches();

        // Standardize schemas for sorting:
        const normalizedFavs = favs.map(f => ({
            ...f,
            isRecent: false,
            sortTime: f.lastOpened || 0
        }));

        const normalizedRecents = recents.map(r => ({
            id: r.id,
            name: r.name,
            url: r.url,
            lastUrl: r.url,
            icon: 'globe',
            launchMode: 'optimized',
            isRecent: true,
            sortTime: r.timestamp || 0
        }));

        // Combine Pinned Favorites and Recents
        const combined = [...normalizedFavs, ...normalizedRecents];

        // Sort by lastOpened / timestamp descending (dynamic ordering)
        combined.sort((a, b) => {
            const timeA = a.sortTime;
            const timeB = b.sortTime;
            if (timeB !== timeA) {
                return timeB - timeA;
            }
            // If they are equal (e.g. both 0), sort Favorites first, then Recents, then alphabetically
            if (a.isRecent && !b.isRecent) return 1;
            if (!a.isRecent && b.isRecent) return -1;
            return a.name.localeCompare(b.name);
        });

        // Draw dynamically sorted cards
        combined.forEach(item => {
            const card = document.createElement('div');
            card.className = 'smart-card';
            
            let contextText = item.lastContext;
            if (item.isRecent) {
                const timeStr = new Date(item.sortTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                contextText = `Recent launch • ${timeStr}`;
            } else if (!contextText) {
                contextText = 'Direct launch';
            }
            
            const faviconUrl = getFaviconUrl(item.url);
            
            card.innerHTML = `
                <button class="card-delete-badge" title="Delete">&times;</button>
                <div class="smart-card-header">
                    <div class="smart-card-brand">
                        <img class="smart-card-icon" src="${faviconUrl}" onerror="faviconFallback(this)" alt="${escapeHtml(item.name)}">
                        <span class="smart-card-title">${escapeHtml(item.name)}</span>
                    </div>
                </div>
                <div class="smart-card-meta-row">
                    <span class="smart-card-context">${escapeHtml(contextText)}</span>
                    <button class="smart-card-launch-btn" ${item.isRecent ? 'style="color: #9AA0A6;"' : ''}>Open</button>
                </div>
            `;

            // Delete badge triggers in edit mode
            const delBtn = card.querySelector('.card-delete-badge');
            if (editModeFavorites) delBtn.style.display = 'flex';
            
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.isRecent) {
                    deleteRecentLaunch(item.id);
                } else {
                    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                        let updatedFavs = getFavorites().filter(f => f.id !== item.id);
                        saveFavorites(updatedFavs);
                    }
                }
            });

            setupCardInteraction(card, item, item.isRecent, false);
            carousel.appendChild(card);
        });

        // Add Pinned card Add-Button at the end of the carousel
        const addCard = document.createElement('div');
        addCard.className = 'smart-card add-favorite-card';
        addCard.innerHTML = `
            <div class="add-card-icon">+</div>
            <span class="add-card-label">Add</span>
        `;
        
        addCard.addEventListener('click', () => {
            triggerHapticFeedback();
            document.getElementById('fav-url-input').value = document.getElementById('url-input').value;
            document.getElementById('fav-label-input').value = '';
            document.getElementById('fav-modal-title').textContent = 'Add to Favorites';
            selectedIsQuickApp = false;
            selectedItem = null;
            openModal('modal-add-favorite');
        });

        carousel.appendChild(addCard);
    }

    // --- Quick Apps Dynamic Render ---
    function renderQuickApps() {
        const grid = document.getElementById('quick-apps-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const apps = getQuickApps();

        apps.forEach(app => {
            const btn = document.createElement('button');
            btn.className = 'quick-app-btn';
            btn.setAttribute('data-id', app.id);
            
            const faviconUrl = getFaviconUrl(app.url);

            let iconHtml = `<img src="${faviconUrl}" onerror="faviconFallback(this)" alt="${escapeHtml(app.name)}">`;
            if (app.id === 'qa-iptv') {
                iconHtml = `<span class="material-symbols-outlined quick-app-symbol">tv</span>`;
            }

            btn.innerHTML = `
                <span class="card-delete-badge" role="button" aria-label="Delete">&times;</span>
                ${iconHtml}
                <span>${escapeHtml(app.name)}</span>
            `;

            // Delete badge triggers in edit mode
            const delBtn = btn.querySelector('.card-delete-badge');
            if (app.id === 'qa-iptv') {
                delBtn.style.display = 'none';
            } else if (editModeQuickApps) {
                delBtn.style.display = 'flex';
            }
            
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (app.id === 'qa-iptv') return;
                if (confirm(`Remove Quick App ${app.name}?`)) {
                    let updatedApps = getQuickApps().filter(a => a.id !== app.id);
                    saveQuickApps(updatedApps);
                }
            });

            setupCardInteraction(btn, app, false, true);
            grid.appendChild(btn);
        });

        // Append the Add button to the grid (unconditionally to preserve visibility/discoverability)
        const addBtn = document.createElement('button');
        addBtn.className = 'quick-app-btn add-quick-app-btn';
        addBtn.innerHTML = `
            <span class="add-card-icon">+</span>
            <span class="add-card-label">Add</span>
        `;
        
        addBtn.addEventListener('click', () => {
            triggerHapticFeedback();
            document.getElementById('fav-url-input').value = document.getElementById('url-input').value;
            document.getElementById('fav-label-input').value = '';
            document.getElementById('fav-modal-title').textContent = 'Add to Quick Apps';
            selectedIsQuickApp = true;
            selectedItem = null;
            openModal('modal-add-favorite');
        });
        grid.appendChild(addBtn);
    }

    // Handles tap vs long press for tactile comfort
    function setupCardInteraction(element, item, isRecent, isQuickApp) {
        let pressTimer = null;
        let isLongPress = false;
        let isScrolling = false;

        const startPress = (e) => {
            if (e.target.closest('.card-delete-badge')) return;
            if (item.id === 'qa-iptv') return; // Enforce no long-press options for IPTV
            isLongPress = false;
            isScrolling = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                triggerHapticFeedback();
                openOptionsModal(item, isRecent, isQuickApp);
            }, settings.longPressDuration);
        };

        const movePress = () => {
            isScrolling = true;
            clearTimeout(pressTimer);
        };

        const endPress = (e) => {
            if (e.target.closest('.card-delete-badge')) return;
            clearTimeout(pressTimer);
            if (isScrolling) return;

            if (!isLongPress) {
                triggerHapticFeedback();
                if (item.id === 'qa-iptv') {
                    openModal('modal-iptv-selector');
                    return;
                }
                // Launch last URL context if saved, otherwise default url
                const targetUrl = item.lastUrl || item.url;
                launch(targetUrl, item.launchMode || 'optimized');
            }
        };

        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', endPress);
        element.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        element.addEventListener('touchstart', startPress, { passive: true });
        element.addEventListener('touchmove', movePress, { passive: true });
        element.addEventListener('touchend', endPress, { passive: true });
    }

    // ==========================================================================
    // Modals Control Router
    // ==========================================================================

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Bind close listeners for all overlays
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHapticFeedback();
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Close on backdrop touch (safe keyboard dismiss on form fields)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                if (overlay.id === 'modal-add-favorite' || overlay.id === 'modal-settings') {
                    // Safety blur active element to dismiss Tesla virtual keyboard
                    if (document.activeElement) document.activeElement.blur();
                    return;
                }
                triggerHapticFeedback();
                overlay.classList.add('hidden');
            }
        });
    });

    // Pinned trigger links
    document.getElementById('btn-help').addEventListener('click', () => {
        triggerHapticFeedback();
        openModal('modal-help');
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
        triggerHapticFeedback();
        openModal('modal-settings');
    });

    // Edit Favorites Button
    const btnEditFavs = document.getElementById('btn-edit-favorites');
    btnEditFavs.addEventListener('click', () => {
        triggerHapticFeedback();
        editModeFavorites = !editModeFavorites;
        btnEditFavs.classList.toggle('active', editModeFavorites);
        btnEditFavs.textContent = editModeFavorites ? 'Done' : 'Edit';
        renderFavorites();
    });

    // Edit Quick Apps Button
    const btnEditQuickApps = document.getElementById('btn-edit-quick-apps');
    btnEditQuickApps.addEventListener('click', () => {
        triggerHapticFeedback();
        editModeQuickApps = !editModeQuickApps;
        btnEditQuickApps.classList.toggle('active', editModeQuickApps);
        btnEditQuickApps.textContent = editModeQuickApps ? 'Done' : 'Edit';
        renderQuickApps();
    });

    // ==========================================================================
    // Favorite / Quick App Modification Save Overlay
    // ==========================================================================

    document.getElementById('btn-save-favorite').addEventListener('click', async () => {
        triggerHapticFeedback();
        const url = document.getElementById('fav-url-input').value.trim();
        const name = document.getElementById('fav-label-input').value.trim();
        
        if (!url) {
            const urlInput = document.getElementById('fav-url-input');
            urlInput.classList.add('shake-anim');
            urlInput.focus();
            setTimeout(() => urlInput.classList.remove('shake-anim'), 400);
            return;
        }

        const cleanUrl = normalizeUrl(url);
        const cleanName = name || cleanUrl.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
        const defaultIcon = 'globe';
        
        if (selectedIsQuickApp) {
            let apps = getQuickApps();
            if (selectedItem && selectedItem.id) {
                // Edit existing app
                apps = apps.map(a => {
                    if (a.id === selectedItem.id) {
                        return { ...a, name: cleanName, url: cleanUrl, icon: defaultIcon };
                    }
                    return a;
                });
            } else {
                // Add new app
                apps.push({
                    id: 'qa-' + Date.now(),
                    name: cleanName,
                    url: cleanUrl,
                    icon: defaultIcon,
                    lastOpened: 0
                });
            }
            saveQuickApps(apps);
        } else {
            let favs = getFavorites();
            if (selectedItem && selectedItem.id && !selectedIsRecent) {
                // Edit existing favorite
                favs = favs.map(f => {
                    if (f.id === selectedItem.id) {
                        return {
                            ...f,
                            name: cleanName,
                            url: cleanUrl,
                            icon: defaultIcon,
                            lastUrl: cleanUrl,
                            lastContext: 'Edited URL'
                        };
                    }
                    return f;
                });
            } else {
                // Add new favorite
                favs.push({
                    id: 'fav-' + Date.now(),
                    name: cleanName,
                    url: cleanUrl,
                    icon: defaultIcon,
                    lastUrl: cleanUrl,
                    lastContext: 'Direct launch',
                    launchMode: 'optimized',
                    lastOpened: 0
                });
            }
            saveFavorites(favs);
        }

        closeModal('modal-add-favorite');
        selectedItem = null;
    });

    // ==========================================================================
    // Options Overlay Actions Controller
    // ==========================================================================

    function openOptionsModal(item, isRecent = false, isQuickApp = false) {
        selectedItem = item;
        selectedIsQuickApp = isQuickApp;
        selectedIsRecent = isRecent;
        
        openModal('modal-options');

        const optEdit = document.getElementById('opt-edit');
        const optDelete = document.getElementById('opt-delete');
        const optMoveLeft = document.getElementById('opt-move-left');
        const optMoveRight = document.getElementById('opt-move-right');
        
        // Hide reordering elements for dynamically sorted favorites & recents
        if (isQuickApp) {
            optMoveLeft.style.display = 'flex';
            optMoveRight.style.display = 'flex';
            optEdit.style.display = 'flex';
            optDelete.textContent = 'Remove Quick App';
            
            // Check boundary positions to disable moving out of bounds
            const apps = getQuickApps();
            const idx = apps.findIndex(a => a.id === item.id);
            if (idx <= 0) {
                optMoveLeft.style.opacity = '0.3';
                optMoveLeft.style.pointerEvents = 'none';
            } else {
                optMoveLeft.style.opacity = '1';
                optMoveLeft.style.pointerEvents = 'auto';
            }
            if (idx === -1 || idx >= apps.length - 1 || apps[idx + 1].id === 'qa-iptv') {
                optMoveRight.style.opacity = '0.3';
                optMoveRight.style.pointerEvents = 'none';
            } else {
                optMoveRight.style.opacity = '1';
                optMoveRight.style.pointerEvents = 'auto';
            }
        } else {
            optMoveLeft.style.display = 'none';
            optMoveRight.style.display = 'none';
            
            if (isRecent) {
                optEdit.style.display = 'none';
                optDelete.textContent = 'Remove from Recents';
            } else {
                optEdit.style.display = 'flex';
                optDelete.textContent = 'Delete Favorite';
            }
        }
    }

    document.getElementById('opt-direct').addEventListener('click', () => {
        if (selectedItem) {
            triggerHapticFeedback();
            const targetUrl = selectedItem.lastUrl || selectedItem.url;
            launch(targetUrl, 'direct');
            closeModal('modal-options');
        }
    });

    document.getElementById('opt-optimized').addEventListener('click', () => {
        if (selectedItem) {
            triggerHapticFeedback();
            const targetUrl = selectedItem.lastUrl || selectedItem.url;
            launch(targetUrl, 'optimized');
            closeModal('modal-options');
        }
    });

    document.getElementById('opt-helper-login').addEventListener('click', () => {
        if (selectedItem) {
            triggerHapticFeedback();
            const helperUrl = getHelperLoginUrl(selectedItem.url);
            launch(helperUrl, 'optimized');
            closeModal('modal-options');
        }
    });

    document.getElementById('opt-copy').addEventListener('click', () => {
        if (selectedItem) {
            triggerHapticFeedback();
            const targetUrl = getOptimizedUrl(selectedItem.lastUrl || selectedItem.url);
            navigator.clipboard.writeText(targetUrl).then(() => {
                const textEl = document.getElementById('opt-copy').querySelector('.modal-action-name');
                const originalText = textEl.textContent;
                textEl.textContent = 'Link copied!';
                setTimeout(() => {
                    textEl.textContent = originalText;
                    closeModal('modal-options');
                }, 800);
            }).catch(() => {
                alert('Copying failed.');
            });
        }
    });

    // Reorder Shift Left
    document.getElementById('opt-move-left').addEventListener('click', () => {
        if (selectedItem && selectedIsQuickApp) {
            triggerHapticFeedback();
            let apps = getQuickApps();
            const idx = apps.findIndex(a => a.id === selectedItem.id);
            if (idx > 0) {
                // Swap position
                const temp = apps[idx];
                apps[idx] = apps[idx - 1];
                apps[idx - 1] = temp;
                saveQuickApps(apps);
            }
            closeModal('modal-options');
        }
    });

    // Reorder Shift Right
    document.getElementById('opt-move-right').addEventListener('click', () => {
        if (selectedItem && selectedIsQuickApp) {
            triggerHapticFeedback();
            let apps = getQuickApps();
            const idx = apps.findIndex(a => a.id === selectedItem.id);
            if (idx !== -1 && idx < apps.length - 1 && apps[idx + 1].id !== 'qa-iptv') {
                // Swap position
                const temp = apps[idx];
                apps[idx] = apps[idx + 1];
                apps[idx + 1] = temp;
                saveQuickApps(apps);
            }
            closeModal('modal-options');
        }
    });

    document.getElementById('opt-edit').addEventListener('click', () => {
        if (selectedItem) {
            triggerHapticFeedback();
            closeModal('modal-options');
            
            document.getElementById('fav-url-input').value = selectedItem.url;
            document.getElementById('fav-label-input').value = selectedItem.name;
            document.getElementById('fav-modal-title').textContent = selectedIsQuickApp ? 'Edit Quick App' : 'Edit Favorite';
            
            openModal('modal-add-favorite');
        }
    });

    document.getElementById('opt-delete').addEventListener('click', () => {
        if (selectedItem) {
            triggerHapticFeedback();
            closeModal('modal-options');
            
            if (selectedIsRecent) {
                deleteRecentLaunch(selectedItem.id);
            } else if (selectedIsQuickApp) {
                if (confirm(`Remove Quick App ${selectedItem.name}?`)) {
                    let updatedApps = getQuickApps().filter(a => a.id !== selectedItem.id);
                    saveQuickApps(updatedApps);
                }
            } else {
                if (confirm(`Delete Favorite ${selectedItem.name}?`)) {
                    let updatedFavs = getFavorites().filter(f => f.id !== selectedItem.id);
                    saveFavorites(updatedFavs);
                }
            }
        }
    });

    // ==========================================================================
    // UI Console Input Listeners & Keyboard Assists
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
        triggerHapticFeedback();
        urlInput.value = '';
        updateClearButtonState();
        urlInput.focus();
    });

    assistButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHapticFeedback();
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

    if (btnDirect) {
        btnDirect.addEventListener('click', () => {
            triggerHapticFeedback();
            launch(urlInput.value, 'direct');
        });
    }
    btnOptimized.addEventListener('click', () => {
        triggerHapticFeedback();
        launch(urlInput.value, 'optimized');
    });
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            triggerHapticFeedback();
            launch(urlInput.value, 'optimized');
        }
    });

    // ==========================================================================
    // System Settings Controller
    // ==========================================================================

    function applySettings() {
        document.getElementById('vibration-toggle').checked = settings.vibrationEnabled;
        document.getElementById('long-press-slider').value = settings.longPressDuration;
        document.getElementById('long-press-value').textContent = settings.longPressDuration + 'ms';
        
        const segButtons = document.querySelectorAll('#time-format-control .segment-btn');
        segButtons.forEach(btn => {
            const val = btn.getAttribute('data-value');
            if ((val === '24h' && settings.timeFormat24h) || (val === '12h' && !settings.timeFormat24h)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const currentTheme = getResolvedTheme();
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        const themeToggle = document.getElementById('btn-theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = currentTheme === 'light' ? 'light_mode' : 'dark_mode';
            themeToggle.setAttribute('aria-label', currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
            themeToggle.title = settings.theme === 'auto'
                ? `System theme: ${currentTheme}`
                : `Theme: ${currentTheme}`;
        }

        updateClockDisplay();
    }

    function saveSettings() {
        localStorage.setItem('teslaLauncherSettings_v4', JSON.stringify(settings));
        applySettings();
    }

    function updateClockDisplay() {
        const clockEl = document.querySelector('.header-clock');
        if (!clockEl) return;

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        if (!settings.timeFormat24h) {
            const ampm = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours === 0 ? 12 : hours;
            clockEl.textContent = `${hours}:${minutes}:${seconds}${ampm}`;
        } else {
            clockEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
        }

        const dateEl = document.querySelector('.header-date');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    document.getElementById('vibration-toggle').addEventListener('change', (e) => {
        settings.vibrationEnabled = e.target.checked;
        saveSettings();
        triggerHapticFeedback();
    });

    const longPressSlider = document.getElementById('long-press-slider');
    longPressSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        settings.longPressDuration = val;
        document.getElementById('long-press-value').textContent = val + 'ms';
    });
    longPressSlider.addEventListener('change', () => {
        saveSettings();
        triggerHapticFeedback();
    });

    document.querySelectorAll('#time-format-control .segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHapticFeedback();
            const value = btn.getAttribute('data-value');
            settings.timeFormat24h = (value === '24h');
            saveSettings();
        });
    });

    const themeToggle = document.getElementById('btn-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            triggerHapticFeedback();
            settings.theme = getResolvedTheme() === 'dark' ? 'light' : 'dark';
            saveSettings();
        });
    }

    if (systemThemeQuery) {
        systemThemeQuery.addEventListener('change', () => {
            if (settings.theme === 'auto') {
                applySettings();
            }
        });
    }

    // Fullscreen Launcher Header Button click event
    document.getElementById('btn-fullscreen-launcher').addEventListener('click', () => {
        triggerHapticFeedback();
        launch(window.location.href, 'optimized');
    });

    document.getElementById('btn-reset-settings').addEventListener('click', () => {
        if (confirm('Reset all settings to default?')) {
            settings = {...defaultSettings};
            saveSettings();
            triggerHapticFeedback();
        }
    });

    // Reset redirect animation state on pageshow (e.g. user goes back in history)
    window.addEventListener('pageshow', () => {
        const redirectScreen = document.getElementById('view-redirect');
        if (redirectScreen) redirectScreen.classList.add('hidden');
        const progress = document.getElementById('redirect-progress');
        if (progress) progress.style.width = '0%';
    });

    // IPTV Selector Modal Web Player Choices click event
    document.querySelectorAll('.iptv-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHapticFeedback();
            closeModal('modal-iptv-selector');
            const playerUrl = btn.getAttribute('data-url');
            launch(playerUrl, 'optimized');
        });
    });

    // ==========================================================================
    // Initialization
    // ==========================================================================

    applySettings();
    setInterval(updateClockDisplay, 1000);
    renderFavorites();
    renderQuickApps();
    updateClearButtonState();

});
