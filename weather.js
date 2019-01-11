// const request = require('request');
//
// const xml = './Enveloppe.xml';
// const opts = {
//     body: xml,
//     headers: {
//         'Content-Type': 'text/xml; charset=utf-8',
//         SOAPAction: 'runTransaction'
//     },
//     wsdl_options: {
//         proxy: process.env.QUOTAGUARDSTATIC_URL
//     }
// }
// console.log(xml);
// const url = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
//
// const body = request.post(url, opts, (err, response) => {
//     console.log('response', response.body);
// })


// access an HTTP API
'use strict';
var http, options, proxy, url, target;

http = require("http");
url = require("url");

let quota = "http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293";

proxy = url.parse(quota);
target  = url.parse("http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl");

options = {
  hostname: proxy.hostname,
  port: proxy.port || 80,
  path: target.href,
  headers: {
    "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
    "Host" : target.hostname
  }
};
console.log(proxy);

http.get(options, function(res) {
  res.pipe(process.stdout);
  return console.log("status code", res.statusCode);
  });
