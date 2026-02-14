# 🚀 Deployment Guide - GitHub Pages

This guide explains how to deploy DevCoffee to GitHub Pages at https://m1xxos.github.io/coffe-game/

## Prerequisites

The repository includes:
- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)
- ✅ `.nojekyll` file to disable Jekyll processing
- ✅ Relative paths in HTML/CSS/JS files

## Important Note: Repository Name

To deploy at `https://m1xxos.github.io/coffe-game/`, you have two options:

### Option 1: Create a New Repository (Recommended)

1. Create a new repository named exactly `coffe-game`
2. Copy all game files from DevCoffee to the new repository:
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
   - `.github/workflows/deploy.yml`
   - `.nojekyll`
3. Push to the new repository
4. Follow the setup steps below

### Option 2: Use DevCoffee Repository

If you keep this repository as `DevCoffee`, the URL will be:
- `https://m1xxos.github.io/DevCoffee/`

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Build and deployment**:
   - **Source**: Select **"GitHub Actions"**
5. Save the settings

### 2. Merge the PR

1. Merge the pull request with the GitHub Pages configuration
2. The GitHub Actions workflow will automatically trigger

### 3. Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (green checkmark)
4. The deployment URL will be shown in the workflow output

### 4. Access Your Game

Once deployed, your game will be available at:
- If repository is `coffe-game`: https://m1xxos.github.io/coffe-game/
- If repository is `DevCoffee`: https://m1xxos.github.io/DevCoffee/

## Automatic Updates

After initial setup, every push to the `copilot/create-barista-browser-game` branch will automatically trigger a new deployment.

To deploy from a different branch (e.g., `main`), edit `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main  # Change this to your desired branch
```

## Troubleshooting

### Workflow Fails

- Check the **Actions** tab for error messages
- Ensure Pages is enabled in Settings
- Verify permissions are correct in workflow file

### 404 Page Not Found

- Wait a few minutes after deployment
- Check the deployment URL in Actions output
- Ensure `.nojekyll` file exists
- Clear browser cache

### CSS/JS Not Loading

- Verify all paths are relative (not absolute)
- Check browser console for errors
- Ensure files are committed to the repository

## Manual Testing

To test the deployment locally with the subdirectory path:

```bash
# Start local server
python3 -m http.server 8080

# Open in browser:
http://localhost:8080/
```

All relative paths should work correctly in both local and GitHub Pages environments.

## Repository Structure

```
DevCoffee/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Deployment workflow
├── .nojekyll               # Disable Jekyll
├── index.html              # Main game file
├── style.css               # Styles
├── game.js                 # Game logic
├── README.md               # Project documentation
└── DEPLOYMENT.md           # This file
```

---

**Note**: If you want the exact URL `https://m1xxos.github.io/coffe-game/`, please create a new repository named `coffe-game` and copy these files there.
