export const equationTemplates = {
    "Cross Product": `# Create a matrix\nA = [1,0;1,1]\n# Create a vector\nv = [0.5,0.5]\n# Skew the vector\nvf = A*v\n\n# Create two 3D vectors\nva = [2,1,1]\nvb = [1,2,0]\n# Get the cross product\nvc = va*vb\nvd = vb*va`,
    "Rotation":
`# Make theta responisble to slider
theta = slider * pi * 2

# Generate our sins and cosines
c = cos(theta)
s = sin(theta)

# Add a random vector
v = [2,1]

# Create 2d rotation
M = [c,-s;s,c]

# Cross a few vectors
ca = [1,0.5,2]
cb = [1,1,1]
cross vec = ca*cb

# Assign to global transform to see what it looks like
G = M`
} as const