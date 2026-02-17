import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  ShapeSource,
  LineLayer,
  PointAnnotation,
  LocationPuck,
} from '@rnmapbox/maps';
import { AutoCompleteInput } from './AutoCompleteInput';
import { useLocation } from '../hooks/useLocation';
import { useBusTracking } from '../hooks/useBusTracking';
import * as colectivosService from '../services/colectivos';
import {
  Line,
  Stop,
  RoutePoint,
  Arrival,
} from '../types';
import {
  MAP_CONFIG,
  ROUTE_COLORS,
  RUTAS_INNECESARIAS,
  MAPBOX_CONFIG,
} from '../constants/config';
import { Text } from 'react-native';

// Set Mapbox access token
Mapbox.setAccessToken(MAPBOX_CONFIG.ACCESS_TOKEN);

interface RouteSegment {
  coordinates: [number, number][];
  color: string;
}

// Helper to convert from {lat, lng} to [lng, lat]
const toGeoJSON = (lat: number, lng: number): [number, number] => [lng, lat];

export function MapScreen() {
  const { location, hasPermission } = useLocation();
  const cameraRef = useRef<Camera>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [nearbyStops, setNearbyStops] = useState<Stop[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);

  const { arrivals } = useBusTracking(
    selectedLine,
    selectedStop?.Identificador || null
  );

  // Cargar líneas al inicio
  useEffect(() => {
    loadLines();
  }, []);

  // Debug: monitorear cambios en stops
  useEffect(() => {
    console.log('Estado stops actualizado. Total:', stops.length);
  }, [stops]);

  const loadLines = async () => {
    try {
      setIsLoadingLines(true);
      console.log('Iniciando carga de líneas...');
      const result = await colectivosService.getLines();
      console.log('Líneas cargadas:', result?.lineas?.length || 0);

      if (result && result.lineas && Array.isArray(result.lineas)) {
        setLines(result.lineas);
      } else {
        console.warn('Respuesta de líneas inválida:', result);
        setLines([]);
      }
    } catch (error) {
      console.error('Error cargando líneas:', error);
      setLines([]);
    } finally {
      setIsLoadingLines(false);
    }
  };

  // Manejar selección de línea
  const handleLineSelect = async (line: Line) => {
    try {
      setSelectedLine(line.CodigoLineaParada);
      setSelectedStop(null);
      setNearbyStops([]);

      // Cargar recorrido
      const routeResult = await colectivosService.getLineRoute(
        line.CodigoLineaParada
      );

      // Filtrar puntos innecesarios
      const filteredPoints = routeResult.puntos.filter(
        (point) => !RUTAS_INNECESARIAS.includes(point.AbreviaturaBanderaSMP)
      );

      // Agrupar por AbreviaturaBanderaSMP
      const routes: RoutePoint[][] = [];
      let currentAbbrev = filteredPoints[0]?.AbreviaturaBanderaSMP;
      let currentRoute: RoutePoint[] = [];

      filteredPoints.forEach((point) => {
        if (point.AbreviaturaBanderaSMP !== currentAbbrev) {
          routes.push(currentRoute);
          currentAbbrev = point.AbreviaturaBanderaSMP;
          currentRoute = [];
        }
        currentRoute.push(point);
      });

      if (currentRoute.length > 0) {
        routes.push(currentRoute);
      }

      // Convertir a segmentos con colores (Mapbox uses [lng, lat])
      const segments: RouteSegment[] = routes.map((route, index) => ({
        coordinates: route.map((point) =>
          toGeoJSON(parseFloat(point.Latitud as any), parseFloat(point.Longitud as any))
        ),
        color: ROUTE_COLORS[index % ROUTE_COLORS.length],
      }));

      setRouteSegments(segments);

      // Cargar paradas de la línea
      const stopsResult = await colectivosService.getStopPointsByLine(
        line.CodigoLineaParada
      );
      console.log('Paradas de la línea recibidas:', stopsResult);

      let allStops: Stop[] = [];
      if (stopsResult.paradas) {
        Object.values(stopsResult.paradas).forEach((stopsArray: any) => {
          if (Array.isArray(stopsArray)) {
            allStops = allStops.concat(stopsArray);
          }
        });
      }

      console.log('Número de paradas aplanadas:', allStops.length);
      setStops(allStops);
    } catch (error) {
      console.error('Error cargando línea:', error);
      setStops([]);
    }
  };

  // Manejar selección de parada
  const handleStopSelect = (stop: Stop) => {
    setSelectedStop(stop);
  };

  // Manejar click en el mapa
  const handleMapPress = useCallback(async (event: any) => {
    const { geometry } = event;
    if (!geometry || geometry.type !== 'Point') return;

    const [longitude, latitude] = geometry.coordinates;

    try {
      console.log('Buscando paradas cerca de:', latitude, longitude);
      const result = await colectivosService.getNearestStops(latitude, longitude);
      console.log('Paradas encontradas:', result.paradas?.length || 0);

      if (result && result.paradas && Array.isArray(result.paradas)) {
        setNearbyStops(result.paradas);
      } else {
        setNearbyStops([]);
      }
    } catch (error) {
      console.error('Error obteniendo paradas cercanas:', error);
      setNearbyStops([]);
    }
  }, []);

  // Centrar mapa en ubicación del usuario
  const centerOnUser = () => {
    if (location && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 15,
        animationMode: 'flyTo',
        animationDuration: 1000,
      });
    }
  };

  // Validar que una coordenada es válida
  const isValidCoordinate = (lat: any, lng: any): boolean => {
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

  // Create GeoJSON FeatureCollection for route lines
  const getRouteFeatures = () => {
    return routeSegments.map((segment, index) => ({
      type: 'Feature' as const,
      properties: {
        color: segment.color,
        index,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: segment.coordinates,
      },
    }));
  };

  if (isLoadingLines) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={MAP_CONFIG.INITIAL_CENTER}
          zoomLevel={MAP_CONFIG.INITIAL_ZOOM}
          animationMode="none"
        />

        {/* User location puck */}
        {hasPermission && (
          <LocationPuck
            puckBearingEnabled
            puckBearing="heading"
            pulsing={{
              isEnabled: true,
              color: '#2196F3',
            }}
          />
        )}

        {/* Route lines */}
        {routeSegments.map((segment, index) => (
          <ShapeSource
            key={`route-${index}`}
            id={`routeSource-${index}`}
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: segment.coordinates,
              },
            }}
          >
            <LineLayer
              id={`routeLine-${index}`}
              style={{
                lineColor: segment.color,
                lineWidth: 3,
              }}
            />
          </ShapeSource>
        ))}

        {/* Nearby stops */}
        {nearbyStops
          .filter((stop) => isValidCoordinate(stop.Latitud, stop.Longitud))
          .map((stop, index) => (
            <PointAnnotation
              key={`nearby-${index}`}
              id={`nearby-${index}`}
              coordinate={toGeoJSON(
                parseFloat(stop.Latitud as any),
                parseFloat(stop.Longitud as any)
              )}
            >
              <View style={styles.stopMarker}>
                <Text style={styles.stopMarkerText}>🚏</Text>
              </View>
            </PointAnnotation>
          ))}

        {/* Selected stop */}
        {selectedStop &&
          isValidCoordinate(selectedStop.Latitud, selectedStop.Longitud) && (
            <PointAnnotation
              key="selected-stop"
              id="selected-stop"
              coordinate={toGeoJSON(
                parseFloat(selectedStop.Latitud as any),
                parseFloat(selectedStop.Longitud as any)
              )}
            >
              <View style={[styles.stopMarker, styles.selectedStopMarker]}>
                <Text style={styles.stopMarkerText}>🚏</Text>
              </View>
            </PointAnnotation>
          )}

        {/* Bus markers */}
        {arrivals
          .filter((arrival) =>
            isValidCoordinate(arrival.Latitud, arrival.Longitud)
          )
          .map((arrival, index) => (
            <PointAnnotation
              key={`bus-${index}`}
              id={`bus-${index}`}
              coordinate={toGeoJSON(
                parseFloat(arrival.Latitud as any),
                parseFloat(arrival.Longitud as any)
              )}
            >
              <View style={styles.busMarker}>
                <Text style={styles.busMarkerText}>🚌</Text>
              </View>
            </PointAnnotation>
          ))}
      </MapView>

      {/* Controles superiores */}
      <SafeAreaView style={styles.controlsContainer}>
        <AutoCompleteInput
          data={lines}
          displayKey="Descripcion"
          placeholder="Nombre de la línea"
          onSelect={handleLineSelect}
        />

        {stops.length > 0 && (
          <View style={styles.stopInputContainer}>
            <AutoCompleteInput
              data={stops}
              displayKey="Descripcion"
              placeholder="Nombre de las calles"
              onSelect={handleStopSelect}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Botón para centrar en usuario */}
      {hasPermission && (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={centerOnUser}
        >
          <Text style={styles.myLocationButtonText}>📍</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    right: 10,
    left: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: 'transparent',
  },
  stopInputContainer: {
    marginTop: 5,
  },
  busMarker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  busMarkerText: {
    fontSize: 20,
  },
  stopMarker: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#666',
  },
  selectedStopMarker: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  stopMarkerText: {
    fontSize: 18,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myLocationButtonText: {
    fontSize: 24,
  },
});
