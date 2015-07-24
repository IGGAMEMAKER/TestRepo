var http = require('http');
this.sendRequest = sendRequest;
//this.sendRequest1 = sendRequest1;
this.printer = printer;

function printer(res) {
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
		console.log("body: " + chunk);
	    });
	};

/*function sendRequest(urlPath, options, curData, responseCallBack){
	
}*/
function sendRequest(urlPath, curData, host, port, responseCallBack){
	var options = {
		host: host,
		port: port,
		path: urlPath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(curData)
		}};
	options.path = "/"+urlPath;
	if (curData !== null && curData !== undefined){
		options.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(curData)
	    	}
	}
	else{
		console.log('Data null ' + urlPath);
	}
	var req = http.request(options, responseCallBack);

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	req.write(curData);
	req.end();
}




/*
function sendRequest(urlPath, options, curData, responseCallBack){
	options.path = "/"+urlPath;
	if (curData !== null && curData !== undefined){
		options.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(curData)
	    	}
	}
	else{
		console.log('Data null ' + urlPath);
	}
	var req = http.request(options, printer);

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	req.write(curData);
	req.end();
}
function sendRequest1(urlPath, curData, host, port, responseCallBack){
	var options = {
		host: host,
		port: port,
		path: urlPath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(curData)
		}};
	sendRequest(urlPath, options, curData, responseCallBack);
}*/
