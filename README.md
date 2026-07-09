# 🚗 Tesla Fullscreen Launcher

A premium, touch-optimized Single Page Application (SPA) designed to load streaming media and web content in borderless fullscreen mode natively within your Tesla's in-car web browser.

Styled to match the Tesla Native OS HMI, the entire interface fits on a single, non-scrolling screen (optimized for a 900px landscape viewport) with oversized touch targets and snappy micro-interactions.

---

## 🔑 Key Features

- **Tesla Native HMI Aesthetics**: Minimalist slate dark theme (`#0F0F12` background) with Exo 2 and Inter typography, matching the car's native software controls.
- **Touch-Optimized (Haptic Comfort)**: Giant 60px touch targets for buttons, inputs, and quick-action cards, making interactions easy while parked or during charging sessions.
- **Smart Cards (Memory Recall)**: Pinned favorites and recent launches dynamically track your last visited context (e.g. *Last channel: otplol* for Twitch, *Last video* for YouTube, or *Last server* for Plex). Tap to instantly resume where you left off.
- **Automatic Fullscreen Breakout**: Seamlessly leverages YouTube's media redirect mechanism to trigger Tesla's borderless media player container for true fullscreen video streaming.
- **DRM & Authentication Preservation**: Uses top-level browser redirection rather than iframes. This preserves your active logins and guarantees Widevine DRM support (Netflix, Disney+, and Plex play in full HD without restrictions).
- **Assisted Login Gateway**: Solves login window popup blocking caused by the Tesla browser's sandbox. Access the dedicated "Assisted Login" launcher menu to sign in to Canal+, Netflix, or Google beforehand.
- **100% Client-Side Privacy**: No external trackers, servers, or database connections. All settings, favorites, and history contexts are stored locally in your vehicle's browser `localStorage`.

---

## 🎬 One-Tap Launch via URL Bookmarks

You can launch specific apps or URLs directly in fullscreen with a single tap by bookmarking a custom URL. This bypasses the launcher home screen entirely—ideal for creating direct home-screen shortcuts or assigning specific bookmarks inside the vehicle.

### Format
Combine your deployed launcher URL with the `launch` parameter and the destination website address:
```
https://[YOUR_GITHUB_USERNAME].github.io/tesla-fullscreen-launcher/?launch=[TARGET_URL]
```

### Live Examples

- **One-tap Netflix Launch**:
  ```
  https://bfmix.github.io/tesla-fullscreen-launcher/?launch=https://www.netflix.com
  ```
- **One-tap Plex Launch**:
  ```
  https://bfmix.github.io/tesla-fullscreen-launcher/?launch=https://app.plex.tv/desktop
  ```
- **One-tap Disney+ Launch**:
  ```
  https://bfmix.github.io/tesla-fullscreen-launcher/?launch=https://www.disneyplus.com
  ```

> [!TIP]
> The launcher automatically parses the target URL. If a YouTube, Twitch, or Plex domain is detected, it handles redirects using optimized player settings to load theater view immediately.

---

## ⚙️ In-Car Customization Settings

Configure the launcher directly from the floating settings panel (Gear icon ⚙️ in the header):
- **Haptic Touch Toggle**: Toggle a brief physical click vibration feedback on successful touchscreen taps.
- **Long-Press Threshold Slider**: Adjust the hold duration (from 500ms to 2000ms) required to open the options dialog for favorites.
- **Segmented Time Format Control**: Swap between 24h and 12h clock display.

---

## 🚀 Easy GitHub Pages Deployment

Deploy your own private instance of the launcher in less than 2 minutes using the pre-configured GitHub Actions workflow:

1. **Fork or Clone** this repository to your GitHub account.
2. Go to your repository's **Settings** tab.
3. Select **Pages** from the sidebar.
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** from the dropdown menu.
5. Push any commit to the `main` branch. The action will automatically deploy your live launcher site to:
   `https://[YOUR_GITHUB_USERNAME].github.io/tesla-fullscreen-launcher/`

---

## 🛠️ Under the Hood

- **Pure Static Stack**: Written in plain HTML5, Vanilla ES6 JavaScript, and custom CSS3. No framework payloads (React/Vue), compilation, or npm installs are required to build the app, keeping page size under 50KB.
- **Dynamic Icons**: Feeds domain URLs through Google's S2 API to fetch and render high-resolution site favicons dynamically, with standard fallback handlers.
- **Redirection Progress Screen**: Displays a loading indicator while triggering YouTube redirection, making transition flows feel seamless and integrated.