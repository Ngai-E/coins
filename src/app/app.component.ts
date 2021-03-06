import { Component } from '@angular/core';

var assets;
var timestamps;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'coins';
}

class crypto {
	static getAssetsInfo(callback){
		//alert('test');
		return fetch("https://api.coincap.io/v2/assets")
					.then(response => {
						return response.json();
					})
					.then(assets => {
						//console.log(assets);
						callback(null, assets);
					})
					.catch(e => {
						//console.log(`an error ocurred with status of ${e}`);
						callback(`Request failed. Returned status of ${e}`,null);
					})
	}

	//view users log in
	static logInfo(callback){
		//alert('test');
		return fetch("http://localhost:8080/log/view")
					.then(response => {
						return response.json();
					})
					.then(response => {
						//console.log(response);
						callback(null, response);
					})
					.catch(e => {
						//console.log(`an error ocurred with status of ${e}`);
						callback(`Request failed. Returned status of ${e}`,null);
					})
	}

	
	//save log in database
	static logUser(device, browser, ip, date, location, callback){
		//alert('test');
		return fetch(`http://localhost:8080/log/add?device=${device}&ip=${ip}&browser=${browser}&location=${location}&date=${date}`)
					.then(response => {
						//console.log(response);
						callback(null, response.status);
					})
					.catch(e => {
						//console.log(`an error ocurred with status of ${e}`);
						callback(`Request failed. Returned status of ${e}`,null);
					})
	}

}



//fetch the top 100 currencies
function fetchCoins(){
	crypto.getAssetsInfo(function (error,asset) {

		if(error){   //an error occured
			console.log(error);
		} else{
			//console.log(asset.data);
			assets = asset.data;
			timestamps = asset.timestamp;
			plotChart(5);
			fillCoinsHTML();     //design coins html
		}
	});

	crypto.logInfo(function (error,response) {

		if(error){   //an error occured
			///console.log(error);
		} else{
			
		}
	});
}  //close fetchcoins

//function to plot chart for the past seven days
function plotgraphs(url, id){
	let price = [];  //to hold the price variation in the past 7 days
	

	//console.log(url);
	fetch(url)
		.then(response => {
			return response.json();
		})
		.then(response => {
			//console.log(response);
			
			//get the prices
			for(let item of response.data){
				//console.log(Number(item.priceUsd));
				price.push(Number(item.priceUsd));
			}

			//plot
			//plot
			let data = {
					  labels:[],
					  series: [price]
					  
					};

			// Create a new line chart object where as first parameter we pass in a selector
			// that is resolving to our chart container element. The Second parameter
			// is the actual data object.
			new Chartist.Line(`#${id}`, data);

		}).catch(e => {
			console.log(e)
		});

} //end function to plot graph

//plot chart for top x crypto currencies
function plotChart(x){
	let serie = [];
	let label = [];
	let sum = 0;
	//let i;

	//loop through the asset to get the top x
	for (var i = x - 1; i >= 0; i--) {
		serie[i] = Number(assets[i].marketCapUsd);
		//console.log(serie[i])
		label[i] = assets[i].name;
		sum += serie[i];

	}

	//get percentages
	for (var i = x - 1; i >= 0; i--) {
		serie[i] = ((serie[i] / sum) * 100).toFixed(1);
		label[i] = `${label[i]} (${serie[i]}%)`;
		//console.log(serie[i])
	}
	//console.log(sum)
	//console.log(serie.length)

	//plot
	new Chart(document.getElementById("pie-chart").getContext('2d'), {
    type: 'pie',
    data: {
      labels:label,
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
        data: serie
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Top Five Crypto Currencies By Market Capitalization'
      }
    }
});
	
}//end plot for top five crypto currencies

//change colour
function highlightChange(percent){
	if(percent.match(/[-]/i))
		return `change(24Hr):<b style="color:red;"> ${percent}%</b>`;
	else
		return `change(24Hr):<b style = "color:green;"> ${percent}%</b>`;
}//end highlighChange

//display the coins
function fillCoinsHTML(asset = assets){
	const rows = document.getElementById('cards');
	asset.forEach(function coins(coin){

		const card = document.createElement('div') //create a bootstrap card element
		card.className = 'card styleCard';

 		const logo = document.createElement('img'); // create the crytocurrency logo
 		//logo.setAttribute('src', `https://chasing-coins.com/api/v1/std/logo/${coin.symbol}`); //https://chasing-coins.com/coin/logo/
 		logo.setAttribute('src', `https://chasing-coins.com/coin/logo/${coin.symbol}`);
 		//logo.className = 'card-img-top cryto-image';
 		logo.setAttribute('class', `card-img-top`);
 		logo.setAttribute("style", "width:60px;align-self: center;margin-top: 20px;" )
 		logo.setAttribute('alt', `${coin.id} logo`);

 		const cardBody = document.createElement('div'); //create the bootstrap 4 card-body
 		cardBody.setAttribute('class', 'card-body');
 		cardBody.innerHTML = `<h4 class="card-title">${coin.name} <small>(${coin.symbol})</small></h4>
            <p class="card-text">
              <span style="display: block;"><b>price: ${coin.priceUsd} </b></span>
              <span style="display: block;">${highlightChange(Number(coin.changePercent24Hr).toFixed(2))}</span>
              <span style="display: block;">Circulating Supply: ${Number(coin.supply).toFixed(2)}</span>
              <span style="display: block;">Volume(24Hr): ${Number(coin.volumeUsd24Hr).toFixed(2)}</span>
              <span style="display: block;">Market Cap: ${Number(coin.marketCapUsd).toFixed(2)}</span>
            </p>
            <div class = 'graph' id= '${coin.id}'>Price Graph (7d)</div>`;

        card.append(logo);
        card.append(cardBody);

        rows.append(card);


	});
	//console.log(asset);

	//display the graph
	let graph = document.getElementsByClassName('graph');
	for (var div = 0; div < graph.length; div++) {
		//console.log(graph[div].id);
		plotgraphs(`https://api.coincap.io/v2/assets/${graph[div].id}/history?interval=h12&start=
			${new Date().setDate(new Date().getDate()-7)}&end=${new Date().getTime()}`, graph[div].id)
	}
	// for (let div of graph){
	// 	console.log(div.id);
	// 	plotgraphs(`https://api.coincap.io/v2/assets/${div.id}/history?interval=h12&start=
	// 		${new Date().setDate(new Date().getDate()-7)}&end=${new Date().getTime()}`)
	// }

} //end function to display coins

document.addEventListener('DOMContentLoaded', (event) => {
	fetch('https://ipapi.co/json/')   //get the location of client logged into site
	.then(response => {
		return response.json();
	})
	.then(response => {
		//console.log(response);
		
		let device, browser = '', ip, date, location;

		//get the browser type and version
		let browsers = bowser;
		//console.log(browsers);
		for (const key of Object.keys(browsers)) {
			if (key != 'version')
				if(key != 'webkit')
					if(key != 'a')
						if(key != 'gecko')
    						browser += key.toString() + " " ;


		}
			browser += 'version' + " " + browsers.version; 
		//console.log(browser);

		//get the ip 
		ip = response.ip;

		//get the location
		location = `${response.country_name},${response.city} (latitude: ${response.latitude}, longitude: ${response.longitude})`;


		//get the date logged in
		date = new Date();
		date = date.toString() + '';

		//get Device type
		if(navigator.userAgent.match(/mobile/i)) {
			device = navigator.platform + ' on ' + 'Mobile Phone'; 
		} else if (navigator.userAgent.match(/iPad|Android|Touch/i)) {
				device = navigator.platform + ' on ' + 'Tablet';
		} else {
			device = navigator.platform + ' on ' + 'desktop computer';
			}
		

		console.log(device, date, ip, location, browser);

		crypto.logUser(device, browser, ip, date, location, function(error, success){
			if(error){
				console.log(` ${error}`)
			}
			else{
				console.log(success);
			}
		});
	})
	.catch(e => {
		console.log(`the location fetch request failed with error ${e}`);
	})


	

});

// close DOMContentLoaded

fetchCoins();  // test