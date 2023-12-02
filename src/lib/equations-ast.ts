import { times } from 'lodash-es'

export type AstParseNode =
	| AstAdd
	| AstDot
	| AstSub
	| AstSemi
	| AstMult
	| AstComma
	| AstParenthesis
	| AstBracket
export type AstNode = AstParseNode | AstToken
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
	name: 'token'
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
	list: AstNode[]
	separator: 'semicolon'
	name: 'semicolon'
}

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
	mult: {
		name: 'mult',
		symbols: ['*'],
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

export function astMaker(eq: string): AstNode {
	eq = eq.trim()
	let thisToken = ''
	const accumulatedNodes: AstNode[] = []

	for (let i = 0; i < eq.length; i++) {
		const char = eq[i]
		const restOfEquation = eq.slice(i + 1)

		const symbolised = symbolList.get(char)
		// console.log({ char, symbolised })
		if (symbolised === undefined) {
			thisToken += char
		} else {
			if (thisToken.length) {
				// Token ends when we meet it
				const newToken: AstToken = {
					token: thisToken,
					name: 'token'
				}
				thisToken = ''
				accumulatedNodes.push(newToken)
			}

			if (symbolised.type === 'wrap') {
				const { node, len } = processWrap(symbolised, restOfEquation)
				i = len
				accumulatedNodes.push(node)
			} else if (symbolised.type === 'operate') {
				console.log('Operator found')
				if (symbolised.name === 'add' || symbolised.name === 'sub') {
					if (accumulatedNodes.length === 0)
						throw new Error(`${symbolised.symbols[0]} detected without anything before from it.`)
					if (accumulatedNodes.length > 1)
						throw new Error(
							`${symbolised.symbols[0]} detected, but there was more than 1 node previous from it. This should be impossible!`
						)
					return {
						name: symbolised.name,
						lhs: accumulatedNodes[0],
						rhs: astMaker(restOfEquation),
						// @ts-ignore I don't know why it's throwing an error here
						operation: symbolised.name
					}
				} else if (symbolised.name === "dot") {
					throw new Error('Not implemented yet for symbol')
				}
			}
		}
	}

	if (thisToken.length) {
		return {
			token: thisToken,
			name: 'token'
		}
	}

	if (accumulatedNodes.length === 1) {
		return accumulatedNodes[0]
	}

	throw new Error(`Reached the end of AST with no token or anything`)
}

function processWrap(
	symbolised: AstSymbol,
	restOfEquation: string
): {
	node: AstNode
	len: number
} {
	if (symbolised.name === 'parenthesis') {
		// Find the end of this bracket
		return astContainer(restOfEquation, symbolised.symbols[0], symbolised.symbols[1])
	} else if (symbolised.name === 'bracket') {
		return bracketBreaker(restOfEquation)
	} else {
		throw new Error(`Symbolised wrap type name not recognise: ${symbolised.name}`)
	}
}

function astContainer(
	restOfEq: string,
	openingSymbol: string,
	closingSymbol: string
): {
	node: AstNode
	len: number
} {
	let containerLayerDepth = 0
	for (let i = 0; i < restOfEq.length; i++) {
		const innerChar = restOfEq[i]
		if (innerChar === openingSymbol) {
			containerLayerDepth++
		} else if (innerChar === closingSymbol) {
			if (containerLayerDepth === 0) {
				return {
					node: astMaker(restOfEq.slice(0, i)),
					len: i + 1
				}
			} else {
				containerLayerDepth--
			}
		}
	}
	throw new Error(`Equation ${restOfEq} did not have a closing symbol: ${closingSymbol}`)
}

/**
 * We receive something like `3,4,5] + ...`
 * We need to find the "]" closing bracket and then
 * return the pointer to where it left off
 * @param eq
 */
function bracketBreaker(eq: string): { node: AstBracket; len: number } {
	const splitSemis: string[] = []
	let latestSemi = ''
	let bracketLayerDepth = 0
	let closingBracketIndex: undefined | number = undefined
	// We aren't wanting to do any processing here
	// actually, we just want to split up the semis
	// and commas
	for (let i = 0; i < eq.length; i++) {
		const char = eq[i]
		// restOfEquation = eq.slice(i + 1)
		const symbolised = symbolList.get(char)
		if (symbolised === undefined) {
			latestSemi += char
		} else {
			if (symbolised.type === 'wrap') {
				if (symbolised.name === 'bracket') {
					if (symbolised.symbols[0] === char) {
						bracketLayerDepth++
					} else {
						// Closing bracket
						if (bracketLayerDepth === 0) {
							if (latestSemi.length) splitSemis.push(latestSemi)
							closingBracketIndex = i + 1
							break
						}
						bracketLayerDepth--
					}
				}
				latestSemi += char
				// We actually don't care about parenthesis because
				// they'll just throw an error if they're mis-aligned anyway
			} else if (symbolised.name === 'semicolon') {
				splitSemis.push(latestSemi)
				latestSemi = ''
			} else {
				latestSemi += char
			}
		}
	}

	console.log(splitSemis)

	if (closingBracketIndex === undefined) throw new Error(`No closing bracket found ]`)
	if (splitSemis.length === 0)
		throw new Error(`We found a closing bracket but there were no entries`)

	const nodes = splitSemis.map((eq) => {
		console.log({ eq })
		const splitCommas: string[] = []
		let latestComma = ''
		let bracketLayerDepth = 0
		for (let i = 0; i < eq.length; i++) {
			const char = eq[i]
			// restOfEquation = eq.slice(i + 1)
			const symbolised = symbolList.get(char)
			if (symbolised === undefined) {
				latestComma += char
			} else {
				if (symbolised.type === 'wrap') {
					if (symbolised.name === 'bracket') {
						if (symbolised.symbols[0] === char) {
							bracketLayerDepth++
						} else {
							bracketLayerDepth--
						}
					}
					latestComma += char
					// We actually don't care about parenthesis because
					// they'll just throw an error if they're mis-aligned anyway
				} else if (symbolised.name === 'comma') {
					if (bracketLayerDepth === 0) {
						splitCommas.push(latestComma)
						latestComma = ''
					} else {
                        latestComma += char
                    }
				} else {
					latestComma += char
				}
			}
		}
        if (latestComma.length) splitCommas.push(latestComma)
		if (splitCommas.length === 0)
			throw new Error(`We reached the end of the line but did not find the ending bracket ]`)
		return {
			list: splitCommas.map(astMaker),
			separator: 'comma',
			name: 'comma'
		} satisfies AstComma
	})

	const semicolonList = { name: 'semicolon', separator: 'semicolon', list: nodes } satisfies AstSemi

	const inner: AstSemi | AstComma = nodes.length === 1 ? nodes[0] : semicolonList

	const node: AstBracket = {
		name: 'bracket',
		container: 'bracket',
		inner
	}

	return {
		node,
		len: closingBracketIndex
	}
}

function findNextNotInBracket(eq : string, target : string[]) : {eq: string, char : string, remainder : string} {
    let paranthesisDepth = 0
    let bracketDepth = 0
    let acc = ""
    for (let index = 0; index < eq.length; index++) {
        const char = eq[index];
        const symbolised = symbolList.get(char)
        if (target.includes(char)) {
            if (paranthesisDepth === 0 && bracketDepth === 0) {
                return {
                    eq: acc,
                    char,
                    remainder : eq.slice(index)
                }
            }
        }
        acc += char
        if (symbolised?.type === "wrap") {
            if (symbolised.name === "bracket") {
                if (char === symbolised.symbols[0]) {
                    bracketDepth++
                } else {
                    bracketDepth--
                }
            } else if (symbolised.name === "parenthesis") {
                if (char === symbolised.symbols[0]) {
                    paranthesisDepth++
                } else {
                    paranthesisDepth--
                }
            }
        }
    }
    throw new Error(`Reached end of ${eq} but did not find ${target.join()} (outside of brackets / parentheses)`)
}