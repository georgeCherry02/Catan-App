function Player(id, colour, inv) {
	this.ID = id;
	this.colour = colour;
	this.inv = inv[id];
	/* Buildables */
	this.availableBuildings = new Map();
	this.availableBuildings.set("road", 0);
	this.availableBuildings.set("settle", 0);
	this.availableBuildings.set("city", 0);
	this.changeAmountAvailBuild = function(type, amount) {
		var initVal = this.availableBuildings.get(type);
		this.availableBuildings.set(type, initVal + amount);
	}
	this.changeResourceInInv = function(type, amount) {
		var initVal = this.inv['res'][type];
		this.inv['res'][type] = initVal + amount;
	}
	this.addCard = function() {
		var cardInv = boardState['devCardList'];
		var numDevCard = 0;
		cardInv.forEach(function(x) {
			numDevCard += x;
		});
		var cardNum = getRandomInt(numDevCard - 1);
		for (i = 0; i < 5; i++) {
			if (cardNum < cardInv[i]) {
				this.inv['card'].push(cardTypes[i]);
				var initVal = boardState['devCardList'][i];
				boardState['devCardList'][i] = initVal - 1;
				break;
			} else {
				cardNum = cardNum - cardInv[i];
			}
		}
	}
}
