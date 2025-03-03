import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Container, Grid, TextField, Button, Paper, Box, Typography, IconButton, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TransformIcon from '@mui/icons-material/Transform';
import { blue, pink } from '@mui/material/colors';

interface Point {
  x: number;
  y: number;
}

interface TransformParams {
  tx: number;
  ty: number;
  rotation: number;
  scale: number;
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [points, setPoints] = useState<Point[]>([]);
  const [transformedPoints, setTransformedPoints] = useState<Point[]>([]);
  const [params, setParams] = useState<TransformParams>({
    tx: 0,
    ty: 0,
    rotation: 0,
    scale: 1,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const ORIGIN_X = CANVAS_WIDTH / 2;
  const ORIGIN_Y = CANVAS_HEIGHT / 2;

  const drawPoints = useCallback((canvas: HTMLCanvasElement | null, pointsToShow: Point[], color: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with a slight background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw coordinate axes with better styling
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Grid lines
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Main axes with darker color
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 2;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, ORIGIN_Y);
    ctx.lineTo(canvas.width, ORIGIN_Y);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(ORIGIN_X, 0);
    ctx.lineTo(ORIGIN_X, canvas.height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // X axis labels
    for (let x = -150; x <= 150; x += 50) {
      const canvasX = x + ORIGIN_X;
      if (x !== 0) {
        ctx.fillText(x.toString(), canvasX, ORIGIN_Y + 20);
      }
    }
    
    // Y axis labels
    for (let y = -150; y <= 150; y += 50) {
      const canvasY = ORIGIN_Y - y;
      if (y !== 0) {
        ctx.fillText(y.toString(), ORIGIN_X - 25, canvasY);
      }
    }

    // Origin label
    ctx.fillText('0', ORIGIN_X - 15, ORIGIN_Y + 20);
    
    // Draw points
    pointsToShow.forEach((point, index) => {
      // Convert from coordinate system to canvas coordinates
      const canvasX = point.x + ORIGIN_X;
      const canvasY = ORIGIN_Y - point.y;
      
      // Draw point shadow
      ctx.beginPath();
      ctx.arc(canvasX, canvasY + 2, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();
      
      // Draw point with gradient
      const gradient = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, 6);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color.replace(')', ', 0.8)'));
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
      
      // Draw point label with background
      const label = `P${index + 1}(${Math.round(point.x)},${Math.round(point.y)})`;
      const labelWidth = ctx.measureText(label).width + 8;
      
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(canvasX + 8, canvasY - 20, labelWidth, 20);
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, canvasX + 12, canvasY - 10);
    });
  }, [ORIGIN_X, ORIGIN_Y]);

  // Initialize canvases when the component mounts
  useEffect(() => {
    drawPoints(leftCanvasRef.current, [], blue[500]);
    drawPoints(rightCanvasRef.current, [], pink[500]);
  }, []);

  React.useEffect(() => {
    drawPoints(leftCanvasRef.current, points, blue[500]);
  }, [points, drawPoints]);

  React.useEffect(() => {
    drawPoints(rightCanvasRef.current, transformedPoints, pink[500]);
  }, [transformedPoints, drawPoints]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = leftCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    const x = canvasX - ORIGIN_X;
    const y = ORIGIN_Y - canvasY;
    
    setPoints([...points, { x, y }]);
    
    // Show feedback to the user
    setSnackbar({
      open: true,
      message: `Point added at (${Math.round(x)}, ${Math.round(y)})`,
      severity: 'info'
    });
  };

  const transformPoint = (point: Point): Point => {
    const { tx, ty, rotation, scale } = params;
    const rad = (rotation * Math.PI) / 180; // Convert degrees to radians
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Apply transformation matrix:
    // | scale*cos  -scale*sin  tx | | x |
    // | scale*sin   scale*cos  ty | | y |
    // |     0          0       1  | | 1 |
    const x = scale * (point.x * cos - point.y * sin) + tx;
    const y = scale * (point.x * sin + point.y * cos) + ty;

    return { x, y };
  };

  const handleTransform = () => {
    if (points.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one point before transforming',
        severity: 'error'
      });
      return;
    }
    
    const newPoints = points.map(transformPoint);
    setTransformedPoints(newPoints);
    
    setSnackbar({
      open: true,
      message: `${points.length} point${points.length > 1 ? 's' : ''} transformed successfully`,
      severity: 'success'
    });
  };

  const handleClear = () => {
    setPoints([]);
    setTransformedPoints([]);
    setParams({
      tx: 0,
      ty: 0,
      rotation: 0,
      scale: 1,
    });
    
    setSnackbar({
      open: true,
      message: 'All points cleared',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          color: '#333',
          mb: 4,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        2D Geometric Transformations
      </Typography>
      
      <Grid container spacing={8} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              background: 'white',
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)'
              },
              position: 'relative',
              zIndex: 1
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                Original Points
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (Click to add points)
              </Typography>
            </Box>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <canvas
                ref={leftCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleCanvasClick}
                style={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'crosshair',
                  width: isMobile ? '100%' : CANVAS_WIDTH,
                  height: 'auto',
                  maxWidth: '100%',
                  backgroundColor: 'white'
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              height: '100%',
              background: 'white',
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)'
              },
              position: 'relative',
              zIndex: 1
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                Transformed Points
              </Typography>
            </Box>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <canvas
                ref={rightCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  width: isMobile ? '100%' : CANVAS_WIDTH,
                  height: 'auto',
                  maxWidth: '100%',
                  backgroundColor: 'white'
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              background: 'white',
              borderRadius: 2,
              position: 'relative',
              zIndex: 0
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <TextField
                label="Translation X"
                type="number"
                value={params.tx}
                onChange={(e) => setParams({ ...params, tx: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ 
                  minWidth: isMobile ? '100%' : 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <TextField
                label="Translation Y"
                type="number"
                value={params.ty}
                onChange={(e) => setParams({ ...params, ty: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ 
                  minWidth: isMobile ? '100%' : 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <TextField
                label="Rotation (degrees)"
                type="number"
                value={params.rotation}
                onChange={(e) => setParams({ ...params, rotation: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ 
                  minWidth: isMobile ? '100%' : 150,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <TextField
                label="Scale"
                type="number"
                value={params.scale}
                onChange={(e) => setParams({ ...params, scale: Number(e.target.value) })}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
                sx={{ 
                  minWidth: isMobile ? '100%' : 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, width: isMobile ? '100%' : 'auto' }}>
                <Button
                  variant="contained"
                  onClick={handleTransform}
                  startIcon={<TransformIcon />}
                  sx={{ 
                    height: '40px',
                    flex: isMobile ? 1 : 'none',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Transform
                </Button>
                <IconButton
                  onClick={handleClear}
                  color="error"
                  sx={{ 
                    height: '40px',
                    width: '40px',
                    borderRadius: 2
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Feedback notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
