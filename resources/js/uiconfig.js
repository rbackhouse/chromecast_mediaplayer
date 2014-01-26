define(function() {
	var baseUrl;
	if (window.cordova) {
		baseUrl = "Change Me";
	} else {
		baseUrl = ".";
	}
	return {
		baseUrl: baseUrl
	}
});