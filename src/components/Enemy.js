import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { COLLISION_THRESHOLD, INITIAL_ENEMY_SPEED } from '../constants.js';

export default class Enemy extends THREE.Group {
    constructor() {
        super();
        this.model = null;
    }

    async init() {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('/models/Bat.glb');
            const model = gltf.scene;
            model.scale.setScalar(8);
            model.rotation.x = Math.PI / 2;

            const box = new THREE.Box3().setFromObject(model);
            model.position.z = -box.min.z;

            this.add(model);
            this.model = model;
        } catch (error) {
            console.error('Error loading enemy model:', error);
        }
    }

    update(playerPosition, enemies = [], isGameOver = false, speed = INITIAL_ENEMY_SPEED, houses = []) {
        if (!this.model || isGameOver) return;

        // Direction to player in XY plane
        const direction = new THREE.Vector3().subVectors(playerPosition, this.position);
        direction.z = 0;
        
        if (direction.lengthSq() > 0.1) {
            direction.normalize();

            // Intended next position
            const nextPos = this.position.clone().addScaledVector(direction, speed);

            // Check collision with other enemies
            const collidedWithEnemy = enemies.some(other => {
                if (other === this) return false;
                return nextPos.distanceTo(other.position) < COLLISION_THRESHOLD;
            });

            if (collidedWithEnemy) {
                return;
            }

            // Check collision with houses
            const collidedWithHouse = houses.some(house => house.checkCollision(nextPos));
            if (collidedWithHouse) {
                return;
            }

            // Move
            this.position.copy(nextPos);

            // Rotate to face player
            const angle = Math.atan2(direction.y, direction.x);
            this.model.rotation.y = angle + Math.PI / 2;
        }
    }
}
