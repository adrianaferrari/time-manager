const config = {
	webappOrigin: process.env.WEBAPP_ORIGIN!,
	publicPath: process.env.PUBLIC_PATH!,
	environment: process.env.NODE_ENV! as 'production' | 'development' | 'testing',
	apiUrl: process.env.API_URL!,

	themeColor: process.env.THEME_COLOR!,
	backgroundColor: process.env.BACKGROUND_COLOR!,
	appName: process.env.APP_NAME!,
	appShortName: process.env.APP_SHORT_NAME!,
	appDescription: process.env.APP_DESCRIPTION!,
};

function recursiveCheck(obj: Record<string, any>, path: string[] = []) {
	Object.keys(obj).forEach((key) => {
		if (obj[key] === undefined || Number.isNaN(obj[key])) {
			throw new Error(`missing env variable for config key "${[...path, key].join('.')}"`);
		} else if (typeof obj[key] === 'object') {
			recursiveCheck(obj[key], [...path, key]);
		}
	});
}

recursiveCheck(config);

export default config;
