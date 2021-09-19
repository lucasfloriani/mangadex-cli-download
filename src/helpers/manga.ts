import * as R from 'ramda'
import { lastOrEmptyString, splitByColumn } from './utils';

export const grabChapterNumberByUrl = R.compose(lastOrEmptyString, splitByColumn)