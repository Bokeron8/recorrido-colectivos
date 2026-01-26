import { soapRequest } from './soapClient';
import { SOAP_CONFIG } from '../constants/config';
import { Line, Stop, RoutePoint, Arrival } from '../types';

/**
 * Obtener todas las líneas de colectivo disponibles
 */
export async function getLines(): Promise<{ lineas: Line[] }> {
  const soapBody = `<RecuperarLineaPorLocalidad xmlns="http://clsw.smartmovepro.net/">
  <usuario>${SOAP_CONFIG.USUARIO}</usuario>
  <clave>${SOAP_CONFIG.CLAVE}</clave>
  <localidad>${SOAP_CONFIG.LOCALIDAD}</localidad>
  <provincia>${SOAP_CONFIG.PROVINCIA}</provincia>
  <pais>${SOAP_CONFIG.PAIS}</pais>
  <isSublinea>false</isSublinea>
</RecuperarLineaPorLocalidad>`;

  return soapRequest<{ lineas: Line[] }>(
    'RecuperarLineaPorLocalidad',
    soapBody
  );
}

/**
 * Obtener el recorrido de una línea específica
 */
export async function getLineRoute(
  lineCode: string
): Promise<{ puntos: RoutePoint[] }> {
  const soapBody = `<RecuperarRecorridoParaMapaPorEntidadYLinea xmlns="http://clsw.smartmovepro.net/">
  <usuario>${SOAP_CONFIG.USUARIO}</usuario>
  <clave>${SOAP_CONFIG.CLAVE}</clave>
  <codigoLineaParada>${lineCode}</codigoLineaParada>
  <isSublinea>false</isSublinea>
</RecuperarRecorridoParaMapaPorEntidadYLinea>`;

  return soapRequest<{ puntos: RoutePoint[] }>(
    'RecuperarRecorridoParaMapaPorEntidadYLinea',
    soapBody
  );
}

/**
 * Obtener las paradas de una línea específica
 */
export async function getStopPointsByLine(
  lineCode: string
): Promise<{ paradas?: any }> {
  const soapBody = `<RecuperarParadasCompletoPorLinea xmlns="http://clsw.smartmovepro.net/">
  <usuario>${SOAP_CONFIG.USUARIO}</usuario>
  <clave>${SOAP_CONFIG.CLAVE}</clave>
  <codigoLineaParada>${lineCode}</codigoLineaParada>
  <isSublinea>false</isSublinea>
  <isInteligente>false</isInteligente>
</RecuperarParadasCompletoPorLinea>`;

  return soapRequest<{ paradas?: any }>(
    'RecuperarParadasCompletoPorLinea',
    soapBody
  );
}

/**
 * Obtener las paradas más cercanas a una ubicación
 */
export async function getNearestStops(
  latitude: number,
  longitude: number
): Promise<{ paradas: Stop[] }> {
  const soapBody = `<RecuperarParadasMasCercanasPorLocalidadProvinciaPais xmlns="http://clsw.smartmovepro.net/">
  <usuario>${SOAP_CONFIG.USUARIO}</usuario>
  <clave>${SOAP_CONFIG.CLAVE}</clave>
  <latitud>${latitude}</latitud>
  <longitud>${longitude}</longitud>
  <listaCodigosEmpresa>${SOAP_CONFIG.LISTA_CODIGOS_EMPRESA}</listaCodigosEmpresa>
  <descripcionProvincia>${SOAP_CONFIG.PROVINCIA}</descripcionProvincia>
  <descripcionPais>${SOAP_CONFIG.PAIS}</descripcionPais>
  <isInteligente>false</isInteligente>
</RecuperarParadasMasCercanasPorLocalidadProvinciaPais>`;

  return soapRequest<{ paradas: Stop[] }>(
    'RecuperarParadasMasCercanasPorLocalidadProvinciaPais',
    soapBody
  );
}

/**
 * Obtener los próximos arribos a una parada
 */
export async function getArrives(
  lineCode: string,
  stopId: string
): Promise<{ arribos?: Arrival[] }> {
  const soapBody = `<RecuperarProximosArribos xmlns="http://clsw.smartmovepro.net/">
  <usuario>${SOAP_CONFIG.USUARIO}</usuario>
  <clave>${SOAP_CONFIG.CLAVE}</clave>
  <identificadorParada>${stopId}</identificadorParada>
  <codigoLineaParada>${lineCode}</codigoLineaParada>
  <codigoAplicacion>${SOAP_CONFIG.CODIGO_APLICACION}</codigoAplicacion>
  <localidad>${SOAP_CONFIG.LOCALIDAD}</localidad>
</RecuperarProximosArribos>`;

  const result = await soapRequest<{ arribos?: Arrival[] }>(
    'RecuperarProximosArribos',
    soapBody
  );

  return {
    arribos: result.arribos || [],
  };
}
