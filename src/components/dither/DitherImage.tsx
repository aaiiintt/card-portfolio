import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uThreshold;
  uniform float uContrast;
  uniform float uGrain;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform int uDitherSize;
  varying vec2 vUv;
  
  // Bayer 4x4 matrix
  float bayer4x4(vec2 coord) {
    int x = int(mod(coord.x, 4.0));
    int y = int(mod(coord.y, 4.0));
    int index = x + y * 4;
    
    float matrix[16];
    matrix[0] = 0.0; matrix[1] = 8.0; matrix[2] = 2.0; matrix[3] = 10.0;
    matrix[4] = 12.0; matrix[5] = 4.0; matrix[6] = 14.0; matrix[7] = 6.0;
    matrix[8] = 3.0; matrix[9] = 11.0; matrix[10] = 1.0; matrix[11] = 9.0;
    matrix[12] = 15.0; matrix[13] = 7.0; matrix[14] = 13.0; matrix[15] = 5.0;
    
    return matrix[index] / 16.0;
  }
  
  // Bayer 8x8 matrix
  float bayer8x8(vec2 coord) {
    int x = int(mod(coord.x, 8.0));
    int y = int(mod(coord.y, 8.0));
    int index = x + y * 8;
    
    if (index == 0) return 0.0;
    if (index == 1) return 32.0;
    if (index == 2) return 8.0;
    if (index == 3) return 40.0;
    if (index == 4) return 2.0;
    if (index == 5) return 34.0;
    if (index == 6) return 10.0;
    if (index == 7) return 42.0;
    if (index == 8) return 48.0;
    if (index == 9) return 16.0;
    if (index == 10) return 56.0;
    if (index == 11) return 24.0;
    if (index == 12) return 50.0;
    if (index == 13) return 18.0;
    if (index == 14) return 58.0;
    if (index == 15) return 26.0;
    if (index == 16) return 12.0;
    if (index == 17) return 44.0;
    if (index == 18) return 4.0;
    if (index == 19) return 36.0;
    if (index == 20) return 14.0;
    if (index == 21) return 46.0;
    if (index == 22) return 6.0;
    if (index == 23) return 38.0;
    if (index == 24) return 60.0;
    if (index == 25) return 28.0;
    if (index == 26) return 52.0;
    if (index == 27) return 20.0;
    if (index == 28) return 62.0;
    if (index == 29) return 30.0;
    if (index == 30) return 54.0;
    if (index == 31) return 22.0;
    if (index == 32) return 3.0;
    if (index == 33) return 35.0;
    if (index == 34) return 11.0;
    if (index == 35) return 43.0;
    if (index == 36) return 1.0;
    if (index == 37) return 33.0;
    if (index == 38) return 9.0;
    if (index == 39) return 41.0;
    if (index == 40) return 51.0;
    if (index == 41) return 19.0;
    if (index == 42) return 59.0;
    if (index == 43) return 27.0;
    if (index == 44) return 49.0;
    if (index == 45) return 17.0;
    if (index == 46) return 57.0;
    if (index == 47) return 25.0;
    if (index == 48) return 15.0;
    if (index == 49) return 47.0;
    if (index == 50) return 7.0;
    if (index == 51) return 39.0;
    if (index == 52) return 13.0;
    if (index == 53) return 45.0;
    if (index == 54) return 5.0;
    if (index == 55) return 37.0;
    if (index == 56) return 63.0;
    if (index == 57) return 31.0;
    if (index == 58) return 55.0;
    if (index == 59) return 23.0;
    if (index == 60) return 61.0;
    if (index == 61) return 29.0;
    if (index == 62) return 53.0;
    return 21.0;
  }
  
  // Simplex noise for grain
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Sample texture
    vec4 color = texture2D(uTexture, uv);
    
    // Convert to grayscale
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Apply contrast
    gray = (gray - 0.5) * uContrast + 0.5;
    gray = clamp(gray, 0.0, 1.0);
    
    // Get screen coordinates for dithering
    vec2 screenCoord = gl_FragCoord.xy;
    
    // Apply dithering based on size
    float ditherValue;
    if (uDitherSize == 4) {
      ditherValue = bayer4x4(screenCoord);
    } else {
      ditherValue = bayer8x8(screenCoord);
    }
    
    // Apply threshold with dithering
    float threshold = uThreshold + (ditherValue - 0.5) * 0.5;
    float dithered = step(threshold, gray);
    
    // Add grain noise
    float grain = snoise(screenCoord * 0.5 + uTime * 0.1) * uGrain;
    dithered = clamp(dithered + grain, 0.0, 1.0);
    
    // Final output - monochrome with slight warmth
    vec3 finalColor = vec3(dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface DitherPlaneProps {
  imageUrl: string;
  threshold?: number;
  contrast?: number;
  grain?: number;
  ditherSize?: 4 | 8;
}

function DitherPlane({ imageUrl, threshold = 0.5, contrast = 1.2, grain = 0.05, ditherSize = 8 }: DitherPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.minFilter = THREE.NearestFilter;
      loadedTexture.magFilter = THREE.NearestFilter;
      setTexture(loadedTexture);
    });
  }, [imageUrl]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!texture) return null;

  // Get image dimensions with proper typing
  const image = texture.image as HTMLImageElement;
  const imageWidth = image?.width || 1;
  const imageHeight = image?.height || 1;

  // Calculate aspect ratio to maintain image proportions
  const imageAspect = imageWidth / imageHeight;
  const viewportAspect = viewport.width / viewport.height;
  
  let planeWidth = viewport.width;
  let planeHeight = viewport.height;
  
  if (imageAspect > viewportAspect) {
    planeHeight = planeWidth / imageAspect;
  } else {
    planeWidth = planeHeight * imageAspect;
  }

  const uniforms = {
    uTexture: { value: texture },
    uTime: { value: 0 },
    uThreshold: { value: threshold },
    uContrast: { value: contrast },
    uGrain: { value: grain },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uImageSize: { value: new THREE.Vector2(imageWidth, imageHeight) },
    uDitherSize: { value: ditherSize },
  };

  return (
    <mesh ref={meshRef} scale={[planeWidth, planeHeight, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface DitherImageProps {
  src: string;
  alt?: string;
  className?: string;
  threshold?: number;
  contrast?: number;
  grain?: number;
  ditherSize?: 4 | 8;
  height?: string;
}

export function DitherImage({ 
  src, 
  alt = '', 
  className = '', 
  threshold = 0.5,
  contrast = 1.2,
  grain = 0.05,
  ditherSize = 8,
  height = '400px'
}: DitherImageProps) {
  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ height }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        gl={{ 
          antialias: false,
          powerPreference: 'high-performance',
        }}
        className="dither-canvas"
      >
        <DitherPlane 
          imageUrl={src}
          threshold={threshold}
          contrast={contrast}
          grain={grain}
          ditherSize={ditherSize}
        />
      </Canvas>
      {alt && (
        <span className="sr-only">{alt}</span>
      )}
    </div>
  );
}

export default DitherImage;
