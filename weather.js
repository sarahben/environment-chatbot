const request = require('request');

const parser = require('body-parser');
var body_xml = 'AT424';
var requestBody =
  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
  'xmlns:ws="http://ws.royalairmaroc.com"> <soapenv:Header/>' +
  '<soapenv:Body> <ws:SmsgetFlightInfoByFlightNumber>' +
  '<ws:FlightNumber>' + body_xml + '</ws:FlightNumber>' +
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
  //console.log(body, "Body------------------------");
  if (error) {
    console.log(error);
  } else {
//Afficher resultat
// console.log(body);
  var DOMParser = new (require('xmldom')).DOMParser;
  var doc = DOMParser.parseFromString(body);
  var NodeById = doc.getElementsByTagName('ax21:statut')[0];
if (NodeById != null){
  var y = NodeById.childNodes[0];
  var z = y.nodeValue;
  console.log(String(z) + "coucou");
} else {
  console.log("vol non correct");  }
} //else

});
