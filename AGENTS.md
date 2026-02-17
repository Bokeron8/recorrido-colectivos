# AGENTS.md - Agentic Coding Guidelines

This document contains essential information for AI agents working on this codebase.

## Project Overview

React Native Expo application for tracking buses in Corrientes, Argentina. Uses TypeScript, Mapbox Maps SDK via @rnmapbox/maps for map visualization, and consumes SOAP APIs from SmartMovePro.

## Build Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android    # Android emulator/device
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser

# Clear cache and start
npm run clear      # expo start -c

# Build for production (using EAS)
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Testing

**No testing framework is currently configured.** If adding tests:

```bash
# Recommended: Install Jest + React Native Testing Library
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Run tests (after setup)
npm test                    # Run all tests
npm test -- ComponentName   # Run specific test file
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
```

## Linting/Formatting

**No linting or formatting tools configured.** If adding:

```bash
# Recommended setup
npm install --save-dev eslint prettier @react-native-community/eslint-config
npx eslint --init

# Run linting/formatting
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
npm run format     # Format code with Prettier
```

## Code Style Guidelines

### Imports
- React imports first: `import React from 'react'`
- React Native components second: `import { View, Text } from 'react-native'`
- Third-party libraries third: `import MapView from 'react-native-maps'`
- Local imports last, grouped by type:
  - Components: `import { MapScreen } from './components/MapScreen'`
  - Hooks: `import { useLocation } from '../hooks/useLocation'`
  - Services: `import * as colectivosService from '../services/colectivos'`
  - Types: `import { Line, Stop } from '../types'`
  - Constants: `import { MAP_CONFIG } from '../constants/config'`

### Naming Conventions
- **Components**: PascalCase (e.g., `MapScreen`, `AutoCompleteInput`)
- **Hooks**: camelCase with `use` prefix (e.g., `useLocation`, `useBusTracking`)
- **Functions**: camelCase (e.g., `getLines`, `handleLineSelect`)
- **Variables**: camelCase (e.g., `selectedLine`, `routeSegments`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SOAP_CONFIG`, `ROUTE_COLORS`)
- **Types/Interfaces**: PascalCase (e.g., `Line`, `Stop`, `RoutePoint`)
- **Files**: Match the default export name (e.g., `MapScreen.tsx`)

### TypeScript
- Use `.tsx` for components, `.ts` for utilities/hooks
- Explicit return types on exported functions
- Define interfaces for props: `interface AutoCompleteInputProps<T>`
- Use generics where appropriate
- Index signatures with `[key: string]: any` for flexible API responses
- Strict mode is OFF (be defensive with runtime checks)

### Component Patterns
- Use functional components with hooks
- Props interface defined above component
- Destructure props in function parameters
- Use `useRef` for map references and intervals
- Use `useEffect` with cleanup functions for subscriptions/intervals
- Memoize callbacks with `useCallback` if needed (not currently used)

### Error Handling
- Wrap async calls in try/catch blocks
- Use `console.error()` for errors (not console.log)
- Set fallback states on errors (empty arrays, null values)
- Avoid Alert in production - use UI state instead
- Validate coordinates: check ranges (-90 to 90, -180 to 180)

### Styling
- Use `StyleSheet.create()` for styles
- Place styles at bottom of file
- Use flexbox for layouts (`flex: 1` for containers)
- Platform-specific values: `Platform.OS === 'ios' ? 50 : 40`
- Shadows for iOS, elevation for Android
- Absolute positioning for overlays

### API/Services
- Export named functions, not default
- Use descriptive JSDoc comments
- Return typed promises: `Promise<{ lineas: Line[] }>`
- Parse and validate SOAP responses carefully
- Log truncated responses for debugging (use `.substring(0, 200)`)

## Project Structure

```
src/
├── components/       # React components (.tsx)
├── hooks/           # Custom hooks (.ts)
├── services/        # API calls and clients (.ts)
├── types/           # TypeScript interfaces/types (.ts)
└── constants/       # Configuration constants (.ts)
assets/              # Images, icons, splash screens
```

## Key Dependencies

- `expo` - Expo SDK
- `react-native` - React Native
- `@rnmapbox/maps` - Mapbox Maps SDK for React Native
- `expo-location` - Location services
- `axios` - HTTP client
- `fast-xml-parser` - XML parsing for SOAP

## Environment Notes

- No `.env` file or environment variables currently used
- API credentials are in `src/constants/config.ts` (not sensitive)
- Requires location permissions on both platforms
- Mapbox configuration:
  - Public access token in `src/constants/config.ts` (MAPBOX_CONFIG.ACCESS_TOKEN)
  - Secret download token in `eas.json` env vars (RNMAPBOX_MAPS_DOWNLOAD_TOKEN)
  - Run `npx expo prebuild --clean` after changing Mapbox configuration

## Development Workflow

1. Run `npm start` to start Metro bundler
2. Scan QR code with Expo Go app, or press `a` for Android / `i` for iOS
3. Shake device to open developer menu
4. Use `console.log()` liberally for debugging (visible in terminal)
5. Hot reload works for most changes
6. Some changes (adding packages) require restarting Metro

## Common Issues

- Clear cache if builds fail: `npm run clear`
- Location permissions must be granted for app to work
- iOS builds require macOS and Xcode
- Android builds require Android Studio or SDK
- Mapbox requires running `npx expo prebuild --clean` after installing or updating
- Cannot use Expo Go with Mapbox - must use development build or EAS

## Migration Notes

This project was migrated from SvelteKit to React Native. Some patterns may reflect web development approaches adapted for mobile.
