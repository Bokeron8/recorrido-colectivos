import { useState, useEffect, useRef } from 'react';
import { getArrives } from '../services/colectivos';
import { Arrival } from '../types';
import { MAP_CONFIG } from '../constants/config';

/**
 * Hook para rastrear colectivos en tiempo real
 */
export function useBusTracking(lineCode: string | null, stopId: string | null) {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchArrivals = async () => {
    if (!lineCode || !stopId) {
      setArrivals([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getArrives(lineCode, stopId);
      const arrivalsData = result.arribos || [];
      
      // Invertir el orden para que coincida con la lógica original
      setArrivals(arrivalsData.reverse());
    } catch (err) {
      console.error('Error obteniendo arribos:', err);
      setError('Error al obtener los arribos');
      setArrivals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (lineCode && stopId) {
      // Fetch inmediato
      fetchArrivals();

      // Configurar polling cada 5 segundos
      intervalRef.current = setInterval(() => {
        fetchArrivals();
      }, MAP_CONFIG.UPDATE_INTERVAL);
    } else {
      setArrivals([]);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lineCode, stopId]);

  return {
    arrivals,
    isLoading,
    error,
    refreshArrivals: fetchArrivals,
  };
}
