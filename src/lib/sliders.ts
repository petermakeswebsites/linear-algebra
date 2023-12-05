import { get, writable } from "svelte/store";

// const sliders = writable(new Map<string, number>)

// function nextName(start = 1) {
//     const currentSliders = [...get(sliders).keys()]
//     const nextSliderName = 'sl' + start
//     if (currentSliders.includes(nextSliderName)) return nextName(start++)
//     return nextSliderName
// }

// const createSlider() {
//     const newName = nextName()

// }

export const slider = writable(1)