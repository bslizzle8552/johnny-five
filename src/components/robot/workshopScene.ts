import * as THREE from 'three';

export type WorkshopAnchors = {
  floorPropHome: { x: number; y: number; z: number };
  chairSeatTarget: { x: number; z: number };
  chairApproachTarget: { x: number; z: number };
  chairYaw: number;
  propStandTarget: { x: number; z: number };
  propReachYaw: number;
};

export type WorkshopScene = {
  group: THREE.Group;
  floor: THREE.Mesh;
  grid: THREE.GridHelper;
  axesHelper: THREE.AxesHelper;
  floorProp: THREE.Group;
  dispose: () => void;
};

export const workshopAnchors: WorkshopAnchors = {
  floorPropHome: { x: 0.42, y: 0.055, z: 0.26 },
  chairSeatTarget: { x: -0.58, z: -0.56 },
  chairApproachTarget: { x: -0.56, z: -0.2 },
  chairYaw: -72,
  propStandTarget: { x: 0.12, z: 0.34 },
  propReachYaw: -126,
};

function markWorkshopMesh(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

function createPanel(width: number, height: number, depth: number, material: THREE.Material) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 4, 4, 1), material);
  panel.castShadow = true;
  panel.receiveShadow = true;
  return panel;
}

function createWorkshopChair() {
  const chair = new THREE.Group();
  chair.name = 'realistic-workshop-chair';

  const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x6e7d79, metalness: 0.18, roughness: 0.54 });
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x46504d, metalness: 0.34, roughness: 0.38 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x252a2a, metalness: 0.72, roughness: 0.32 });

  const seat = createPanel(0.5, 0.07, 0.43, seatMaterial);
  seat.position.set(0, 0.34, 0);
  chair.add(seat);

  const cushion = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.33, 5, 16), seatMaterial);
  cushion.scale.set(3.15, 0.22, 1.15);
  cushion.rotation.z = Math.PI / 2;
  cushion.position.set(0, 0.39, 0.02);
  chair.add(cushion);

  const back = createPanel(0.54, 0.56, 0.07, seatMaterial);
  back.position.set(0, 0.64, -0.21);
  back.rotation.x = THREE.MathUtils.degToRad(-8);
  chair.add(back);

  const topRail = createPanel(0.58, 0.035, 0.09, edgeMaterial);
  topRail.position.set(0, 0.9, -0.25);
  chair.add(topRail);

  [
    [-0.2, 0.17, -0.16],
    [0.2, 0.17, -0.16],
    [-0.2, 0.17, 0.16],
    [0.2, 0.17, 0.16],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.024, 0.34, 16), legMaterial);
    leg.position.set(x, y, z);
    chair.add(leg);
  });

  chair.position.set(-0.58, 0, -0.78);
  chair.rotation.y = THREE.MathUtils.degToRad(18);
  markWorkshopMesh(chair);
  return chair;
}

function createWorkbench() {
  const bench = new THREE.Group();
  bench.name = 'realistic-workbench';

  const wood = new THREE.MeshStandardMaterial({ color: 0x8f6f4c, metalness: 0.05, roughness: 0.62 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x333534, metalness: 0.68, roughness: 0.38 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x171819, metalness: 0.2, roughness: 0.74 });

  const top = createPanel(1.16, 0.08, 0.46, wood);
  top.position.set(0.42, 0.54, -1.1);
  bench.add(top);

  [
    [-0.1, 0.27, -1.26],
    [0.94, 0.27, -1.26],
    [-0.1, 0.27, -0.94],
    [0.94, 0.27, -0.94],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.5, 14), darkMetal);
    leg.position.set(x, y, z);
    bench.add(leg);
  });

  const viseBase = createPanel(0.18, 0.045, 0.12, darkMetal);
  viseBase.position.set(0.02, 0.61, -0.99);
  bench.add(viseBase);

  const viseJaw = createPanel(0.05, 0.12, 0.16, darkMetal);
  viseJaw.position.set(-0.06, 0.68, -0.99);
  bench.add(viseJaw);

  const cable = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.008, 8, 36, Math.PI * 1.35), rubber);
  cable.rotation.x = Math.PI / 2;
  cable.position.set(0.62, 0.6, -0.96);
  bench.add(cable);

  markWorkshopMesh(bench);
  return bench;
}

function createBackWall() {
  const wall = new THREE.Group();
  wall.name = 'realistic-tool-wall';

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xb8b1a6, metalness: 0.03, roughness: 0.86 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x6f6659, metalness: 0.38, roughness: 0.42 });
  const toolMat = new THREE.MeshStandardMaterial({ color: 0x2c3030, metalness: 0.72, roughness: 0.28 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xb35036, metalness: 0.18, roughness: 0.42 });

  const panel = createPanel(1.95, 0.72, 0.04, wallMat);
  panel.position.set(0.35, 0.95, -1.45);
  wall.add(panel);

  const shelf = createPanel(1.35, 0.045, 0.18, railMat);
  shelf.position.set(0.45, 0.72, -1.22);
  wall.add(shelf);

  [-0.18, 0.03, 0.25].forEach((x, index) => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 10), handleMat);
    handle.position.set(x, 1.03, -1.4);
    handle.rotation.z = index === 1 ? -0.16 : 0.12;
    wall.add(handle);

    const head = createPanel(0.09, 0.035, 0.025, toolMat);
    head.position.set(x, 1.15, -1.39);
    wall.add(head);
  });

  markWorkshopMesh(wall);
  return wall;
}

function createCharger() {
  const charger = new THREE.Group();
  charger.name = 'realistic-charger-dock';
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x25292b, metalness: 0.5, roughness: 0.4 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x5fc7bc, emissive: 0x1a726c, emissiveIntensity: 1.8, roughness: 0.24 });

  const base = createPanel(0.36, 0.04, 0.26, baseMat);
  base.position.set(0.86, 0.02, -0.52);
  charger.add(base);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.34, 18), baseMat);
  post.position.set(0.86, 0.19, -0.62);
  charger.add(post);

  const light = new THREE.Mesh(new THREE.SphereGeometry(0.035, 18, 12), glowMat);
  light.position.set(0.86, 0.38, -0.62);
  charger.add(light);

  markWorkshopMesh(charger);
  return charger;
}

function createFloorProp(home: WorkshopAnchors['floorPropHome']) {
  const floorProp = new THREE.Group();
  floorProp.name = 'realistic-inspection-part';

  const brass = new THREE.MeshStandardMaterial({ color: 0xd6a84d, metalness: 0.5, roughness: 0.28 });
  const cyan = new THREE.MeshStandardMaterial({ color: 0x65c7c2, emissive: 0x164d4a, emissiveIntensity: 1.35, roughness: 0.22 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b2c2a, metalness: 0.55, roughness: 0.35 });

  const core = createPanel(0.1, 0.1, 0.1, brass);
  floorProp.add(core);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 14), cyan);
  cap.position.set(0.045, 0.045, 0.045);
  floorProp.add(cap);

  const socket = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.007, 8, 24), dark);
  socket.rotation.x = Math.PI / 2;
  socket.position.set(0.045, 0.045, 0.045);
  floorProp.add(socket);

  floorProp.position.set(home.x, home.y, home.z);
  markWorkshopMesh(floorProp);
  return floorProp;
}

export function createWorkshopScene(): WorkshopScene {
  const group = new THREE.Group();
  group.name = 'realistic-workshop-world';

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xa49c91,
    metalness: 0.02,
    roughness: 0.82,
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.5, 128), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const grid = new THREE.GridHelper(3.2, 16, 0x237a78, 0x8f887d);
  grid.position.y = 0.004;
  group.add(grid);

  const axesHelper = new THREE.AxesHelper(0.42);
  axesHelper.position.set(-1.25, 0.02, 1.1);
  group.add(axesHelper);

  const backWall = createBackWall();
  const bench = createWorkbench();
  const chair = createWorkshopChair();
  const charger = createCharger();
  const floorProp = createFloorProp(workshopAnchors.floorPropHome);

  group.add(backWall, bench, chair, charger, floorProp);

  return {
    group,
    floor,
    grid,
    axesHelper,
    floorProp,
    dispose: () => {
      disposeObject(group);
    },
  };
}
