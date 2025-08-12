import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const container = document.getElementById('viewer');
container.innerHTML = ''; // Remove any existing canvas before adding new one
container.appendChild(renderer.domElement);
renderer.setSize(container.clientWidth, container.clientHeight);

// If camera aspect ratio depends on canvas size, update that too:
camera.aspect = container.clientWidth / container.clientHeight;
camera.updateProjectionMatrix();
