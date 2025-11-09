import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCube = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || Math.max(400, window.innerHeight * 0.6);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b122e);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.5, metalness: 0.2 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    let rafId = 0;
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.015;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const newWidth = mount.clientWidth || window.innerWidth;
      const newHeight = mount.clientHeight || Math.max(400, window.innerHeight * 0.6);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '60vh', borderRadius: 12, overflow: 'hidden' }}
    />
  );
};

export default ThreeCube;