import { newScanner } from './scanner.js'

const scanAll = (css) => {
	const f = scanFunc(css)
	const result = []
	let tk = null

	while ((tk = f()) !== null) {
		result.push(tk)
	}

	return result
}

const scanFunc = (css) => {
	// PLESAE NOTE: CBA to handle two code points for the first implementation.
	// TODO

	const sr = newScanner(css)

	const scanName = () => {
		const name = sr.readWhile(/[a-zA-Z0-9_\-\.]/)
		sr.skipSpace()
		return name
	}

	const scanParams = (name) => {
		if (!sr.accept(/\(/)) {
			return []
		}

		sr.skipSpace()

		if (sr.accept(/\)/)) {
			return []
		}

		const args = scanArgs(name)

		sr.skipSpace()
		sr.expect(/\)/)

		return args
	}

	const scanArgs = (name) => {
		const args = []

		while (true) {
			const arg = scanArg(name)
			args.push(arg)

			if (!sr.accept(/,/)) {
				break
			}

			sr.skipSpace()
		}

		return args
	}

	const scanArg = (name) => {
		const arg = sr.readWhile(/[^,)]/)

		if (arg === '') {
			throw new Error(`Missing argument for '${name}'`)
		}

		sr.skipSpace()
		return arg
	}

	return () => {
		if (!sr.seek(/\$/)) {
			return null
		}

		const start = sr.index()
		const startRune = sr.read()
		const name = scanName()
		const args = scanParams(name)
		const end = sr.index()

		return {
			start: start,
			end: end,
			raw: sr.slice(start, end),
			path: name.split('.'),
			args: args,
		}
	}
}

export default {
	scanAll: scanAll,
	scanFunc: scanFunc,
}
