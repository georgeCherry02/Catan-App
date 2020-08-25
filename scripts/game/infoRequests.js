function gatherInformation() {
	var initInv = inventories;
	initInv[player.ID] = player.inv;
	var res = {
		"inventory" : JSON.stringify(initInv),
		"board_state" : JSON.stringify(boardState),
		"world_id" : wid,
		"turn_num" : turnNum
	};
	return res;
}

function displayNameFromID(id, dest) {
	var url = "requests/nameFromID.php";
	var vari = {"id":id};
	request(url, vari, dest);
}

function checkIfPlayersStillNeedToDiscardCards(wid) {
	var url = "requests/stealLeft.php";
	var dest = "stealInfo";
	var vari = {"wid":wid};
	request(url, vari, dest, false);
	if (document.getElementById('stealInfo').innerHTML != "") {
		var res = JSON.parse(document.getElementById('stealInfo').innerHTML);
	} else {
		return false;
	}
	if (res != undefined && res.length > 0) {
		popMsg("<h3 class='discardWait'>Have to wait for people to discard cards before play continues</h3>");
		return true;
	} else {
		return false;
	}
}

function checkOnTradeDeal(wid) {
	var url = "requests/checkOnTradeDeal.php";
	var dest = "tradeInfo";
	var vari = {"wid":wid};
	request(url, vari, dest, false);
}
