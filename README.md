# BMECom - Biomedical Engineering Community Website

A modern, responsive website for the biomedical engineering community featuring article management, user authentication, and content sharing.

## 🚀 Features

- **📰 Article Management**: Add, view, and manage biomedical engineering articles
- **👥 User Authentication**: Secure login system with user roles
- **💾 Local Storage**: Articles and user data stored locally in browser
- **📊 Storage Management**: Export/import data with backup capabilities
- **🎨 Modern UI**: Responsive design with beautiful styling
- **🔧 Admin Tools**: Moderator functionality for user management

## 📁 Project Structure

```
Site/
├── index.html              # Main homepage
├── articles.html           # Articles listing page
├── articles.js             # Articles functionality
├── login.html              # User login page
├── fix-login.html          # Login troubleshooting
├── articles-storage.html   # Storage management dashboard
├── styles.css              # Main stylesheet
├── script.js               # General JavaScript
├── open.html               # Quick access launcher
└── README.md               # This file
```

## 🌐 How to Use

### Quick Start
1. Open `open.html` in your web browser
2. Click any button to navigate to different pages
3. The website will automatically redirect to the homepage

### Adding Articles
1. Go to the Articles page
2. Log in with your credentials
3. Enter a biomedical engineering article URL
4. Click "Analyze Article" to add it to your collection

### Managing Data
1. Open the Storage Management page
2. View statistics about your articles and users
3. Export data for backup or sharing
4. Import previously exported data

## 👤 User Management

### Default Login (Mendel)
- **Email**: mendel@bmecom.com
- **Password**: 123
- **Role**: Moderator

### Creating New Users
1. Go to the Login page
2. Click "Create Account"
3. Fill in your details
4. Start adding articles

## 💾 Data Storage

All data is stored locally in your browser's localStorage:
- **Articles**: Saved as JSON in `userArticles`
- **Users**: Saved as JSON in `users`
- **Current User**: Session information

### Backup & Restore
- **Export**: Download all data as JSON file
- **Import**: Upload previously exported data
- **Backup**: Create timestamped backups

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional appearance
- **Smooth Animations**: Enhanced user experience
- **Accessibility**: Keyboard navigation and screen reader support

## 🔧 Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage
- **No Dependencies**: Pure vanilla JavaScript
- **Cross-Browser**: Compatible with all modern browsers

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚀 Getting Started

### Local Access (This Computer Only)
1. **Download** all files to a folder
2. **Open** `open.html` in your web browser
3. **Navigate** to different pages using the buttons
4. **Start** adding articles and managing your content

### Network Access (Multiple Devices)
1. **Start Network Server**:
   - Double-click `Launch Network Access.bat`
   - Choose option 1: "Start Network Server"
   - Your site will be available at: **http://192.168.0.183:8080**

2. **Access from Other Devices**:
   - Connect devices to the same WiFi network
   - Open browser and go to: `http://192.168.0.183:8080`
   - Works on smartphones, tablets, laptops, and other devices

📖 **For detailed network access instructions, see `NETWORK_ACCESS.md`**

### Internet Access (Any Device, Anywhere)
1. **Deploy to Internet**:
   - Double-click `Deploy to Internet.bat`
   - Choose your preferred hosting service
   - Follow the step-by-step instructions

2. **Get Public URL**:
   - Your site will be available at: `https://your-custom-url.com`
   - Works on any device, anywhere in the world
   - No WiFi network restrictions

📖 **For detailed internet deployment instructions, see `DEPLOY_TO_INTERNET.md`**

## 📞 Support

For issues or questions:
1. Check the Storage Management page for data issues
2. Use the Fix Login page for authentication problems
3. Clear browser data if experiencing issues

## 📄 License

This project is open source and available under the MIT License.

---

**BMECom** - Connecting the Biomedical Engineering Community 