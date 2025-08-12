import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { camera, renderer } from './scene.js';

export let controls;

export function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
}
