import pg from 'pg';
import BigNumber from 'bignumber.js';
import { DateOnly } from '@cdellacqua/date-only';

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (decimal: string): BigNumber => new BigNumber(decimal));
pg.types.setTypeParser(pg.types.builtins.DATE, (date: string): DateOnly => new DateOnly(date));
