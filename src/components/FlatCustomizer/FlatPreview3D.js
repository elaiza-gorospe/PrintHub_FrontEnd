import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "../TshirtCustomizer/TshirtCustomizer.css";

// Aspect ratio (width / height) per product type
const FLAT_CONFIG = {
  calling_card: { ar: 1.75 },  // 3.5" × 2" business card
  banners:      { ar: 2.5  },  // wide horizontal banner
  stickers:     { ar: 1.0  },  // square sticker
  hang_tags:    { ar: 0.5  },  // tall/narrow hang tag
  brochures:    { ar: 1.41 },  // A4 folded brochure
};

// Zone plane offsets — fraction of box face dimensions
const ZONE_PLANE = {
  front:   { oz:  1, ry: 0,          sw: 0.9, sh: 0.9 },
  back:    { oz: -1, ry: Math.PI,    sw: 0.9, sh: 0.9 },
  outside: { oz:  1, ry: 0,          sw: 0.9, sh: 0.9 },
  inside:  { oz: -1, ry: Math.PI,    sw: 0.9, sh: 0.9 },
};

export default function FlatPreview3D({
  productType,
  baseColor = "#ffffff",
  zoneDesigns = {},
}) {
  const mountRef = useRef(null);
  const boxMeshRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const baseColorRef = useRef(baseColor);
  const designsRef = useRef(zoneDesigns);
  const planeMeshesRef = useRef([]);
  const boxDimRef = useRef({ w: 1.5, h: 1.0, d: 0.045 });
  const [zoom, setZoom] = useState(100);

  useEffect(() => { baseColorRef.current = baseColor; }, [baseColor]);
  useEffect(() => { designsRef.current = zoneDesigns; }, [zoneDesigns]);

  // ── Rebuild design planes ──────────────────────────────────────────
  const rebuildPlanes = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    planeMeshesRef.current.forEach((m) => {
      scene.remove(m);
      m.geometry.dispose();
      if (m.material.map) m.material.map.dispose();
      m.material.dispose();
    });
    planeMeshesRef.current = [];

    const { w, h, d } = boxDimRef.current;

    Object.entries(designsRef.current).forEach(([zoneId, design]) => {
      if (!design?.imageUrl) return;
      const cfg = ZONE_PLANE[zoneId];
      if (!cfg) return;

      new THREE.TextureLoader()
        .setCrossOrigin("anonymous")
        .load(design.imageUrl, (tex) => {
          if (!sceneRef.current) return;
          tex.colorSpace = THREE.SRGBColorSpace;

          const pw = w * cfg.sw;
          const ph = h * cfg.sh;
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
          // Place plane on front or back face of the box
          mesh.position.set(0, 0, cfg.oz * (d / 2 + 0.001));
          mesh.rotation.y = cfg.ry;
          sceneRef.current.add(mesh);
          planeMeshesRef.current.push(mesh);
        });
    });
  }, []);

  // ── Set up scene once ─────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;

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
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w0 / h0, 0.01, 100);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 5, 5);
    scene.add(dir);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    // Build the flat box geometry from productType config
    const cfg = FLAT_CONFIG[productType] || { ar: 1.4 };
    const boxW = 1.5;
    const boxH = boxW / cfg.ar;
    const boxD = boxW * 0.03;
    boxDimRef.current = { w: boxW, h: boxH, d: boxD };

    const geo = new THREE.BoxGeometry(boxW, boxH, boxD);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColorRef.current),
      roughness: 0.4,
      metalness: 0.0,
    });
    const box = new THREE.Mesh(geo, mat);
    scene.add(box);
    boxMeshRef.current = box;

    // Position camera to frame the box nicely
    const maxDim = Math.max(boxW, boxH, boxD);
    const fov = camera.fov * (Math.PI / 180);
    const dist = (maxDim / 2 / Math.tan(fov / 2)) * 2.2;
    camera.position.set(0, 0, dist);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();

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

    // Initial design planes
    rebuildPlanes();

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
      planeMeshesRef.current.forEach((m) => {
        m.geometry.dispose();
        if (m.material.map) m.material.map.dispose();
        m.material.dispose();
      });
      planeMeshesRef.current = [];
      if (boxMeshRef.current) {
        boxMeshRef.current.geometry.dispose();
        boxMeshRef.current.material.dispose();
        boxMeshRef.current = null;
      }
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType]);

  // ── Recolor box when baseColor changes ────────────────────────────
  useEffect(() => {
    if (boxMeshRef.current) {
      boxMeshRef.current.material.color.set(baseColor);
    }
  }, [baseColor]);

  // ── Rebuild planes when designs change ────────────────────────────
  useEffect(() => {
    rebuildPlanes();
  }, [zoneDesigns, rebuildPlanes]);

  return (
    <div>
      <div className="tsc-preview-3d" ref={mountRef} />

      <div className="tsc-zoom-row">
        <button
          type="button"
          className="tsc-zoom-btn"
          onClick={() => setZoom((z) => Math.max(50, z - 25))}
        >
          −
        </button>
        <span>{zoom}%</span>
        <button
          type="button"
          className="tsc-zoom-btn"
          onClick={() => setZoom((z) => Math.min(200, z + 25))}
        >
          +
        </button>
      </div>
    </div>
  );
}
