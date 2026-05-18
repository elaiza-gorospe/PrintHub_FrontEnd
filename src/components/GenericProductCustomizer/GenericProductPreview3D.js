import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "../TshirtCustomizer/TshirtCustomizer.css";

const ZONE_FACE = {
  front: "front",
  back: "back",
  left_sleeve: "left",
  right_sleeve: "right",
  front_cover: "front",
  back_cover: "back",
  outside: "front",
  inside: "back",
};

const EMPTY_OBJECT = Object.freeze({});

export default function GenericProductPreview3D({
  modelPath,
  shirtColor = "#ffffff",
  zoneDesigns = EMPTY_OBJECT,
  zoneFaceMap = EMPTY_OBJECT,
  decalScale = EMPTY_OBJECT,
  projectionMode = "decal",
  flatShape = null,
}) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const decalsRef = useRef([]);
  const colorRef = useRef(shirtColor);
  const designsRef = useRef(zoneDesigns);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    colorRef.current = shirtColor;
  }, [shirtColor]);

  useEffect(() => {
    designsRef.current = zoneDesigns;
  }, [zoneDesigns]);

  const clearDecals = useCallback(() => {
    decalsRef.current.forEach((mesh) => {
      mesh.parent?.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material.map) mesh.material.map.dispose();
      mesh.material.dispose();
    });
    decalsRef.current = [];
  }, []);

  const applyBaseColor = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;
    const color = new THREE.Color(colorRef.current);
    model.traverse((node) => {
      if (!node.isMesh) return;
      if (node.geometry.hasAttribute("color")) node.geometry.deleteAttribute("color");
      if (node.material?.map) {
        node.material.map.dispose();
        node.material.map = null;
      }
      if (node.material?.color) {
        node.material.color = color;
        node.material.needsUpdate = true;
      }
    });
  }, []);

  const getTargetMesh = useCallback((model) => {
    let target = null;
    let bestVolume = -Infinity;
    model.traverse((node) => {
      if (!node.isMesh) return;
      const box = new THREE.Box3().setFromObject(node);
      const size = box.getSize(new THREE.Vector3());
      const volume = size.x * size.y * size.z;
      if (volume > bestVolume) {
        bestVolume = volume;
        target = node;
      }
    });
    return target;
  }, []);

  const createFlatModel = useCallback((shapeConfig = {}) => {
    const {
      width = 2.1,
      height = 2.97,
      depth = 0.035,
      radius = 0,
      foldLines = 0,
      hole = false,
    } = shapeConfig;

    let geometry;
    if (radius > 0) {
      geometry = new THREE.CylinderGeometry(width / 2, width / 2, depth, 96);
      geometry.rotateX(Math.PI / 2);
      geometry.scale(1, height / width, 1);
    } else {
      geometry = new THREE.BoxGeometry(width, height, depth);
    }

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorRef.current),
      roughness: 0.72,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const model = new THREE.Group();
    const body = new THREE.Mesh(geometry, material);
    body.name = "flat-print-body";
    model.add(body);

    if (foldLines > 0) {
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x9aa4b2,
        transparent: true,
        opacity: 0.75,
      });
      for (let i = 1; i <= foldLines; i += 1) {
        const x = -width / 2 + (width / (foldLines + 1)) * i;
        const points = [
          new THREE.Vector3(x, -height / 2, depth / 2 + 0.003),
          new THREE.Vector3(x, height / 2, depth / 2 + 0.003),
        ];
        model.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));
      }
    }

    if (hole) {
      const holeGeometry = new THREE.RingGeometry(width * 0.045, width * 0.075, 48);
      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0x1e2433,
        side: THREE.DoubleSide,
      });
      const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);
      holeMesh.position.set(0, height * 0.38, depth / 2 + 0.004);
      model.add(holeMesh);
    }

    return model;
  }, []);

  const getZoneProjectionMode = useCallback(
    (zoneId) =>
      typeof projectionMode === "string"
        ? projectionMode
        : projectionMode[zoneId] || projectionMode.default || "decal",
    [projectionMode],
  );

  const createPlaneOverlay = useCallback(
    ({ face, texture, design, box, size, center, scale }) => {
      const designX = design.x ?? 10;
      const designY = design.y ?? 10;
      const designW = design.w ?? 80;
      const designH = design.h ?? 80;
      const isSide = face === "left" || face === "right";
      const zoneW = (isSide ? size.z : size.x) * (scale.w ?? 0.56);
      const zoneH = size.y * (scale.h ?? 0.5);
      const offsetA = ((designX + designW / 2) / 100 - 0.5) * zoneW;
      const offsetY = (0.5 - (designY + designH / 2) / 100) * zoneH;
      const position = center.clone();
      let rotation = new THREE.Euler(0, 0, 0);
      let width = zoneW * (designW / 100);
      let height = zoneH * (designH / 100);

      if (face === "back") {
        position.z = box.min.z - size.z * (scale.surfaceOffset ?? 0.02);
        position.x += offsetA;
        position.y += offsetY;
        rotation = new THREE.Euler(0, Math.PI, 0);
      } else if (face === "left") {
        position.x = box.min.x - size.x * (scale.surfaceOffset ?? 0.02);
        position.z += offsetA;
        position.y += offsetY;
        rotation = new THREE.Euler(0, -Math.PI / 2, 0);
      } else if (face === "right") {
        position.x = box.max.x + size.x * (scale.surfaceOffset ?? 0.02);
        position.z += offsetA;
        position.y += offsetY;
        rotation = new THREE.Euler(0, Math.PI / 2, 0);
      } else {
        position.z = box.max.z + size.z * (scale.surfaceOffset ?? 0.02);
        position.x += offsetA;
        position.y += offsetY;
      }

      position.x += (scale.x ?? 0) * size.x;
      position.y += (scale.y ?? 0) * size.y;
      position.z += (scale.z ?? 0) * size.z;

      if (isSide) {
        width = zoneW * (designW / 100);
        height = zoneH * (designH / 100);
      }

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.copy(position);
      plane.rotation.copy(rotation);
      return plane;
    },
    [],
  );

  const rebuildDecals = useCallback(() => {
    const model = modelRef.current;
    const scene = sceneRef.current;
    if (!model || !scene) return;

    clearDecals();
    model.updateMatrixWorld(true);
    const target = getTargetMesh(model);
    if (!target) return;
    target.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(target);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    Object.entries(designsRef.current).forEach(([zoneId, design]) => {
      if (!design?.imageUrl) return;
      const face = zoneFaceMap[zoneId] || ZONE_FACE[zoneId] || "front";

      new THREE.TextureLoader()
        .setCrossOrigin("anonymous")
        .load(design.imageUrl, (texture) => {
          if (!modelRef.current || !sceneRef.current) return;
          texture.colorSpace = THREE.SRGBColorSpace;

          const designX = design.x ?? 10;
          const designY = design.y ?? 10;
          const designW = design.w ?? 80;
          const designH = design.h ?? 80;

          const scale = decalScale[zoneId] || {};
          const isSide = face === "left" || face === "right";
          const zoneW = (isSide ? size.z : size.x) * (scale.w ?? 0.56);
          const zoneH = size.y * (scale.h ?? 0.5);
          const offsetA = ((designX + designW / 2) / 100 - 0.5) * zoneW;
          const offsetY = (0.5 - (designY + designH / 2) / 100) * zoneH;

          const position = center.clone();
          let orientation;
          let decalSize;

          if (face === "back") {
            position.z = box.min.z + size.z * (scale.surfaceOffset ?? 0.02);
            position.x += offsetA;
            position.y += offsetY;
            orientation = new THREE.Euler(0, Math.PI, 0);
            decalSize = new THREE.Vector3(
              zoneW * (designW / 100),
              zoneH * (designH / 100),
              Math.max(size.z * (scale.depth ?? 0.22), 0.01),
            );
          } else if (face === "left") {
            position.x = box.min.x + size.x * (scale.surfaceOffset ?? 0.02);
            position.z += offsetA;
            position.y += offsetY;
            orientation = new THREE.Euler(0, Math.PI / 2, 0);
            decalSize = new THREE.Vector3(
              zoneW * (designW / 100),
              zoneH * (designH / 100),
              Math.max(size.x * (scale.depth ?? 0.22), 0.01),
            );
          } else if (face === "right") {
            position.x = box.max.x - size.x * (scale.surfaceOffset ?? 0.02);
            position.z += offsetA;
            position.y += offsetY;
            orientation = new THREE.Euler(0, -Math.PI / 2, 0);
            decalSize = new THREE.Vector3(
              zoneW * (designW / 100),
              zoneH * (designH / 100),
              Math.max(size.x * (scale.depth ?? 0.22), 0.01),
            );
          } else {
            position.z = box.max.z - size.z * (scale.surfaceOffset ?? 0.02);
            position.x += offsetA;
            position.y += offsetY;
            orientation = new THREE.Euler(0, 0, 0);
            decalSize = new THREE.Vector3(
              zoneW * (designW / 100),
              zoneH * (designH / 100),
              Math.max(size.z * (scale.depth ?? 0.22), 0.01),
            );
          }

          let geometry = null;
          let decal = null;
          const mode = getZoneProjectionMode(zoneId);
          if (mode !== "plane") {
            geometry = new DecalGeometry(target, position, orientation, decalSize);
          }
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
          });
          if (mode === "plane" || !geometry?.attributes?.position?.count) {
            geometry?.dispose();
            material.dispose();
            decal = createPlaneOverlay({
              face,
              texture,
              design,
              box,
              size,
              center,
              scale,
            });
          } else {
            decal = new THREE.Mesh(geometry, material);
          }
          scene.add(decal);
          decalsRef.current.push(decal);
        });
    });
  }, [clearDecals, createPlaneOverlay, getTargetMesh, getZoneProjectionMode, decalScale, zoneFaceMap]);

  useEffect(() => {
    if (!mountRef.current || (!modelPath && !flatShape)) return;

    setReady(false);
    setError("");
    const container = mountRef.current;
    const width = container.offsetWidth || 260;
    const height = container.offsetHeight || 340;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1e2433);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    const fitCameraToModel = (model) => {
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const dist = (maxDim / 2 / Math.tan(fov / 2)) * 2;
      camera.position.set(center.x, center.y, center.z + dist);
      camera.near = dist / 100;
      camera.far = dist * 100;
      camera.updateProjectionMatrix();
      controls.target.copy(center);
      controls.update();
    };

    if (flatShape) {
      const model = createFlatModel(flatShape);
      modelRef.current = model;
      scene.add(model);
      applyBaseColor();
      rebuildDecals();
      fitCameraToModel(model);
      setReady(true);
    } else {
      new GLTFLoader().load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          modelRef.current = model;
          scene.add(model);
          applyBaseColor();
          rebuildDecals();
          fitCameraToModel(model);
          setReady(true);
        },
        undefined,
        () => setError(`Failed to load 3D model: ${modelPath}`),
      );
    }

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nextWidth = container.offsetWidth || 260;
      const nextHeight = container.offsetHeight || 340;
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
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
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      clearDecals();
      if (modelRef.current) {
        modelRef.current.traverse((node) => {
          if (!node.isMesh) return;
          node.geometry?.dispose();
          (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) =>
            m?.dispose(),
          );
        });
      }
      modelRef.current = null;
      sceneRef.current = null;
    };
  }, [applyBaseColor, clearDecals, createFlatModel, flatShape, modelPath, rebuildDecals]);

  useEffect(() => {
    if (!modelRef.current) return;
    applyBaseColor();
    rebuildDecals();
  }, [applyBaseColor, rebuildDecals, shirtColor]);

  useEffect(() => {
    if (ready) rebuildDecals();
  }, [ready, rebuildDecals, zoneDesigns]);

  return (
    <div>
      <div className="tsc-preview-3d" ref={mountRef}>
        {!ready && !error && (
          <div className="tsc-preview-loading">
            <span className="tsc-spinner" />
            <span>Loading 3D preview...</span>
          </div>
        )}
        {error && <div className="tsc-preview-error">{error}</div>}
      </div>
      <div className="tsc-zoom-row">
        <button type="button" className="tsc-zoom-btn" onClick={() => setZoom((z) => Math.max(50, z - 25))}>
          -
        </button>
        <span>{zoom}%</span>
        <button type="button" className="tsc-zoom-btn" onClick={() => setZoom((z) => Math.min(200, z + 25))}>
          +
        </button>
      </div>
    </div>
  );
}
