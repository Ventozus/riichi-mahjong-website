/**
 * tiles-3d.js — 3D-витрина тайлов
 * Раскладка: ветра+драконы слева, масти справа, красные доры внизу.
 * Подписи — через CSS2DRenderer (HTML поверх canvas).
 */

import * as THREE from 'three';
import { GLTFLoader }                        from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject }        from 'three/addons/renderers/CSS2DRenderer.js';

/* ─── Настройки ─────────────────────────────────────────────────────────── */
const CONTAINER_ID = 'tiles-3d-container';
const GLB_PATH     = '3d/tiles/tiles_site_1.glb';
const TEX_PATH     = '3d/tiles/mj-tiles-icons-2.png';
const MAT_NAME     = 'pin.1';
const TILE_SCALE   = 160;
const SPACING_X    = 310;   // шаг между тайлами в строке
const SPACING_Z    = 380;   // шаг между тайлами в колонке (ветра/драконы)
const HOVER_RISE   = 130;
const BOB_AMP      = 14;
const BOB_SPEED    = 0.45;

/* ─── UV ────────────────────────────────────────────────────────────────── */
const TEX_REPEAT_X = 0.3;
const TEX_REPEAT_Y = 1.1;
const TEX_ROTATION = Math.PI + Math.PI / 2;
const SPRITE_COLS  = 10;
const COL_X_BASE   = 0.1625;
const COL_STEP     = 0.1;
const ROW_Y        = [1.045, 0.795, 0.546, 0.297];

/* ─── Позиции секций ─────────────────────────────────────────────────────── */
const SUIT_X_OFF = 850;           // центр блока мастей по X (сдвинут вправо)
const X_WIND     = -1300;         // колонка ветров (между драконами и мастями)
const X_DRAGON   = -1750;         // колонка драконов (крайняя левая)

const Z_PIN  = -500;
const Z_MAN  = -100;
const Z_SOU  =  300;
const Z_DORA =  950;

const WIND_Z   = [-500, -100,  300,  700]; // 東 南 西 北
const DRAGON_Z = [-500,  -50,  400]; // 中 白 發  — выровнено с ветрами

/* ─── Камера ─────────────────────────────────────────────────────────────── */
// Ortho-полуоконный размер. Уменьши = крупнее тайлы, увеличь = всё влезает.
const ORTHO_H     = 1100;
const CAM_LOOK_X  = 100;
const CAM_LOOK_Z  = 100;

/* ─── Раскладка тайлов ───────────────────────────────────────────────────── */
function buildLayout() {
    const tiles = [];

    // ── Масти: пин (row1), ман (row0), соу (row2) — cols 0-8 ─────────────
    const suits = [
        { spriteRow: 1, z: Z_PIN },
        { spriteRow: 0, z: Z_MAN },
        { spriteRow: 2, z: Z_SOU },
    ];
    suits.forEach(({ spriteRow, z }) => {
        for (let col = 0; col < 9; col++) {
            tiles.push({ spriteRow, spriteCol: col, x: (col - 4) * SPACING_X + SUIT_X_OFF, z });
        }
    });

    // ── Красные доры: col 9 каждой масти ─────────────────────────────────
    [1, 0, 2].forEach((spriteRow, idx) => {
        tiles.push({ spriteRow, spriteCol: 9, x: (idx - 1) * SPACING_X + SUIT_X_OFF, z: Z_DORA });
    });

    // ── Ветра: 東(0) 南(1) 西(2) 北(3) ───────────────────────────────────
    [0, 1, 2, 3].forEach((spriteCol, idx) => {
        tiles.push({ spriteRow: 3, spriteCol, x: X_WIND, z: WIND_Z[idx] });
    });

    // ── Драконы: 中(4) 白(5) 發(6) ───────────────────────────────────────
    [4, 5, 6].forEach((spriteCol, idx) => {
        tiles.push({ spriteRow: 3, spriteCol, x: X_DRAGON, z: DRAGON_Z[idx] });
    });

    return tiles;
}

/* ─── Создание подписи ───────────────────────────────────────────────────── */
function makeLabel(text, cls = '') {
    const div = document.createElement('div');
    div.textContent = text;
    div.className   = 'tile3d-lbl' + (cls ? ' tile3d-lbl--' + cls : '');
    div.style.pointerEvents = 'none';
    return new CSS2DObject(div);
}

/* ─── Главная функция ───────────────────────────────────────────────────── */
function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;
    container.style.overflow = 'hidden'; // метки не выходят за рамку

    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 500;

    /* Сцена */
    const scene = new THREE.Scene();

    /* Ортографическая камера */
    const aspect = W / H;
    const camera = new THREE.OrthographicCamera(
        -ORTHO_H * aspect,  ORTHO_H * aspect,
         ORTHO_H,           -ORTHO_H,
        1, 5000
    );
    camera.position.set(CAM_LOOK_X, 1400, CAM_LOOK_Z);
    camera.up.set(0, 0, -1);
    camera.lookAt(CAM_LOOK_X, 0, CAM_LOOK_Z);

    /* WebGL-рендерер */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    /* CSS2D-рендерер (HTML-подписи) */
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(W, H);
    labelRenderer.domElement.style.cssText =
        'position:absolute;top:0;left:0;pointer-events:none;';
    container.appendChild(labelRenderer.domElement);

    /* Инжектируем стили подписей (один раз) */
    if (!document.getElementById('tile3d-css')) {
        const s = document.createElement('style');
        s.id = 'tile3d-css';
        s.textContent = `
            .tile3d-lbl {
                font-family: sans-serif;
                font-size: 13px;
                color: #222;
                white-space: nowrap;
                pointer-events: none;
                user-select: none;
            }
            .tile3d-lbl--section {
                font-family: 'ventoza-berense', sans-serif;
                font-size: 20px;
                font-weight: 700;
                font-style: italic;
                color: #1a1a1a;
            }
            .tile3d-lbl--row {
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            .tile3d-lbl--num {
                font-size: 12px;
                color: #555;
            }
            .tile3d-lbl--small {
                font-size: 11px;
                color: #555;
            }
        `;
        document.head.appendChild(s);
    }

    /* Освещение */
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dirMain = new THREE.DirectionalLight(0xffffff, 1.1);
    dirMain.position.set(300, 1000, 500);
    scene.add(dirMain);
    const dirFill = new THREE.DirectionalLight(0xffffff, 0.38);
    dirFill.position.set(-400, 600, -300);
    scene.add(dirFill);

    /* ── Подписи ─────────────────────────────────────────────────────────── */
    function addLabel(text, x, z, cls) {
        const lbl = makeLabel(text, cls);
        lbl.position.set(x, 0, z);
        scene.add(lbl);
    }

    // Секции
    addLabel('Основные масти', SUIT_X_OFF - 4 * SPACING_X, Z_PIN - 320, 'section');
    addLabel('Красные доры',   SUIT_X_OFF - 1 * SPACING_X, Z_DORA - 320, 'section');
    addLabel('Ветра',          X_WIND,                     WIND_Z[0] - 310, 'section');
    addLabel('Драконы',        X_DRAGON,                   DRAGON_Z[0] - 310, 'section');

    // Номера столбцов 1–9 (над пин-рядом)
    for (let col = 0; col < 9; col++) {
        addLabel(String(col + 1), (col - 4) * SPACING_X + SUIT_X_OFF, Z_PIN - 200, 'num');
    }

    // Названия мастей справа от каждого ряда
    const suitRightX = 4 * SPACING_X + SUIT_X_OFF + 200;
    addLabel('Пин',  suitRightX, Z_PIN,  'row');
    addLabel('Ман',  suitRightX, Z_MAN,  'row');
    addLabel('Соу',  suitRightX, Z_SOU,  'row');
    addLabel('Доры', suitRightX, Z_DORA, 'row');

    // Ветра — направления
    ['Восток','Юг','Запад','Север'].forEach((name, i) => {
        addLabel(name, X_WIND + 260, WIND_Z[i], 'small');
    });

    // Драконы — цвета
    ['Красный','Белый','Зелёный'].forEach((name, i) => {
        addLabel(name, X_DRAGON - 260, DRAGON_Z[i], 'small');
    });

    /* ── Состояние ───────────────────────────────────────────────────────── */
    const layout        = buildLayout();
    const tileObjects   = [];
    const bobPhases     = [];
    const FLIP_AXIS     = new THREE.Vector3(0, 0, -1);
    const flipStates    = new Map();
    const hoveredOnce   = new Set();
    let   hoveredObj    = null;
    let   prevHoveredObj = null;

    /* ── Спрайт-лист с горизонтальным флипом ─────────────────────────────── */
    const spriteImg = new Image();
    spriteImg.onerror = () => console.error('[tiles-3d] Ошибка загрузки спрайта:', TEX_PATH);
    spriteImg.onload = () => {
        const flipCanvas = document.createElement('canvas');
        flipCanvas.width  = spriteImg.naturalWidth;
        flipCanvas.height = spriteImg.naturalHeight;
        const fc = flipCanvas.getContext('2d');
        fc.scale(-1, 1);
        fc.drawImage(spriteImg, -spriteImg.naturalWidth, 0);

        const spriteTexBase = new THREE.CanvasTexture(flipCanvas);
        spriteTexBase.colorSpace = THREE.SRGBColorSpace;
        spriteTexBase.wrapS      = THREE.RepeatWrapping;
        spriteTexBase.wrapT      = THREE.RepeatWrapping;
        spriteTexBase.repeat.set(TEX_REPEAT_X, TEX_REPEAT_Y);
        spriteTexBase.rotation   = TEX_ROTATION;

        const loader = new GLTFLoader();
        loader.load(GLB_PATH, (gltf) => {
            layout.forEach(({ spriteRow, spriteCol, x, z }, i) => {
                const obj = gltf.scene.clone(true);

                let foundFace = false;
                obj.traverse((node) => {
                    if (!node.isMesh || Array.isArray(node.material)) return;
                    if (node.material.name === MAT_NAME) {
                        foundFace = true;
                        node.material = node.material.clone();
                        const tex = spriteTexBase.clone();
                        tex.needsUpdate = true;
                        tex.offset.set(
                            COL_X_BASE + (SPRITE_COLS - 1 - spriteCol) * COL_STEP,
                            ROW_Y[spriteRow]
                        );
                        node.material.map = tex;
                        node.material.needsUpdate = true;
                    }
                });

                if (!foundFace && i === 0) {
                    console.warn(`[tiles-3d] Материал "${MAT_NAME}" не найден.`);
                }

                obj.position.set(x, 0, z);
                obj.scale.set(TILE_SCALE, TILE_SCALE, TILE_SCALE);
                obj.rotation.set(Math.PI, Math.PI / 2, 0);
                scene.add(obj);
                tileObjects.push(obj);
                bobPhases.push(Math.random() * Math.PI * 2);
                flipStates.set(obj, { qBase: obj.quaternion.clone(), angleCurrent: 0, angleTarget: 0 });
            });
        }, undefined, (err) => console.error('[tiles-3d] GLB:', err));
    };
    spriteImg.src = TEX_PATH;

    /* ── Raycast ─────────────────────────────────────────────────────────── */
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    function getHit(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(tileObjects, true);
        if (!hits.length) return null;
        let hit = hits[0].object;
        while (hit && !tileObjects.includes(hit)) hit = hit.parent;
        return (hit && tileObjects.includes(hit)) ? hit : null;
    }

    function onMouseMove(e) {
        hoveredObj = getHit(e);
        if (hoveredObj !== prevHoveredObj) {
            prevHoveredObj = hoveredObj;
            if (hoveredObj && !hoveredOnce.has(hoveredObj)) {
                hoveredOnce.add(hoveredObj);
                const st = flipStates.get(hoveredObj);
                if (st) st.angleTarget = Math.PI;
            }
        }
    }

    function onMouseLeave() { hoveredObj = null; }

    function onMouseClick(e) {
        const hit = getHit(e);
        if (!hit) return;
        const st = flipStates.get(hit);
        if (st) st.angleTarget = st.angleTarget < Math.PI ? Math.PI : 0;
    }

    renderer.domElement.addEventListener('mousemove',  onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);
    renderer.domElement.addEventListener('click',      onMouseClick);

    /* ── Render loop ─────────────────────────────────────────────────────── */
    let raf;
    function animate() {
        raf = requestAnimationFrame(animate);
        const t = performance.now() / 1000;

        tileObjects.forEach((obj, i) => {
            const bob     = Math.sin(t * BOB_SPEED + bobPhases[i]) * BOB_AMP;
            const targetY = (obj === hoveredObj ? HOVER_RISE : 0) + bob;
            obj.position.y += (targetY - obj.position.y) * 0.08;

            const fs = flipStates.get(obj);
            if (fs) {
                fs.angleCurrent += (fs.angleTarget - fs.angleCurrent) * 0.1;
                obj.quaternion.multiplyQuaternions(
                    new THREE.Quaternion().setFromAxisAngle(FLIP_AXIS, fs.angleCurrent),
                    fs.qBase
                );
            }
        });

        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    animate();

    /* ── Resize ──────────────────────────────────────────────────────────── */
    function onResize() {
        const W2 = container.clientWidth  || 800;
        const H2 = container.clientHeight || 500;
        const a  = W2 / H2;
        camera.left   = -ORTHO_H * a;
        camera.right  =  ORTHO_H * a;
        camera.top    =  ORTHO_H;
        camera.bottom = -ORTHO_H;
        camera.updateProjectionMatrix();
        renderer.setSize(W2, H2);
        labelRenderer.setSize(W2, H2);
    }
    window.addEventListener('resize', onResize);

    /* ── Dispose ─────────────────────────────────────────────────────────── */
    function dispose() {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('mousemove',  onMouseMove);
        renderer.domElement.removeEventListener('mouseleave', onMouseLeave);
        renderer.domElement.removeEventListener('click',      onMouseClick);

        const dm = new Set(), dt = new Set();
        scene.traverse((node) => {
            if (!node.isMesh) return;
            node.geometry.dispose();
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach((m) => {
                if (dm.has(m)) return; dm.add(m);
                if (m.map && !dt.has(m.map)) { dt.add(m.map); m.map.dispose(); }
                m.dispose();
            });
        });
        renderer.dispose();
        [renderer.domElement, labelRenderer.domElement].forEach((el) => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    }
    window.addEventListener('pagehide', dispose, { once: true });
}

init();
