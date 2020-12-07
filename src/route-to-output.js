
const rePathEnd = /\/*$/;
module.exports = routeToOutput;
function routeToOutput(route) {
	return route.replace(rePathEnd, '/index.html');
}
