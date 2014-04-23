var fs = require('fs'),
	sys = require('sys'),
	http = require('http');
  
  

function GetJSON(url, callbacks) {

	http.get(url, function(res) {

		res.setEncoding('utf8');
	
		res.on("data", function(chunk) {
		
			callbacks.data(chunk);
		});	
		
		res.on("end", function() {
		
			callbacks.end();
		});
		
	}).on('error', function(e) {

		console.log('error : ' + e);
	});	
}



http.createServer(function (req, res) {
	
	var url = 'http://countdown.tfl.gov.uk/stopBoard/77359';
	
	console.log('request received');
	
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	GetJSON(url, {
	
		data : function(chunk) {
			
			res.write(chunk);
		},
		
		end : function() {
		
			res.end();
			
			console.log('response dispatched');
		}
	});
  
}).listen(9000);

