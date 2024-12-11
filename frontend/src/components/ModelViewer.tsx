"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type ModelViewerProps = {
  modelUrl: string | null;
};

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    animateId?: number;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current || !modelUrl) return;

    // If scene already exists, clean up first
    if (sceneRef.current) {
      const { scene, renderer, controls, animateId } = sceneRef.current;
      
      if (animateId) {
        cancelAnimationFrame(animateId);
      }
      
      // Remove existing children
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      
      renderer.dispose();
    }

    // Setup Three.js scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff, 1.0);

    // Append renderer to DOM
    const { clientWidth, clientHeight } = mountRef.current;
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting and controls
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    camera.position.set(0, 0, 5);
    controls.update();

    // Load model
    let loadedModel: THREE.Group | null = null;
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.scale.set(2, 2, 2);

        // Check materials and add default if necessary
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (!child.material) {
              child.material = new THREE.MeshStandardMaterial({ color: 0x888888 });
            }
          }
        });

        scene.add(loadedModel);
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

    // Animation loop
    const animate = () => {
      const animateId = requestAnimationFrame(animate);
      if (loadedModel) loadedModel.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);

      // Store reference for potential cleanup
      if (sceneRef.current) {
        sceneRef.current.animateId = animateId;
      }
    };
    animate();

    // Resize handling
    const handleResize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current;
        renderer.setSize(clientWidth, clientHeight);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener("resize", handleResize);

    // Store scene references for potential cleanup
    sceneRef.current = { scene, camera, renderer, controls };

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current) {
        const { scene, renderer, controls, animateId } = sceneRef.current;

        // Cancel animation frame
        if (animateId) {
          cancelAnimationFrame(animateId);
        }

        // Dispose of all scene children
        while (scene.children.length > 0) {
          const child = scene.children[0];
          scene.remove(child);

          // Dispose of geometries and materials
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            
            const material = child.material;
            if (Array.isArray(material)) {
              material.forEach((mat) => mat.dispose());
            } else {
              material.dispose();
            }
          }
        }

        // Dispose of renderer and controls
        renderer.dispose();
        controls.dispose();
      }

      // Clear the mount ref
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }

      // Reset scene reference
      sceneRef.current = null;
    };
  }, [modelUrl]); // Only re-run when modelUrl changes

  // Render nothing if no modelUrl
  if (!modelUrl) return null;

  return <div ref={mountRef} className="w-full h-full" />;
};

export default React.memo(ModelViewer);
