import React, { useState, useRef, useEffect } from 'react';
import { Grid, TextField, Button, Paper, Box, Typography, IconButton, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TransformIcon from '@mui/icons-material/Transform';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Transform3DParams {
  tx: number;
  ty: number;
  tz: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
}

interface Transform3DProps {
  initialPoints?: Point3D[];
  initialTransformedPoints?: Point3D[];
  disablePointAddition?: boolean;
}

const Transform3D: React.FC<Transform3DProps> = ({ 
  initialPoints = [], 
  initialTransformedPoints = [],
  disablePointAddition = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [points, setPoints] = useState<Point3D[]>(initialPoints);
  const [transformedPoints, setTransformedPoints] = useState<Point3D[]>(initialTransformedPoints);
  const [params, setParams] = useState<Transform3DParams>({
    tx: 0,
    ty: 0,
    tz: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const leftSceneRef = useRef<HTMLDivElement>(null);
  const rightSceneRef = useRef<HTMLDivElement>(null);
  const leftRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rightRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const leftSceneObjRef = useRef<THREE.Scene | null>(null);
  const rightSceneObjRef = useRef<THREE.Scene | null>(null);
  const leftCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rightCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const leftControlsRef = useRef<OrbitControls | null>(null);
  const rightControlsRef = useRef<OrbitControls | null>(null);

  const SCENE_WIDTH = 400;
  const SCENE_HEIGHT = 400;

  useEffect(() => {
    if (!leftSceneRef.current || !rightSceneRef.current) return;

    // Store refs in variables for cleanup
    const leftScene = leftSceneRef.current;
    const rightScene = rightSceneRef.current;

    // Setup scenes
    leftSceneObjRef.current = new THREE.Scene();
    rightSceneObjRef.current = new THREE.Scene();
    leftSceneObjRef.current.background = new THREE.Color(0xf5f5f5);
    rightSceneObjRef.current.background = new THREE.Color(0xf5f5f5);

    // Setup cameras with better initial position
    leftCameraRef.current = new THREE.PerspectiveCamera(45, SCENE_WIDTH / SCENE_HEIGHT, 0.1, 1000);
    rightCameraRef.current = new THREE.PerspectiveCamera(45, SCENE_WIDTH / SCENE_HEIGHT, 0.1, 1000);
    leftCameraRef.current.position.set(15, 15, 15);
    rightCameraRef.current.position.set(15, 15, 15);
    leftCameraRef.current.lookAt(0, 0, 0);
    rightCameraRef.current.lookAt(0, 0, 0);

    // Setup renderers with better quality
    leftRendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    rightRendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    leftRendererRef.current.setSize(SCENE_WIDTH, SCENE_HEIGHT);
    rightRendererRef.current.setSize(SCENE_WIDTH, SCENE_HEIGHT);
    leftRendererRef.current.setPixelRatio(window.devicePixelRatio);
    rightRendererRef.current.setPixelRatio(window.devicePixelRatio);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    leftSceneObjRef.current.add(ambientLight);
    rightSceneObjRef.current.add(ambientLight.clone());

    // Add directional lights from multiple angles
    const createDirectionalLight = (position: [number, number, number], intensity: number) => {
      const light = new THREE.DirectionalLight(0xffffff, intensity);
      light.position.set(...position);
      return light;
    };

    const lights = [
      createDirectionalLight([5, 5, 5], 0.8),
      createDirectionalLight([-5, 5, -5], 0.4),
      createDirectionalLight([0, -5, 0], 0.3)
    ];

    lights.forEach(light => {
      leftSceneObjRef.current?.add(light);
      rightSceneObjRef.current?.add(light.clone());
    });

    leftScene.appendChild(leftRendererRef.current.domElement);
    rightScene.appendChild(rightRendererRef.current.domElement);

    // Setup controls with better defaults
    leftControlsRef.current = new OrbitControls(leftCameraRef.current, leftRendererRef.current.domElement);
    rightControlsRef.current = new OrbitControls(rightCameraRef.current, rightRendererRef.current.domElement);
    
    // Configure controls with adjusted limits
    const configureControls = (controls: OrbitControls) => {
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 5;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI / 1.5;
    };

    configureControls(leftControlsRef.current);
    configureControls(rightControlsRef.current);

    // Add grid and axes with better visibility
    const gridHelper = new THREE.GridHelper(20, 20, 0x666666, 0xcccccc);
    const axesHelper = new THREE.AxesHelper(10);
    leftSceneObjRef.current.add(gridHelper);
    leftSceneObjRef.current.add(axesHelper);
    rightSceneObjRef.current.add(gridHelper.clone());
    rightSceneObjRef.current.add(axesHelper.clone());

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (leftControlsRef.current) leftControlsRef.current.update();
      if (rightControlsRef.current) rightControlsRef.current.update();
      
      if (leftRendererRef.current && leftSceneObjRef.current && leftCameraRef.current) {
        leftRendererRef.current.render(leftSceneObjRef.current, leftCameraRef.current);
      }
      
      if (rightRendererRef.current && rightSceneObjRef.current && rightCameraRef.current) {
        rightRendererRef.current.render(rightSceneObjRef.current, rightCameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      if (leftRendererRef.current) {
        leftScene.removeChild(leftRendererRef.current.domElement);
        leftRendererRef.current.dispose();
      }
      
      if (rightRendererRef.current) {
        rightScene.removeChild(rightRendererRef.current.domElement);
        rightRendererRef.current.dispose();
      }
    };
  }, [SCENE_WIDTH, SCENE_HEIGHT]);

  const createPoint = (point: Point3D, color: number): THREE.Object3D => {
    const geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color,
      shininess: 100,
      specular: 0x444444
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(point.x, point.y, point.z);
    
    // Add a subtle shadow effect
    const shadowGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const shadowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.2
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.position.set(point.x, point.y - 0.15, point.z);
    shadow.scale.set(1, 0.1, 1);
    
    const group = new THREE.Group();
    group.add(sphere);
    group.add(shadow);
    
    return group;
  };

  useEffect(() => {
    if (!leftSceneObjRef.current) return;

    // Clear existing points
    const pointObjects = leftSceneObjRef.current.children.filter(
      (child: THREE.Object3D): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
    );
    pointObjects.forEach((point: THREE.Mesh) => leftSceneObjRef.current?.remove(point));

    // Add new points
    points.forEach(point => {
      const sphere = createPoint(point, 0x2196f3);
      leftSceneObjRef.current?.add(sphere);
    });
  }, [points]);

  useEffect(() => {
    if (!rightSceneObjRef.current) return;

    // Clear existing points
    const pointObjects = rightSceneObjRef.current.children.filter(
      (child: THREE.Object3D): child is THREE.Mesh => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
    );
    pointObjects.forEach((point: THREE.Mesh) => rightSceneObjRef.current?.remove(point));

    // Add new points
    transformedPoints.forEach(point => {
      const sphere = createPoint(point, 0xe91e63);
      rightSceneObjRef.current?.add(sphere);
    });
  }, [transformedPoints]);

  // Add useEffect for initial transformed points
  useEffect(() => {
    if (initialTransformedPoints.length > 0) {
      setTransformedPoints(initialTransformedPoints);
    }
  }, [initialTransformedPoints]);

  const handleSceneClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disablePointAddition) return;
    if (!leftSceneRef.current || !leftCameraRef.current || !leftRendererRef.current) return;

    const rect = leftSceneRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / SCENE_WIDTH) * 2 - 1;
    const y = -((event.clientY - rect.top) / SCENE_HEIGHT) * 2 + 1;

    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, leftCameraRef.current);
    
    // Calculate the point where the ray intersects the XY plane (z = 0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    // Limit the point coordinates to stay within a reasonable range
    const clampValue = 5;
    const newPoint = {
      x: Math.max(-clampValue, Math.min(clampValue, intersectPoint.x)),
      y: Math.max(-clampValue, Math.min(clampValue, intersectPoint.y)),
      z: 0
    };

    setPoints([...points, newPoint]);
    
    setSnackbar({
      open: true,
      message: `Point added at (${newPoint.x.toFixed(2)}, ${newPoint.y.toFixed(2)}, 0)`,
      severity: 'info'
    });
  };

  const transformPoint = (point: Point3D): Point3D => {
    const { tx, ty, tz, rotationX, rotationY, rotationZ, scale } = params;
    
    // Create transformation matrix
    const matrix = new THREE.Matrix4();
    
    // Apply transformations in order: scale -> rotate -> translate
    matrix.makeScale(scale, scale, scale);
    
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeRotationX(rotationX * Math.PI / 180);
    matrix.multiply(rotMatrix);
    
    rotMatrix.makeRotationY(rotationY * Math.PI / 180);
    matrix.multiply(rotMatrix);
    
    rotMatrix.makeRotationZ(rotationZ * Math.PI / 180);
    matrix.multiply(rotMatrix);
    
    matrix.setPosition(tx, ty, tz);
    
    // Apply transformation
    const vector = new THREE.Vector3(point.x, point.y, point.z);
    vector.applyMatrix4(matrix);
    
    return { x: vector.x, y: vector.y, z: vector.z };
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
      tz: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
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
    <>
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
        3D Geometric Transformations
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
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                Original Points
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {disablePointAddition ? 
                  '(Drag to rotate view)' : 
                  '(Click to add points, drag to rotate view)'}
              </Typography>
            </Box>
            <Box 
              ref={leftSceneRef}
              onClick={handleSceneClick}
              sx={{ 
                width: SCENE_WIDTH,
                height: SCENE_HEIGHT,
                margin: '0 auto',
                cursor: disablePointAddition ? 'grab' : 'crosshair'
              }}
            />
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
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                Transformed Points
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (Drag to rotate view)
              </Typography>
            </Box>
            <Box 
              ref={rightSceneRef}
              sx={{ 
                width: SCENE_WIDTH,
                height: SCENE_HEIGHT,
                margin: '0 auto'
              }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              background: 'white',
              borderRadius: 2
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
                sx={{ minWidth: isMobile ? '100%' : 120 }}
              />
              <TextField
                label="Translation Y"
                type="number"
                value={params.ty}
                onChange={(e) => setParams({ ...params, ty: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 120 }}
              />
              <TextField
                label="Translation Z"
                type="number"
                value={params.tz}
                onChange={(e) => setParams({ ...params, tz: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 120 }}
              />
              <TextField
                label="Rotation X"
                type="number"
                value={params.rotationX}
                onChange={(e) => setParams({ ...params, rotationX: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 120 }}
              />
              <TextField
                label="Rotation Y"
                type="number"
                value={params.rotationY}
                onChange={(e) => setParams({ ...params, rotationY: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 120 }}
              />
              <TextField
                label="Rotation Z"
                type="number"
                value={params.rotationZ}
                onChange={(e) => setParams({ ...params, rotationZ: Number(e.target.value) })}
                variant="outlined"
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 120 }}
              />
              <TextField
                label="Scale"
                type="number"
                value={params.scale}
                onChange={(e) => setParams({ ...params, scale: Number(e.target.value) })}
                inputProps={{ step: 0.1 }}
                variant="outlined"
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 120 }}
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
                  sx={{ height: '40px', width: '40px' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
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
    </>
  );
};

export default Transform3D; 