import axios from 'axios';
import { XMLParser } from "fast-xml-parser";

export async function GET({ url }) {
    const linea = url.searchParams.get('linea');
    const parser = new XMLParser();

    let data = `<?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <RecuperarParadasPorLineaParaCuandoLlega xmlns="http://clsw.smartmovepro.net/">
                    <usuario>WEB.CORRIENTES</usuario>
                    <clave>PAR.SW.CORRIENTES</clave>
                    <codigoLineaParada>${linea}</codigoLineaParada>
                    <isSubLinea>false</isSubLinea>
                    <isInteligente>false</isInteligente>
                    </RecuperarParadasPorLineaParaCuandoLlega>
                </soap:Body>
                </soap:Envelope>`;

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://clswcorrientes.smartmovepro.net/ModuloParadas/SWParadas.asmx',
        headers: {
            'connection': 'close',
            'host': 'clswcorrientes.smartmovepro.net',
            'soapaction': 'http://clsw.smartmovepro.net/RecuperarParadasPorLineaParaCuandoLlega',
            'Content-Type': 'text/xml;charset=utf-8',

        },
        data: data,
        responseType: 'document'
    };

    try {
        const response = await axios.request(config);
        let jObj = parser.parse(response.data);
        return new Response(jObj['soap:Envelope']['soap:Body']['RecuperarParadasPorLineaParaCuandoLlegaResponse']['RecuperarParadasPorLineaParaCuandoLlegaResult']);

    } catch (error) {
        let jObj = parser.parse(error.response.data);
        return new Response(JSON.stringify(jObj))
    }
}
