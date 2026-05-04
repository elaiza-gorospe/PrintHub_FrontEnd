import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { buildApiUrl } from "../../config/api";
import "./AIBuilder.css";

export default function AIBuilder3DPreview({ designImage, prompt }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [model3D, setModel3D] = useState(null);

  // Generate 3D model from prompt via backend Shap-E
  useEffect(() => {
    if (!prompt) return;

    setLoading(true);
    setError("");
    setModel3D(null);

    const generateModel = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/builder/generate-3d"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Server error: ${response.statusText}`,
          );
        }

        const blob = await response.blob();
        const glbUrl = URL.createObjectURL(blob);
        setModel3D(glbUrl);
      } catch (err) {
        setError(err.message || "Failed to generate 3D model");
        console.error("3D generation error:", err);
      } finally {
        setLoading(false);
      }
    };

    generateModel();
  }, [prompt]);

  // Render 3D model in three.js
  useEffect(() => {
    if (!model3D || !mountRef.current) return undefined;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 4;

    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      model3D,
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        // Auto-scale model to fit in view
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);
        model.position.sub(
          box.getCenter(new THREE.Vector3()).multiplyScalar(scale),
        );
      },
      undefined,
      (err) => {
        console.warn("GLTFLoader failed:", err);
        setError("Failed to load 3D model");
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
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      controls.dispose();
      if (model) {
        model.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      if (model3D) URL.revokeObjectURL(model3D);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [model3D]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "20px 30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              margin: "0 auto 12px",
              border: "3px solid #ddd",
              borderTop: "3px solid #455073",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ fontSize: "13px", color: "#455073" }}>
            Generating 3D model…
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.95)",
            padding: "20px 30px",
            borderRadius: "8px",
            color: "#c0392b",
            fontSize: "13px",
            maxWidth: "300px",
          }}
        >
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="aib-3d-canvas"
        ref={mountRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
