import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Stone extends THREE.Group {

    constructor() {
        super();
        this.model = null;
    }

    async init() {

        const loader = new GLTFLoader();

        try {

            const gltf = await loader.loadAsync('/models/Rocks.glb');

            this.model = gltf.scene;

            this.model.rotation.x = Math.PI / 2;

            this.model.scale.setScalar(40);

            const box = new THREE.Box3().setFromObject(this.model);

            this.model.position.z = -box.min.z;

            this.add(this.model);

        } catch (error) {

            console.error('Error loading stone:', error);
        }
    }
}