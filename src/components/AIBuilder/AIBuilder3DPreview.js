import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./AIBuilder.css";

export default function AIBuilder3DPreview({ designImage }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!designImage || !mountRef.current) return undefined;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    const loader = new THREE.TextureLoader();

    // Use a plane with the design as texture
    const geometry = new THREE.PlaneGeometry(1.6, 1.6);
    let material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    let mesh = null;

    let activeTexture = null;
    loader.load(
      designImage,
      (tex) => {
        activeTexture = tex;
        // Avoid referencing sRGBEncoding directly to prevent bundler named-export errors
        tex.flipY = true;
        material = new THREE.MeshStandardMaterial({
          map: tex,
          side: THREE.DoubleSide,
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        // scale to fit aspect of texture
        const imageAspect =
          tex.image && tex.image.width && tex.image.height
            ? tex.image.width / tex.image.height
            : 1;
        mesh.scale.set(imageAspect, 1, 1);
      },
      undefined,
      (err) => {
        // ignore texture load errors
        console.warn("AIBuilder3DPreview texture load failed", err);
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
      if (mesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
      if (activeTexture) activeTexture.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [designImage]);

  return (
    <div
      className="aib-3d-canvas"
      ref={mountRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
