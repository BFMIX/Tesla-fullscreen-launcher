# Tesla Fullscreen Launcher

An ultra-lightweight, high-performance static web application specifically optimized for Tesla's in-car web browser (running on both Intel Atom/MCU2 and AMD Ryzen/MCU3 systems).

## 🚗 How to Use on Tesla

1. Open your Tesla's web browser
2. Navigate to your deployed Tesla Fullscreen Launcher URL (e.g., `https://yourusername.github.io/tesla-fullscreen-launcher/`)
3. Use the touch-friendly interface to:
   - Enter URLs directly or use quick-access buttons (.com, twitch.tv/, etc.)
   - Save frequently visited sites as favorites
   - Launch websites in optimized fullscreen mode using YouTube's theater mode

## 🔑 Features

- **Zero Dependencies**: Pure HTML/CSS/Vanilla JavaScript - no frameworks or build tools
- **Ultra-Lightweight**: Under 50KB total payload for fast loading on Tesla's hardware
- **Touch Optimized**: All touch targets meet Tesla's recommended 48px minimum size
- **Session Persistent**: Uses localStorage to preserve favorites and browsing history
- **YouTube Theater Mode**: Leverages YouTube's redirect URL to trigger Tesla's borderless YouTube Theater App for true fullscreen experience
- **Direct Launch Support**: Launch specific websites instantly via URL parameters
- **GitHub Pages Ready**: One-click deployment via GitHub Actions

## 🎬 One-Tap Launch via URL Parameters

Create instant one-tap bookmarks for your favorite services by combining:
1. Your deployed launcher URL
2. The `launch` parameter
3. The target website URL

**Format**: `https://yourusername.github.io/tesla-fullscreen-launcher/?launch=[TARGET_URL]`

**Example** - One-tap Netflix launch:
```
https://yourusername.github.io/tesla-fullscreen-launcher/?launch=https://www.netflix.com
```

**Example** - One-tap Spotify launch:
```
https://yourusername.github.io/tesla-fullscreen-launcher/?launch=https://open.spotify.com
```

**Tip**: For YouTube-optimized sites, the launcher automatically detects YouTube domains and uses the optimal redirect method.

## ⭐ Favorites Management

### Adding Favorites
1. Navigate to a website using the launcher
2. Click the ⭐ (star) button in the toolbar
3. The site is saved with:
   - Website name (from page title)
   - URL
   - Favicon (automatically fetched)
   - Launch mode preference (YouTube optimized or direct)

### Managing Favorites
- Access your favorites from the main menu (☰ → Favorites)
- Rearrange by dragging and dropping
- Remove by swiping left or clicking the delete button (with confirmation)
- Each favorite shows:
  - Site favicon
  - Website name
  - Launch mode indicator (🚀 for YouTube optimized, ↔️ for direct)

## ⚙️ Settings

Access settings via the gear icon (⚙️) in the header:

### Appearance
- **Theme**: Tesla Premium Dark (optimized for night driving)
- **Touch Targets**: All interactive elements ≥48px for safe use while driving

### Privacy & Data
- **Data Storage**: All data (favorites, history) stored locally in your Tesla's browser
- **No Tracking**: Zero analytics, no external requests except for favicon fetching and site navigation
- **Data Export/Import**: Coming soon (see planned features)

### Advanced
- **URL Validation**: Automatic URL formatting and safety checks
- **YouTube Detection**: Smart domain matching for youtube.com, youtu.be, and embedded players

## 🔒 Session & Authentication Preservation

Unlike iframe-based solutions, this launcher preserves your login sessions because:

1. **Top-Level Navigation**: All navigations use `window.location.href` - same as typing manually
2. **No Iframes**: Avoids third-party cookie restrictions and DRM issues (Widevine works perfectly)
3. **Direct Connections**: All requests go straight from your Tesla to destination servers
4. **Isolated Profiles**: Note that Tesla's standard browser and YouTube Theater App use separate Chromium profiles - log in directly while in Theater mode to persist sessions there

## 🚀 GitHub Actions Deployment

This repository includes a pre-configured GitHub Actions workflow for effortless deployment to GitHub Pages:

### Setup Instructions
1. Fork or clone this repository
2. Rename repository to `tesla-fullscreen-launcher` (or your preferred name)
3. Push to your GitHub account
4. Go to Repository Settings → Pages
5. Under "Build and deployment":
   - Source: **GitHub Actions**
6. Push to `main` branch to trigger deployment
7. Your site will be live at: `https://yourusername.github.io/tesla-fullscreen-launcher/`

### Workflow Details (`.github/workflows/deploy.yml`)
- Triggered on pushes to `main`/`master` branches
- Uses official `actions/deploy-pages@v4` action
- Deploys entire repository as static site
- Includes concurrency management to prevent deployment conflicts

## 🛠️ Technical Implementation

### Core Technologies
- **HTML5**: Semantic markup with ARIA labels for accessibility
- **CSS3**: CSS Grid/Flexbox layout with Tesla-optimized touch targets
- **Vanilla ES6 JavaScript**: No frameworks, minimal DOM manipulation
- **localStorage API**: Persistent storage for favorites and history
- **Fetch API**: Asynchronous favicon retrieval with proper error handling

### Key Functions
- `normalizeUrl()`: Ensures proper URL formatting (handles http/https, www, etc.)
- `isYouTube()`: Robust YouTube domain detection (includes youtu.be, embed, etc.)
- `fetchFavicon()`: Asynchronously retrieves site icons via Google's S2 service
- `isSafeUrl()`: URL validation to prevent CSS injection
- `saveFavorite()` / `deleteFavorite()`: localStorage persistence with confirmation
- `saveHistoryItem()`: Automatic history tracking with deduplication

### Performance Optimizations
- Minimal DOM updates (uses `textContent` instead of `innerHTML` where appropriate)
- Event delegation for touch handlers
- CSS transforms for smooth animations
- Efficient localStorage usage with JSON serialization

## 📱 Touch Interface Guidelines

All interactive elements follow Tesla's recommended touch target guidelines:
- Minimum 48px × 48px touch targets
- Adequate spacing between interactive elements
- Large tap areas for buttons (⭐, 🚀, ⚙️, etc.)
- Swipe gestures for quick actions (delete favorite/history)

## 🔮 Planned Features

- [ ] Import/Export favorites as JSON
- [ ] Settings modal (vibration toggle, long-press sensitivity, time format)
- [ ] Haptic feedback on successful actions
- [ ] Enhanced progress bar reflecting actual load state
- [ ] Dark/Light theme toggle (respecting Tesla's system preferences)

---

**Made with ❤️ for Tesla owners**  
*Enjoy safer, more enjoyable touchscreen interactions in your Tesla!*