const request = require('request');
const readline = require('readline');

// Restaurant data.
let restaurants = [];

// Extracting specific fields from data.
const prepareData = (data) => {
	let res = [];
	for(item of data) {
		res.push({
			name: item['applicant'],
			address: item['location']
		})
	}
	return res;
}

// Filtering the restaurant that opens in-between current time.
const filterDataBasedOnTime = (data) => {
	let map = {}; // Using a map to remove duplicates.
	let res = []; // Results.
	let currentTime = new Date(Date.now()); // Getting the current time.
	let hour = currentTime.getHours(); // Extracting the hour from data.
	let min = currentTime.getMinutes(); // Extracting the minutes from data.
	let currentTimeMin = hour * 60 + min; // Calculating the current time in minute.
	console.log(currentTimeMin);

	for(item of data) {
		let startTime = item['start24'].split(':'); // Extracting the start time from data.
		let endTime = item['end24'].split(':'); // Extracting the end time from data.
		let startTimeMin = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); // Calculating the start time in minute.
		let endTimeMin = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); // Calculating the end time in minute.


		if(currentTimeMin > startTimeMin && currentTimeMin < endTimeMin) {
			// Filtering the restaurant that opens in-between current time. Storing them into the map where key is the address. 
			// Noted that the restaurant name can be the same but address can't be the same.
			map[item['location']] = item;
		}
	}

	for(address in map) {
		res.push(map[address]);
	}
	return res;
}

// Sorting the data alphabetically by the restaurant name.
const sortAlphabeticallyByName = (data) => {
	return data.sort((a, b) => {
		if(a.applicant < b.applicant) { return -1; }
		if(a.applicant > b.applicant) { return 1; }
		return 0;
	});
}

// Displaying the data.
const display = (data) => {
	console.log('NAME ADDRESS');
	for(item of data) {
		console.log(item.name + ', ' + item.address);
	}
}

// Creating a readline object that deal with user input and output.
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Sending the request and deal with the response.
request('https://data.sfgov.org/resource/jjew-r69b.json', function (error, response, body) {
	if(error) {
		console.error('Some Error Occurs:', error);
	} else {
		restaurants = JSON.parse(body); // Parsing the response into JSON format.
		let page = 0; // Variable for pagination.
		let filteredData = filterDataBasedOnTime(restaurants); // Filter data.
		filteredData = sortAlphabeticallyByName(filteredData); // Sort data.

		console.log('Press 1 to display 10 available restaurants.'); // Print instructions.
		console.log('Press 2 to exit.');

		rl.on('line', (userInput) => { // Readline object accept user inputs.
			if (userInput === '1') {
				if(page >= filteredData.length) { // If there is no data left, quit.
					console.log('No other shops are opening right now.');
					rl.close();
				} else {
					let data = prepareData(filteredData.slice(page, page + 10)); // Slicing data.
					display(data); // Display data.
					page += 10; // Pagination.
				}
			} else if (userInput === '2') { // Quit the command line.
				rl.close();
			} else { // Handle invalid user inputs.
				console.log('Invalid input.');
			}
		});
	}
});


// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js