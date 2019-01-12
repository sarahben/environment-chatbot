var http = require('http');

var options = {
  host: 'trackbag.royalairmaroc.com',
  port: 80,
  path : '/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna',
  method : 'GET'
};

  var body = '';

callback = function(res){
  res.on('data', function (chunk) {
    body += chunk;
      });
  res.on('end', function () {
    var result = JSON.parse(body);
    console.log(result.statut, "Hamza");
    console.log(req.data, "Karim");
    console.log(body, "sara");
  });
}

var req = http.request(options, callback).end();
console.log(body, "================");
