import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.174.0/three.module.min.js';

const cage1 = document.getElementById("cage1");
const cage2 = document.getElementById("cage2");
const cage3 = document.getElementById("cage3");

export const cageScales = [1, 1, 1];

// Common materials and geometries
const softWhiteWireframe = new THREE.LineBasicMaterial({ 
  color: 0xf0f0f0, 
  transparent: true,
  opacity: 0.9 
});

const blueMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x4080ff,
  transparent: false,
  opacity: 1.0
});

const centerSphereGeometry = new THREE.SphereGeometry(5, 16, 16);

//#region Cage1 - Octahedron
const scene1 = new THREE.Scene();
let camera1 = new THREE.PerspectiveCamera(75, 1, 1, 1000);
camera1.position.set(0, 0, 125);

let renderer1 = new THREE.WebGLRenderer({ alpha: true });
renderer1.setSize(cage1.clientWidth, cage1.clientHeight);
cage1.appendChild(renderer1.domElement);

// Create octahedron
let spirit = new THREE.Group();
const octahedronGeometry = new THREE.OctahedronGeometry(45, 0);
const octahedronEdges = new THREE.EdgesGeometry(octahedronGeometry);
const octahedronLines = new THREE.LineSegments(octahedronEdges, softWhiteWireframe);
spirit.add(octahedronLines);

// Add inner octahedron for depth
const innerOctahedronGeometry = new THREE.OctahedronGeometry(30, 0);
const innerOctahedronEdges = new THREE.EdgesGeometry(innerOctahedronGeometry);
const innerOctahedronLines = new THREE.LineSegments(innerOctahedronEdges, softWhiteWireframe);
spirit.add(innerOctahedronLines);

// Blue center sphere
const centerSphere1 = new THREE.Mesh(centerSphereGeometry, blueMaterial);
scene1.add(centerSphere1);
scene1.add(spirit);

function updateSpirit(deltaTime) {
  // Rotate the octahedron
  spirit.rotation.x += 0.02 * deltaTime * cageScales[0];
  spirit.rotation.y += 0.03 * deltaTime * cageScales[0];
  
  // Pulse the inner octahedron
  const pulseAmount = Math.sin(Date.now() * 0.001) * 0.1 + 0.9;
  innerOctahedronLines.scale.set(pulseAmount, pulseAmount, pulseAmount);
}
//#endregion

//#region Cage2 - Cube with extruded faces
const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(75, 1, 1, 1000);
camera2.position.set(0, 0, 125);

let renderer2 = new THREE.WebGLRenderer({ alpha: true });
renderer2.setSize(cage2.clientWidth, cage2.clientHeight);
cage2.appendChild(renderer2.domElement);

// Create geometric structure
const geometricStructure = new THREE.Group();

// Create a cube frame
const cubeSize = 40;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
const cubeLines = new THREE.LineSegments(cubeEdges, softWhiteWireframe);
geometricStructure.add(cubeLines);

// Create extruded faces (triangular prisms on each face)
const createPrism = (x, y, z, dir) => {
  // Create a triangular prism extending from the cube face
  const triangleShape = new THREE.Shape();
  triangleShape.moveTo(-10, -10);
  triangleShape.lineTo(10, -10);
  triangleShape.lineTo(0, 10);
  triangleShape.lineTo(-10, -10);
  
  const extrudeSettings = {
    steps: 1,
    depth: 15,
    bevelEnabled: false
  };
  
  const prismGeometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
  const prismEdges = new THREE.EdgesGeometry(prismGeometry);
  const prismLines = new THREE.LineSegments(prismEdges, softWhiteWireframe);
  
  // Position and rotate based on face direction
  prismLines.position.set(x, y, z);
  
  if (dir === 'x') {
    prismLines.rotation.y = Math.PI / 2;
  } else if (dir === 'y') {
    prismLines.rotation.x = Math.PI / 2;
  }
  
  return prismLines;
};

// Add prisms to each face of the cube
const halfSize = cubeSize / 2;
geometricStructure.add(createPrism(0, 0, halfSize, 'z'));
geometricStructure.add(createPrism(0, 0, -halfSize, 'z'));
geometricStructure.add(createPrism(halfSize, 0, 0, 'x'));
geometricStructure.add(createPrism(-halfSize, 0, 0, 'x'));
geometricStructure.add(createPrism(0, halfSize, 0, 'y'));
geometricStructure.add(createPrism(0, -halfSize, 0, 'y'));

// Blue center sphere
const centerSphere2 = new THREE.Mesh(centerSphereGeometry, blueMaterial);
geometricStructure.add(centerSphere2);

scene2.add(geometricStructure);

function updateGeometricStructure(deltaTime) {
  // Rotate the structure
  geometricStructure.rotation.x += 0.015 * deltaTime * cageScales[1];
  geometricStructure.rotation.y += 0.02 * deltaTime * cageScales[1];
}
//#endregion

//#region Cage3 - Dodecahedron with dual structure
const scene3 = new THREE.Scene();
const camera3 = new THREE.PerspectiveCamera(75, 1, 1, 1000);
camera3.position.set(0, 0, 125);

let renderer3 = new THREE.WebGLRenderer({ alpha: true });
renderer3.setSize(cage3.clientWidth, cage3.clientHeight);
cage3.appendChild(renderer3.domElement);

// Create dual polyhedra structure
const dualStructure = new THREE.Group();

// Outer dodecahedron
const dodecahedronGeometry = new THREE.DodecahedronGeometry(45, 0);
const dodecahedronEdges = new THREE.EdgesGeometry(dodecahedronGeometry);
const dodecahedronLines = new THREE.LineSegments(dodecahedronEdges, softWhiteWireframe);
dualStructure.add(dodecahedronLines);

// Inner icosahedron (dual of dodecahedron)
const icosahedronGeometry = new THREE.IcosahedronGeometry(30, 0);
const icosahedronEdges = new THREE.EdgesGeometry(icosahedronGeometry);
const icosahedronLines = new THREE.LineSegments(icosahedronEdges, softWhiteWireframe);
dualStructure.add(icosahedronLines);

// Blue center sphere
const centerSphere3 = new THREE.Mesh(centerSphereGeometry, blueMaterial);
dualStructure.add(centerSphere3);

scene3.add(dualStructure);

// Floating vertices around the structure
const vertexPoints = new THREE.Group();
const smallSphereGeometry = new THREE.SphereGeometry(1.5, 8, 8);
const smallSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });

// Add small spheres at each vertex of the dodecahedron
const positions = dodecahedronGeometry.attributes.position;
const vertexSet = new Set(); // To store unique vertices

for (let i = 0; i < positions.count; i++) {
  const vertex = new THREE.Vector3();
  vertex.fromBufferAttribute(positions, i);
  
  // Create a unique key for this vertex position
  const key = `${Math.round(vertex.x)},${Math.round(vertex.y)},${Math.round(vertex.z)}`;
  
  if (!vertexSet.has(key)) {
    vertexSet.add(key);
    const sphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    sphere.position.copy(vertex);
    vertexPoints.add(sphere);
  }
}

dualStructure.add(vertexPoints);

function updateDualStructure(deltaTime) {
  // Counter-rotating the polyhedra
  dodecahedronLines.rotation.y += 0.01 * deltaTime * cageScales[2];
  dodecahedronLines.rotation.x += 0.005 * deltaTime * cageScales[2];
  
  icosahedronLines.rotation.y -= 0.01 * deltaTime * cageScales[2];
  icosahedronLines.rotation.x -= 0.005 * deltaTime * cageScales[2];
  
  // Keep vertex points stationary relative to outer dodecahedron
  vertexPoints.rotation.copy(dodecahedronLines.rotation);
}
//#endregion

//#region Cage
const scene = new THREE.Scene();
const cage = document.getElementById("cage");

let camera = new THREE.PerspectiveCamera(75, 1, 1, 1000);
camera.position.set(0, 0, 125);

let renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(cage.clientWidth, cage.clientHeight);
cage.appendChild(renderer.domElement);
//#endregion

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta() * 10;
  
  updateSpirit(deltaTime);
  updateGeometricStructure(deltaTime);
  updateDualStructure(deltaTime);
  
  renderer1.render(scene1, camera1);
  renderer2.render(scene2, camera2);
  renderer3.render(scene3, camera3);
  renderer.render(scene, camera);
}

animate();

function onWindowResize() {
  renderer.setSize(cage.clientWidth, cage.clientHeight);
  renderer1.setSize(cage1.clientWidth, cage1.clientHeight);
  renderer2.setSize(cage2.clientWidth, cage2.clientHeight);
  renderer3.setSize(cage3.clientWidth, cage3.clientHeight);
}

window.addEventListener('resize', onWindowResize);

// Combined scene
const soul = new THREE.Group();
scene.add(soul);

const axisX = new THREE.Vector3(1, 0, 0);
const axisY = new THREE.Vector3(0, 1, 0);

export function rotate(dX, dY) {
  soul.rotateOnWorldAxis(axisY, 5 * dY);
  soul.rotateOnWorldAxis(axisX, 5 * dX);
}

export function collapse() {
  cage.style.zIndex = 10;
  soul.add(spirit);
  soul.add(geometricStructure);
  soul.add(dualStructure);
}
