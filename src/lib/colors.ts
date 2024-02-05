import Color from "color"
const ratio = 0.618033988749895

export function colorFromString(id: string, saturation = 0.5, value = 0.5) {
	let newHue = ratio * [...id].reduce((prev, current) => current.charCodeAt(0) + prev, 0)
	newHue %= 1

	if (typeof saturation !== 'number') {
		saturation = 0.5
	}

	if (typeof value !== 'number') {
		value = 0.95
	}

	const col = Color({
		h: newHue * 360,
		s: saturation * 100,
		v: value * 100
	}).hex()
    return col
}
