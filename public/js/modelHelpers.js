import * as THREE from 'three';
import { scene } from './scene.js';


export const addedParts = {};
export const partInstances = {};

export function loadModel(loader, modelName) {
  return new Promise((resolve) => {
    loader.load(`/models/${modelName}.glb`, (gltf) => {
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      resolve(gltf.scene);
    });
  });
}

export function centerAndFitModel(model, camera, controls) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5;
    camera.position.set(0, size.y / 2, cameraZ);
    camera.lookAt(0, 0, 0);
    if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
    }
}


export function togglePart(part) {
  if (addedParts[part.id]) {
    scene.remove(addedParts[part.id]);
    delete addedParts[part.id];
  } else {
    const partClone = partInstances[part.id].clone();
    scene.add(partClone);
    addedParts[part.id] = partClone;
  }
}
export function resetParts() {
  addedParts.clear();
  console.log('All parts reset');
  // Yahan bhi 3D model ko reset karne ka code add karo agar zarurat ho
}