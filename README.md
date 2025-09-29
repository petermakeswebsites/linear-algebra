# Linear Algebra Visualiser

## Overview

The Linear Algebra Visualiser is a tool designed to help understand and visualise the concepts of linear algebra, focusing on matrix transformations in 2D and 3D spaces. It includes features for visualising eigenvectors and their transformations, and supports complex numbers, scripting, and an array of mathematical functions. I purposely did not use any external libraries for maths as I wanted to solidify my knowledge, so I implemented a custom complex number, matrix, and vector calculations.

## Features

- **2D and 3D Matrix Transformations**: Visualise how matrices are transformed in two or three dimensions when transformations are applied to them.
- **Eigenvectors and Eigenvalues**: See how eigenvectors move across the same line during transformations and how eigenvalues are related to these transformations.
- **Scripting Capabilities**: Includes a scripting interface that supports variables, complex numbers, and nested expressions. Scripting allows for dynamic interaction with the visualizations.
- **Complex Number Support**: Built-in support for complex numbers to explore their properties within linear algebra contexts.
- **Customisable Transition Matrix**: Override the global transition matrix (GUI) in the scripts by assigning `G = [1,2;3,4]`.
- **Interactive Slider**: Experiment with transformations using a slideable value/variable for real-time visual feedback.
- **AST for Parsing**: Utilises an abstract syntax tree for flexible parsing of expressions.

## Usage

Either go to [https://math.petermakeswebsites.co.uk](https://math.petermakeswebsites.co.uk) or clone the repository to your local machine.

The visualiser supports scripting to define variables, vectors, matrices, and perform various linear algebra operations. Here's how you can use it:

- Define a vector: `d = [1, 2]`
- Define a matrix: `m = [1, 2; 3 + 3i, (4*5)]`
- Perform operations: `G = [your 2x2 or 3x3 matrix]` to override the global transition matrix.

### Supported Functions

The visualizer includes several built-in functions for linear algebra calculations:

- Mathematical functions: `abs`, `sin`, `cos`, `tan`, `sqrt`, etc., with support for vectors, matrices, and numbers where compatible.
- `log`: Logs the matrix, vector, or number.
- `dot`: Dot product of two vectors.
- `length`: Length of a vector.
- `integer`: Attempts to scale a vector such that it keeps the same direction but has whole number components.
- `angle`: Finds the angle between two vectors in radians.
- `eigenvectors`: For calculating eigenvectors and eigenvalues of matrices, note this is only for 2D matrices for now because of issues with the cubic root function.
- `transpose`: Tranposes a vector or a matrix.
- `cross`: Cross product is not a function but done by writing `Vec1 * Vec2`, the return is the cross product vector.
- `identity`: Creates an identity matrix with col and row of the number passed to it.

## Contributing

Contributions are welcome! If you have suggestions for improvements or want to contribute code, please feel free to submit an issue or pull request.

## License

MIT Licensed
