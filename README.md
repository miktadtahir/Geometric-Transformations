# Point Transformation Application

A web application for visualizing 3D geometric transformations, built with React and Three.js. This interactive tool allows users to place points in 3D space and apply various geometric transformations (translation, rotation, and scaling).

## Features

- Interactive 3D point placement in the left panel
- Transformation parameter controls:
  - Translation (tx, ty, tz)
  - Rotation around X, Y, and Z axes
  - Scaling ratio
- Custom matrix operations for point transformations
- Real-time visualization of transformed points in the right panel
- Responsive design
- User-friendly interface
- 3D view controls (zoom, rotate, pan)

## Technologies

- React
- TypeScript
- Three.js
- Material-UI
- WebGL

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

1. Click on the left panel to place points in 3D space
2. Set transformation parameters:
   - tx, ty, tz: Translation along X, Y, and Z axes
   - Rotation X, Y, Z: Rotation around each axis (in degrees)
   - Scale: Scaling ratio
3. Click "Transform" to apply the transformation
4. View transformed points in the right panel
5. Use "Clear" button to reset all points

## Transformation Matrix

The application uses the following 4x4 transformation matrix to transform points:

\[
\\begin{bmatrix} 
x' \\\\ 
y' \\\\
z' \\\\
1
\\end{bmatrix} = 
\\begin{bmatrix} 
s\\cos(\\theta_z)\\cos(\\theta_y) & -s\\sin(\\theta_z)\\cos(\\theta_x) & s\\sin(\\theta_y) & t_x \\\\ 
s\\sin(\\theta_z)\\cos(\\theta_y) & s\\cos(\\theta_z)\\cos(\\theta_x) & -s\\sin(\\theta_x) & t_y \\\\
-s\\sin(\\theta_y) & s\\sin(\\theta_x)\\cos(\\theta_y) & s\\cos(\\theta_x)\\cos(\\theta_y) & t_z \\\\
0 & 0 & 0 & 1
\\end{bmatrix}
\\begin{bmatrix} 
x \\\\ 
y \\\\ 
z \\\\
1
\\end{bmatrix}
\]

Where:
- s: Scaling factor
- θx, θy, θz: Rotation angles around X, Y, and Z axes
- tx, ty, tz: Translation parameters
