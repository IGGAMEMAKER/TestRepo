var http = require('http');
var url = require('url');
var server = new http.Server();

server.listen(5001, '127.0.0.1');

server.on('request', function(req,res) {
	var cars = ["Saab1", "Volvo1", "BMW1"];

	cars.push("LADADADADADA");
	res.setHeader('Content-Type', 'application/json');
	//res.write(JSON.stringify({ a: 1 }));
	var urlParsed = url.parse(req.url);
	console.log(urlParsed);
	res.write(JSON.stringify(cars));
	res.write("\n");
	//res.write(urlParsed);
	res.end("Chiao");
	//res.json({ msgId: 123 });
	//res.write("OLOLO");
	//res.end("Hola");
});
