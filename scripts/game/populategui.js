function initData() {
	var turnLoc = document.getElementById('turn');
	turnNum = turnLoc.innerHTML;	

	var playersLoc = document.getElementById('players');
	playerIDs = JSON.parse(playersLoc.innerHTML);
	playerNum = playerIDs.length;	
	player = createPlayer(playerNum);

	var worldIDLoc = document.getElementById('worldID');
	wid = worldIDLoc.innerHTML;
	var verLoc = document.getElementById('ver');
	ver = verLoc.innerHTML;
	var boardStateLoc = document.getElementById('boardState');
	boardState = JSON.parse(boardStateLoc.innerHTML);
	var inventoriesLoc = document.getElementById('playerInventory');
	inventories = JSON.parse(inventoriesLoc.innerHTML);

	var playerTurnID;
	var tn = parseInt(turnNum);
	if ((tn <= playerNum * 2) && (tn > playerNum)) {
		var ind = (tn + playerNum) % playerNum;
		playerTurnID = playerIDs[ind];
	} else {
		playerTurnID = playerIDs[(tn + playerNum - 1) % playerNum];
	}
	if (playerTurnID == player.ID) {
		canBuild = true;
	}
}

function populateGUI() {
	updateResInventory();
	updateCardInventory();
	populateTurnPanel();
}

function updateResInventory() {
	var resInv = populateResInv(player.inv['res']);
	var resInvDispLoc = document.getElementById('resInv');
	resInvDispLoc.innerHTML = resInv;
}

function updateCardInventory() {
	var cardInv = populateCardInv(player.inv['card']);
	var cardInvDispLoc = document.getElementById('cardInv');
	cardInvDispLoc.innerHTML = cardInv;
	if (player.inv['card'].length == 0) {
		cardInvDispLoc.classList.add('invisible');
	} else if (player.inv['card'].length > 0) {
		cardInvDispLoc.classList.remove('invisible');
	}
}

function populateCardInv(cards) {
	var html = "<div class='cardCont'>";
	cards.forEach( function(card) {
		html += "<div><h5>" + card + "</h5><div>";
	});
	return html;
}

function populateResInv(res) {
	var html = "<div class='resourceCont'>";
	html += addResource("Wood", res, 0);
	html += addResource("Brick", res, 1);
	html += addResource("Sheep", res, 2);
	html += addResource("Wheat", res, 3);
	html += addResource("Ore", res, 4);
	html += "</div>";
	return html;
}

function populateTurnPanel() {
	if (!canBuild) {
		var panel = document.getElementById('turn-info');
		panel.classList.add('nope');
	}
}

function addResource(type, res, loc) {
	return "<div><h5>" + type + ": " + res[loc] + "</h5></div>";
}

function createPlayer(playerNum) {
	var idLoc = document.getElementById('playerID');
	var pid = idLoc.innerHTML;
	var invLoc = document.getElementById('playerInventory');
	var inv = invLoc.innerHTML;
	var jsInv = JSON.parse(inv);
	var c;
	var tn = parseInt(turnNum);
	if ((tn <= playerNum * 2) && (tn > playerNum)) {
		c = (tn + playerNum) % playerNum;
	} else {
		c = (tn + playerNum - 1) % playerNum;
	}
	var col;
	switch (c) {
		case 1: 
			col = 'red';
			break;
		case 2:
			col = 'blue';
			break;
		case 3:
			col = 'yellow';
			break;
		default:
			col = 'white';
	}
	return new Player(pid, col, jsInv);
}
