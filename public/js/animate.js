import { renderer, scene, camera } from './scene.js';
import { controls } from './controls.js';

export function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  renderer.render(scene, camera);
}
