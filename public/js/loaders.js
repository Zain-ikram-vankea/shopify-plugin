import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/libs/draco/');
dracoLoader.setDecoderConfig({ type: 'js' });

export const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
