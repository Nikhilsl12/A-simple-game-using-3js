// import * as THREE from 'three';
// import './style.css';
// import Player from './components/Player.js';
// import Enemy from './components/Enemy.js';
// import Map from './components/Map.js';
// import House from './components/House.js';
// import {
//     SCORE_PER_SECOND,
//     SCORE_PER_KILL,
//     COLLISION_THRESHOLD,
//     INITIAL_ENEMY_SPAWN_DELAY,
//     MIN_ENEMY_SPAWN_DELAY,
//     INITIAL_ENEMY_SPEED,
//     INITIAL_PLAYER_SPEED,
//     DIFFICULTY_GROWTH_FACTOR,
//     ATTACK_COOLDOWN,
//     ATTACK_RADIUS
// } from './constants.js';
// import { createCamera } from './components/Camera.js';
// import { createRenderer } from './components/Renderer.js';
//
// // Create a new THREE.Scene()
// const scene = new THREE.Scene();
//
// const enemies = [];
// const houses = [];
// const MAP_SIZE = 400;
// const SPAWN_LOCATIONS = [
//     new THREE.Vector3(MAP_SIZE, MAP_SIZE, 0),
//     new THREE.Vector3(-MAP_SIZE, MAP_SIZE, 0),
//     new THREE.Vector3(MAP_SIZE, -MAP_SIZE, 0),
//     new THREE.Vector3(-MAP_SIZE, -MAP_SIZE, 0)
// ];
//
// // Lighting
// // Add an AmbientLight to the scene with an intensity of 1.5 to provide base illumination.
// const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
// scene.add(ambientLight);
//
// // Add a DirectionalLight to the scene to create shadows and depth.
// // Set the intensity to 1.5 and positioned to (-100, -100, 200).
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
// directionalLight.position.set(-100, -100, 200);
// scene.add(directionalLight);
//
// let score = 0;
// let isGameOver = false;
// let spawnInterval;
// let spawnTimer = 0;
// const clock = new THREE.Clock();
// const scoreElement = document.querySelector('.score');
// const gameOverElement = document.querySelector('.game-over');
//
// // Initialize components
// const player = new Player();
// const map = new Map();
// const camera = createCamera();
// const renderer = createRenderer();
//
// // Setup the scene
// const init = async () => {
//     // Load the player model and add it to the scene
//     await player.init();
//     scene.add(player);
//
//     // Add the map
//     scene.add(map);
//
//     // Add houses
//     for (let i = 0; i < 3; i++) {
//         const house = new House();
//         await house.init();
//         // Random position between -MAP_SIZE and MAP_SIZE
//         const x = (Math.random() - 0.5) * MAP_SIZE * 2;
//         const y = (Math.random() - 0.5) * MAP_SIZE * 2;
//         house.position.set(x, y, 0);
//         scene.add(house);
//         houses.push(house);
//     }
//
//     // Add the camera as a child of the player group
//     player.add(camera);
//
//     // Position the camera to look at the player properly
//     camera.position.set(300, -300, 300);
//     camera.up.set(0, 0, 1);
//     camera.lookAt(0, 0, 0);
//
//     // Add a GridHelper to make movement visible
//     const gridHelper = new THREE.GridHelper(2000, 50);
//     gridHelper.rotation.x = Math.PI / 2;
//     scene.add(gridHelper);
//
//     // Render loop
//     renderer.setAnimationLoop(() => {
//         const delta = clock.getDelta();
//
//         // Calculate difficulty factor
//         const difficultyFactor = score * DIFFICULTY_GROWTH_FACTOR;
//
//         // Linear scaling of parameters
//         const currentEnemySpeed = INITIAL_ENEMY_SPEED * (1 + difficultyFactor * 1.5); // Enemy scales faster
//         const currentPlayerSpeed = INITIAL_PLAYER_SPEED * (1 + difficultyFactor);
//         const currentSpawnDelay = Math.max(MIN_ENEMY_SPAWN_DELAY, INITIAL_ENEMY_SPAWN_DELAY / (1 + difficultyFactor * 2));
//         const currentAttackCooldown = Math.max(200, ATTACK_COOLDOWN / (1 + difficultyFactor));
//         const currentAttackRadius = ATTACK_RADIUS * (1 + difficultyFactor * 0.5);
//
//         if (!isGameOver) {
//             score += delta * SCORE_PER_SECOND;
//             player.update(enemies, currentPlayerSpeed, houses);
//
//             // Spawn logic with accumulated timer
//             spawnTimer += delta * 1000; // convert to ms
//             if (spawnTimer >= currentSpawnDelay) {
//                 spawnTimer = 0;
//                 spawnEnemy();
//             }
//
//             // Check collision with enemies (guard prevents repeated calls)
//             if (!isGameOver) {
//                 for (const enemy of enemies) {
//                     const playerXY = new THREE.Vector3(player.position.x, player.position.y, 0);
//                     const enemyXY = new THREE.Vector3(enemy.position.x, enemy.position.y, 0);
//                     if (playerXY.distanceTo(enemyXY) < COLLISION_THRESHOLD) {
//                         triggerGameOver();
//                         break;
//                     }
//                 }
//             }
//         }
//
//         enemies.forEach(enemy => enemy.update(player.position, enemies, isGameOver, currentEnemySpeed, houses));
//         renderer.render(scene, camera);
//
//         if (scoreElement) {
//             scoreElement.textContent = Math.floor(score) || 0;
//         }
//     });
// };
//
// const spawnEnemy = async () => {
//     if (isGameOver) return;
//     const enemy = new Enemy();
//     enemy.position.set(1000, 1000, 0);
//     await enemy.init();
//     const location = SPAWN_LOCATIONS[Math.floor(Math.random() * SPAWN_LOCATIONS.length)];
//     enemy.position.copy(location);
//     scene.add(enemy);
//     enemies.push(enemy);
// };
//
// const startSpawning = () => {
//     // We are now using spawnTimer in the animation loop as per spec
//     spawnTimer = 0;
// };
//
// const triggerGameOver = () => {
//     isGameOver = true;
//     player.isDead = true;
//     player.visible = false;
//     if (gameOverElement) {
//         gameOverElement.classList.remove('hidden');
//     }
// };
//
// const resetGame = () => {
//     isGameOver = false;
//     score = 0;
//     if (scoreElement) scoreElement.textContent = '0';
//     spawnTimer = 0;
//     player.reset();
//
//     // Clear enemies
//     enemies.forEach(enemy => scene.remove(enemy));
//     enemies.length = 0;
//
//     if (gameOverElement) {
//         gameOverElement.classList.add('hidden');
//     }
//
//     startSpawning();
//
//     // Spawn initial enemies at corners
//     SPAWN_LOCATIONS.forEach(async (location) => {
//         const enemy = new Enemy();
//         enemy.position.copy(location);
//         await enemy.init();
//         scene.add(enemy);
//         enemies.push(enemy);
//     });
// };
//
// // Input handling
// window.addEventListener('keydown', (event) => {
//     if (isGameOver) {
//         if (event.code === 'Space') {
//             resetGame();
//         }
//         return;
//     }
//
//     player.keys[event.key] = true;
//
//     if (event.code === 'Space') {
//         const difficultyFactor = score * DIFFICULTY_GROWTH_FACTOR;
//         const currentAttackCooldown = Math.max(200, ATTACK_COOLDOWN / (1 + difficultyFactor));
//         const currentAttackRadius = ATTACK_RADIUS * (1 + difficultyFactor * 0.5);
//
//         const kills = player.attack(scene, enemies, currentAttackCooldown, currentAttackRadius);
//         score += kills * SCORE_PER_KILL;
//     }
// });
//
// window.addEventListener('keyup', (event) => {
//     player.keys[event.key] = false;
// });
//
// init();
//
// // Handle window resize
// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });
//





import * as THREE from 'three';
import './style.css';

import Player from './components/Player.js';
import Enemy from './components/Enemy.js';
import Map from './components/Map.js';
import House from './components/House.js';
import Tree from './components/Tree.js';
import Stone from './components/Stone.js';
import Grass from './components/Grass.js';

import {
    SCORE_PER_SECOND,
    SCORE_PER_KILL,
    COLLISION_THRESHOLD,
    INITIAL_ENEMY_SPAWN_DELAY,
    MIN_ENEMY_SPAWN_DELAY,
    INITIAL_ENEMY_SPEED,
    INITIAL_PLAYER_SPEED,
    DIFFICULTY_GROWTH_FACTOR,
    ATTACK_COOLDOWN,
    ATTACK_RADIUS
} from './constants.js';

import { createCamera } from './components/Camera.js';
import { createRenderer } from './components/Renderer.js';

// Scene
const scene = new THREE.Scene();

// Fog for atmosphere
scene.fog = new THREE.Fog(0x87b7ff, 2500, 7000);
scene.background = new THREE.Color(0x87b7ff);

const enemies = [];
const houses = [];
const trees = [];
const stones = [];
const grasses = [];

const MAP_SIZE = 400;

const SPAWN_LOCATIONS = [
    new THREE.Vector3(MAP_SIZE, MAP_SIZE, 0),
    new THREE.Vector3(-MAP_SIZE, MAP_SIZE, 0),
    new THREE.Vector3(MAP_SIZE, -MAP_SIZE, 0),
    new THREE.Vector3(-MAP_SIZE, -MAP_SIZE, 0)
];

// ---------------- LIGHTING ----------------

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);

directionalLight.position.set(-100, -100, 200);

directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

scene.add(directionalLight);

// ---------------- GAME VARIABLES ----------------

let score = 0;

let isGameOver = false;

let spawnTimer = 0;

const clock = new THREE.Clock();

const scoreElement = document.querySelector('.score');
const livesElement = document.querySelector('.lives');
const gameOverElement = document.querySelector('.game-over');

const updateLivesUI = (count) => {
    if (!livesElement) return;
    livesElement.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        livesElement.appendChild(heart);
    }
};

// ---------------- COMPONENTS ----------------

const player = new Player();

const map = new Map();

const camera = createCamera();

const renderer = createRenderer();

// objects clusters

// house cluster
const createHouseCluster = async () => {

    // Village center
    const villageX = 400;
    const villageY = -300;

    for (let i = 0; i < 5; i++) {

        const house = new House();

        await house.init();

        // Spread around village center
        const x =
            villageX +
            (Math.random() - 0.5) * 1200;

        const y =
            villageY +
            (Math.random() - 0.5) * 1200;

        house.position.set(x, y, 0);

        // Random rotation
        house.rotation.z =
            Math.random() * Math.PI * 2;

        // Slight scale variation
        const scale =
            0.9 + Math.random() * 0.3;

        house.scale.setScalar(scale);

        scene.add(house);

        houses.push(house);
    }
};

// Tree cluster
const createTreeClusters = async () => {

    const CLUSTER_COUNT = 4;
    const TREES_PER_CLUSTER = 4;

    for (let cluster = 0; cluster < CLUSTER_COUNT; cluster++) {

        // Keep clusters away from center arena
        const clusterX =
            (Math.random() - 0.5) * 2500;

        const clusterY =
            (Math.random() - 0.5) * 2500;

        // Skip center area
        // if (
        //     Math.abs(clusterX) < 2500 &&
        //     Math.abs(clusterY) < 2500
        // ) {
        //     continue;
        // }

        for (let i = 0; i < TREES_PER_CLUSTER; i++) {

            const tree = new Tree();

            await tree.init();

            // Spread inside cluster
            const x =
                clusterX +
                (Math.random() - 0.5) * 500;

            const y =
                clusterY +
                (Math.random() - 0.5) * 500;

            tree.position.set(x, y, 0);

            // Random rotation
            tree.rotation.z =
                Math.random() * Math.PI * 2;

            // Slight scale variation
            const scale =
                0.8 + Math.random() * 0.6;

            tree.scale.setScalar(scale);

            scene.add(tree);

            trees.push(tree);
        }
    }
};
// Stone cluster
const createStoneClusters = async () => {

    const CLUSTER_COUNT = 2;
    const STONES_PER_CLUSTER = 2;

    for (let cluster = 0; cluster < CLUSTER_COUNT; cluster++) {

        const clusterX =
            (Math.random() - 0.5) * 2000;

        const clusterY =
            (Math.random() - 0.5) * 2000;

        for (let i = 0; i < STONES_PER_CLUSTER; i++) {

            const stone = new Stone();

            await stone.init();

            const x =
                clusterX +
                (Math.random() - 0.5) * 300;

            const y =
                clusterY +
                (Math.random() - 0.5) * 300;

            stone.position.set(x, y, 0);

            stone.rotation.z =
                Math.random() * Math.PI * 2;

            const scale =
                0.7 + Math.random() * 0.5;

            stone.scale.setScalar(scale);

            scene.add(stone);

            stones.push(stone);
        }
    }
};
// Grass Cluster
const createGrassPatches = async () => {

    for (const tree of trees) {

        const grassCount =
            2 + Math.floor(Math.random() * 4);

        for (let i = 0; i < grassCount; i++) {

            const grass = new Grass();

            await grass.init();

            const x =
                tree.position.x +
                (Math.random() - 0.5) * 500;

            const y =
                tree.position.y +
                (Math.random() - 0.5) * 500;

            grass.position.set(x, y, 0);

            grass.rotation.z =
                Math.random() * Math.PI * 2;

            const scale =
                0.5 + Math.random() * 0.5;

            grass.scale.setScalar(scale);

            scene.add(grass);

            grasses.push(grass);
        }
    }
};
// ---------------- INIT ----------------

const init = async () => {

    // Load player
    await player.init();

    scene.add(player);

    // Add map
    scene.add(map);

    // Helper cluster calls
    await createHouseCluster();

    await createTreeClusters();

    await createStoneClusters();

    await createGrassPatches();

    updateLivesUI(3);

    // Camera attached to player
    player.add(camera);

    // Better camera angle
    camera.position.set(300, -400, 300);

    camera.up.set(0, 0, 1);

    camera.lookAt(0, 0, 0);

    // ---------------- GAME LOOP ----------------

    renderer.setAnimationLoop(() => {

        const delta = clock.getDelta();

        const difficultyFactor = score * DIFFICULTY_GROWTH_FACTOR;

        const currentEnemySpeed =
            INITIAL_ENEMY_SPEED * (1 + difficultyFactor * 1.5);

        const currentPlayerSpeed =
            INITIAL_PLAYER_SPEED * (1 + difficultyFactor);

        const currentSpawnDelay =
            Math.max(
                MIN_ENEMY_SPAWN_DELAY,
                INITIAL_ENEMY_SPAWN_DELAY / (1 + difficultyFactor * 2)
            );

        const currentAttackCooldown =
            Math.max(
                200,
                ATTACK_COOLDOWN / (1 + difficultyFactor)
            );

        const currentAttackRadius =
            ATTACK_RADIUS * (1 + difficultyFactor * 0.5);

        // ---------------- GAMEPLAY ----------------

        if (!isGameOver) {

            score += delta * SCORE_PER_SECOND;

            player.update(
                enemies,
                currentPlayerSpeed,
                houses,
                trees
            );

            // Enemy spawning
            spawnTimer += delta * 1000;

            if (spawnTimer >= currentSpawnDelay) {

                spawnTimer = 0;

                spawnEnemy();
            }

            // Collision detection
            if (!isGameOver) {

                for (const enemy of enemies) {

                    const playerXY = new THREE.Vector3(
                        player.position.x,
                        player.position.y,
                        0
                    );

                    const enemyXY = new THREE.Vector3(
                        enemy.position.x,
                        enemy.position.y,
                        0
                    );

                    if (
                        playerXY.distanceTo(enemyXY)
                        < COLLISION_THRESHOLD
                    ) {
                        const died = player.takeDamage();
                        updateLivesUI(player.lives);
                        
                        if (died) {
                            triggerGameOver();
                        }
                        break;
                    }
                }
            }
        }

        // Update enemies
        enemies.forEach(enemy => {

            enemy.update(
                player.position,
                enemies,
                isGameOver,
                currentEnemySpeed,
                houses
            );
        });

        // Render
        renderer.render(scene, camera);

        // Score UI
        if (scoreElement) {

            scoreElement.textContent =
                Math.floor(score) || 0;
        }
    });
};

// ---------------- ENEMY SPAWNING ----------------

const spawnEnemy = async () => {

    if (isGameOver) return;

    const enemy = new Enemy();

    enemy.position.set(1000, 1000, 0);

    await enemy.init();

    const location =
        SPAWN_LOCATIONS[
            Math.floor(Math.random() * SPAWN_LOCATIONS.length)
            ];

    enemy.position.copy(location);

    scene.add(enemy);

    enemies.push(enemy);
};

// ---------------- GAME OVER ----------------

const triggerGameOver = () => {

    isGameOver = true;

    player.isDead = true;

    player.visible = false;

    if (gameOverElement) {

        gameOverElement.classList.remove('hidden');
    }
};

// ---------------- RESET ----------------

const resetGame = () => {

    isGameOver = false;

    score = 0;

    if (scoreElement) {
        scoreElement.textContent = '0';
    }

    updateLivesUI(3);

    spawnTimer = 0;

    player.reset();

    // Remove enemies
    enemies.forEach(enemy => scene.remove(enemy));

    enemies.length = 0;

    if (gameOverElement) {

        gameOverElement.classList.add('hidden');
    }

    // Spawn enemies again
    SPAWN_LOCATIONS.forEach(async (location) => {

        const enemy = new Enemy();

        enemy.position.copy(location);

        await enemy.init();

        scene.add(enemy);

        enemies.push(enemy);
    });
};

// ---------------- INPUT ----------------

window.addEventListener('keydown', (event) => {

    if (isGameOver) {

        if (event.code === 'Space') {

            resetGame();
        }

        return;
    }

    player.keys[event.key] = true;

    if (event.code === 'Space') {

        const difficultyFactor =
            score * DIFFICULTY_GROWTH_FACTOR;

        const currentAttackCooldown =
            Math.max(
                200,
                ATTACK_COOLDOWN / (1 + difficultyFactor)
            );

        const currentAttackRadius =
            ATTACK_RADIUS * (1 + difficultyFactor * 0.5);

        const kills = player.attack(
            scene,
            enemies,
            currentAttackCooldown,
            currentAttackRadius
        );

        score += kills * SCORE_PER_KILL;
    }
});

window.addEventListener('keyup', (event) => {

    player.keys[event.key] = false;
});

// ---------------- START ----------------

init();

// ---------------- RESIZE ----------------

window.addEventListener('resize', () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});