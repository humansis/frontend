const crypto = require('crypto');

try {
	crypto.createHash('md4');
} catch (e) {
	console.warn('Crypto "md4" is not supported anymore by this Node version');
	const origCreateHash = crypto.createHash;
	crypto.createHash = (alg, opts) => origCreateHash(alg === 'md4' ? 'md5' : alg, opts);
}

module.exports = {
	chainWebpack: (config) => {
		config
			.plugin("html")
			.tap((args) => {
				// eslint-disable-next-line no-param-reassign
				args[0].title = "Humansis";
				return args;
			});
	},
};
