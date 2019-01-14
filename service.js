const https = require('https');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'xml.xml');

fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
      var DOMParser = new (require('xmldom')).DOMParser;
      var doc = DOMParser.parseFromString(data);
      var NodeById = doc.getElementsByTagName('companyId')[0];
      var y = NodeById.childNodes[0];
      var z = y.nodeValue;
      console.log(z, "test333333333333");
    } else {
        console.log(err);
    }
});
