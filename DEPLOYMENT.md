# GitHub Pages Deployment Guide

This guide explains how to deploy the Expense Manager app to GitHub Pages.

## Automatic Deployment (Recommended)

The app is configured with GitHub Actions for automatic deployment. Every push to the `main` branch will trigger a deployment.

### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to: **Settings** → **Pages**
   - Under "Build and deployment":
     - **Source**: Select "GitHub Actions"
   - Save the settings

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Once complete (green checkmark), your app will be live!

4. **Access your app:**
   - Your app will be available at: `https://arupkumargupta.github.io/ledger/`
   - Or check the deployment URL in the Actions workflow output

## Manual Deployment (Alternative)

If you prefer to deploy manually using gh-pages:

```bash
# Build and deploy
yarn deploy
```

This will:
1. Build the production bundle
2. Deploy to the `gh-pages` branch
3. Make it available at the GitHub Pages URL

**Note:** For manual deployment, you need to configure GitHub Pages to use the `gh-pages` branch:
- Go to **Settings** → **Pages**
- **Source**: Select "Deploy from a branch"
- **Branch**: Select `gh-pages` and `/ (root)`

## Configuration Details

### Base Path
The app is configured with base path `/ledger/` in `vite.config.ts` to match the repository name.

### Build Output
- Built files are generated in the `dist/` directory
- The `.nojekyll` file prevents Jekyll processing on GitHub Pages

### Environment
- The app runs entirely in the browser
- All data is stored in localStorage
- No backend server required

## Troubleshooting

### Deployment fails
- Check the Actions tab for error logs
- Ensure you have enabled GitHub Pages
- Verify the repository has Pages enabled in Settings

### App shows blank page
- Check browser console for errors
- Verify the base path matches your repository name
- Clear browser cache and hard reload

### Assets not loading
- Ensure `base: '/ledger/'` is set in `vite.config.ts`
- Verify all asset paths are relative, not absolute

## Local Testing

To test the production build locally:

```bash
# Build the app
yarn build

# Preview the production build
yarn preview
```

The preview will be available at `http://localhost:4173/ledger/`

## Updates

To update the deployed app:

1. Make your changes locally
2. Test thoroughly
3. Commit and push to main:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. GitHub Actions will automatically rebuild and deploy

## Monitoring

- **Actions tab**: View deployment status and logs
- **Deployments**: Check deployment history in the repository sidebar
- **Pages settings**: View the current deployment URL and status

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Enter your custom domain
3. Follow GitHub's instructions to configure DNS
4. Update the `base` in `vite.config.ts` to `/` instead of `/ledger/`

---

**Live URL:** https://arupkumargupta.github.io/ledger/

**Repository:** https://github.com/arupKumarGupta/ledger

