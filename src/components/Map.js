import * as THREE from 'three';

export default class Map extends THREE.Group {

    constructor() {
        super();

        this.createCheckerGround();
    }

    createCheckerGround() {

        const size = 4000;

        const divisions = 40;

        const tileSize = size / divisions;

        // VERY subtle color variation
        const darkGreen =
            new THREE.Color(0x5b6b3a
            );

        const lightGreen =
            new THREE.Color(0x6f7d45);

        for (let i = 0; i < divisions; i++) {

            for (let j = 0; j < divisions; j++) {

                const geometry =
                    new THREE.PlaneGeometry(
                        tileSize,
                        tileSize
                    );

                const color =
                    (i + j) % 2 === 0
                        ? darkGreen
                        : lightGreen;

                const material =
                    new THREE.MeshStandardMaterial({
                        color: color
                    });

                const tile =
                    new THREE.Mesh(
                        geometry,
                        material
                    );

                tile.position.x =
                    (i * tileSize) -
                    (size / 2) +
                    (tileSize / 2);

                tile.position.y =
                    (j * tileSize) -
                    (size / 2) +
                    (tileSize / 2);

                tile.position.z = 0;

                tile.receiveShadow = true;

                this.add(tile);
            }
        }
    }
}