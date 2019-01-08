

module.exports = {
  sendFlightstatus(sender.id, responseText) {
    if(responseText ){
    var soap = require('soap');
    var url = 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl';
    var args = {FlightNumber: responseText};
      soap.createClient(url, function(err, client) {
          client.FlightStatus.FlightStatusHttpSoap12Endpoint.SmsgetFlightInfoByFlightNumber(args,
             function(err, result) {
                if(result != null){

                let jsreturn = result.return;
                if(jsreturn != null){

                let statut = jsreturn[0].statut;
              }
            }
          });
      });
    }
  }


}
