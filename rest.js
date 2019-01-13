var http = require('http');

var options = {
  host: 'trackbag.royalairmaroc.com',
  port: 80,
  path : '/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna',
  method : 'GET'
};

http.request(options, function(res){
    var body = '';

    res.on('data', function (chunk) {
      body += chunk;
        });
    res.on('end', function () {
      var result = JSON.parse(body);
      console.log(result.statut);
    });
}).end();
