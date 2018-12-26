import { Component } from '@angular/core';

var assets;
var timestamps;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
						console.log(assets);
						callback(null, assets);
					})
					.catch(e => {
						console.log(`an error ocurred with status of ${e}`);
						callback(`Request failed. Returned status of ${e}`,null);
					})
	}

	//store user credencials
	static logInfo(callback){
		//alert('test');
		return fetch("http://localhost:8080/log/view/")
					.then(response => {
						console.log(response);
						callback(null, response);
					})
					.catch(e => {
						console.log(`an error ocurred with status of ${e}`);
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
			fillCoinsHTML();     //design coins html
		}
	});

	crypto.logInfo(function (error,response) {

		if(error){   //an error occured
			///console.log(error);
		} else{
			
		}
	});
}

//display the coins
function fillCoinsHTML(asset = assets){
	const rows = document.getElementById('cards');
	asset.forEach(function coins(coin){

		const card = document.createElement('div') //create a bootstrap card element
		card.className = 'card styleCard';

 		const logo = document.createElement('img'); // create the crytocurrency logo
 		logo.setAttribute('src', `assets/img/${coin.id}.png`);
 		logo.className = 'card-img-top cryto-image';
 		logo.setAttribute('alt', `${coin.id} logo`);

 		const cardBody = document.createElement('div'); //create the bootstrap 4 card-body
 		cardBody.setAttribute('class', 'card-body');
 		cardBody.innerHTML = `<h4 class="card-title">${coin.name} <small>(${coin.symbol})</small></h4>
            <p class="card-text">
              <span style="display: block;"><b>price: ${coin.priceUsd} </b></span>
              <span style="display: block;"><b>change: (TODO) </b></span>
            </p>
            <a href="#" class="btn btn-primary">See Variations</a>`;

        card.append(logo);
        card.append(cardBody);

        rows.append(card);


	});
	//console.log(asset);


}

fetchCoins();  // test