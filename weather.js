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
var http = require("http");
var url = require("url");
var soap = require('soap');
var args = {FlightNumber: 'AT424'};

var quota = "http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293";

var proxy = url.parse(quota);
var target  = url.parse("http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl");

var options = {
  hostname: proxy.hostname,
  port: proxy.port || 80,
  path: target.href,
  headers: {
    "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
    "Host" : target.hostname
  }
};
var opts = {
        wsdl_options: {
            proxy: process.env.QUOTAGUARDSTATIC_URL
        }
    };
console.log(proxy);
soap.createClient(options.path, opts, function(err, client) {
    console.log('connected');
    client.FlightStatus.FlightStatusHttpSoap11Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result, body) {
        console.log(result);
        console.log("create data : ", body);
        if (err) {
          console.log(err);
        }
        // if(result != null){
        // let jsreturn = result.return;
        // console.log(jsreturn);
        //
        // let statut = jsreturn[0].statut;
        // console.log(statut);}
    });
});

// http.get(options, function(res) {
//   res.pipe(process.stdout);
//   return console.log("status code", res.statusCode);
//   });
