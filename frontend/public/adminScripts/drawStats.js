function drawChart(name, labels, datasets){
	var ctx = document.getElementById(name).getContext("2d");//"myChart"

	var data = {
	    labels: labels,
	    datasets: datasets
	};
	var myLineChart = new Chart(ctx).Bar(data);//, options);
}


function makeDataset(data, name, index, colour){
	var col = "rgba(";
	if (colour) {
		col += colour + ",";
	}	else {
		if (index >= 0){
			var kef = 10;
			col+= index * kef % 256 + ",";
			col+= index * kef % 256 + ",";
			col+= index * kef % 256 + ",";
		}
		else{
			// grey
			col+="220,220,220,";
		}
	}
	return {
		label: name,
		fillColor: col + "0.7)",
		strokeColor: col+ "1)",
		pointColor: col + "1)",
		pointHighlightStroke: col + "1)",

		pointStrokeColor: "#fff",
		pointHighlightFill: "#fff",
		data: data
	};
	/*return {
		label: name,
		fillColor: "rgba(220,220,220,0.2)",
		strokeColor: "rgba(220,220,220,1)",
		pointColor: "rgba(220,220,220,1)",
		pointHighlightStroke: "rgba(220,220,220,1)",

		pointStrokeColor: "#fff",
		pointHighlightFill: "#fff",
		data: data
	};*/
}

function drawMyChart(){
	var datasets =
	[
		makeDataset([65, 59, 80, 81, 56, 55, 40], 'first', 0, "220,220,220"),
		makeDataset([28, 48, 40, 19, 86, 27, 225], 'second', 1, "151,187,205")
	];
	drawChart('myChart', ["January", "February", "March", "April", "May", "June", "July", "August"], datasets);
}

function drawChart1(){
	var datasets =
	[
		makeDataset([65, 59, 80, 81, 56, 55, 40], 'first', 0, "220,20,20"),
		//makeDataset([28, 48, 40, 19, 86, 27, 190], 'second', 1, "151,187,205")
	];
	drawChart('chart1', ["January", "February", "March", "April", "May", "June", "July", "August"], datasets);
}

/*function drawTournamentStats(){
	var dat = [1,1,1,1,1,1];
	var datasets = [
		makeDataset(dat, 'Started')
		//makeDataset(dat, 'Opened', )
	]
	drawChart('tournStats', ["January", "February", "March", "April", "May", "June", "July", "August"], datasets);
}*/

function drawTournamentStats(inf){
	//var dat = [1,1,1,1,1,1];
	var info = JSON.parse(inf);
	console.log('1111');
	console.log(info);
	//console.log(JSON.parse(info));

	var started = info.started;
	var prized = info.prized;
	var finished =info.finished;
	var attempts = info.attempts;
	var opened = info.opened;
	console.log(opened);
	var IDs = info.IDs;


	var mail = info.mail;
	var mailFail = info.mailFail;
	var register = info.register;
	var registerFail = info.registerFail;
	var resetPassword = info.resetPassword;
	var resetPasswordFail = info.resetPasswordFail;


	var datasets = [
		makeDataset(started , 'started' ,0, "220,0,0"),
		makeDataset(finished, 'finished',1, "0,0,220"),
		makeDataset(prized  , 'prized'  ,2, "0,220,0")
		//makeDataset(attempts, 'attempts',3, "220,220,220")
		//makeDataset(dat, 'Opened', )
	];

	var datasets2 = [
		makeDataset(attempts, 'attempts', 3, "0,0,0"),
		makeDataset(opened  , 'opened'  , 3, "256,0,0")
	];

	var datasets3 = [
		makeDataset(register, 'register', 3, "0,0,0"),
		makeDataset(registerFail  , 'registerFail'  , 3, "256,0,0")
	];

	var datasetsMail = [
		makeDataset(mail, 'mail', 3, "0,0,0"),
		makeDataset(mailFail  , 'mailFail'  , 3, "256,0,0")
	];

	var datasetsReset = [
		makeDataset(resetPassword, 'resetPassword', 3, "0,0,0"),
		makeDataset(resetPasswordFail  , 'resetPasswordFail'  , 3, "256,0,0")
	];

	/*var gameStats = [
		makeDataset(resetPassword, 'resetPassword', 3, "0,0,0"),
		makeDataset(resetPasswordFail  , 'resetPasswordFail'  , 3, "256,0,0")
	]*/

	var Time = [1,2];
	drawChart('tournStats', IDs , datasets);
	drawChart('attemptToSuccess', IDs, datasets2);

	drawChart('register', Time, datasets3);
	drawChart('mail', Time, datasetsMail);
	drawChart('resetPassword', Time, datasetsReset);

}

//drawChart('myChart', ["January", "February", "March", "April", "May", "June", "July", "August"]);