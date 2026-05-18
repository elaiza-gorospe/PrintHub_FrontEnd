import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./TshirtCustomizer.css";

const FRONT_BODY_MESH = "Material1718";
const BACK_BODY_MESH = "Material1722";
const SLEEVE_MESH_NAMES = new Set(["Material1724"]);

// UV regions on the shirt texture atlas. Applying these only to the matching
// mesh group keeps artwork wrapped to the shirt without bleeding to sleeves.
const BODY_ZONES = {
  front: { meshName: FRONT_BODY_MESH, uMin: 0.25, uMax: 0.75, vMin: 0.3, vMax: 0.7 },
  back: { meshName: BACK_BODY_MESH, uMin: 0.25, uMax: 0.75, vMin: 0.3, vMax: 0.7 },
};

const SLEEVE_DECALS = {
  left_sleeve: {
    side: -1,
    ry: Math.PI / 2,
    sw: 0.18,
    sh: 0.16,
    y: 0.05,
    z: 0.02,
    depth: 0.2,
  },
  right_sleeve: {
    side: 1,
    ry: -Math.PI / 2,
    sw: 0.18,
    sh: 0.16,
    y: 0.05,
    z: 0.02,
    depth: 0.2,
  },
};

export default function TshirtPreview3D({
  modelPath,
  shirtColor = "#ffffff",
  zoneDesigns = {},
}) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
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
  const clearDecals = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;
    meshesRef.current.forEach((m) => {
      m.parent?.remove(m);
      m.geometry.dispose();
      if (m.material.map) m.material.map.dispose();
      m.material.dispose();
    });
    meshesRef.current = [];
  }, []);

  const updateZoneTextures = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;

    Object.entries(BODY_ZONES).forEach(([zoneId, uv]) => {
      const design = designsRef.current[zoneId];
      const target = model.getObjectByName(uv.meshName);
      if (!target?.material) return;

      if (!design?.imageUrl) {
        if (target.material.map) {
          target.material.map.dispose();
          target.material.map = null;
        }
        target.material.userData.isZoneTexture = false;
        target.material.color = new THREE.Color(shirtColorRef.current);
        target.material.needsUpdate = true;
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = shirtColorRef.current;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        if (!modelRef.current) return;
        const x = uv.uMin * canvas.width;
        const y = uv.vMin * canvas.height;
        const w = (uv.uMax - uv.uMin) * canvas.width;
        const h = (uv.vMax - uv.vMin) * canvas.height;
        const designX = design.x ?? 10;
        const designY = design.y ?? 10;
        const designW = design.w ?? 80;
        const designH = design.h ?? 80;

        ctx.drawImage(
          img,
          x + (designX / 100) * w,
          y + (designY / 100) * h,
          (designW / 100) * w,
          (designH / 100) * h,
        );

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        if (target.material.map) target.material.map.dispose();
        target.material.map = texture;
        target.material.userData.isZoneTexture = true;
        target.material.color = new THREE.Color("#ffffff");
        target.material.needsUpdate = true;
      };
      img.src = design.imageUrl;
    });
  }, []);

  const rebuildSleeveDecals = useCallback(() => {
    const model = modelRef.current;
    const scene = sceneRef.current;
    if (!model || !scene) return;

    clearDecals();
    model.updateMatrixWorld(true);
    const sleeveMesh = Array.from(SLEEVE_MESH_NAMES)
      .map((name) => model.getObjectByName(name))
      .find(Boolean);
    if (!sleeveMesh) return;
    sleeveMesh.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(sleeveMesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    Object.entries(SLEEVE_DECALS).forEach(([zoneId, cfg]) => {
      const design = designsRef.current[zoneId];
      if (!design?.imageUrl) return;

      new THREE.TextureLoader()
        .setCrossOrigin("anonymous")
        .load(design.imageUrl, (tex) => {
          if (!modelRef.current) return;
          tex.colorSpace = THREE.SRGBColorSpace;

          const designX = design.x ?? 10;
          const designY = design.y ?? 10;
          const designW = design.w ?? 80;
          const designH = design.h ?? 80;
          const zoneW = size.z * cfg.sw;
          const zoneH = size.y * cfg.sh;
          const offsetZ = ((designX + designW / 2) / 100 - 0.5) * zoneW;
          const offsetY = (0.5 - (designY + designH / 2) / 100) * zoneH;
          const position = new THREE.Vector3(
            cfg.side > 0 ? box.max.x - 1 : box.min.x + 1,
            center.y + size.y * cfg.y + offsetY,
            center.z + size.z * cfg.z + offsetZ,
          );
          const orientation = new THREE.Euler(0, cfg.ry, 0);
          const decalSize = new THREE.Vector3(
            zoneW * (designW / 100),
            zoneH * (designH / 100),
            size.x * cfg.depth,
          );
          const geometry = new DecalGeometry(
            sleeveMesh,
            position,
            orientation,
            decalSize,
          );
          const material = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.userData.isDesignDecal = true;
          scene.add(mesh);
          meshesRef.current.push(mesh);
        });
    });
  }, [clearDecals]);

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
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1e2433);

    const camera = new THREE.PerspectiveCamera(45, w0 / h0, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 0, 3);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2.5;

    new GLTFLoader().load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        model.rotation.y = 5; // face front on load
        scene.add(model);

        applyColor(model, shirtColorRef.current);
        updateZoneTextures();
        rebuildSleeveDecals();

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

        setReady(true);
      },
      undefined,
      (err) => {
        console.warn("GLB load failed:", err);
        setError(
          "Failed to load 3D model. Place shirt.glb in public/models/.",
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
        m.parent?.remove(m);
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
      sceneRef.current = null;
      cameraRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]);

  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.zoom = zoom / 100;
    cameraRef.current.updateProjectionMatrix();
  }, [zoom]);

  // ── Recolor shirt when shirtColor changes ─────────────────────────
  useEffect(() => {
    if (modelRef.current) {
      applyColor(modelRef.current, shirtColor);
      updateZoneTextures();
      rebuildSleeveDecals();
    }
  }, [shirtColor, updateZoneTextures, rebuildSleeveDecals]);

  // ── Rebuild planes when model is ready OR when designs change ─────
  useEffect(() => {
    if (ready) {
      updateZoneTextures();
      rebuildSleeveDecals();
    }
  }, [ready, zoneDesigns, updateZoneTextures, rebuildSleeveDecals]);

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
    if (node.isMesh && !node.userData?.isDesignDecal) {
      // Strip vertex colors from geometry
      if (node.geometry.hasAttribute("color")) {
        node.geometry.deleteAttribute("color");
      }

      // Only update color, don't recreate the whole material
      if (node.material) {
        if (node.material.map && !node.material.userData?.isZoneTexture) {
          node.material.map.dispose();
          node.material.map = null;
        }
        node.material.color = node.material.userData?.isZoneTexture
          ? new THREE.Color("#ffffff")
          : color;
        node.material.needsUpdate = true;
      }
    }
  });
}
