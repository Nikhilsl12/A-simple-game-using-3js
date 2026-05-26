// import * as THREE from 'three';
//
// export const createRenderer = () => {
//     // Use canvas.game in index.html as the rendering canvas
//     const canvas = document.querySelector('.game');
//
//     // Initialize THREE.WebGLRenderer with alpha: true and antialias: true
//     const renderer = new THREE.WebGLRenderer({
//         canvas: canvas,
//         alpha: true,
//         antialias: true
//     });
//
//     // Set the renderer size to match the window dimensions
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//
//     return renderer;
// };
import * as THREE from 'three';

export const createRenderer = () => {

    const canvas = document.querySelector('.game');

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(window.devicePixelRatio);

    // Enable shadows
    renderer.shadowMap.enabled = true;

    return renderer;
};
