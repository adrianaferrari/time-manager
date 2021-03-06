import { SerializableError } from '@cdellacqua/serializable-error';

const config = {
	http: {
		hostname: process.env.HOST!,
		port: Number(process.env.PORT),
		baseUrl: process.env.BASE_URL!,
	},
	signedUrlExpirationSeconds: Number(process.env.SIGNED_URL_EXPIRATION_SECONDS),
	authentication: {
		tokenExpirationSeconds: Number(process.env.JWT_EXPIRATION_SECONDS),
	},
	environment: process.env.NODE_ENV! as 'development'|'staging'|'production',
	secret: process.env.SECRET!,
	log: {
		level: process.env.LOG_LEVEL!,
	},
	shutdown: {
		interval: Number(process.env.SHUTDOWN_INTERVAL_SECONDS),
	},
};

function recursiveCheck(obj: Record<string, any>, path: string[] = []) {
	Object.keys(obj).forEach((key) => {
		if (obj[key] === undefined || Number.isNaN(obj[key])) {
			throw new SerializableError(`missing env variable for config key "${[...path, key].join('.')}"`);
		} else if (typeof obj[key] === 'object') {
			recursiveCheck(obj[key], [...path, key]);
		}
	});
}

recursiveCheck(config);

export default config;
