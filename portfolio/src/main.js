import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import kringImg from '/img/kring.jpg';
import { AudioListener, Audio, AudioLoader } from 'three';

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 40);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222);

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

scene.add(pointLight, ambientLight);

//Audio

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load('/portfolio/audio/The Spinning Loaf Cat.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  sound.play();
});


// Helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);

scene.add(lightHelper, gridHelper);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}
Array(200).fill().forEach(addStar);

// Texture Loader
const textureLoader = new THREE.TextureLoader();
textureLoader.load(kringImg, (texture) => {
  // Geometry
  const geometry = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    // Base (square)
    -5, 0, -5, // 0 - Bottom left
     5, 0, -5, // 1 - Bottom right
     5, 0,  5, // 2 - Top right
    -5, 0,  5, // 3 - Top left
    // Apex (top)
     0, 10, 0, // 4 - Apex
  ]);

  const indices = [
    // Base (two triangles)
    0, 1, 2,
    0, 2, 3,
    // Sides
    0, 1, 4,
    1, 2, 4,
    2, 3, 4,
    3, 0, 4,
  ];

  const uvs = new Float32Array([
    // Base UVs
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    // Apex UV
    0.5, 0.5,
  ]);

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });

  const pyramid = new THREE.Mesh(geometry, material);
  pyramid.rotation.x = Math.PI;
  pyramid.position.set(0, 5, 0);
  scene.add(pyramid);

  // Start animation
  function animate() {
    requestAnimationFrame(animate);

    pyramid.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
