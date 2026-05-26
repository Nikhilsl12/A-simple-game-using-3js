import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Tree extends THREE.Group {

    constructor() {
        super();
        this.model = null;
    }

    async init() {

        const loader = new GLTFLoader();

        try {

            const gltf = await loader.loadAsync('/models/Pine Trees.glb');

            this.model = gltf.scene;

            // Match house orientation
            this.model.rotation.x = Math.PI / 2;

            // IMPORTANT
            this.model.scale.setScalar(100);

            const box = new THREE.Box3().setFromObject(this.model);

            this.model.position.z = -box.min.z;

            this.add(this.model);

        } catch (error) {

            console.error('Error loading tree:', error);
        }
    }
    checkCollision(position, threshold = 45) {

        const treeXY =
            new THREE.Vector3(
                this.position.x,
                this.position.y,
                0
            );

        const entityXY =
            new THREE.Vector3(
                position.x,
                position.y,
                0
            );

        return treeXY.distanceTo(entityXY) < threshold;
    }
}