# Windows-Specific Configuration

## Fixing Supabase Fetch Errors on Windows

If you're experiencing "fetch failed" errors when running the hotel reservation app on Windows, here are specific solutions:

### 1. Check Windows Defender Firewall

Windows Defender Firewall might be blocking outgoing connections to Supabase. To fix:

1. Open Windows Defender Firewall settings
2. Go to "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" and then "Allow another app"
4. Browse to your Node.js installation (usually `C:\Program Files\nodejs\node.exe`)
5. Add it to the allowed apps list (both Private and Public networks)

### 2. Disable IPv6 (if causing issues)

IPv6 can sometimes interfere with network requests:

1. Press Windows + R, type `ncpa.cpl` and press Enter
2. Right-click on your active network adapter
3. Select Properties
4. Uncheck "Internet Protocol Version 6 (TCP/IPv6)" if listed
5. Click OK

### 3. DNS Configuration

If DNS resolution is causing issues:

1. Open Command Prompt as Administrator
2. Run these commands:
   ```
   ipconfig /flushdns
   netsh winsock reset
   netsh int ip reset
   ```
3. Restart your computer

### 4. Antivirus Software

Some antivirus software blocks Node.js network requests:

1. Add Node.js and your project directory to antivirus exclusions
2. Temporarily disable real-time scanning to test if it's causing the issue

### 5. Proxy Configuration

If you're on a corporate network:

1. Check if you're behind a proxy by running:
   ```
   npm config get proxy
   npm config get https-proxy
   ```
2. If needed, configure proxy settings:
   ```
   npm config set proxy http://your-proxy:port
   npm config set https-proxy http://your-proxy:port
   ```

### 6. Windows Network Troubleshooting

Try these commands in Command Prompt (as Administrator):

```
netsh winsock reset catalog
netsh int ip reset
ipconfig /release
ipconfig /renew
ipconfig /flushdns
```

Then restart your computer.

### 7. Development Server Configuration

If issues persist, try running your Next.js development server with specific network settings:

```bash
# Instead of npm run dev, try:
npx next dev --hostname 127.0.0.1
```

### 8. Git Bash vs Command Prompt vs PowerShell

Try running your development server from different terminals:
- Command Prompt (cmd)
- PowerShell
- Git Bash
- Windows Terminal

Different terminals handle network requests differently on Windows systems.

### 9. Port Conflicts

If the default port 3000 is in use:

1. Try a different port:
   ```
   npx next dev -p 3001
   ```
2. Or kill processes on port 3000:
   ```
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### 10. Windows Subsystem for Linux (WSL)

If you have WSL installed, consider running the project in WSL2 instead of Windows, as it often handles network requests more consistently.

---

If you continue to experience issues, check the main troubleshooting guide (TROUBLESHOOTING.md) and ensure your Supabase configuration is correct in your `.env.local` file.