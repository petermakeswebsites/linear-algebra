import { last, times } from 'lodash-es'

export type AstParseNode =
	| AstAdd
	| AstDot
	| AstSub
	| AstSemi
	| AstMult
	| AstDivide
	| AstComma
	| AstParenthesis
	| AstBracket
	| AstPow
export type AstNode = AstParseNode | AstToken | AstFunction
export type AstAdd = {
	lhs: AstNode
	rhs: AstNode
	operation: 'add'
	name: 'add'
}

/**
 * Token is either a number or var, or an error!
 * To be parsed outside
 *
 * e.g. `-13.5` or `a`
 */
export type AstToken = {
	token: string
	negative: boolean
	name: 'token'
}

export type AstFunction = {
	name: 'function'
	function: string
	negative: boolean
	args: AstComma
}

export type AstSub = {
	lhs: AstNode
	rhs: AstNode
	operation: 'sub'
	name: 'sub'
}

export type AstDot = {
	lhs: AstNode
	rhs: AstNode
	operation: 'dot'
	name: 'dot'
}

export type AstMult = {
	lhs: AstNode
	rhs: AstNode
	operation: 'mult'
	name: 'mult'
}

export type AstDivide = {
	lhs: AstNode
	rhs: AstNode
	operation: 'divide'
	name: 'divide'
}

export type AstPow = {
	lhs: AstNode
	rhs: AstNode
	operation: 'pow'
	name: 'pow'
}

export type AstParenthesis = {
	inner: AstNode
	container: 'parenthesis'
	name: 'parenthesis'
}

export type AstBracket = {
	inner: AstSemi | AstComma
	container: 'bracket'
	name: 'bracket'
}

export type AstSemi = {
	list: AstComma[]
	separator: 'semicolon'
	name: 'semicolon'
}

/**
 * Comma list
 */
export type AstComma = {
	list: AstNode[]
	separator: 'comma'
	name: 'comma'
}

type AstSymbol =
	| {
			symbols: string[]
			name: AstNode['name']
			type: 'split' | 'operate'
	  }
	| {
			symbols: [open: string, close: string]
			name: AstNode['name']
			type: 'wrap'
	  }

const Symbols: Record<AstParseNode['name'], AstSymbol> = {
	add: {
		name: 'add',
		symbols: ['+'],
		type: 'operate'
	},
	sub: {
		name: 'sub',
		symbols: ['-'],
		type: 'operate'
	},
	pow: {
		name: 'pow',
		symbols: ['^'],
		type: 'operate'
	},
	mult: {
		name: 'mult',
		symbols: ['*'],
		type: 'operate'
	},
	divide: {
		name: 'divide',
		symbols: ['/'],
		type: 'operate'
	},
	dot: {
		name: 'dot',
		symbols: ['@'],
		type: 'operate'
	},
	comma: {
		name: 'comma',
		symbols: [','],
		type: 'split'
	},
	semicolon: {
		name: 'semicolon',
		symbols: [';'],
		type: 'split'
	},
	parenthesis: {
		name: 'parenthesis',
		symbols: ['(', ')'],
		type: 'wrap'
	},
	bracket: {
		name: 'bracket',
		symbols: ['[', ']'],
		type: 'wrap'
	}
}

const symbolList = new Map<string, AstSymbol>(
	Object.values(Symbols).flatMap((p) => {
		return p.symbols.map((symbol) => {
			return [symbol, p] as const
		})
	})
)

/**
 * Basically sometimes the minus sign
 * should be considered a token, and other times
 * it should be considered an operator
 */
function minusIsToken(beforeMinus: string): boolean {
	const isToken = ['-', '/', '*', '@', '+', '(', '', '^']
	return isToken.includes(beforeMinus)
}

export function astMaker(eq: string): AstNode {
	eq = eq.trim()
	if (!eq.length) throw new Error(`Expecting token but was blank`)

	// First check to see if we've got addition / subtraction
	const addsub = findNextNotInBracket(eq, ['+', '-'])
	if (addsub !== null) {
		if (addsub.char === '+') {
			return {
				name: 'add',
				operation: 'add',
				lhs: astMaker(addsub.eq),
				rhs: astMaker(addsub.remainder)
			} satisfies AstAdd
		} else {
			const lastCharacter = addsub.eq.slice(-1)
			const isToken = minusIsToken(lastCharacter)
			// console.log({isToken})
			if (!isToken)
				return {
					name: 'sub',
					operation: 'sub',
					lhs: astMaker(addsub.eq),
					rhs: astMaker(addsub.remainder)
				} satisfies AstSub
		}
	}

	const mult = findNextNotInBracket(eq, ['@', '*', '/'])
	if (mult !== null) {
		if (mult.char === '@') {
			return {
				name: 'dot',
				operation: 'dot',
				lhs: astMaker(mult.eq),
				rhs: astMaker(mult.remainder)
			} satisfies AstDot

		} else if (mult.char === '/') {
			return {
				name: 'divide',
				operation: 'divide',
				lhs: astMaker(mult.eq),
				rhs: astMaker(mult.remainder)
			} satisfies AstDivide
		} else {
			return {
				name: 'mult',
				operation: 'mult',
				lhs: astMaker(mult.eq),
				rhs: astMaker(mult.remainder)
			} satisfies AstMult
		}
	}

	const pow = findNextNotInBracket(eq, ['^'])
	if (pow !== null) {
		return {
			name: 'pow',
			operation: 'pow',
			lhs: astMaker(pow.eq),
			rhs: astMaker(pow.remainder)
		} satisfies AstPow
	}

	const parenthesis = findNextNotInBracket(eq, ['('])
	if (parenthesis !== null) {
		const beforeOpenParenthesis = parenthesis.eq

		// Find close parenthesis
		const next = findNextNotInBracket(parenthesis.remainder, [')'])
		if (next === null) throw new Error(`Close parenthesis not found in '${eq}'`)

		const inParanthesis = next.eq

		const afterParenthesis = next.remainder
		// console.log({ beforeOpenParenthesis, inParanthesis, afterParenthesis })

		if (afterParenthesis.length)
			throw new Error('There should be some kind of modifier after paranthesis - or nothing')
		if (beforeOpenParenthesis.length) {
			// We're a function, parse args!

			const commaList = splitAllNotInBrackets(inParanthesis, ',')
			const commaNodes: AstNode[] = commaList.map((insideComma) => astMaker(insideComma))
			const fnArgs: AstComma = {
				name: 'comma',
				separator: 'comma',
				list: commaNodes
			}
			// Amount of preceeding negative signs
			const negatives = /\-+/.exec(beforeOpenParenthesis)?.[0]?.length || 0
			const negative = !!(negatives % 2) // Is odd
			const func = beforeOpenParenthesis.slice(negatives)

			return {
				name: 'function',
				function: func,
				negative,
				args: fnArgs
			} satisfies AstFunction
		} else {
			// We're not a function, just brackets
			return astMaker(inParanthesis)
		}
	}

	const bracket = findNextNotInBracket(eq, ['['])
	if (bracket !== null) {
		const beforeBracket = bracket.eq
		if (beforeBracket.length) throw new Error(`Can't have that before the [ opening in '${eq}'`)
		// First we find the closing bracket
		const bracketReturn = findNextNotInBracket(bracket.remainder, [']'])
		if (bracketReturn === null)
			throw new Error(
				`Attempted to find ] in '${bracket.remainder}' but it was not found outside of other brackets`
			)
		const insideBracket = bracketReturn.eq
		const afterBracket = bracketReturn.remainder
		if (afterBracket.length)
			throw new Error(`Illegal character after the closing bracket ] in '${bracket.remainder}'`)
		return bracketBreaker(insideBracket)
	}

	// Amount of preceeding negative signs
	const negatives = /\-+/.exec(eq)?.[0]?.length || 0
	const negative = !!(negatives % 2) // Is odd
	const token = eq.slice(negatives)

	return {
		name: 'token',
		token,
		negative
	} satisfies AstToken
}

/**
 * We receive something like `3,4,5`
 * assuming already checked for whats around the brackets
 * return the pointer to where it left off
 * @param eq
 */
function bracketBreaker(eq: string): AstBracket {
	// const splitSemis: string[] = []
	// let latestSemi = ''
	// let bracketLayerDepth = 0
	// let closingBracketIndex: undefined | number = undefined
	// We aren't wanting to do any processing here
	// actually, we just want to split up the semis
	// and commas

	const semiSplit = splitAllNotInBrackets(eq, ';').map((semi) => {
		// Semi is essentially between two semicolons, expected separator ,
		// Should return a comma list
		const commaSplit = splitAllNotInBrackets(semi, ',')
		return {
			list: commaSplit.map(astMaker),
			name: 'comma',
			separator: 'comma'
		} satisfies AstComma
	})

	const semiReturn: AstSemi = {
		list: semiSplit,
		name: 'semicolon',
		separator: 'semicolon'
	}

	if (semiReturn.list.length === 0) throw new Error(`Nothing in semicolon list`)
	const node: AstBracket = {
		inner: semiReturn.list.length > 1 ? semiReturn : semiReturn.list[0],
		container: 'bracket',
		name: 'bracket'
	}
	return node
}

function findNextNotInBracket(
	eq: string,
	target: string[]
): { eq: string; char: string; remainder: string } | null {
	let paranthesisDepth = 0
	let bracketDepth = 0
	let acc = ''
	for (let index = 0; index < eq.length; index++) {
		const char = eq[index]
		const symbolised = symbolList.get(char)
		if (target.includes(char)) {
			if (paranthesisDepth === 0 && bracketDepth === 0) {
				const rtn = {
					eq: acc,
					char,
					remainder: eq.slice(index + 1)
				}
				return rtn
			}
		}
		acc += char
		if (symbolised?.type === 'wrap') {
			if (symbolised.name === 'bracket') {
				if (char === symbolised.symbols[0]) {
					bracketDepth++
				} else {
					bracketDepth--
				}
			} else if (symbolised.name === 'parenthesis') {
				if (char === symbolised.symbols[0]) {
					paranthesisDepth++
				} else {
					paranthesisDepth--
				}
			}
		}
	}
	if (paranthesisDepth || bracketDepth)
		throw new Error(
			`Reached end of ${eq} but brackets were not closed properly, parantheses open depth ${paranthesisDepth}, bracket open depth ${bracketDepth}`
		)
	return null
}

/**
 * Only do use this if you know you're
 * going to use all of eq for a fact
 */
function splitAllNotInBrackets(eq: string, char: string): string[] {
	const first = findNextNotInBracket(eq, [char])
	if (first === null) {
		return [eq]
	} else {
		return [first.eq, ...splitAllNotInBrackets(first.remainder, char)]
	}
}
