import * as R from 'ramda'

export const applyTwo = <T>(fn: Function) => (value: [T, T]) => fn(value[0], value[1])

export const splitByColumn = R.split('-')

export const lastOr = <T>(defaultValue: T) => (valueToTest: string[]) => R.last(valueToTest) || defaultValue
export const lastOrEmptyString = lastOr('')

export const curriedSetTimeout = (time: number) => (fn: Function) => setTimeout(fn, time)

export const minN = R.apply(Math.min)
export const maxN = R.apply(Math.max)
export const getMinAndMax = R.juxt([maxN, minN])

export const sleep = (time: number) => new Promise(curriedSetTimeout(time));

export const withValue = R.compose(R.not, R.isEmpty)

export const asyncEvery = <T>(predicate: (item: T) => Promise<boolean>) => async (list: T[]) => {
	for (let item of list) {
		if (!await predicate(item)) return false;
	}
	return true;
};
