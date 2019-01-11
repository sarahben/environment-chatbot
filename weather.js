const request = require('request')

const xml = './Enveloppe.xml'
const opts = {
    body: xml,
    headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'runTransaction'
    },
    wsdl_options: {
        proxy: process.env.QUOTAGUARDSTATIC_URL
    }
}

const url = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl'

const body = request.post(url, opts, (err, response) => {
    console.log('response', response.body)
})
