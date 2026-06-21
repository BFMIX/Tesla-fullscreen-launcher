# Tesla Fullscreen Launcher

An ultra-lightweight, high-performance static web application specifically optimized for Tesla's in-car web browser (running on both Intel Atom/MCU2 and AMD Ryzen/MCU3 systems).

---

## Project Structure

This project is a 100% client-side application with zero backend or external dependencies.

*   [index.html](file:///Users/bfmix/Desktop/DEv/Project/Tesla%20Real%20FullScreen/index.html) - Structural framework, touch interfaces, and documentation cards.
*   [style.css](file:///Users/bfmix/Desktop/DEv/Project/Tesla%20Real%20FullScreen/style.css) - Tesla Premium Dark styling, optimized touch targets, and layout grids.
*   [app.js](file:///Users/bfmix/Desktop/DEv/Project/Tesla%20Real%20FullScreen/app.js) - URL rewriter engine, history logging, query string parser, and `localStorage` favorites persistency.
*   [.github/workflows/deploy.yml](file:///Users/bfmix/Desktop/DEv/Project/Tesla%20Real%20FullScreen/.github/workflows/deploy.yml) - CI/CD pipeline configuration for automated deployment to GitHub Pages.
*   [.gitignore](file:///Users/bfmix/Desktop/DEv/Project/Tesla%20Real%20FullScreen/.gitignore) - Standard ignore patterns.

---

## How It Works

This tool helps launch URLs in a clean fullscreen window by taking advantage of the way Tesla's operating system handles specific media containers.

1.  **Launch Console:** The user inputs a URL (or search query) using touch-assist helpers (like `.com` and `twitch.tv/` keys) designed to bypass Tesla's clunky virtual keyboard.
2.  **Open Direct (🚀):** Navigates to the URL directly within the current browser tab. Useful for websites with native fullscreen capabilities.
3.  **Open Optimized (🎬):** 
    *   If the target URL is a **YouTube** domain, the engine wraps it in a YouTube redirect URL: `https://www.youtube.com/redirect?q=ENCODED_TARGET_URL`.
    *   This forces the Tesla OS to launch the borderless **YouTube Theater App** container, loading the target URL without the browser address bar or status bars.
    *   For other domains (like Twitch or Plex), it opens them directly to maximize compatibility.

---

## 🔒 Session & Authentication Preservation (Browser Integrity)

A major technical constraint of building for embedded browsers is preserving authentication states (logins for Plex, Twitch, Netflix, Disney+, etc.) and avoiding age-verification blocks.

To guarantee that your cookies and sessions are never broken or lost:
*   **100% Top-Level Navigation:** All links and targets are loaded using standard, top-level transitions (`window.location.href`).
*   **No Iframes:** We do not embed external sites in `<iframe>` tags. This ensures cookies are never blocked as third-party, and Widevine DRM works natively.
*   **No Traffic Proxying:** All network requests go directly from your Tesla browser to the destination servers, preserving local sessions and keeping credentials secure.

*Note: Session data and logins are stored natively in the Tesla browser profile. Because the standard browser and the Theater YouTube container run in separate Chromium profiles inside the Tesla OS, logins made in standard mode will not carry over to Theater mode. Log in directly while in fullscreen Theater mode to persist sessions there.*

---

## 🎬 Tesla 1-Tap Direct Fullscreen Bookmarks (Frictionless Launch)

The launcher supports **Instant Direct Launch via URL parameters** (`?launch=...` or `?url=...`). This allows you to bookmark individual services in fullscreen on your Tesla browser without having to load the main dashboard first.

### How to create a 1-Tap Fullscreen Bookmark:
Combine the YouTube redirect, your hosted launcher, and the target URL:
```text
https://www.youtube.com/redirect?q=[YOUR_LAUNCHER_URL]/?launch=[TARGET_URL]
```
For example, to launch **Netflix** in fullscreen in 1 tap, bookmark this URL in your Tesla browser:
```text
https://www.youtube.com/redirect?q=https://username.github.io/tesla-fullscreen-launcher/?launch=https://www.netflix.com
```
When you open this bookmark, it redirects through YouTube, hits your launcher, detects the `launch` parameter, and instantly loads Netflix in borderless fullscreen.

---

## 🚀 GitHub Actions Deployment (Ready to Ship)

This repository includes a pre-configured GitHub Actions workflow in [.github/workflows/deploy.yml](file:///Users/bfmix/Desktop/DEv/Project/Tesla%20Real%20FullScreen/.github/workflows/deploy.yml).

### To Deploy on GitHub Pages:
1.  Create a new repository on GitHub (e.g., `tesla-fullscreen-launcher`).
2.  Push these files to the repository's `main` (or `master`) branch:
    ```bash
    git init
    git add .
    git commit -m "Initialize Tesla Fullscreen Launcher"
    git remote add origin https://github.com/your-username/tesla-fullscreen-launcher.git
    git branch -M main
    git push -u origin main
    ```
3.  On GitHub, go to your repository settings -> **Pages**.
4.  Under **Build and deployment**, set the source to **GitHub Actions**.
5.  Every push to `main` will now automatically deploy the launcher to:
    `https://your-username.github.io/tesla-fullscreen-launcher/`
