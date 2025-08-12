import * as THREE from 'three';

// Helper function: check if object is facing camera
export function isFacingCamera(object, camera) {
  const objectPosition = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const normal = new THREE.Vector3();

  object.getWorldPosition(objectPosition);
  camera.getWorldPosition(cameraPosition);

  // Object ka facing direction nikalna
  object.getWorldDirection(normal);

  // Camera se object ki direction vector
  const directionToCamera = cameraPosition.clone().sub(objectPosition).normalize();

  // Dot product se pata chalega kya object camera ki taraf hai
  return normal.dot(directionToCamera) > 0;
}