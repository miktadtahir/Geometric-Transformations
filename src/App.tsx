import React, { useState } from 'react';
import { Container, Box, Switch, FormControlLabel, Link, Typography } from '@mui/material';
import Transform2D from './components/Transform2D';
import Transform3D from './components/Transform3D';
import GitHubIcon from '@mui/icons-material/GitHub';

interface Point {
  x: number;
  y: number;
  z?: number;
}

function App() {
  const [is3DMode, setIs3DMode] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [transformedPoints, setTransformedPoints] = useState<Point[]>([]);

  const handle2DPointsUpdate = (newPoints: Point[], newTransformedPoints: Point[]) => {
    setPoints(newPoints);
    setTransformedPoints(newTransformedPoints);
  };

  const currentComponent = is3DMode ? (
    <Transform3D 
      initialPoints={points.map(p => ({ ...p, z: 0 }))}
      initialTransformedPoints={transformedPoints.map(p => ({ ...p, z: 0 }))}
      disablePointAddition={true}
    />
  ) : (
    <Transform2D 
      initialPoints={points}
      initialTransformedPoints={transformedPoints}
      onPointsUpdate={handle2DPointsUpdate}
    />
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={is3DMode}
              onChange={(e) => setIs3DMode(e.target.checked)}
            />
          }
          label={is3DMode ? "3D Mode" : "2D Mode"}
        />
        <Link 
          href="https://github.com/miktadtahir/Geometric-Transformations"
          target="_blank"
          rel="noopener noreferrer"
              sx={{ 
                display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'text.primary',
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          <GitHubIcon sx={{ mr: 1 }} />
          <Typography>View on GitHub</Typography>
        </Link>
            </Box>
      
      {currentComponent}
    </Container>
  );
}

export default App;
