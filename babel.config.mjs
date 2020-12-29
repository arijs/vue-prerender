
const reExt = /\.mjs$/i;

export default {
	"presets": [
		[
			"@babel/preset-env",
			{
				"modules": "commonjs"
			}
		]
	],
	"plugins": [
		[
			"module-resolver",
			{
				resolvePath(sourcePath) {
					return sourcePath.replace(reExt, '');
				}
			}
		]
	]
}
