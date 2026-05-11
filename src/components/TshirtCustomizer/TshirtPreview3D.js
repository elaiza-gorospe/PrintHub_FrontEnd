/**
 * TshirtPreview3D
 * THREE.js viewer that loads a GLB t-shirt model and applies a color tint
 * to all MeshStandardMaterial meshes.
 *
 * Props:
 *   modelPath  {string}  – URL of the GLB file, e.g. "/models/tshirt.glb"
 *   shirtColor {string}  – hex color string, e.g. "#ffffff"
 */
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./TshirtCustomizer.css";

export default function TshirtPreview3D({ modelPath, shirtColor = "#ffffff" }) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);

  // ── Set up scene once ─────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current || !modelPath) return;

    setLoading(true);
    setError("");

    const container = mountRef.current;
    const width = container.offsetWidth || container.clientWidth || 260;
    const height = container.offsetHeight || container.clientHeight || 280;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e2433);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3;

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        scene.add(model);

        // Apply initial color
        applyColor(model, shirtColor);

        // Auto-fit camera
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = (maxDim / 2 / Math.tan(fov / 2)) * 1.5;
        camera.position.z = cameraZ;
        controls.target.copy(box.getCenter(new THREE.Vector3()));
        controls.update();

        setLoading(false);
      },
      undefined,
      (err) => {
        console.warn("GLB load failed:", err);
        setError(
          "Failed to load 3D model. Place tshirt.glb in public/models/.",
        );
        setLoading(false);
      },
    );

    let rafId = null;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.offsetWidth || container.clientWidth || 260;
      const h = container.offsetHeight || container.clientHeight || 280;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Also observe container size changes (handles flex/grid layout settling)
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (modelRef.current) {
        modelRef.current.traverse((node) => {
          if (node.isMesh) {
            node.geometry?.dispose();
            if (node.material) {
              if (Array.isArray(node.material)) {
                node.material.forEach((m) => m.dispose());
              } else {
                node.material.dispose();
              }
            }
          }
        });
        modelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]);

  // ── Re-apply color when shirtColor changes ────────────────────────
  useEffect(() => {
    if (modelRef.current) {
      applyColor(modelRef.current, shirtColor);
      // Force re-render by flagging renderer needs update
      if (rendererRef.current) rendererRef.current.needsUpdate = true;
    }
  }, [shirtColor]);

  return (
    <div>
      <div className="tsc-preview-3d" ref={mountRef}>
        {loading && (
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
        {!loading && error && <div className="tsc-preview-error">{error}</div>}
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
        if (
          mat &&
          (mat.isMeshStandardMaterial ||
            mat.isMeshPhongMaterial ||
            mat.isMeshBasicMaterial)
        ) {
          mat.color.set(color);
          mat.needsUpdate = true;
        }
      });
    }
  });
}
