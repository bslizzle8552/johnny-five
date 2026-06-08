import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { withBasePath } from './assetPaths';

type RobotAnimationEntry = {
  id: string;
  label: string;
  optimizedPath?: string;
  clips: string[];
};

type RobotManifest = {
  animations: RobotAnimationEntry[];
};

type RobotAction = {
  id: string;
  label: string;
  sourceId: string;
  clipIncludes: string;
};

const robotActions: RobotAction[] = [
  { id: 'idle', label: 'Idle', sourceId: 'turn_scared_dance_idle', clipIncludes: 'idle_251105' },
  { id: 'walking', label: 'Walk', sourceId: 'walking', clipIncludes: 'walk_normal' },
  { id: 'scared', label: 'Scared', sourceId: 'turn_scared_dance_idle', clipIncludes: 'stand-scared' },
  { id: 'turn', label: 'Turn', sourceId: 'turn_scared_dance_idle', clipIncludes: 'orc-turn' },
  { id: 'dance', label: 'Dance', sourceId: 'turn_scared_dance_idle', clipIncludes: 'taunt-dance' },
  { id: 'afraid', label: 'Afraid', sourceId: 'afraid', clipIncludes: 'stand-afraid' },
];

function pickClip(entry: RobotAnimationEntry, clipIncludes: string) {
  const matchingClips = entry.clips.filter((clip) => clip.includes(clipIncludes));
  return matchingClips.find((clip) => !clip.startsWith('Armature|')) ?? matchingClips[0] ?? entry.clips[0];
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

function keepModelOnStage(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) {
    return;
  }

  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
}

export function RobotViewer() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const gltfRef = useRef<GLTF | null>(null);
  const activePathRef = useRef<string | null>(null);
  const activeActionRef = useRef<RobotAction>(robotActions[0]);
  const loadTokenRef = useRef(0);

  const [manifest, setManifest] = useState<RobotManifest | null>(null);
  const [activeAction, setActiveAction] = useState<RobotAction>(robotActions[0]);
  const [autoRandomize, setAutoRandomize] = useState(true);
  const [status, setStatus] = useState('Loading manifest');

  const entriesById = useMemo(() => {
    return new Map(manifest?.animations.map((entry) => [entry.id, entry]) ?? []);
  }, [manifest]);

  useEffect(() => {
    let cancelled = false;

    fetch(withBasePath('/robot/manifest.json'))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Manifest request failed with ${response.status}`);
        }
        return response.json() as Promise<RobotManifest>;
      })
      .then((nextManifest) => {
        if (!cancelled) {
          setManifest(nextManifest);
          setStatus('Manifest ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : 'Manifest failed to load');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    activeActionRef.current = activeAction;
  }, [activeAction]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9d4cb);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
    camera.position.set(1.9, 1.42, 3.25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.75, 0);
    controls.minDistance = 1.2;
    controls.maxDistance = 5;

    const hemiLight = new THREE.HemisphereLight(0xf8efe0, 0x6d6256, 2.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(2.4, 3.6, 2.2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9fc7ff, 0.8);
    fillLight.position.set(-2.8, 1.6, -1.8);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.35, 96),
      new THREE.MeshStandardMaterial({ color: 0xaaa196, roughness: 0.82 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const clock = new THREE.Clock();
    let frameId = 0;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      mixerRef.current?.update(clock.getDelta());
      if (modelRef.current) {
        keepModelOnStage(modelRef.current);
      }
      controls.update();
      renderer.render(scene, camera);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    loaderRef.current = new GLTFLoader();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      controls.dispose();
      mixerRef.current?.stopAllAction();
      if (modelRef.current) {
        scene.remove(modelRef.current);
        disposeObject(modelRef.current);
      }
      floor.geometry.dispose();
      if (Array.isArray(floor.material)) {
        floor.material.forEach((material) => material.dispose());
      } else {
        floor.material.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      loaderRef.current = null;
      mixerRef.current = null;
      modelRef.current = null;
      gltfRef.current = null;
      activePathRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!manifest || entriesById.size === 0) {
      return;
    }

    setActiveAction(robotActions[0]);
  }, [manifest, entriesById]);

  useEffect(() => {
    const entry = entriesById.get(activeAction.sourceId);
    const scene = sceneRef.current;
    const loader = loaderRef.current;
    const path = entry?.optimizedPath ? withBasePath(entry.optimizedPath) : undefined;
    const clipName = entry ? pickClip(entry, activeAction.clipIncludes) : undefined;

    if (!scene || !loader || !path || !clipName) {
      return undefined;
    }

    const playClip = (gltf: GLTF) => {
      mixerRef.current?.stopAllAction();
      const mixer = new THREE.AnimationMixer(gltf.scene);
      const clip = THREE.AnimationClip.findByName(gltf.animations, clipName) ?? gltf.animations[0];
      const clipAction = mixer.clipAction(clip);
      clipAction.reset();
      clipAction.setLoop(THREE.LoopRepeat, Number.POSITIVE_INFINITY);
      clipAction.fadeIn(0.2);
      clipAction.play();
      mixerRef.current = mixer;
      setStatus(`Playing ${activeAction.label}`);
    };

    if (activePathRef.current === path && gltfRef.current) {
      playClip(gltfRef.current);
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    setStatus(`Loading ${activeAction.label}`);

    loader.load(
      path,
      (gltf) => {
        if (loadToken !== loadTokenRef.current) {
          disposeObject(gltf.scene);
          return;
        }

        mixerRef.current?.stopAllAction();
        if (modelRef.current) {
          scene.remove(modelRef.current);
          disposeObject(modelRef.current);
        }

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = size.y > 0 ? 1.45 / size.y : 1;

        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        scene.add(model);
        keepModelOnStage(model);
        modelRef.current = model;
        gltfRef.current = gltf;
        activePathRef.current = path;
        playClip(gltf);
      },
      undefined,
      (error) => {
        setStatus(error instanceof Error ? error.message : `Could not load ${activeAction.label}`);
      },
    );

    return undefined;
  }, [activeAction, entriesById, manifest]);

  useEffect(() => {
    if (!autoRandomize || !manifest) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const current = activeActionRef.current;
      const choices = robotActions.filter((action) => action.id !== current.id);
      const next = choices[Math.floor(Math.random() * choices.length)] ?? robotActions[0];
      setActiveAction(next);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [autoRandomize, manifest]);

  return (
    <main className="robot-viewer">
      <section className="robot-stage" aria-label="Johnny Five humanoid robot viewer">
        <div className="robot-canvas" ref={mountRef} />
        <div className="robot-status" aria-live="polite">
          {status}
        </div>
      </section>

      <aside className="robot-controls" aria-label="Animation controls">
        <div className="robot-control-header">
          <p>Johnny Five v0.1</p>
          <h1>Robot animation lab</h1>
        </div>

        <div className="robot-toggle-row">
          <label className="robot-toggle">
            <input
              type="checkbox"
              checked={autoRandomize}
              onChange={(event) => setAutoRandomize(event.target.checked)}
            />
            Randomize
          </label>
          <button type="button" onClick={() => setActiveAction(robotActions[Math.floor(Math.random() * robotActions.length)])}>
            Surprise me
          </button>
        </div>

        <div className="robot-action-grid">
          {robotActions.map((action) => (
            <button
              className={action.id === activeAction.id ? 'is-active' : ''}
              key={action.id}
              type="button"
              onClick={() => setActiveAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </aside>
    </main>
  );
}
