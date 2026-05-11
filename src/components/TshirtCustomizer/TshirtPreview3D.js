import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./TshirtCustomizer.css";

// Zone plane config: offsets as fraction of bounding-box size, plus Y rotation
const ZONE_PLANE = {
  front: { ox: 0, oy: 0.05, oz: 1, ry: 0, sw: 0.4, sh: 0.35 },
  back: { ox: 0, oy: 0.05, oz: -1, ry: Math.PI, sw: 0.4, sh: 0.35 },
  left_sleeve: { ox: 0.38, oy: 0.2, oz: 0.2, ry: -0.5, sw: 0.2, sh: 0.2 },
  right_sleeve: { ox: -0.38, oy: 0.2, oz: 0.2, ry: 0.5, sw: 0.2, sh: 0.2 },
};

export default function TshirtPreview3D({
  modelPath,
  shirtColor = "#ffffff",
  zoneDesigns = {},
}) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const shirtColorRef = useRef(shirtColor);
  const designsRef = useRef(zoneDesigns);
  const meshesRef = useRef([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    shirtColorRef.current = shirtColor;
  }, [shirtColor]);
  useEffect(() => {
    designsRef.current = zoneDesigns;
  }, [zoneDesigns]);

  // ── Rebuild design planes (called when model loads OR designs change) ──
  const rebuildPlanes = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;

    // Dispose old planes
    meshesRef.current.forEach((m) => {
      model.remove(m);
      m.geometry.dispose();
      if (m.material.map) m.material.map.dispose();
      m.material.dispose();
    });
    meshesRef.current = [];

    // Compute bounding box; convert world-space center to model-local space
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const wCenter = box.getCenter(new THREE.Vector3());
    const lCenter = model.worldToLocal(wCenter.clone());

    Object.entries(designsRef.current).forEach(([zoneId, design]) => {
      if (!design?.imageUrl) return;
      const cfg = ZONE_PLANE[zoneId];
      if (!cfg) return;

      new THREE.TextureLoader().load(design.imageUrl, (tex) => {
        if (!modelRef.current) return;
        tex.colorSpace = THREE.SRGBColorSpace;

        const pw = size.x * cfg.sw;
        const ph = size.y * cfg.sh;
        const geo = new THREE.PlaneGeometry(pw, ph);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          lCenter.x + cfg.ox * size.x,
          lCenter.y + cfg.oy * size.y,
          lCenter.z + cfg.oz * (size.z * 0.5 + 0.005),
        );
        mesh.rotation.y = cfg.ry;
        modelRef.current.add(mesh);
        meshesRef.current.push(mesh);
      });
    });
  }, []);

  // ── Set up scene once ─────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current || !modelPath) return;

    setReady(false);
    setError("");

    const container = mountRef.current;
    const w0 = container.offsetWidth || 260;
    const h0 = container.offsetHeight || 340;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w0, h0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e2433);

    const camera = new THREE.PerspectiveCamera(45, w0 / h0, 0.1, 1000);
    camera.position.set(0, 0, 3);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.5;

    new GLTFLoader().load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        scene.add(model);
        applyColor(model, shirtColorRef.current);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const dist = (maxDim / 2 / Math.tan(fov / 2)) * 1.8;
        camera.position.set(center.x, center.y, center.z + dist);
        camera.near = dist / 100;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();
        controls.target.copy(center);
        controls.update();

        setReady(true); // triggers rebuildPlanes
      },
      undefined,
      (err) => {
        console.warn("GLB load failed:", err);
        setError(
          "Failed to load 3D model. Place tshirt.glb in public/models/.",
        );
      },
    );

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.offsetWidth || 260;
      const h = container.offsetHeight || 340;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
      meshesRef.current.forEach((m) => {
        m.geometry.dispose();
        if (m.material.map) m.material.map.dispose();
        m.material.dispose();
      });
      meshesRef.current = [];
      if (modelRef.current) {
        modelRef.current.traverse((node) => {
          if (node.isMesh) {
            node.geometry?.dispose();
            (Array.isArray(node.material)
              ? node.material
              : [node.material]
            ).forEach((m) => m?.dispose());
          }
        });
        modelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]);

  // ── Recolor shirt when shirtColor changes ─────────────────────────
  useEffect(() => {
    if (modelRef.current) applyColor(modelRef.current, shirtColor);
  }, [shirtColor]);

  // ── Rebuild planes when model is ready OR when designs change ─────
  useEffect(() => {
    if (ready) rebuildPlanes();
  }, [ready, zoneDesigns, rebuildPlanes]);

  return (
    <div>
      <div className="tsc-preview-3d" ref={mountRef}>
        {!ready && !error && (
          <div className="tsc-preview-loading">
            <span
              className="tsc-spinner"
              style={{
                borderTopColor: "#455073",
                borderColor: "rgba(69,80,115,0.2)",
              }}
            />
            <span>Loading 3D preview…</span>
          </div>
        )}
        {error && <div className="tsc-preview-error">{error}</div>}
      </div>

      {/* Zoom controls */}
      <div className="tsc-zoom-row">
        <button
          type="button"
          className="tsc-zoom-btn"
          onClick={() => {
            setZoom((z) => {
              const next = Math.max(50, z - 25);
              return next;
            });
          }}
        >
          −
        </button>
        <span>{zoom}%</span>
        <button
          type="button"
          className="tsc-zoom-btn"
          onClick={() => {
            setZoom((z) => Math.min(200, z + 25));
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function applyColor(model, hexColor) {
  const color = new THREE.Color(hexColor);
  model.traverse((node) => {
    if (node.isMesh) {
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach((mat) => {
        if (mat) {
          mat.color.set(color);
          mat.needsUpdate = true;
        }
      });
    }
  });
}
