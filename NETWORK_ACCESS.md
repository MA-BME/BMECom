# 🌐 BMECom Network Access Guide

## 📱 Access Your Site from Any Device

Your BMECom website can be accessed from smartphones, tablets, laptops, and other devices on your local network.

---

## 🚀 Quick Start

### Option 1: Use the Network Launcher (Recommended)
1. Double-click `Launch Network Access.bat`
2. Choose option 1: "Start Network Server"
3. Your site will be available at: **http://192.168.0.183:8080**

### Option 2: Manual Server Start
1. Open PowerShell as Administrator
2. Navigate to your site folder: `cd "C:\Users\maizikovitch\Site"`
3. Run: `powershell -ExecutionPolicy Bypass -File "start-network-server.ps1"`

---

## 📋 Network Access URLs

### Primary Access URL
```
http://192.168.0.183:8080
```

### Alternative URLs (if primary doesn't work)
```
http://192.168.0.183:8080/index.html
http://192.168.0.183:8080/open.html
```

---

## 📱 Supported Devices

### ✅ Mobile Devices
- **iPhone/iPad**: Safari, Chrome, Firefox
- **Android Phones**: Chrome, Samsung Internet, Firefox
- **Android Tablets**: Chrome, Samsung Internet, Firefox

### ✅ Computers
- **Windows**: Chrome, Firefox, Edge, Safari
- **Mac**: Safari, Chrome, Firefox
- **Linux**: Chrome, Firefox, Opera

### ✅ Other Devices
- **Smart TVs**: Built-in web browsers
- **Gaming Consoles**: Web browsers (if available)
- **E-readers**: Web browsers (if available)

---

## 🔧 Setup Instructions

### Step 1: Start the Network Server
1. Run `Launch Network Access.bat`
2. Select option 1: "Start Network Server"
3. Wait for the message: "Server is running at http://192.168.0.183:8080/"

### Step 2: Connect Devices to Same Network
- Ensure all devices are connected to the **same WiFi network**
- Check that your computer and target device are on the same network

### Step 3: Access from Other Devices
1. Open a web browser on the target device
2. Enter: `http://192.168.0.183:8080`
3. Press Enter or Go

---

## 🛠️ Troubleshooting

### ❌ "Cannot connect" or "Site not found"
**Solutions:**
1. **Check Network Connection**
   - Ensure both devices are on the same WiFi network
   - Try disconnecting and reconnecting to WiFi

2. **Verify Server is Running**
   - Check that the server shows "Server is running" message
   - Look for any error messages in the server window

3. **Try Different Port**
   - If port 8080 is busy, the server will show an error
   - Edit `start-network-server.ps1` and change `8080` to `8081` or `3000`

4. **Windows Firewall**
   - Allow the connection when Windows asks
   - Or temporarily disable Windows Firewall for testing

### ❌ "Access Denied" or Permission Errors
**Solutions:**
1. **Run as Administrator**
   - Right-click `Launch Network Access.bat`
   - Select "Run as administrator"

2. **Check PowerShell Execution Policy**
   - Open PowerShell as Administrator
   - Run: `Set-ExecutionPolicy RemoteSigned`

### ❌ Slow Loading or Timeouts
**Solutions:**
1. **Check Network Speed**
   - Ensure WiFi signal is strong
   - Try moving closer to the router

2. **Close Other Applications**
   - Close unnecessary programs on your computer
   - Free up system resources

---

## 🔒 Security Notes

### Local Network Only
- This setup only works on your **local network**
- Your site is **not accessible from the internet**
- Only devices on the same WiFi can access it

### Temporary Access
- The server stops when you close the terminal window
- Restart the server each time you want network access
- No permanent hosting or internet access

---

## 📊 Network Information

### Your Network Details
- **Local IP**: 192.168.0.183
- **Port**: 8080
- **Protocol**: HTTP
- **Network Type**: Local WiFi

### Alternative Access Methods
If the network server doesn't work, you can:

1. **Use File Sharing**
   - Share the site folder on your network
   - Access via file explorer on other devices

2. **Use Cloud Storage**
   - Upload files to Google Drive, Dropbox, or OneDrive
   - Share the folder with other devices

3. **Use USB Transfer**
   - Copy the site files to a USB drive
   - Transfer to other devices

---

## 🎯 Quick Commands

### Start Server (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File "start-network-server.ps1"
```

### Check if Server is Running
```cmd
netstat -an | findstr :8080
```

### Stop Server
Press `Ctrl+C` in the server window

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify all devices are on the same network**
3. **Try running as Administrator**
4. **Check Windows Firewall settings**

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

✅ Server message: "Server is running at http://192.168.0.183:8080/"  
✅ Other devices can access the URL  
✅ BMECom website loads normally on all devices  
✅ All features work (articles, login, etc.)  

---

**Happy sharing! Your BMECom site is now accessible from any device on your network! 🚀** 