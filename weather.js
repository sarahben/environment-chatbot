var http, options, proxy, url;

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

http.get(options, function(res) {
  // res.pipe(process.stdout);
  console.log("status code", res);
  console.log(res); });

http.post(options, function(res)  {
  var soap = require('soap');
  // var wsdlurl = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
  var args = {FlightNumber: 'AT424'};
  var opts = {
        wsdl_options: {
            proxy: process.env.QUOTAGUARDSTATIC_URL
            //http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293
            }
          }
    soap.createClient(options.path, opts, function(err, client) {
        client.FlightStatus.FlightStatusHttpSoap12Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result) {
            console.log(result);
            if(result != null){
              let jsreturn = result.return;
              console.log(jsreturn);
            //
            // let statut = jsreturn[0].statut;
            // console.log(statut);}
        });
    });
});

//////PART II
// var soap = require('soap');
// var url = 'C:/Users/pc/webhook/flightstatus.xml';
// var args = {FlightNumber: 'AT424'};
//   soap.createClient(url, function(err, client) {
//       client.FlightStatus.FlightStatusHttpSoap11Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result) {
//           console.log(result);
//           if(result != null){
//           let jsreturn = result.return;
//           console.log(jsreturn);
//
//           let statut = jsreturn[0].statut;
//           console.log(statut);}
//       });
//   });

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
