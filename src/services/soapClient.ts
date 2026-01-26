import axios, { AxiosRequestConfig } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { SOAP_CONFIG } from '../constants/config';

const parser = new XMLParser();

/**
 * Cliente SOAP genérico para hacer llamadas al servidor de colectivos
 */
export async function soapRequest<T>(
  soapAction: string,
  soapBody: string
): Promise<T> {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${soapBody}
  </soap:Body>
</soap:Envelope>`;

  const config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: SOAP_CONFIG.BASE_URL,
    headers: {
      connection: 'close',
      host: 'clswcorrientes.smartmovepro.net',
      soapaction: `http://clsw.smartmovepro.net/${soapAction}`,
      'Content-Type': 'text/xml;charset=utf-8',
    },
    data: envelope,
    responseType: 'text', // Cambiar de 'document' a 'text' para React Native
  };

  try {
    const response = await axios.request(config);
    
    // Parsear la respuesta XML
    const jObj = parser.parse(response.data);
    
    // Log para debug
    console.log('SOAP Response parsed:', JSON.stringify(jObj).substring(0, 200));
    
    // Navegar por la estructura del XML
    const envelope = jObj['soap:Envelope'] || jObj['Envelope'];
    if (!envelope) {
      console.error('No se encontró soap:Envelope en la respuesta');
      throw new Error('Respuesta SOAP inválida');
    }
    
    const body = envelope['soap:Body'] || envelope['Body'];
    if (!body) {
      console.error('No se encontró soap:Body en la respuesta');
      throw new Error('Respuesta SOAP inválida');
    }
    
    const responseNode = body[`${soapAction}Response`];
    if (!responseNode) {
      console.error(`No se encontró ${soapAction}Response en la respuesta`);
      throw new Error('Respuesta SOAP inválida');
    }
    
    let result = responseNode[`${soapAction}Result`];
    
    // Si el resultado es un string JSON, parsearlo
    if (typeof result === 'string') {
      try {
        console.log('Parseando resultado como JSON string...');
        result = JSON.parse(result);
        console.log('Resultado parseado:', JSON.stringify(result).substring(0, 300));
      } catch (e) {
        console.warn('El resultado es un string pero no es JSON válido:', result.substring(0, 100));
      }
    }
    
    return result as T;
  } catch (error: any) {
    console.error(`Error en SOAP request ${soapAction}:`, error.message);
    
    if (error.response?.data) {
      console.error('Error response data:', error.response.data.substring(0, 500));
      const jObj = parser.parse(error.response.data);
      throw new Error(JSON.stringify(jObj));
    }
    
    throw error;
  }
}
