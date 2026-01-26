# Recorrido Colectivos - React Native

Aplicación móvil para rastrear colectivos en tiempo real en Corrientes, Argentina.

## 📱 Características

- **Visualización de rutas** de colectivos en mapa interactivo
- **Búsqueda de líneas** con autocompletado
- **Paradas en tiempo real** con ubicación exacta
- **Tracking de vehículos** con actualización cada 5 segundos
- **Geolocalización** para encontrar paradas cercanas
- **Estimaciones de arribo** para cada parada

## 🛠️ Tecnologías

- **React Native** con Expo
- **TypeScript** para type safety
- **react-native-maps** para visualización de mapas
- **expo-location** para geolocalización
- **SOAP API** de SmartMovePro Corrientes

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el proyecto:
```bash
npm start
```

3. Ejecutar en emulador/dispositivo:
```bash
# Android
npm run android

# iOS (solo en macOS)
npm run ios

# Web
npm run web
```

## 📱 Desarrollo

### Expo Go

La forma más rápida de probar la app es usando Expo Go:

1. Instala Expo Go en tu dispositivo móvil:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Ejecuta `npm start`

3. Escanea el código QR con la cámara (iOS) o Expo Go (Android)

### Estructura del Proyecto

```
recorrido-colectivos/
├── src/
│   ├── components/       # Componentes React
│   │   ├── MapScreen.tsx
│   │   └── AutoCompleteInput.tsx
│   ├── services/         # Llamadas a API SOAP
│   │   ├── soapClient.ts
│   │   └── colectivos.ts
│   ├── hooks/           # Custom hooks
│   │   ├── useLocation.ts
│   │   └── useBusTracking.ts
│   ├── types/           # TypeScript types
│   └── constants/       # Configuración
├── assets/              # Imágenes e íconos
├── App.js              # Punto de entrada
└── app.json            # Configuración de Expo
```

## 🗺️ API

La aplicación consume la API SOAP de SmartMovePro Corrientes para obtener:

- Líneas de colectivo disponibles
- Recorridos de cada línea
- Paradas por línea
- Ubicación de vehículos en tiempo real
- Estimaciones de arribo

## 📝 Notas

- La aplicación requiere permisos de ubicación para funcionar correctamente
- Los mapas usan Google Maps en Android/iOS y OpenStreetMap en Web
- El tracking de colectivos se actualiza automáticamente cada 5 segundos

## 🎯 Migración desde SvelteKit

Este proyecto fue migrado de una aplicación web SvelteKit a React Native:

- ✅ Todos los endpoints SOAP ahora se llaman directamente desde el cliente
- ✅ Leaflet reemplazado por react-native-maps
- ✅ Geolocalización nativa con expo-location
- ✅ UI optimizada para móviles

## 📄 Licencia

Proyecto personal para seguimiento de colectivos en Corrientes.
