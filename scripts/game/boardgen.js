// Creates some key variables for generating the board
var roadCount = 1;
var settlementCount = 1;
var hexCount = 1;
var desAdded = 0;
var resDist;
var numDist;

// Function to parse the boardState from the database and turn it into a presentable html format
function genBoard() {
	// Gather board information
	var boardDataLocation = document.getElementById('boardState');
	var data = JSON.parse(boardDataLocation.innerHTML);
	resDist = data['res'];
	numDist = data['num'];

	// Find location of the board
	var board = document.getElementById('board');
	// If it's not the players turn then it disallows any clicking on the board
	if (!canBuild) {
		board.classList.add('nope');
	}

	var html = "";
	// Loop through the 5 rows and choose what to do depending on the row with the switch stmt
	for (i = 1; i <= 5; i++) {
		switch (i) {
			case 1:
			case 5:
				html += "<div class='row' id='row" + i + "'>";
				for (j = 1; j <= 3; j++) {
					html += addHex();
					html += addBasicFeatures();
					if (j == 3) {
						html += addRightFeatures();
					}
					if (i == 5) {
						html += addBottomRoads();
						html += addBottomSettlements();
						if (j == 3) {
							html += addFeature('settle', 'botright');
						}
					}
					html += "</div>";
				}
				html += "</div>";
				break;
			case 2:
			case 4:
				html += "<div class='row' id='row" + i + "'>";
				for (j = 1; j <= 4; j++) {
					html += addHex();
					html += addBasicFeatures();
					if (j == 4) {
						html += addRightFeatures();
					}
					if (i == 4) {
						if (j == 1) {
							html += addFeature('road', 'botleft');
							html += addFeature('settle', 'botleft');
						} else if (j == 4) {
							html += addFeature('road', 'botright');
							html += addFeature('settle', 'botright');
						}
					}
					html += "</div>";
				}
				html += "</div>";
				break;
			case 3:
				html += "<div class='row' id='row" + i + "'>";
				for (j = 1; j <= 5; j++) {
					html += addHex();
					html += addBasicFeatures();
					if (j == 1) {
						html += addFeature('road', 'botleft');
						html += addFeature('settle', 'botleft');
					} else if (j == 5) {
						html += addRightFeatures();
						html += addFeature('road', 'botright');
						html += addFeature('settle', 'botright');
					}
					html += "</div>";
				}
				html += "</div>";
				break;
		}
	}
	// Add the base layer board to html doc
	board.innerHTML = html;
	// Add all the current buildings
	addExistingBuildings();
	// Add in the robber
	addRobber();
}

function addExistingBuildings() {
	// Gather the information on buildings from the boardState
	var exBuild = boardState['build'];
	// Loop through players and check if the colour matches the building in the boardState
	for (i = 0; i < playerIDs.length; i++) {
		var c;
		switch (i) {
			case 0:
				c = 'white';
				break;
			case 1:
				c = 'red';
				break;
			case 2: 
				c = 'blue';
				break;
			default:
				c = 'yellow';
		}
		var cPlayer = playerIDs[i];
		var cBuilds = exBuild[cPlayer];
		var tempCycle = [['road', 'roads', 'R'], ['settle', 'settles', 'S'], ['city', 'cities', 'C']];
		// Create a loop to cycle through for roads, settlements and cities
		for (j = 0; j < 3; j++) {
			// Loop through all the buildings in the boardState per player
			for (k = 0; k < cBuilds[tempCycle[j][1]].length; k++) {
				var id = cBuilds[tempCycle[j][1]][k];
				var elem = document.getElementById(tempCycle[j][0] + id);
				elem.classList.remove(player.colour);
				elem.classList.add(c);
				elem.classList.add('built' + tempCycle[j][2]);
			}
		}
	}
}

function addRobber() {
	var loc = boardState['robberLoc'];
	var hex = document.getElementById('hex' + loc);
	hex.classList.add('robber');
	var initHTML = hex.innerHTML;
	hex.innerHTML = initHTML + "<div id='robber'></div>";
}

function removeRobber(loc) {
	var hex = document.getElementById('hex' + loc);
	hex.classList.toggle('robber');
	var robber = document.getElementById('robber');
	hex.removeChild(robber);
}

function addHex() {
	var tempH = "<div class='hex";
	var resType = resDist[hexCount - 1];
	tempH += resType;
	if (resType == 5) {
		desAdded = -1;
		tempH += "' id='hex";
		tempH += hexCount;
		tempH += "'>";
		hexCount++;
		return tempH;
	} else {
		var number = numDist[hexCount - 1 + desAdded];
		tempH += " roll" + number + "' id='hex";
		tempH += hexCount + "'>";
		tempH += "<div class='boardNumber' id='hex" + hexCount + "Counter'>";
		tempH += "<p class='counterContainer'>" + number + "</p></div>"; 
		hexCount++;
		return tempH;
	}
}

function addBasicFeatures() {
	var tempB = "";
	tempB += addBasicRoads();
	tempB += addBasicSettlements();
	return tempB;
}

function addBottomRoads() {
	var tempBR = "";
	tempBR += addFeature('road', 'botleft');
	tempBR += addFeature('road', 'botright');
	return tempBR;
}

function addBottomSettlements() {
	var tempBS = "";
	tempBS += addFeature('settle', 'botleft');
	tempBS += addFeature('settle', 'bottom');
	return tempBS;
}

function addRightFeatures() {
	var tempRF = "";
	tempRF += addFeature('road', 'finvert');
	tempRF += addFeature('settle', 'right'); 
	return tempRF;
}

function addBasicRoads() {
	var tempR = "";
	tempR += addFeature('road', 'left'); 
	tempR += addFeature('road', 'right'); 
	tempR += addFeature('road', 'vert');
	return tempR;
}

function addBasicSettlements() {
	var tempS = "";
	tempS += addFeature('settle', 'left');
	tempS += addFeature('settle', 'top');
	return tempS;
}

function addFeature(type, pos) {
	var temp = "<div class='" + player.colour + " " + pos;
	switch (type) {
		case "road":
			temp += "r";
			temp += " " + type + "' id='" + type;
			temp += roadCount;
			roadCount++;
			break;
		case "settle":
			temp += "s";
			temp += " " + type + "' id='" + type;
			temp += settlementCount;
			settlementCount++;
			break;
	}
	temp += "' onclick='build(this.id)'></div>";
	return temp;
}
