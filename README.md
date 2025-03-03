# Point Transformation Application

A web application for geometric point transformations, built with React and TypeScript. This interactive tool allows users to place points on a canvas and apply various geometric transformations including translation, rotation, and scaling.

## Features

- Interactive point placement on the left panel
- Transformation parameter controls:
  - Translation (tx, ty)
  - Rotation angle
  - Scaling ratio
- Custom matrix operations for point transformations
- Real-time visualization of transformed points on the right panel
- Responsive design
- User-friendly interface

## Technologies

- React
- TypeScript
- Material-UI
- HTML Canvas

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

The application will run at http://localhost:3000

## Usage

1. Click on the left panel to place points
2. Set transformation parameters:
   - tx: Translation along X-axis
   - ty: Translation along Y-axis
   - Rotation: Angle in degrees
   - Scale: Scaling ratio
3. Click "Transform" to apply the transformation
4. View transformed points on the right panel
5. Use "Clear" button to reset all points

## Transformation Matrix

The application uses the following transformation matrix to transform points:

\[
\\begin{bmatrix} 
x' \\\\ 
y' 
\\end{bmatrix} = 
\\begin{bmatrix} 
s\\cos(\\theta) & -s\\sin(\\theta) & t_x \\\\ 
s\\sin(\\theta) & s\\cos(\\theta) & t_y
\\end{bmatrix}
\\begin{bmatrix} 
x \\\\ 
y \\\\ 
1
\\end{bmatrix}
\]

Where:
- s: Scaling factor
- θ: Rotation angle
- tx, ty: Translation parameters
