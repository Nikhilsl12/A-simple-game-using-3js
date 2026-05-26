import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class House extends THREE.Group {
    constructor() {
        super();
        this.model = null;
        this.boundingBox = new THREE.Box3();
    }

    async init() {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('/models/small_house.glb');
            this.model = gltf.scene;

            // Scale of 65
            this.model.scale.setScalar(65);

            // Rotate Math.PI / 2 around X to align with Z-up
            this.model.rotation.x = Math.PI / 2;

            // Random rotation around Y in multiples of Math.PI / 2
            this.model.rotation.y = (Math.floor(Math.random() * 4)) * (Math.PI / 2);

            // Ensure sitting exactly on ground level (Z=0)
            this.boundingBox.setFromObject(this.model);
            const center = new THREE.Vector3();
            this.boundingBox.getCenter(center);
            this.model.position.z = -this.boundingBox.min.z;

            this.add(this.model);

            // Update bounding box after positioning
            this.boundingBox.setFromObject(this);
        } catch (error) {
            console.error('Error loading house model:', error);
        }
    }

    checkCollision(position, threshold = 40) {
        // Simple radial collision check for houses as they are roughly square/circular from top
        // But spec says "Neither enemies nor the player should be able to pass through the houses"
        // And "Implement collision logic for: Houses and entities, Houses and the player"
        const houseXY = new THREE.Vector3(this.position.x, this.position.y, 0);
        const entityXY = new THREE.Vector3(position.x, position.y, 0);
        return houseXY.distanceTo(entityXY) < threshold;
    }
}
