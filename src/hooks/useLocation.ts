import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Region } from '../types';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          setHasPermission(false);
          return;
        }

        setHasPermission(true);
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        setErrorMsg('Error al obtener la ubicación');
      }
    })();
  }, []);

  const refreshLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error refrescando ubicación:', error);
    }
  };

  return {
    location,
    errorMsg,
    hasPermission,
    refreshLocation,
  };
}
