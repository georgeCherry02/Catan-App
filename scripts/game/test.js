async function test() {
	for (i = 1; i < settleToRoad.length; i++) {
		var settleId = 'settle' + i;
		var setElem = document.getElementById(settleId);
		setElem.classList.toggle('testB');
		var cRoad = settleToRoad[i];
		await sleep(200);
		for (j = 0; j < 2; j++) {
			cRoad.forEach(function(n) {
				var id = 'road' + n;
				var elem = document.getElementById(id);
				elem.classList.toggle('test');
			});
			await sleep(200);
		}
	}
}
