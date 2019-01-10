var soap = require('soap');
var url = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
var args = {FlightNumber: 'AT424'};
  soap.createClient(url, function(err, client) {
      client.FlightStatus.SmsgetFlightInfoByFlightNumber(args, function(err, result) {
          console.log(result);
          if(result != null){
          let jsreturn = result.return;
          console.log(jsreturn);

          let statut = jsreturn[0].statut;
          console.log(statut);}
      });
  });
