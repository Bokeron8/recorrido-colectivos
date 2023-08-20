import axios from 'axios';
import { XMLParser, XMLBuilder } from "fast-xml-parser";

export async function GET({ url }) {

    const parada = url.searchParams.get('parada');
    const linea = url.searchParams.get('linea');

    const parser = new XMLParser();
    const builder = new XMLBuilder();


    let data = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
                <soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
                    <soap:Body>
                            <RecuperarProximosArribos xmlns=\"http://clsw.smartmovepro.net/\">
                                        <usuario>WEB.CORRIENTES</usuario>
                                        <clave>PAR.SW.CORRIENTES</clave>
                                        <identificadorParada>${parada}</identificadorParada>
                                        <codigoLineaParada>${linea}</codigoLineaParada>
                                        <codigoAplicacion>24</codigoAplicacion>
                                        <localidad>CORRIENTES</localidad>
                            </RecuperarProximosArribos>
                    </soap:Body>
                </soap:Envelope>`;

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://clswcorrientes.smartmovepro.net/ModuloParadas/SWParadas.asmx',
        headers: {
            'connection': 'close',
            'host': 'clswcorrientes.smartmovepro.net',
            'soapaction': 'http://clsw.smartmovepro.net/RecuperarProximosArribos',
            'Content-Type': 'text/xml;charset=utf-8',

        },
        data: data,
        responseType: 'document'
    };

    try {
        const response = await axios.request(config);
        let jObj = parser.parse(response.data);
        return new Response(jObj['soap:Envelope']['soap:Body']['RecuperarProximosArribosResponse']['RecuperarProximosArribosResult']);

    } catch (error) {
        let jObj = parser.parse(error.response.data);
        return new Response(JSON.stringify(jObj))
    }
}
