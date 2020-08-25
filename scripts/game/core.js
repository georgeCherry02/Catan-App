// Utility functions
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
function getRandomInt(max) {
	return Math.ceil(Math.random() * max); 
}

// Core function running game if it's not your turn, or if you're still placing settlements and roads
async function runGame() {
	// Set up first few rounds (e.g. Placing down settlements)
	if (turnNum <= playerNum * 2) {
		player.changeAmountAvailBuild('road', 1);
		player.changeAmountAvailBuild('settle', 1);
	}
	// Create variables to stop people being spammed with alerts
	var stealAlertedOnce = false;
	var tradeAlertedOnce = false;
	// Loop for while it's not your turn
	while (!canBuild) {
		// Execute every 5 seconds
		await sleep(5000);

		// Check if game is waiting on a player to discard their cards because they had over 7
		if (!stealAlertedOnce && checkIfPlayersStillNeedToDiscardCards(wid) /* Updates stealInfo field too */) {
			var playersToDiscard = JSON.parse(document.getElementById('stealInfo').innerHTML);
			// Check if the current player is one of the players that needs to discard
			if (playersToDiscard.includes(parseInt(player.ID))) {
				closeMsg();
				discardCards();
			}
			stealAlertedOnce = true;
		}

		// Check if the game is waiting on the current player to respond to a trade offer
		if (!tradeAlertedOnce) {
			// Updates trade info field
			checkOnTradeDeal(wid);
			var tradeInfo = document.getElementById('tradeInfo').innerHTML;
			if (tradeInfo != "") {
				var tradeDeal = JSON.parse(tradeInfo);
				// Check if the trade deal is sent to the current player
				if (tradeDeal['to'] == player.ID) {
					// Parse offered trade deal
					var msg = parseTradeDeal(tradeDeal);
					popMsg(msg, false);
					// Inserts player the trade deal is from's name into form
					displayNameFromID(tradeDeal['from'], 'tradeOfferFrom');
				} else {
					popMsg("<h3>Awaiting trade to be resolved</h3>");
				}
				tradeAlertedOnce = true;
			}
		}
	}
}

// Core function running game if it is your turn
function progressTurn() {
	// Check if the game is in the beginning phases
	// If so no subturns exist
	if (turnNum <= playerNum * 2) {
		nextTurn();
		location.reload();
		return null;
	}

	subTurnNum++;
	switch (subTurnNum) {
		case 1:
			roll();
			break;
		case 2:
			setUpTrade();
			break;
		case 3:
			allowBuildingButtons();
			break;
		default:
			nextTurn();
			location.reload();
	}
}

// Creates an HTTP Request to progress turn
function nextTurn() {
	var url = "requests/nextTurn.php";
	var dest = null;
	var vari = gatherInformation();
	request(url, vari, dest);
}

// Rolls the dice in the roll phase
function roll() {
	var tot = getRandomInt(6) + getRandomInt(6); // Get Dice Roll
	document.getElementById('diceRoll').innerHTML = tot; // Load on GUI
	var hexesTriggered = []; // Create empty array to register which hexes are effected by the dice roll

	// Execute code for non-robber roll
	if (tot != 7) {
		// Check if hex's number is equivelant to that of the roll and checks the robber is not on that tile
		for (i = 1; i <= 19; i++) {
			var elem = document.getElementById('hex' + i);
			if (elem.classList.contains('roll' + tot) && !elem.classList.contains('robber')) {
				hexesTriggered.push(i);
			}
		}

		// Loops through the triggered tiles (Will only be 1 or 2)
		hexesTriggered.forEach(function(hid) {
			var hex = document.getElementById('hex' + hid).classList;
			// Finds the type of tile
			var type = 5;
			for (i = 0; i < 5; i++) {
				if (hex.contains('hex' + i)) {
					type = i;
				}
			}
			// If the tile has a type do this
			if (type != 5) {
				// Get all settlement locations on the effected hex
				var settleLocs = hexToSettle[hid];
				settleLocs.forEach(function(sid) {
					var settle = document.getElementById('settle' + sid);
					var c = settle.classList;
					var amount = 0;
					// Check if the locations contains a settlement or a city
					if (c.contains('builtS')) {
						amount = 1;
					} else if (c.contains('builtC')) {
						amount = 2;
					}
					// If a settlement/city exists give the play it belongs to the right resources
					if (amount != 0) {
						for (i = 0; i < 4; i++) {
							var cCol = colours[i];
							var cPlayer;
							if (playerIDs[i] != undefined) {
								cPlayer = playerIDs[i];
								if (c.contains(cCol)) {
									var init = inventories[cPlayer]['res'][type];
									inventories[cPlayer]['res'][type] = init + 1;
									if (cCol == player.colour) {
										player.changeResourceInInv(type, 1);
									}
								}
							}
						}
					}
				});
			} else /* Clearly something's gone really wrong */ {
				location.reload();			
			}
		});
	} else /* Execute code for Robber roll */ {
		// Alert the current player
		popMsg("<h3>You rolled a 7!</h3><p class='roll7Msg'>Select the hex you want to robber to move to...</p>");
		// Check if any player happens to have more than seven cards
		// Appropriately deal with those that do
		checkLessThanSevenResCards();
		var rLoc = boardState['robberLoc'];
		for (i = 1; i <= 19; i++) {
			if (i != rLoc) {
				var hexC = document.getElementById('hex' + i + 'Counter');
				hexC.setAttribute('onclick', 'moveRobber(this.id, false)');
			}
		}
	}
	// Simply reload GUI with updated information
	updateResInventory();
}

// Looks if any players has to discard cards due to excess inventory size and updates database if so
function checkLessThanSevenResCards() {
	// Create empty array to represent players who have to discard cards
	var playerIDsToGetRidOfCards = []; 

	// Loop through players
	playerIDs.forEach(function(x) {
		var resInv = inventories[x]['res'];
		var runningTot = 0;
		resInv.forEach(function(y) {
			runningTot += y;
		});
		if (runningTot > 7) {
			playerIDsToGetRidOfCards.push(x);
		}
	});

	// Check if current player is effected
	if (playerIDsToGetRidOfCards.includes(player.ID)) {
		discardCards();
		playerIDsToGetRidOfCards.pop(player.ID);
	}

	// Check if any other players are effected and if so alert them through db
	if (playerIDsToGetRidOfCards.length > 0) {
		var url = "requests/stealAlert.php";
		var vari = {
			"IDs": JSON.stringify(playerIDsToGetRidOfCards),
			"wid": wid 
		}; 
		request(url, vari, null);
	}
}

function moveRobber(counterLoc, knight) {
	// If the game is still waiting on a player to discard cards you won't be able to move the robber
	// Alerts play in function
	if (checkIfPlayersStillNeedToDiscardCards(wid)) {
		return;
	}

	// Extracts number location from ID
	// "hex + ID + Counter" --> ID
	var loc = counterLoc.substring(3, counterLoc.length - 7);

	// Removes original robber
	removeRobber(boardState['robberLoc']);
	// Updates current location in boardState
	boardState['robberLoc'] = loc;
	// Updates Robber location on visual board by calling original add robber function
	addRobber();
	// Find which settlement locations surround the hex it's moved to
	var settleLocs = hexToSettle[loc];
	// Create an empty array to find out which of these locations have a settlement built on them
	var occupiedSettles = [];
	settleLocs.forEach(function(sid) {
		var settle = document.getElementById('settle' + sid);
		// Check if location's built on
		if (settle.classList.contains('builtS') || settle.classList.contains('builtC')) {
			// Check the building is not owned by the current player
			if (!settle.classList.contains(player.colour)) {
				occupiedSettles.push(sid);
			}
		}
	});

	// Create an empty array to store players that are available to steal from
	var playersToStealFrom = [];
	// Cycle through players for each settlement effected and check if it's owned by that player
	occupiedSettles.forEach(function(sid) {
		playerIDs.forEach(function(pid) {
			if (player.ID != pid) {
				var playerBuildList = boardState['build'][pid];
				playerBuildList['settles'].forEach(function(x) {
					if (x == sid && !playersToStealFrom.includes(pid)) {
						playersToStealFrom.push(pid);
						playerAdded = true;
					}
				});
				playerBuildList['cities'].forEach(function(x) {
					if (x == sid && !playersToStealFrom.includes(pid)) {
						playersToStealFrom.push(pid);
						playerAdded = true;
					}
				});
			}
		});
	});

	// If there are players to steal from, notify the current player and ask which player they'd like to steal from
	if (playersToStealFrom.length != 0) {
		var customMsg = "";
		playersToStealFrom.forEach(function(x) {
			customMsg += "<div onclick='stealFrom(" + x + ")' class='stealButton' id='steal" + x + "'></div>";
		});
		popMsg("<h3>Select a player to steal from...</h3>" + customMsg, false);
		// Make sure the players have names rather than ids
		playersToStealFrom.forEach(function(x) {
			displayNameFromID(x, 'steal' + x);
		});
	}

	// Remove the onclick='moveRobber()' from all cells
	for (i = 1; i <= 19; i++) {
		var elem = document.getElementById('hex' + i);
		elem.onclick='';
	}
}

function stealFrom(pid) {
	// Closes the "Which player would you like to steal from?" dialogue
	closeMsg();
	// Get's that player's inventory
	var stealInv = inventories[pid]['res'];

	// Creates a uniform distribution and picks a resource from it
	var numRes = 0;
	stealInv.forEach(function(x) {
		numRes += x;
	});
	var resPicked;
	var random = getRandomInt(numRes - 1);
	for (i = 0; i < 5; i++) {
		if (random < stealInv[i]) {
			resPicked = i;
			break;
		} else {
			random = random - stealInv[i];
		}
	}

	// Updates the current player's inventory
	player.changeResourceInInv(resPicked, 1);
	// Updates inventory GUI and tells player what they gained
	updateResInventory();
	var temp  = "<h3>You stole some " + resTypes[resPicked] + ".</h3>";
	popMsg(temp);

	//Updates player who was stolen from's inventory
	var initVal = inventories[pid]['res'][resPicked]; 
	inventories[pid]['res'][resPicked] = initVal - 1;
}

// Creates an interface to discard cards through if the player has more than 
// This form is listened on by an event listener: popMsgMovedOver
// ****** In retrospect this is beyond stupid, please fix this soon ******
// *** The event listener that is, it's literally in a file called eventListener.js (Far too vague) ***
function discardCards() {
	var pResInv = inventories[player.ID]['res'];
	// Creates title of html to be sent
	var msg = "<h3 class='discardTitle'>Discard half your cards please</h3>";
	// Assembles the form piece by piece
	msg += "<form method='POST' action='discardCards.php' class='discardCards'>";
	msg += "<input type='hidden' name='pid' value='" + player.ID + "'></input>";
	msg += "<input type='hidden' name='wid' value='" + wid + "'></input>";
	// Adds each of the resources that are available to be discarded
	for (i = 0; i < 5; i++) {
		msg += "<div>";
		msg += "<h4 class='discardType'>" + capitaliseFirstLetter(resTypes[i]) + ": " + pResInv[i] + "</h4>";
		msg += "<label for='discard" + resTypes[i] + "'>Amount: </label>";
		msg += "<input type='text' name='" + resTypes[i] + "' id='discard" + resTypes[i] + "' value='0'></input>"; 
		msg += "</div>";
	}
	msg += "<input type='submit' id='discardSubmit'></input></form>";
	// Creates a field to tell the player how many cards they still have to discard
	msg += "<div id='leftToDiscard'></div>";
	// Sends the msg to the current player
	popMsg(msg, false);
	discarding = true;
}

// Creates the interface for a player to send a trade deal
// Simply asks who to send the deal to, or if you don't want to trade at all
function setUpTrade(previousTrade = false, outcome = false) {
	var msg = "";
	if (previousTrade) {
		if (outcome) {
			msg += <h3 class='successfulTrade'>Trade successful.</h3>;
		} else {
			msg += <h3 class='failedTrade'>Trade terminated.</h3>;
		}
	}
	msg += "<h3>Select a player to trade with:</h3>";
	// Adds key variables for database modification
	msg += "<form onsubmit='setUpDetailedTrade()' class='setUpTrade'>";
	msg += "<input type='hidden' name='id' value='" + wid + "'></input>";
	msg += "<input type='hidden' name='ver' value='" + ver + "'></input>";
	msg += "<label for='tradeTo'>Offer to:</label>";
	// Creates drop down for selecting player to send trade offer to
	msg += "<select name='to' id='tradeTo'>";
	playerIDs.forEach(function(id) {
		if (id != player.ID) {
			msg += "<option value='" + id + "' id='tradeTo" + id + "'>";
			msg += "</option>";
			displayNameFromID(id, "tradeTo" + id)
		}
	});
	// Adds no trading option
	msg += "<option value='0'>Don't trade</option>";
	msg += "</select>";
	msg += "<input type='submit' id='tradeStart'></input>";
	msg += "</form>";
	popMsg(msg, false);
}

// Creates the interface for a player to set up a full trade offer once they've selected who to trade with
// in the setUpTrade() function above
function setUpDetailedTrade() {
	// Removes any previous message as this will be more important
	closeMsg();
	var to = document.getElementById('tradeTo').value;
	if (to == 0) {
		return;
	}
	var msg = "<h4 class='tradeTitle'>Make a trade offer</h4>"; 
	msg += "<form method='POST' action='sendTradeOffer.php' class='setUpDetailedTrade'>";
	// Add key values for database editing
	msg += "<input type='hidden' name='type' value='offer'></input>";
	msg += "<input type='hidden' name='from' value='" + player.ID + "'></input>";
	msg += "<input type='hidden' name='to' value='" + to + "'></input>";
	msg += "<input type='hidden' name='wid' value='" + wid + "'></input>";
	msg += "<input type='hidden' name='ver' value='" + ver + "'></input>";
	// Create the two columns for offering and asking
	var offered = "<div class='offered'><h3>Resources to offer:</h3>";
	var requested = "<div class='requested'><h3>Resources asked for:</h3>";
	for (i = 0; i < 5; i++) {
		offered += "<h4 class='offerType'>" + capitaliseFirstLetter(resTypes[i]) + ": " + player.inv['res'][i] + "</h4>";
		offered += "<label for='offered" + resTypes[i] + "'>Amount: </label>";
		offered += "<input type='text' name='" + resTypes[i] + "Offered' id='" + resTypes[i] + "Offered' value='0'></input>";
		requested += "<h4 class='requestedType'>" + capitaliseFirstLetter(resTypes[i]) + "</h4>";
		requested += "<label for='requested" + resTypes[i] + "'>Amount: </label>";
		requested += "<input type='text' name='" + resTypes[i] + "Requested' id='" + resTypes[i] + "Requested' value='0'></input>";
	}
	offered += "</div>";
	requested += "</div>";
	msg += offered + requested;
	msg += "<input type='submit' id='sendTrade'></input>";
	msg += "</form>";
	// Display interface
	popMsg(msg, false);
	// Wait for resposne
	waitForTradeResponse();
}

// Only triggered after sending of a trade request through setUpTradeDeal()
// Waits on a response, once received 
async function waitForTradeResponse() {
	var responded = false;
	var alertedOnce = false;
	var tradeDeal;
	// Waits on response
	while (!responded) {
		// Checks every 2.5 seconds
		await sleep(2500);
		// Updates tradeInfo field
		checkOnTradeDeal(wid);
		var tradeInfo = document.getElementById('tradeInfo').innerHTML;
		if (tradeInfo != "") {
			tradeDeal = JSON.parse(tradeInfo);
			// If the trade deal isn't from the current player, you must have received a response
			if (tradeDeal['from'] != player.ID) {
				responded = true;
			} else if (!alertedOnce) /* Alert player they're awaiting a response, but only once */ {
				var msg = "<h3>Awaiting reponse</h3>";
				popMsg(msg);
				alertedOnce = true;
			}
		}
	}
	// Once a response is received parse the deal and inform player of response
	var msg = parseTradeDeal(tradeDeal);
	document.getElementById('pop-msg').classList.remove('invisible');
	popMsg(msg, false);
}

// Parses a trade deal from the database format
function parseTradeDeal(tradeDeal) {
	var msg = "<h3>You have received a trade " + tradeDeal['type'] + "!</h3>"
	msg += "<div class='tradeFrom'><h4>From: </h4><h4 id='tradeOfferFrom'></h4></div>";
	// Create the sections to reveal the offered deal and forms to create a counter deal
	var off = "<div class='offeredInfo'><h4>Offered:</h4>";
	var req = "<div class='requestedInfo'><h4>Requested:</h4>";
	var cOff = "<div class='offered'><h3>Resources to offer:</h3>";
	var cReq = "<div class='requested'><h3>Resources asked for:</h3>";
	for (i = 0; i < 5; i++) {
		var cResType = resTypes[i];
		cOff += "<h4 class='offerType'>" + capitaliseFirstLetter(resTypes[i]) + ": " + player.inv['res'][i] + "</h4>";
		cOff += "<label for='offered" + resTypes[i] + "'>Amount: </label>";
		cOff += "<input type='text' name='" + resTypes[i] + "Offered' id='" + resTypes[i] + "Offered' value='0'></input>";
		cReq += "<h4 class='requestedType'>" + capitaliseFirstLetter(resTypes[i]) + "</h4>";
		cReq += "<label for='requested" + resTypes[i] + "'>Amount: </label>";
		cReq += "<input type='text' name='" + resTypes[i] + "Requested' id='" + resTypes[i] + "Requested' value='0'></input>";
		off += "<p>" + capitaliseFirstLetter(cResType) + ": " + tradeDeal['off'][i] + "</p>";
		req += "<p>" + capitaliseFirstLetter(cResType) + ": " + tradeDeal['req'][i] + "</p>";
	}
	off += "</div>";
	req += "</div>";
	cOff += "</div>";
	cReq += "</div>";
	// Add the offered deal to the interface
	msg += off + req;
	// Create options for how to respond to the presented deal
	msg += "<div class='tradeReplies'>";
	msg += "<div onclick='acceptTrade(true)' class='tradeOption acceptTrade'>Accept Trade Offer</div>";
	msg += "<div onclick='revealCounterOffer()' class='tradeOption revealCounter'>Propose Counter Offer</div>";
	msg += "<div onclick='acceptTrade(false)' class='tradeOption rejectTrade'>Reject Trade Offer</div>";
	msg += "</div>";
	// Create the counter offer form, make it initially invisible
	msg += "<form method='POST' action='sendTradeOffer.php' class='invisible' id='setUpCounterOffer'>";
	// Add key variables for database use
	msg += "<input type='hidden' name='type' value='counter offer'></input>";
	msg += "<input type='hidden' name='from' value='" + player.ID + "'></input>";
	msg += "<input type='hidden' name='to' value='" + tradeDeal['from'] + "'></input>";
	msg += "<input type='hidden' name='wid' value='" + wid + "'></input>";
	msg += "<input type='hidden' name='ver' value='" + ver + "'></input>";
	// Add resources for counter offer
	msg += cOff + cReq;
	msg += "<input type='submit'></input>";
	msg += "</form>";
	// Return the html interface so it can be presented
	return msg;
}

// Function to deal with accepting and rejecting trade offers
function acceptTrade(accepted) {
	if(accepted) {
		// Obtain trade deal
		checkOnTradeDeal(wid);
		var tradeInfo = document.getElementById('tradeInfo').innerHTML;
		if (tradeInfo != "") {
			var tradeDeal = JSON.parse(tradeInfo);
			// Adjust inventories
			var offererID = tradeDeal['from'];
			var receiverID = tradeDeal['to'];
			for (var i = 0; i < 5; i++) {
				var offeredAmount = tradeDeal['off'][i];
				var requestedAmount = tradeDeal['req'][i];
				inventories[offererID]['res'][i] -= offeredAmount;
				inventories[offererID]['res'][i] += requestedAmount;
				inventories[receiverID]['res'][i] += offeredAmount;
				inventories[receiverID]['res'][i] -= requestedAmount;
			}
		}
	}
	// This is what you'd do if accepted was false or at the end of a successful trade
	closeMsg();
	setUpTrade(true, accepted);
}

// Simply reveals the counter offer form
function revealCounterOffer() {
	var form = document.getElementById('setUpCounterOffer');
	form.classList.toggle('invisible');
}

// Reveals the buttons that select which building type you want to build
// These buttons allow you to increase your available buildings
function allowBuildingButtons() {
	var buildTypes = ['Road', 'Settle', 'City'];
	buildTypes.forEach(function(x) {
		var cl = document.getElementById('build' + x).classList;
		cl.toggle('invisible');
	});
}

function build(id) {
	var col = player.colour;
	var elem = document.getElementById(id);
	var c = elem.classList;
	var type = false;
	if (c.contains('builtR') || c.contains('builtC')) {
		return null;
	}
	if (c.contains('road')) {
		var idNum = id.replace('road', '');
		if (player.availableBuildings.get('road') > 0) {
			if (turnNum <= playerNum * 2) {
				if (checkSettleNextToRoad(idNum)) { 
					c.add('builtR');
					player.changeAmountAvailBuild('road', -1);
					type = 'roads';
				}
			} else {
				if (checkSettleNextToRoad(idNum) || checkRoadNextToRoad(idNum)) {
					c.add('builtR');
					player.changeAmountAvailBuild('road', -1);
					type = 'roads';
				}
			}
		}
	} else if (c.contains('settle')) {
		var idNum = id.replace('settle', '');
		if (c.contains('builtS')) {
			if (player.availableBuildings.get('city') > 0) {
				c.remove('builtS');
				c.add('builtC');
				player.changeAmountAvailBuild('city', -1);
				type = 'cities';
			}
		} else {
			if (player.availableBuildings.get('settle') > 0) {
				if (checkSettleProximity(idNum)) {
					if (turnNum <= playerNum * 2) {
						c.add('builtS');
						player.changeAmountAvailBuild('settle', -1);
						if (turnNum > playerNum) {
							var hexes = settleToHex[idNum];
							hexes.forEach( function(x) {
								var hex = document.getElementById('hex' + x);
								var hexType = hex.classList;
								var hexInd = hexType[0].replace('hex', '');
								player.changeResourceInInv(hexInd, 1);
							});
						}
						type = 'settles';
					} else if (checkRoadConnected(idNum)) {
						c.add('builtS');
						player.changeAmountAvailBuild('settle', -1);
						type = 'settles';
					}
				}
			}
		}
	}
	if (type != false) {
		updateBoardState(type, idNum);
	}
}

function checkSettleNextToRoad(rid) {
	var col = player.colour;
	var result = false;
	var settleLocs = roadToSettle[rid];
	settleLocs.forEach(function(settleLoc) {
		var settle = document.getElementById('settle' + settleLoc);
		var tempRes = (settle.classList.contains('builtS') || settle.classList.contains('builtC'));
		if (tempRes == true) {
			result = true;
		}
	});
	return result;
}

function checkRoadNextToRoad(rid) {
	var col = player.colour;
	var result = false;
	var settleLocs = roadToSettle[rid];
	settleLocs.forEach(function(settleLoc) {
		var roadLocs = settleToRoad[settleLoc];
		roadLocs.forEach(function(roadLoc) {
			if (roadLoc != rid) {
				var road = document.getElementById('road' + roadLoc);
				var tempRes = road.classList.contains('builtR');
				if (tempRes == true) {
					result = true;
				}
			}
		});
	});
	return result;
}

function checkRoadConnected(sid) {
	var col = player.colour;
	var result = false;
	var roadLocs = settleToRoad[sid];
	roadLocs.forEach(function(roadLoc) {
		var r = document.getElementById('road' + roadLoc).classList;
		if (r.contains(builtR) && r.contains(col)) {
			result = true;
		}
	});
	return result;
}

function checkSettleProximity(sid) {
	var result = true;
	var roadLocs = settleToRoad[sid];
	roadLocs.forEach(function(roadLoc) {
		var settleLocs = roadToSettle[roadLoc];
		settleLocs.forEach(function(settleLoc) {
			if (settleLoc != sid) {
				var s = document.getElementById('settle' + settleLoc).classList;
				if (s.contains('builtS') || s.contains('builtC')) {
					result = false;
				}
			}
		});
	});
	return result;
}

function action(type) {
	var type;
	switch(type) {
		case "buildRoad":
			type = 'road';
			break;
		case "buildSettle":
			type = 'settle';
			break;
		case "buildCity":
			type = 'city';
			break;
		case "buyCard":
			type = 'card';
			break;
	}
	var cost = costs[type];
	if (!evaluateCostToInv(cost)) {
		popMsg("Not enough resources to do this!");
		return;
	}
	if (type == 'card') {
		addCard(cost);
	} else {
		addBuilding(type, cost);
	}
}

function evaluateCostToInv(cost) {
	var res = true;
	for (i = 0; i < resTypes.length; i++) {
		var cResType = resTypes[i];
		if ((cost[cResType] != undefined) && (cost[cResType] > player.inv['res'][i])) {
			res = false;
		}
	}
	return res;
}

function addBuilding(type, cost) {
	for (i = 0; i < resTypes.length; i++) {
		var cResType = resTypes[i];
		if (cost[cResType] != undefined) {
			player.changeResourceInInv(i, -parseInt(cost[cResType]));
		}
	}
	updateResInventory();
	player.changeAmountAvailBuild(type, 1);
}

function addCard(cost) {
	for (i = 0; i < resTypes.length; i++) {
		var cResType = resTypes[i];
		if (cost[cResType] != undefined) {
			player.changeResourceInInv(i, -parseInt(cost[cResType]));
		}
	}
	updateResInventory();
	player.addCard();
}

function updateBoardState(type, loc) {
	boardState['build'][player.ID][type].push(loc);
}
