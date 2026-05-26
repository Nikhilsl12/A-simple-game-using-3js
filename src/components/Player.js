import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { COLLISION_THRESHOLD, ATTACK_RADIUS, ATTACK_COOLDOWN, INITIAL_PLAYER_SPEED, INVINCIBILITY_DURATION } from '../constants.js';

const FLOAT_HEIGHT = 2;
const JUMP_DISTANCE = 40;

export default class Player extends THREE.Group {
    constructor() {
        super();
        this.model = null;
        this.keys = {};
        this.inputQueue = [];
        this.moveState = {
            direction: new THREE.Vector3(),
            progress: 0,
            isMoving: false,
            startPos: new THREE.Vector3(),
            targetPos: new THREE.Vector3()
        };
        this.lastAttackTime = 0;
        this.lives = 3;

        this.isInvincible = false;

        this.lastHitTime = 0;
        this.isDead = false;
    }

    async init() {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('/models/wizard.glb');
            const model = gltf.scene;

            // Scale the model using a scalar of 20
            model.scale.setScalar(0.02);

            // Add model rotation: model.rotation.x = Math.PI / 2;
            model.rotation.x = Math.PI / 2;

            // Calculate the Z-offset based on the model height to ensure Tode sits flush on the ground
            const box = new THREE.Box3().setFromObject(model);
            model.position.z = -box.min.z;

            this.modelBaseZ =model.position.z ;
            this.add(model);
            this.model = model;
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    update(enemies = [], speed = INITIAL_PLAYER_SPEED, houses = [], trees = []) {
        if (this.isDead) return;

        // Handle invincibility
        const now = Date.now();
        if (this.isInvincible && now - this.lastHitTime > INVINCIBILITY_DURATION) {
            this.isInvincible = false;
            if (this.model) this.model.visible = true;
        }

        // Flashing effect when invincible
        if (this.isInvincible && this.model) {
            this.model.visible = Math.floor(now / 100) % 2 === 0;
        }

        // Process input queue if not currently moving
        if (!this.moveState.isMoving && this.inputQueue.length > 0) {
            const direction = this.inputQueue.shift();
            
        //     // Calculate intended next position
        //     const targetPos = this.position.clone().addScaledVector(direction, JUMP_DISTANCE);
        //
        //     // Check collision with houses
        //     const isHouseCollision = houses.some(house => house.checkCollision(targetPos));
        //
        //     if (!isHouseCollision) {
        //         this.startMove(direction);
        //     }
            const targetPos = this.position.clone().addScaledVector(direction, JUMP_DISTANCE);

            // Boundary check
            const MAP_BOUNDARY = 9800;

            const withinBounds =
                targetPos.x >= -MAP_BOUNDARY &&
                targetPos.x <= MAP_BOUNDARY &&
                targetPos.y >= -MAP_BOUNDARY &&
                targetPos.y <= MAP_BOUNDARY;

            // Check collision with houses
            const isHouseCollision =
                houses.some(house =>
                    house.checkCollision(targetPos)
                );

            const isTreeCollision =
                trees.some(tree =>
                    tree.checkCollision(targetPos)
                );

            if (!isHouseCollision &&
                !isTreeCollision &&
                withinBounds) {
                this.startMove(direction);
            }
        }


        // If still not moving, check current keys to enqueue next move
        if (!this.moveState.isMoving && this.inputQueue.length === 0) {
            const direction = this.getDirectionFromKeys();
            if (direction) {
                this.inputQueue.push(direction);
            }
        }

        if (this.moveState.isMoving) {
            this.moveState.progress += speed;
            if (this.moveState.progress >= 1) {
                this.moveState.progress = 1;
                this.moveState.isMoving = false;
            }

            // Update position
            this.position.lerpVectors(this.moveState.startPos, this.moveState.targetPos, this.moveState.progress);
        }

        // Floating animation
        if (this.model && !this.isDead) {
            this.model.position.z = this.modelBaseZ + FLOAT_HEIGHT + Math.sin(Date.now() * 0.005) * 2;
            this.model.rotation.z = 0;
        }
    }

    getDirectionFromKeys() {
        // Camera is isometric at (300, -300, 300) looking at origin.
        // Screen "up" maps to world -x+y, "down" to +x-y, "left" to -x-y, "right" to +x+y.
        const direction = new THREE.Vector3();
        let hasInput = false;

        // Support Arrow keys, WASD, and ASDF
        // Up: ArrowUp, W, F
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys['f'] || this.keys['F']) {
            direction.x -= 1;
            direction.y += 1;
            hasInput = true;
        }
        // Down: ArrowDown, S
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            direction.x += 1;
            direction.y -= 1;
            hasInput = true;
        }
        // Left: ArrowLeft, A
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            direction.x -= 1;
            direction.y -= 1;
            hasInput = true;
        }
        // Right: ArrowRight, D
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            direction.x += 1;
            direction.y += 1;
            hasInput = true;
        }

        if (hasInput) {
            return direction.normalize();
        }
        return null;
    }

    startMove(direction) {
        this.moveState.isMoving = true;
        this.moveState.progress = 0;
        this.moveState.direction.copy(direction);
        this.moveState.startPos.copy(this.position);
        this.moveState.targetPos.copy(this.position).addScaledVector(direction, JUMP_DISTANCE);

        // Rotate the model to face the direction
        if (this.model) {
            const angle = Math.atan2(direction.y, direction.x);
            this.model.rotation.y = angle + Math.PI / 2;
        }
    }

    reset() {
        this.lives = 3;
        this.lastHitTime = 0;
        this.isInvincible = false;
        this.position.set(0, 0, 0);
        this.moveState.isMoving = false;
        this.moveState.progress = 0;
        this.isDead = false;
        this.visible = true;
        if (this.model) this.model.visible = true;
        this.keys = {};
        this.inputQueue = [];
        if (this.model) {
            this.model.position.z = this.modelBaseZ;
        }
    }

    takeDamage() {
        if (this.isDead || this.isInvincible) return false;

        this.lives--;
        this.lastHitTime = Date.now();
        this.isInvincible = true;

        if (this.lives <= 0) {
            this.lives = 0;
            this.isDead = true;
            return true; // Should trigger game over
        }
        return false;
    }

    enqueueMove(direction) {
        this.inputQueue.push(direction);
    }

    attack(scene, enemies, cooldown = ATTACK_COOLDOWN, radius = ATTACK_RADIUS) {
        const now = Date.now();
        if (now - this.lastAttackTime < cooldown) return 0;
        this.lastAttackTime = now;

        // // Visual feedback
        // const geometry = new THREE.CircleGeometry(radius, 32);
        // const material = new THREE.MeshBasicMaterial({
        //     color: 0xffff00,
        //     transparent: true,
        //     opacity: 0.5,
        //     side: THREE.DoubleSide
        // });
        // const circle = new THREE.Mesh(geometry, material);
        //
        // // Position at ground plane with small Z offset
        // circle.position.set(this.position.x, this.position.y, 0.25);
        // scene.add(circle);
        //
        // // Disappear briefly
        // setTimeout(() => {
        //     scene.remove(circle);
        //     geometry.dispose();
        //     material.dispose();
        // }, 200);

        // Magical pulse effect
        const geometry =
            new THREE.RingGeometry(
                radius * 0.6,
                radius,
                64
            );

        const material =
            new THREE.MeshBasicMaterial({

                color: 0x66ccff,

                transparent: true,

                opacity: 0.8,

                side: THREE.DoubleSide,

                blending: THREE.AdditiveBlending
            });

        const pulse =
            new THREE.Mesh(
                geometry,
                material
            );

        pulse.position.set(
            this.position.x,
            this.position.y,
            1
        );

        scene.add(pulse);

// Animate fade
        const startTime = Date.now();

        const animatePulse = () => {

            const elapsed =
                Date.now() - startTime;

            const progress =
                elapsed / 250;

            pulse.scale.setScalar(
                1 + progress * 1.5
            );

            material.opacity =
                0.8 * (1 - progress);

            if (progress < 1) {

                requestAnimationFrame(
                    animatePulse
                );

            } else {

                scene.remove(pulse);

                geometry.dispose();

                material.dispose();
            }
        };

        animatePulse();

        // Combat logic
        // Detect collisions between the attack area and enemies.
        // Use the enemy list to check for proximity.
        let kills = 0;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const distance = this.position.distanceTo(enemy.position);
            if (distance < radius) {
                scene.remove(enemy);
                enemies.splice(i, 1);
                kills++;
            }
        }
        return kills;
    }
}
