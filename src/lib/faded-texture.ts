import { Texture } from "three"

// Step 1: Create a canvas
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')
if (context === null) throw new Error("No context")
canvas.width = 256 // Adjust as needed
canvas.height = 256 // Adjust as needed

// Step 2: Draw the gradient
const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
gradient.addColorStop(0, 'black')
gradient.addColorStop(0.5, 'white')
gradient.addColorStop(1, 'black')

context.fillStyle = gradient
context.fillRect(0, 0, canvas.width, canvas.height)

document.body.appendChild(canvas)

// Step 3: Create the texture
export const fadedTexture = new Texture(canvas);
fadedTexture.needsUpdate = true; // Important to update the texture