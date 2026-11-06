import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function GlassCrossCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    // Match hero navy so transmission samples the real environment through the glass
    scene.background = new THREE.Color(0x001525);

    // 2. Camera Setup
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 550;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // 3. Renderer Setup with transparent canvas and ACES tone mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting Cube / Sphere for authentic Glass Surface Reflections
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x00101d);

    const softbox1 = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00f2ff, side: THREE.DoubleSide })
    );
    softbox1.position.set(8, 8, 8);
    softbox1.lookAt(0, 0, 0);
    envScene.add(softbox1);

    const softbox2 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 14),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    softbox2.position.set(-8, 6, 4);
    softbox2.lookAt(0, 0, 0);
    envScene.add(softbox2);

    const softbox3 = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 6),
      new THREE.MeshBasicMaterial({ color: 0x087d91, side: THREE.DoubleSide })
    );
    softbox3.position.set(0, -8, 6);
    softbox3.lookAt(0, 0, 0);
    envScene.add(softbox3);

    const softbox4 = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    softbox4.position.set(3, 9, 3);
    softbox4.lookAt(0, 0, 0);
    envScene.add(softbox4);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRt = pmremGenerator.fromScene(envScene);
    const envMap = envRt.texture;
    scene.environment = envMap;

    // 5. Symmetric, Precision-Bevelled Medical Cross Geometry
    const armW = 0.54;
    const armL = 1.54;
    const r = 0.16;

    const crossShape = new THREE.Shape();
    crossShape.moveTo(armW - r, armL);
    crossShape.quadraticCurveTo(armW, armL, armW, armL - r);
    crossShape.lineTo(armW, armW + r);
    crossShape.quadraticCurveTo(armW, armW, armW + r, armW);
    crossShape.lineTo(armL - r, armW);
    crossShape.quadraticCurveTo(armL, armW, armL, armW - r);
    crossShape.lineTo(armL, -armW + r);
    crossShape.quadraticCurveTo(armL, -armW, armL - r, -armW);
    crossShape.lineTo(armW + r, -armW);
    crossShape.quadraticCurveTo(armW, -armW, armW, -armW - r);
    crossShape.lineTo(armW, -armL + r);
    crossShape.quadraticCurveTo(armW, -armL, armW - r, -armL);
    crossShape.lineTo(-armW + r, -armL);
    crossShape.quadraticCurveTo(-armW, -armL, -armW, -armL + r);
    crossShape.lineTo(-armW, -armW - r);
    crossShape.quadraticCurveTo(-armW, -armW, -armW - r, -armW);
    crossShape.lineTo(-armL + r, -armW);
    crossShape.quadraticCurveTo(-armL, -armW, -armL, -armW + r);
    crossShape.lineTo(-armL, armW - r);
    crossShape.quadraticCurveTo(-armL, armW, -armL + r, armW);
    crossShape.lineTo(-armW - r, armW);
    crossShape.quadraticCurveTo(-armW, armW, -armW, armW + r);
    crossShape.lineTo(-armW, armL - r);
    crossShape.quadraticCurveTo(-armW, armL, -armW + r, armL);
    crossShape.lineTo(armW - r, armL);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 2,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 6,
    };

    const geometry = new THREE.ExtrudeGeometry(crossShape, extrudeSettings);
    geometry.center();

    // 6. TRUE CRYSTAL-GLASS PHYSICALLY BASED MATERIAL
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf0fffe),
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.99,
      thickness: 1.4,
      ior: 1.48,
      reflectivity: 0.9,
      clearcoat: 0.9,
      clearcoatRoughness: 0.03,
      attenuationColor: new THREE.Color(0x00d5e8),
      attenuationDistance: 2.6,
      envMap: envMap,
      envMapIntensity: 1.35,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const crossMesh = new THREE.Mesh(geometry, glassMaterial);

    // 7. LUMINOUS BEVEL EDGES
    const edgesGeom = new THREE.EdgesGeometry(geometry, 24);
    const edgesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x00f7ff),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });
    const edgeLines = new THREE.LineSegments(edgesGeom, edgesMat);

    const softEdgeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x009bb3),
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const softEdgeLines = new THREE.LineSegments(edgesGeom, softEdgeMat);
    softEdgeLines.scale.set(1.006, 1.006, 1.006);

    const crossGroup = new THREE.Group();
    crossGroup.add(crossMesh);
    crossGroup.add(edgeLines);
    crossGroup.add(softEdgeLines);

    crossGroup.rotation.x = 0.22;
    crossGroup.rotation.y = -0.36;
    crossGroup.rotation.z = 0.07;
    scene.add(crossGroup);

    // 8. DIRECTIONAL LIGHTING
    const ambientLight = new THREE.AmbientLight(0x001a2e, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe0faff, 2.4);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const cyanFill = new THREE.DirectionalLight(0x00d5e8, 1.9);
    cyanFill.position.set(-6, -4, 4);
    scene.add(cyanFill);

    const rimLight = new THREE.DirectionalLight(0x00f7ff, 2.8);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    const movingReflectionLight = new THREE.PointLight(0x00f7ff, 2.0, 14);
    movingReflectionLight.position.set(2, 2, 4);
    scene.add(movingReflectionLight);

    // 9. ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        const floatPeriod = 6.4;
        crossGroup.position.y = Math.sin((t / floatPeriod) * Math.PI * 2) * 0.15;

        const rotYPeriod = 14.5;
        const rotZPeriod = 16.5;
        crossGroup.rotation.y = -0.36 + Math.sin((t / rotYPeriod) * Math.PI * 2) * 0.08;
        crossGroup.rotation.z = 0.07 + Math.cos((t / rotZPeriod) * Math.PI * 2) * 0.055;
        crossGroup.rotation.x = 0.22 + Math.sin((t / 18.0) * Math.PI * 2) * 0.035;

        const glowFactor = (Math.sin((t / 3.6) * Math.PI * 2) + 1) * 0.5;
        edgesMat.opacity = 0.70 + glowFactor * 0.28;
        softEdgeMat.opacity = 0.35 + glowFactor * 0.30;

        const sweepAngle = (t / 7.0) * Math.PI * 2;
        movingReflectionLight.position.x = Math.sin(sweepAngle) * 3.4;
        movingReflectionLight.position.y = Math.cos(sweepAngle) * 2.2 + 0.3;
        movingReflectionLight.position.z = 3.2 + Math.sin(sweepAngle * 2) * 0.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      edgesGeom.dispose();
      glassMaterial.dispose();
      edgesMat.dispose();
      softEdgeMat.dispose();
      softbox1.geometry.dispose();
      (softbox1.material as THREE.Material).dispose();
      softbox2.geometry.dispose();
      (softbox2.material as THREE.Material).dispose();
      softbox3.geometry.dispose();
      (softbox3.material as THREE.Material).dispose();
      softbox4.geometry.dispose();
      (softbox4.material as THREE.Material).dispose();
      envMap.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '380px',
        maxHeight: '560px',
      }}
    />
  );
}
