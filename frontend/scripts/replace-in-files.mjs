import fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

const config = dotenv.config().parsed;

const fileNames = ['index.html', 'manifest.json'];

for (const fileName of fileNames) {
	try {
		const fileContent = fs.readFileSync(join('src', fileName)).toString();
		let output = fileContent;
		for (const key of Object.keys(config)) {
			output = output.replace(new RegExp(`${key}`, 'g'), `${config[key]}`);
		}
		fs.writeFileSync(join('public', fileName), output);
	} catch (err) {
		console.error(err);
		throw err;
	}
}
