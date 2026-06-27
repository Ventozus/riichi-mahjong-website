import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 1400, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D2").appendChild(renderer.domElement);

// const topLight = new THREE.DirectionalLight(0xffffff, 1);
// topLight.position.set(0, 1, -1).normalize();
// scene.add(topLight);

// const topLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
// topLight2.position.set(0, 1, 2).normalize();
// scene.add(topLight2)

let objects = []; 

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

function loadModel(path, texturePath, name, position, offset) {
    loader.load(path, function (gltf) {
        const object = gltf.scene;
        object.traverse((node) => {
            if (node.isMesh) {
                if (node.material.name === name) {
                    const texture = textureLoader.load(texturePath); 
                    texture.wrapS = THREE.Wrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(0.3, 1.1);
                    texture.rotation = Math.PI + Math.PI /2;
                    texture.offset.set(offset.x, offset.y); 

                    node.material.map = texture;
                    node.material.needsUpdate = true;
                }
            }
        });
        scene.add(object);
        object.position.set(position.x, position.y, position.z);
        object.scale.set(100, 100, 100); 
        object.rotation.set(Math.PI, Math.PI/2, 0); 
        objects.push(object); 
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) {
        console.error(error);
    });
}

loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1000, y: 0, z: -400 }, { x: 0.1625, y: 1.045 }); 
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -800, y: 0, z: -400 }, { x: 0.2625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -600, y: 0, z: -400 }, { x: 0.3625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -400, y: 0, z: -400 }, { x: 0.4625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -200, y: 0, z: -400 }, { x: 0.5625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 0, y: 0, z: -400 }, { x: 0.7625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 200, y: 0, z: -400 }, { x: 0.8625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 400, y: 0, z: -400 }, { x: 0.9625, y: 1.045 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 600, y: 0, z: -400 }, { x: 1.0625, y: 1.045 });

loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1000, y: 0, z: -100 }, { x: 0.1625, y: 0.795 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -800, y: 0, z: -100 }, { x: 0.2625, y: 0.795 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -600, y: 0, z: -100 }, { x: 0.3625, y: 0.795 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -400, y: 0, z: -100 }, { x: 0.4625, y: 0.795 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -200, y: 0, z: -100 }, { x: 0.5625, y: 0.795 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 0, y: 0, z: -100 }, { x: 0.7625, y: 0.795 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 200, y: 0, z: -100 }, { x: 0.8625, y: 0.795 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 400, y: 0, z: -100 }, { x: 0.9625, y: 0.795 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 600, y: 0, z: -100 }, { x: 1.0625, y: 0.795 });

loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1000, y: 0, z: 200 }, { x: 0.1625, y: 0.546 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -800, y: 0, z: 200 }, { x: 0.2625, y: 0.546 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -600, y: 0, z: 200 }, { x: 0.3625, y: 0.546 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -400, y: 0, z: 200 }, { x: 0.4625, y: 0.546 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -200, y: 0, z: 200 }, { x: 0.5625, y: 0.546 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 0, y: 0, z: 200 }, { x: 0.7625, y: 0.546 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 200, y: 0, z: 200 }, { x: 0.8625, y: 0.546 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: 400, y: 0, z: 200 }, { x: 0.9625, y: 0.546 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 600, y: 0, z: 200 }, { x: 1.0625, y: 0.546 });

loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 400, y: 0, z: 800 }, { x: 0.6625, y: 0.795 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 600, y: 0, z: 800 }, { x: 0.6625, y: 0.546 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: 800, y: 0, z: 800 }, { x: 0.6625, y: 1.045 });

loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1400, y: 0, z: -400 }, { x: 0.1625, y: 0.297 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1400, y: 0, z: -100 }, { x: 0.2625, y: 0.297 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1400, y: 0, z: 200 }, { x: 0.3625, y: 0.297 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1400, y: 0, z: 500 }, { x: 0.4625, y: 0.297 });

loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1600, y: 0, z: -400 }, { x: 0.5625, y: 0.297 });
loadModel('3d/tiles_site_1.glb', 'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1600, y: 0, z: -100 }, { x: 0.6625, y: 0.297 });
loadModel('3d/tiles_site_1.glb',  'images/Mahjong_Tiles_03.png', 'pin.1', { x: -1600, y: 0, z: 200 }, { x: 0.7625, y: 0.297 });

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const modelHoverStates = new Map();

renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        const object = intersects[0].object.parent; 
        
        const currentState = modelHoverStates.get(object) || { flipped: false, canFlip: true };
        
        if (currentState.canFlip) {
            const newFlipState = !currentState.flipped;
            const newRotation = newFlipState ? Math.PI : Math.PI/2;
            
            gsap.to(object.rotation, { 
                duration: 0.5, 
                x: newRotation,
                onComplete: () => {
                    modelHoverStates.set(object, { 
                        flipped: newFlipState, 
                        canFlip: false 
                    });
                }
            });
        }
    }
});

renderer.domElement.addEventListener('mouseout', (event) => {
    objects.forEach(obj => {
        const currentState = modelHoverStates.get(obj);
        if (currentState) {
            modelHoverStates.set(obj, { 
                flipped: currentState.flipped, 
                canFlip: true 
            });
        }
    });
});

renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        const object = intersects[0].object.parent; 
        const isFlipped = Math.abs(object.rotation.x) < 0.1; 
        const newRotation = isFlipped ? Math.PI : 0; 
        gsap.to(object.rotation, { duration: 0.5, x: newRotation });
    }
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
onWindowResize();
