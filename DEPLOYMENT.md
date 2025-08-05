# 🚀 BMECom Deployment Guide

## Automatic Deployment to GitHub Pages

Your BMECom site is now set up for automatic deployment to GitHub Pages!

### 🌐 Live Site URL
**https://ma-bme.github.io/BMECom/**

### 📋 How to Deploy

#### Option 1: Quick Deploy (Recommended)
1. **Double-click** `deploy.bat` (Windows) or run `./deploy.ps1` (PowerShell)
2. Enter a commit message (or press Enter for default)
3. Wait for the deployment to complete

#### Option 2: Manual Deploy
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

#### Option 3: GitHub Actions (Automatic)
- Simply push to the `main` branch
- GitHub Actions will automatically deploy your site
- Check the Actions tab in your GitHub repository

### ⚙️ Setup Requirements

#### 1. Enable GitHub Pages
1. Go to your repository: `https://github.com/MA-BME/BMECom`
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **"Deploy from a branch"**
5. Choose **"gh-pages"** branch
6. Click **Save**

#### 2. Enable GitHub Actions
1. Go to **Actions** tab in your repository
2. Click **"I understand my workflows, go ahead and enable them"**
3. The deployment workflow will run automatically

### 🔄 Deployment Process

1. **Push to main branch** → Triggers GitHub Actions
2. **GitHub Actions builds** → Creates gh-pages branch
3. **GitHub Pages deploys** → Site goes live
4. **Wait 2-5 minutes** → Changes appear online

### 📊 Deployment Status

- ✅ **GitHub Actions**: Configured
- ✅ **GitHub Pages**: Ready to enable
- ✅ **Deployment Scripts**: Created
- ✅ **Package.json**: Configured

### 🛠️ Files Added for Deployment

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `package.json` - Project configuration
- `deploy.bat` - Windows deployment script
- `deploy.ps1` - PowerShell deployment script
- `DEPLOYMENT.md` - This documentation

### 🚨 Troubleshooting

#### If deployment fails:
1. Check GitHub Actions tab for error messages
2. Verify GitHub Pages is enabled in repository settings
3. Ensure you have write permissions to the repository

#### If site doesn't update:
1. Wait 5-10 minutes for changes to propagate
2. Clear browser cache
3. Check the gh-pages branch exists

### 📱 Testing Your Deployment

After deployment, test these URLs:
- **Homepage**: https://ma-bme.github.io/BMECom/
- **Articles**: https://ma-bme.github.io/BMECom/articles.html
- **Test Page**: https://ma-bme.github.io/BMECom/test-abstract.html

### 🎯 Next Steps

1. **Enable GitHub Pages** in your repository settings
2. **Test the deployment** by running `deploy.bat`
3. **Verify your site** is live at the GitHub Pages URL
4. **Share your site** with the community!

---

**Your BMECom site will now automatically deploy to GitHub Pages every time you push changes!** 🎉 