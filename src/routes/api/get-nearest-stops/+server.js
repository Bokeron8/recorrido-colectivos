import axios from 'axios';
import { XMLParser } from "fast-xml-parser";

export async function GET({ url }) {

    const latitud = url.searchParams.get('latitud');
    const longitud = url.searchParams.get('longitud');
    const parser = new XMLParser();


    let data = `<?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RecuperarParadasMasCercanasPorLocalidadProvinciaPais xmlns="http://clsw.smartmovepro.net/">
                    <usuario>WEB.CORRIENTES</usuario>
                    <clave>PAR.SW.CORRIENTES</clave>
                    <latitud>${latitud}</latitud>
                    <longitud>${longitud}</longitud>
                    <listaCodigosEmpresa>358</listaCodigosEmpresa>
                    <descripcionProvincia>CORRIENTES</descripcionProvincia>
                    <descripcionPais>ARGENTINA</descripcionPais>
                    <isInteligente>false</isInteligente>
                    </RecuperarParadasMasCercanasPorLocalidadProvinciaPais>
                </soap:Body>
                </soap:Envelope>`;

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://clswcorrientes.smartmovepro.net/ModuloParadas/SWParadas.asmx',
        headers: {
            'connection': 'close',
            'host': 'clswcorrientes.smartmovepro.net',
            'soapaction': 'http://clsw.smartmovepro.net/RecuperarParadasMasCercanasPorLocalidadProvinciaPais',
            'Content-Type': 'text/xml;charset=utf-8',

        },
        data: data,
        responseType: 'document'
    };

    try {
        const response = await axios.request(config);
        let jObj = parser.parse(response.data);
        return new Response(jObj['soap:Envelope']['soap:Body']['RecuperarParadasMasCercanasPorLocalidadProvinciaPaisResponse']['RecuperarParadasMasCercanasPorLocalidadProvinciaPaisResult']);

    } catch (error) {
        let jObj = parser.parse(error.response.data);
        return new Response(JSON.stringify(jObj))
    }
}
