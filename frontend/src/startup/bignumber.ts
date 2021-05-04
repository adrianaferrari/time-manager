import BigNumber from 'bignumber.js';
import { decimalSeparator } from '../i18n';

BigNumber.config({
	FORMAT: {
		groupSeparator: '',
		decimalSeparator,
	},
});
