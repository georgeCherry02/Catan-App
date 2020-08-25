function revealForm(e) {
	var id = e + 'f';
	var elem = document.getElementById(id);
	elem.classList.toggle('invisible');
}

function popMsg(msg, close = true) {
	var msgLoc = document.getElementById('pop-msg');
	msgLoc.classList.toggle('invisible');
	var res = msg 
	if (close) {
		res += popMsgClose();
	}
	msgLoc.innerHTML = res;
	var board = document.getElementById('board');
	board.classList.toggle('msgOpen');
}

function popMsgClose() {
	return "<div class='clsPopMsg' onclick='closeMsg()'>x</div>";
}

function closeMsg() {
	var msgLoc = document.getElementById('pop-msg');
	msgLoc.classList.toggle('invisible');
	var board = document.getElementById('board');
	board.classList.toggle('msgOpen')
}

function capitaliseFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
