var discarding = false;
var popMsgLoc = document.getElementById('pop-msg');
popMsgLoc.addEventListener("mouseover", popMsgMovedOver); 

function popMsgMovedOver() {
	if (discarding) {
		var elems = [];
		var tot = 0;
		for (i = 0; i < 5; i++) {
			elems.push(document.getElementById('discard' + resTypes[i]));
			tot += inventories[player.ID]['res'][i];
		}
		var numToDiscard = Math.ceil(tot/2);
		var sum = 0;
		var notAllowed = false;
		var submit = document.getElementById('discardSubmit');
		for (i = 0; i < 5; i++) {
			var elem = elems[i];
			var val = parseInt(elem.value);
			sum += val;
			if (val > inventories[player.ID]['res'][i]) {
				elem.style = "color: red;";
				notAllowed = true;
			} else {
				elem.style = "";
			}
		}
		var cardsRemaining = numToDiscard - sum; 
		document.getElementById('leftToDiscard').innerHTML = "Cards left to discard: " + cardsRemaining;
		if (notAllowed || cardsRemaining > 0) {
			submit.classList.add('nope');
		} else {
			submit.classList.remove('nope');
		}
	}
}
