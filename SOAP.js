var request = require('request');

var options = {
    proxy: process.env.QUOTAGUARDSTATIC_URL,
    url: 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl',
    headers: {
        'User-Agent': 'node.js'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    } else {
      console.log(error);
    }
}

request(options, callback);

var soap = require('soap');
var url = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
var args = {FlightNumber: 'AT424'};
var opts = {
        wsdl_options: {
            proxy: process.env.QUOTAGUARDSTATIC_URL
        }
    };
  soap.createClient(url, opts, function(err, client) {
      console.log('connected');
      client.FlightStatus.FlightStatusHttpSoap12Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result) {
        if (!err){
            console.log(result);
        } else {
          console.log(err); }
          // if(result != null){
          // let jsreturn = result.return;
          // console.log(jsreturn);
          //
          // let statut = jsreturn[0].statut;
          // console.log(statut);}
      });
  });

//FlightStatusHttpSoap11Endpoint.
