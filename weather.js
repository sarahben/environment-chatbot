const request = require('request');
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


// // access an HTTP API
// 'use strict';
// var http = require("http");
// var url = require("url");
// var soap = require('soap');
// var args = {FlightNumber: 'AT424'};
//
// var quota = "http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293";
//
// var proxy = url.parse(quota);
// var target  = url.parse("http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl");
//
// var options = {
//   hostname: proxy.hostname,
//   port: proxy.port || 80,
//   path: target.href,
//   headers: {
//     "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
//     "Host" : target.hostname
//   }
// };
// var opts = {
//         wsdl_options: {
//             proxy: process.env.QUOTAGUARDSTATIC_URL
//         }
//     };
// console.log(proxy);
// soap.createClient(options.path, opts, function(err, client) {
//     console.log('connected');
//     client.FlightStatus.FlightStatusHttpSoap11Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result, body) {
//         console.log(result);
//         console.log("create data : ", body);
//         if (err) {
//           console.log(err);
//         }
//         // if(result != null){
//         // let jsreturn = result.return;
//         // console.log(jsreturn);
//         //
//         // let statut = jsreturn[0].statut;
//         // console.log(statut);}
//     });
// });
// // END OF access an HTTP API
// http.get(options, function(res) {
//   res.pipe(process.stdout);
//   return console.log("status code", res.statusCode);
//   });

// SOAP
// <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.royalairmaroc.com">
//   <soapenv:Header/>
//   <soapenv:Body>
//      <ws:SmsgetFlightInfoByFlightNumber>
//         <!--Optional:-->
//         <ws:FlightNumber>AT425</ws:FlightNumber>
//      </ws:SmsgetFlightInfoByFlightNumber>
//   </soapenv:Body>
// </soapenv:Envelope>;
const parser = require('body-parser');
var requestBody =
  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
  'xmlns:ws="http://ws.royalairmaroc.com"> <soapenv:Header/>' +
  '<soapenv:Body> <ws:SmsgetFlightInfoByFlightNumber>' +
  '<ws:FlightNumber>AT425</ws:FlightNumber>' +
  '</ws:SmsgetFlightInfoByFlightNumber>' +
  '</soapenv:Body>' +
  '</soapenv:Envelope>';

var requestHeaders = {
  'cache-control': 'no-cache',
  'soapaction': 'urn:SmsgetFlightInfoByFlightNumber',
  'content-type': 'text/xml;charset=UTF-8'
};

var requestOptions = {
  'method': 'POST',
  'url': 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl',
  'qs': { 'wsdl': ''},
  'proxy': 'http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293',
  'headers': requestHeaders,
  'body': requestBody,
  'timeout': 5000
};

request(requestOptions, function (error, response, body) {
  if (error) {
    console.log(error);
  } else {
    console.log(body);
    //   var parsingOptions = {
    //     'object': true,
    //     'sanitize': false
    //   };
    //   var jsonResult = parser.toJson(body, parsingOptions); // from xml
    //   if(jsonResult['soapenv:Envelope']
    //     ['soapenv:Body']
    //     ['ns1:AddRoomResponse']
    //     ['ns1:OK'] === 'OK') {
    //       conferenceInfo(req, res, next, params);
    //       console.log(jsonResult);
    //   } else {
    //      console.log(error);// handle error
    //   // handle error
    // }
   }
});//.auth(vidyoApiUsername, vidyoApiPassword);
// you can remove this .auth if your api has no authentication
