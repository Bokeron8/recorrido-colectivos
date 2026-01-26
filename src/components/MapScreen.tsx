import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { AutoCompleteInput } from './AutoCompleteInput';
import { useLocation } from '../hooks/useLocation';
import { useBusTracking } from '../hooks/useBusTracking';
import * as colectivosService from '../services/colectivos';
import {
  Line,
  Stop,
  RoutePoint,
  Arrival,
  Coordinate,
} from '../types';
import { MAP_CONFIG, ROUTE_COLORS, RUTAS_INNECESARIAS } from '../constants/config';
import { Text } from 'react-native';

interface RouteSegment {
  coordinates: Coordinate[];
  color: string;
}

export function MapScreen() {
  const { location, hasPermission } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [nearbyStops, setNearbyStops] = useState<Stop[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState(true);
  const [openCallout, setOpenCallout] = useState<string | null>(null);

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
      const result = await colectivosService.getLines();
      setLines(result.lineas || []);
    } catch (error) {
      console.error('Error cargando líneas:', error);
      Alert.alert('Error', 'No se pudieron cargar las líneas de colectivo');
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

      // Convertir a segmentos con colores
      const segments: RouteSegment[] = routes.map((route, index) => ({
        coordinates: route.map((point) => ({
          latitude: parseFloat(point.Latitud as any),
          longitude: parseFloat(point.Longitud as any),
        })),
        color: ROUTE_COLORS[index % ROUTE_COLORS.length],
      }));

      setRouteSegments(segments);

      // Cargar paradas de la línea
      const stopsResult = await colectivosService.getStopPointsByLine(
        line.CodigoLineaParada
      );
      console.log('Paradas de la línea recibidas:', stopsResult);
      
      // Las paradas vienen como un objeto con arrays agrupados por ruta
      // Necesitamos aplanar todos los arrays en uno solo
      let allStops: Stop[] = [];
      if (stopsResult.paradas) {
        // stopsResult.paradas es un objeto como: { "": [...], "I-17PU": [...] }
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
      Alert.alert('Error', 'No se pudo cargar la información de la línea');
    }
  };

  // Manejar selección de parada
  const handleStopSelect = (stop: Stop) => {
    setSelectedStop(stop);
  };

  // Manejar click en el mapa
  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      console.log('Buscando paradas cerca de:', latitude, longitude);
      const result = await colectivosService.getNearestStops(latitude, longitude);
      console.log('Paradas encontradas:', result.paradas?.length || 0);
      setNearbyStops(result.paradas || []);
    } catch (error) {
      console.error('Error obteniendo paradas cercanas:', error);
    }
  };

  // Centrar mapa en ubicación del usuario
  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  if (isLoadingLines) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={MAP_CONFIG.INITIAL_REGION}
        showsUserLocation={hasPermission}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {/* Renderizar segmentos de ruta */}
        {routeSegments.map((segment: RouteSegment, index: number) => (
          <React.Fragment key={`route-${index}`}>
            <Polyline
              coordinates={segment.coordinates}
              strokeColor={segment.color}
              strokeWidth={3}
            />
          </React.Fragment>
        ))}

        {/* Renderizar paradas cercanas */}
        {nearbyStops.map((stop: Stop, index: number) => (
          <Marker
            coordinate={{
              latitude: parseFloat(stop.Latitud as any),
              longitude: parseFloat(stop.Longitud as any),
            }}
            pinColor="blue"
            title="Parada"
            description={stop.Lineas || stop.Descripcion}
            key={`nearby-${index}`}
          />
        ))}

        {/* Renderizar parada seleccionada */}
        {selectedStop && (
          <Marker
            coordinate={{
              latitude: parseFloat(selectedStop.Latitud as any),
              longitude: parseFloat(selectedStop.Longitud as any),
            }}
            pinColor="green"
            title="Parada Seleccionada"
            description={selectedStop.Descripcion}
          />
        )}

        {/* Renderizar colectivos en tiempo real */}
        {arrivals.map((arrival: Arrival, index: number) => (
          <Marker
            coordinate={{
              latitude: parseFloat(arrival.Latitud as any),
              longitude: parseFloat(arrival.Longitud as any),
            }}
            title="Colectivo"
            description={arrival.Arribo}
            key={`bus-${index}`}
          >
            <View style={styles.busMarker}>
              <Text style={styles.busMarkerText}>🚌</Text>
            </View>
          </Marker>
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
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busMarkerText: {
    fontSize: 24,
  },
  calloutContainer: {
    padding: 12,
    minWidth: 150,
    maxWidth: 250,
  },
  calloutTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    paddingRight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
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
