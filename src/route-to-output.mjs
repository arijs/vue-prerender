
const rePathEnd = /[\\\/]*$/;
export default function routeToOutput(route) {
	return route.replace(rePathEnd, '/index.html');
}
