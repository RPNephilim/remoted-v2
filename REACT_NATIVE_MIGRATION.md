# Electron to React Native Migration Guide

## Overview

This guide outlines the process of converting your Electron-based Remoted application into a mobile app for iOS and Android using React Native.

## Architecture Comparison

### Current Electron Architecture
```
┌─────────────────────────────────────┐
│         Electron App                │
├─────────────────────────────────────┤
│  Main Process (Node.js)             │
│  - src/main.ts                      │
│  - Preload Scripts                  │
├─────────────────────────────────────┤
│  Renderer Process (React)           │
│  - src/ui/                          │
│    - Components                     │
│    - Pages                          │
│    - Contexts                       │
└─────────────────────────────────────┘
```

### Target React Native Architecture
```
┌─────────────────────────────────────┐
│      React Native App               │
├─────────────────────────────────────┤
│  Shared Business Logic              │
│  - WebRTC Peer Connection           │
│  - User Context                     │
│  - API Services                     │
├─────────────────────────────────────┤
│  React Native UI Components         │
│  - Navigation                       │
│  - Screens (not pages)              │
│  - Native Components                │
└─────────────────────────────────────┘
```

## Key Differences

### What Can Be Reused (70-80%)
- ✅ Business logic (contexts, services)
- ✅ State management (UserContext, PeerConnectionContext)
- ✅ WebRTC connection logic
- ✅ API calls and networking
- ✅ Data structures and types

### What Needs to Be Rewritten (20-30%)
- ❌ UI Components (HTML → React Native components)
- ❌ Styling (CSS → StyleSheet/Styled Components)
- ❌ Navigation (React Router → React Navigation)
- ❌ Material-UI → React Native Paper or Native Base
- ❌ Electron-specific APIs (window, process, etc.)

## Migration Strategy

### Phase 1: Setup React Native Project

#### 1. Create New React Native Project
```bash
# Using React Native CLI (recommended for native modules)
npx react-native@latest init RemotedMobile --template react-native-template-typescript

# OR using Expo (easier but with limitations)
npx create-expo-app RemotedMobile --template expo-template-blank-typescript
```

#### 2. Install Core Dependencies
```bash
cd RemotedMobile

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI Library (choose one)
npm install react-native-paper  # Material Design
# OR
npm install native-base  # More components

# WebRTC
npm install react-native-webrtc

# Other utilities
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
```

#### 3. iOS-Specific Setup
```bash
cd ios
pod install
cd ..
```

### Phase 2: Port Business Logic

#### Directory Structure
```
RemotedMobile/
├── src/
│   ├── contexts/
│   │   ├── UserContext.tsx          # Copy from Electron
│   │   └── PeerConnectionContext.tsx # Copy from Electron
│   ├── services/
│   │   ├── PeerConnectionService.ts  # Adapt from Electron
│   │   └── ApiService.ts             # New API wrapper
│   ├── screens/                      # Convert pages → screens
│   │   ├── AuthenticationScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── DeviceSelectScreen.tsx
│   ├── components/                   # Rewrite UI components
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── SideBar.tsx              # → Drawer/TabBar
│   │   └── ConnectTab.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── config/
│   │   └── properties.ts            # Convert JSON → TS
│   └── types/
│       └── index.ts
├── App.tsx
└── package.json
```

### Phase 3: Convert UI Components

#### Material-UI → React Native Paper Mapping

| Electron (Material-UI) | React Native (Paper) |
|------------------------|---------------------|
| `<TextField>`          | `<TextInput>`       |
| `<Button>`             | `<Button>`          |
| `<IconButton>`         | `<IconButton>`      |
| `<Drawer>`             | Custom Drawer Nav   |
| `<Typography>`         | `<Text>`            |

#### Example Conversion: Login Component

**Before (Electron - Material-UI):**
```tsx
import { Button, TextField } from '@mui/material';

<TextField
  id="password"
  label="Password"
  type="password"
  variant="standard"
  sx={{ width: '10%' }}
/>
<Button variant="contained" onClick={loginUser}>
  Login
</Button>
```

**After (React Native - Paper):**
```tsx
import { Button, TextInput } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

<TextInput
  label="Password"
  mode="outlined"
  secureTextEntry
  style={styles.input}
/>
<Button mode="contained" onPress={loginUser}>
  Login
</Button>

const styles = StyleSheet.create({
  input: {
    width: '80%',
    marginBottom: 16,
  }
});
```

### Phase 4: WebRTC Implementation

#### Install and Configure WebRTC
```bash
npm install react-native-webrtc
```

#### iOS Permissions (ios/RemotedMobile/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>Remote desktop requires camera access</string>
<key>NSMicrophoneUsageDescription</key>
<string>Remote desktop requires microphone access</string>
```

#### Android Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### Adapt PeerConnectionService
```typescript
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

// Rest of your PeerConnectionService logic remains similar
// WebRTC API is mostly compatible
```

### Phase 5: Navigation Setup

#### Create Navigation Structure
```tsx
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Authentication">
        <Stack.Screen 
          name="Authentication" 
          component={AuthenticationScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DeviceSelect" 
          component={DeviceSelectScreen} 
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### Update App.tsx
```tsx
import { UserProvider } from './src/contexts/UserContext';
import { PeerConnectionProvider } from './src/contexts/PeerConnectionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <UserProvider>
      <PeerConnectionProvider>
        <AppNavigator />
      </PeerConnectionProvider>
    </UserProvider>
  );
}
```

### Phase 6: Styling Migration

#### CSS to React Native StyleSheet

**Before (CSS):**
```css
.login-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    gap: 0.5%;
}
```

**After (React Native):**
```tsx
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,  // React Native uses pixels, not percentages
    backgroundColor: '#1d1d1d',
  }
});
```

**Key Differences:**
- No `height: 100%` → use `flex: 1`
- Percentage gaps → pixel values
- camelCase property names
- No CSS selectors, direct style objects

### Phase 7: WebSocket Connection

#### Handle SSL Certificates (Production)
For production, ensure your signaling server has a valid SSL certificate. React Native enforces SSL/TLS on both iOS and Android.

#### Development Workaround
```typescript
// For development only - disable SSL validation
// ** NEVER USE IN PRODUCTION **

// iOS: Info.plist
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

// Android: AndroidManifest.xml
android:usesCleartextTraffic="true"
```

## Component Migration Checklist

### Authentication Page
- [ ] Convert Login component
- [ ] Convert SignUp component  
- [ ] Replace TextField with TextInput
- [ ] Replace Button with Button
- [ ] Update navigation (navigate → navigation.navigate)

### Dashboard Page
- [ ] Convert SideBar to Drawer or Bottom Tabs
- [ ] Convert ConnectTab component
- [ ] Convert About component
- [ ] Replace MUI icons with react-native-vector-icons

### Device Select Page
- [ ] Convert SessionDeviceBar component
- [ ] Update list rendering (map → FlatList)
- [ ] Add pull-to-refresh

### Contexts
- [ ] Copy UserContext (minimal changes)
- [ ] Copy PeerConnectionContext (minimal changes)
- [ ] Update WebSocket imports (use react-native-webrtc)

### Services
- [ ] Adapt PeerConnectionService for React Native WebRTC
- [ ] Update fetch calls (add timeout handling)
- [ ] Add error handling for mobile network issues

## Platform-Specific Considerations

### iOS
- **App Transport Security**: Use HTTPS/WSS or configure exceptions
- **Background Modes**: Enable if app needs background WebRTC
- **Signing**: Configure Apple Developer account and provisioning
- **TestFlight**: Use for beta testing

### Android
- **Clear Text Traffic**: Configure for local development
- **ProGuard**: Configure to keep WebRTC classes
- **Permissions**: Request runtime permissions (Camera, Mic)
- **Google Play**: Configure release signing

## Recommended Libraries

### UI Components
```bash
# Option 1: React Native Paper (Material Design)
npm install react-native-paper
npm install react-native-vector-icons

# Option 2: Native Base
npm install native-base
npm install react-native-svg
```

### State Management (if needed)
```bash
# If Context API becomes insufficient
npm install @reduxjs/toolkit react-redux
```

### Forms
```bash
npm install react-hook-form
```

## Development Workflow

### Running the App

#### iOS
```bash
npm run ios
# OR
npx react-native run-ios
```

#### Android
```bash
npm run android
# OR
npx react-native run-android
```

### Hot Reload
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- Enable Fast Refresh in dev menu

## Testing Strategy

1. **Unit Tests**: Test business logic (Jest)
2. **Component Tests**: Test UI components (React Native Testing Library)
3. **E2E Tests**: Test full flows (Detox or Appium)
4. **Manual Testing**: Test on physical devices

## Deployment

### iOS App Store
1. Configure Xcode project
2. Create App Store Connect listing
3. Build archive and upload
4. Submit for review

### Google Play Store
1. Generate signed APK/AAB
2. Create Play Console listing
3. Upload bundle
4. Submit for review

## Estimated Timeline

| Phase | Estimated Time |
|-------|---------------|
| Setup & Dependencies | 1-2 days |
| Port Business Logic | 2-3 days |
| Convert UI Components | 5-7 days |
| WebRTC Integration | 3-4 days |
| Navigation & Routing | 1-2 days |
| Testing & Bug Fixes | 3-5 days |
| Platform-specific polish | 2-3 days |
| **Total** | **17-26 days** |

## Common Pitfalls

1. **Don't use web APIs**: No `document`, `window`, `localStorage`
2. **Use AsyncStorage**: For persistent storage
3. **Handle network errors**: Mobile networks are unreliable
4. **Test on real devices**: Simulators don't show real performance
5. **Memory management**: Clean up WebRTC streams properly
6. **Platform differences**: iOS and Android behave differently

## Alternative Approach: Code Sharing with Monorepo

If you want to maintain both Electron and Mobile apps:

```
remoted-monorepo/
├── packages/
│   ├── core/              # Shared business logic
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   ├── electron/          # Current Electron app
│   └── mobile/            # New React Native app
└── package.json
```

Use tools like:
- **Yarn Workspaces**
- **Lerna**
- **Nx**

## Resources

### Documentation
- [React Native Docs](https://reactnavigation.org/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Native WebRTC](https://github.com/react-native-webrtc/react-native-webrtc)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

### Tutorials
- [React Native Express](https://www.reactnative.express/)
- [React Native School](https://www.reactnativeschool.com/)

### Communities
- [React Native Discord](https://discord.gg/react-native)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

## Next Steps

1. **Proof of Concept**: Start with a simple screen to validate approach
2. **WebRTC Test**: Verify WebRTC works on mobile before full migration
3. **UI Prototype**: Build one complete flow (e.g., login → device select)
4. **Iterate**: Gradually port remaining features

## Questions to Answer Before Starting

- [ ] Do you need to maintain the Electron app? (affects architecture)
- [ ] What's the minimum iOS/Android version you'll support?
- [ ] Will you support tablets?
- [ ] Do you need offline functionality?
- [ ] What's your target release date?
- [ ] Do you have Apple Developer and Google Play accounts?

---

**Good Luck with Your Migration! 🚀**

For questions or issues, refer to the React Native community or consult the documentation links above.
