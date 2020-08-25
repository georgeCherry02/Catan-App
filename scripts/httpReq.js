var xhr = null;
function request(url, variables, async = true, response_function) {
	var finUrl = createUrl(url, variables);
	try {
		xhr = [new XMLHttpRequest(), destination];
	} catch (e) {
		alert("XHR Couldn't be created");
		return;
	}
	xhr[0].onreadystatechange = response_function;
	xhr[0].open("GET", finUrl, async);
	xhr[0].send();
}

function createUrl(url, variables) {
	if (variables == null) {
		return url;
	}
	var res = url + "?";
	for (var key in variables) {
		if (variables.hasOwnProperty(key)) {
			res += key + "=" + variables[key] + "&";
		}
	}
	return res.slice(0, -1);
}
