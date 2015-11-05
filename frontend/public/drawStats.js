function drawChart(name, labels, datasets){
	var ctx = document.getElementById(name).getContext("2d");//"myChart"

	var data = {
	    labels: labels,
	    datasets: datasets
	};
	var myLineChart = new Chart(ctx).Line(data);//, options);
}


function makeDataset(data, name, index, colour){
	var col = "rgba(";
	if (colour) col+=colour+",";
	else{
		if (index>=0){
			var kef=10;
			col+= index*kef%256 + ",";
			col+= index*kef%256 + ",";
			col+= index*kef%256 + ",";
		}
		else{
			// grey
			col+="220,220,220,";
		}
	}
	return {
		label: name,
		fillColor: col + "0.2)",
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

function drawTournamentStats(){
	var dat = [1,1,1,1,1,1];
	var datasets = [
		makeDataset(dat, 'Started')
		//makeDataset(dat, 'Opened', )
	]
	drawChart('tournStats', ["January", "February", "March", "April", "May", "June", "July", "August"], datasets);
}

//drawChart('myChart', ["January", "February", "March", "April", "May", "June", "July", "August"]);