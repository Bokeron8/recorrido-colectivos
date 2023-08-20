import axios from 'axios';
import { XMLParser, XMLBuilder } from "fast-xml-parser";

export async function GET({ url }) {


    const parser = new XMLParser();
    const builder = new XMLBuilder();


    let data = `<?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RecuperarLineaPorLocalidad xmlns="http://clsw.smartmovepro.net/">
                    <usuario>WEB.CORRIENTES</usuario>
                    <clave>PAR.SW.CORRIENTES</clave>
                    <localidad>Corrientes</localidad>
                    <provincia>Corrientes</provincia>
                    <pais>Argentina</pais>
                    <isSublinea>false</isSublinea>
                    </RecuperarLineaPorLocalidad>
                </soap:Body>
                </soap:Envelope>`;

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://clswcorrientes.smartmovepro.net/ModuloParadas/SWParadas.asmx',
        headers: {
            'connection': 'close',
            'host': 'clswcorrientes.smartmovepro.net',
            'soapaction': 'http://clsw.smartmovepro.net/RecuperarLineaPorLocalidad',
            'Content-Type': 'text/xml;charset=utf-8',

        },
        data: data,
        responseType: 'document'
    };

    try {
        const response = await axios.request(config);
        let jObj = parser.parse(response.data);
        return new Response(jObj['soap:Envelope']['soap:Body']['RecuperarLineaPorLocalidadResponse']['RecuperarLineaPorLocalidadResult']);

    } catch (error) {
        let jObj = parser.parse(error.response.data);
        return new Response(JSON.stringify(jObj))
    }
}
