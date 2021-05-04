const fs = require('fs');
const path = require('path');

const projectName = path.basename(__dirname);

(async () => {
	const envPath = path.join(__dirname, '.env.example');
	const envContent = (await fs.promises.readFile(envPath)).toString()
		.replace(/APP_NAME=.*/, `APP_NAME="${projectName}"`)
		.replace(/APP_SHORT_NAME=.*/, `APP_SHORT_NAME="${projectName}"`)
		.replace(/APP_DESCRIPTION=.*/, `APP_DESCRIPTION="${projectName}"`)
	await fs.promises.writeFile(path.join(__dirname, '.env.example'), envContent);
	console.info('updated .env.example');

	await fs.promises.writeFile(path.join(__dirname, '.env'), envContent);
	console.info('created .env');
})();

(async () => {
	const packagePath = path.join(__dirname, 'package.json');
	const packageContent = (await fs.promises.readFile(packagePath)).toString();
	await fs.promises.writeFile(packagePath, packageContent.replace(/"name":[^\r\n]+/, `"name": "${projectName}",`));
	console.info('updated package name in package.json');
})();

(async () => {
	const packageLockPath = path.join(__dirname, 'package-lock.json');
	const packageLockContent = (await fs.promises.readFile(packageLockPath)).toString();
	await fs.promises.writeFile(packageLockPath, packageLockContent.replace(/"name":[^\r\n]+/, `"name": "${projectName}",`));
	console.info('updated package name in package-lock.json');
})();
