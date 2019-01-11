// // access an HTTP API
// var http, options, proxy, url;
//
// http = require("http");
// url = require("url");
//
// let quota = process.env.QUOTAGUARDSTATIC_URL";
//
// proxy = url.parse(quota);
// target  = url.parse("http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl");
//
// options = {
//   hostname: proxy.hostname,
//   port: proxy.port || 80,
//   path: target.href,
//   headers: {
//     "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
//     "Host" : target.hostname
//   }
// };
//
// http.get(options, function(res) {
//   res.pipe(process.stdout);
//   return console.log("status code", res.statusCode);
//   });
// //access an HTTP API
//
// http.(options, function(res)  {
//   var soap = require('soap');
//   // var wsdlurl = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
//   var args = {FlightNumber: 'AT424'};
//   var opts = {
//         wsdl_options: {
//             proxy: process.env.QUOTAGUARDSTATIC_URL
//             }
//           }
//     soap.createClient(options.path, opts, function(err, client) {
//         client.FlightStatus.FlightStatusHttpSoap12Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result) {
//             console.log(result);
//             if(result != null){
//               let jsreturn = result.return;
//               console.log(jsreturn);}
            //
            // let statut = jsreturn[0].statut;
            // console.log(statut);}
//         });
//     });
// });

//////PART II
var soap = require('soap');
var url = './flightstatus.xml';
var args = {FlightNumber: 'AT424'};
var opts = {
      wsdl_options: {
          proxy: process.env.QUOTAGUARDSTATIC_URL
          }
        }
  soap.createClient(url, opts, function(err, client) {
     console.log('connected');
      client.FlightStatus.FlightStatusHttpSoap11Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result) {
          console.log(result);
          if(result != null){
          let jsreturn = result.return;
          console.log(jsreturn);

          let statut = jsreturn[0].statut;
          console.log(statut);}
      });
  });

// 'use strict';
//
// var soap = require('strong-soap').soap;
// var url = './flightstatus.wsdl';
// var requestArgs = {
//     FlightNumber: 'AT424'
// };
//
// var options = {};
// soap.createClient(url, options, function(err, client) {
//   var method = client['SmsgetFlightInfoByFlightNumber'];
//   method(requestArgs, function(err, result, envelope, soapHeader) {
//     console.log(result);
//     //response envelope
//     console.log('Response Envelope: \n' + envelope);
//     //'result' is the response body
//     console.log('Result: \n' + JSON.stringify(result));
//   });
// });
