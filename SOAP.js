var soap = require('soap');
var url = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
var args = {FlightNumber: 'AT424'};
opts = {
        wsdl_options: {
            proxy: process.env.QUOTAGUARDSTATIC_URL
        }
    };
  soap.createClient(url, opts, function(err, client) {
      console.log('connected');
      client.FlightStatus.FlightStatusHttpSoap11Endpoint.SmsgetFlightInfoByFlightNumber(args, function(err, result, body) {
          console.log(result);
          console.log("create data : ", body);
          // if(result != null){
          // let jsreturn = result.return;
          // console.log(jsreturn);
          //
          // let statut = jsreturn[0].statut;
          // console.log(statut);}
      });
  });
