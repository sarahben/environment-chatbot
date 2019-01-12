const https = require('https')
const fs = require('fs')
const url = require('url')

const xml = fs.readFileSync('./Enveloppe.xml','utf-8')
var quota = "http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293";

var proxy = url.parse(quota);
var target  = url.parse("http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl");

const options = {
    hostname: proxy.hostname,
    port: proxy.port || 80,
    url: 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl',
    qs: { 'wsdl': ''},
    method: 'POST',
    proxy: quota,
    headers: {
      'User-Agent' : 'sampleTest',
      'Content-Type' : 'text/xml;charset=utf-8',
      "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
      "Host" : target.hostname,
      'soapAction' : 'urn:SmsgetFlightInfoByFlightNumber'
    },
  }
    body: body,
    timeout: 5000
// const options = {
//     hostname: proxy.hostname,
//     port: proxy.port || 80,
//     path: target.href,
//     method : 'POST',
//     headers : {
//         'User-Agent' : 'sampleTest',
//         'Content-Type' : 'text/xml;charset=utf-8',
//         "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
//         "Host" : target.hostname,
//         'soapAction' : 'urn:SmsgetFlightInfoByFlightNumber'
//     }
// }
var obj = https.request(options,(resp)=>{
    let data = ''
    fs.writeFile('server.log',resp.statusCode+"\n"+JSON.stringify(resp.headers),(err)=>{
        err ? console.log(err) : console.log('log file written')
    })
    resp.on('data',(chunk)=>{
        data += chunk
    })
    resp.on('end',()=>{
        fs.writeFile('soap-response.xml',data,(err)=>{
            err ? console.log(err) : console.log('data file written')
        })
        console.log(data)
    })
}).on('error',(err)=>{
    console.log("Error: " + err.message)
})

/**
 * '.write()' is not being used:
 * obj.write(xml) ? console.log('op success') : console.log('error!')
 * obj.end()
 */

obj.end(xml) ? console.log('op success') : console.log('error!')
