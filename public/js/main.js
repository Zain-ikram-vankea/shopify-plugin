import * as THREE from 'three';
import { camera, scene } from './scene.js';
import { addLighting } from './lighting.js';
import { controls, setupControls } from './controls.js';
import { loader } from './loaders.js';
import { loadModel, partInstances, centerAndFitModel } from './modelHelpers.js';
import { createUI } from './ui.js';
import { animate } from './animate.js';

let config;
let vanBase;

async function init() {
  config = await (await fetch('/data/parts.json')).json();

  // Lights
  addLighting();

  // Controls
  setupControls();


 const meshWorldPosition = new THREE.Vector3();
 const vectorToCamera = new THREE.Vector3();
 const normalMatrix = new THREE.Matrix3();
 const meshNormal = new THREE.Vector3();
 function isFacingCamera(mesh, normalDirection, camera) {
  if (!mesh) return false;
  mesh.getWorldPosition(meshWorldPosition);
  vectorToCamera.subVectors(camera.position, meshWorldPosition).normalize();
  normalMatrix.getNormalMatrix(mesh.matrixWorld);
  meshNormal.copy(normalDirection).applyMatrix3(normalMatrix).normalize();
  return meshNormal.dot(vectorToCamera) > 0.3;
}
const partsData = [
  { name: "driver_side", normal: new THREE.Vector3(1, 0, 0) },
  { name: "passenger_side", normal: new THREE.Vector3(-1, 0, 0) },
  { name: "roof", normal: new THREE.Vector3(0, 1, 0) },
  { name: "rear_door", normal: new THREE.Vector3(0, 0, -1) },
];

 loader.load('/models/van-model.glb', function (gltf) {
   vanBase = gltf.scene;

   scene.add(vanBase);
   centerAndFitModel(vanBase, camera, controls);

   function animate() {
    requestAnimationFrame(animate);

    if (vanBase) {
      partsData.forEach(({ name, normal }) => {
        const part = vanBase.getObjectByName(name);
        if (part) {
          // Agar showExterior false hai to hide karo jis part ka normal camera ki taraf ho
          part.visible = !isFacingCamera(part, normal, camera);
        }
      });
    }

  }
  animate();
 });


  // Preload parts
  await Promise.all(config.addableParts.map(async part => {
    partInstances[part.id] = await loadModel(loader, part.model);
  }));

  // Create UI
  createUI(config.addableParts);

  // Remove loading screen
  document.getElementById('loading')?.remove();

  animate();
}

document.addEventListener('DOMContentLoaded', init);
