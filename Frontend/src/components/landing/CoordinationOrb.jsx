import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

/**
 * TUNING CONFIG: CoordinationOrb (§4.2)
 * All measured coordinates and speeds:
 * - Center: (49.7vw, 60vh)
 * - Diameter: ~27vw (approx 64vh)
 * - Sphere axis tilt: ~18° Z, ~12° X
 * - Orbit ring: 1.9x sphere diameter (~51vw long), tilted -23° Z
 * - Colors: Electric indigo #5a3cf0, PULSE red #f5452c for alert nodes
 * - Idle rotation: ~140s per revolution
 */
const ORB_CONFIG = {
  center: { x: '50%', y: '50%' },
  orbitAngleDeg: -23,
  axisTiltZDeg: 18,
  axisTiltXDeg: 12,
  indigoColor: '#5a3cf0',
  pulseColor: '#f5452c',
  ringScale: 1.8,
  ringSemiMinorFactor: 0.22,
};

export function CoordinationOrb({ scrollRotation = 0 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const shouldReduceMotion = useReducedMotionSafe();
  const [hasWebGL, setHasWebGL] = useState(true);

  // Sector labels inside globe bounds (§4) - only ENTRY GATE and FOOD ZONE, aria-hidden
  const sectorLabels = [
    { label: 'ENTRY GATE', x: '24%', y: '36%', isRed: true },
    { label: 'FOOD ZONE', x: '62%', y: '64%', isRed: true },
  ];

  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 4.2;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();
    window.addEventListener('resize', resize);

    // Master Globe Group with tilt
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = THREE.MathUtils.degToRad(ORB_CONFIG.axisTiltZDeg);
    globeGroup.rotation.x = THREE.MathUtils.degToRad(ORB_CONFIG.axisTiltXDeg);
    scene.add(globeGroup);

    // Line material in electric indigo (#5a3cf0) - quiet backdrop alpha (§4)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x5a3cf0,
      transparent: true,
      opacity: 0.22,
    });

    const faintLineMaterial = new THREE.LineBasicMaterial({
      color: 0x5a3cf0,
      transparent: true,
      opacity: 0.14,
    });

    const R = 1.05;
    const SEGMENTS = 96;

    // Parallels (4-5 horizontal ellipses)
    const parallelsY = [-0.75, -0.4, 0, 0.4, 0.75];
    parallelsY.forEach((yFrac, idx) => {
      const y = yFrac * R;
      const r = Math.sqrt(Math.max(0, R * R - y * y));
      const points = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const theta = (i / SEGMENTS) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(geom, idx === 2 ? lineMaterial : faintLineMaterial);
      globeGroup.add(line);
    });

    // Meridians (6-7 vertical longitude ellipses)
    const MERIDIAN_COUNT = 7;
    for (let m = 0; m < MERIDIAN_COUNT; m++) {
      const phi = (m / MERIDIAN_COUNT) * Math.PI;
      const points = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const theta = (i / SEGMENTS) * Math.PI * 2;
        const x = R * Math.cos(theta) * Math.cos(phi);
        const y = R * Math.sin(theta);
        const z = R * Math.cos(theta) * Math.sin(phi);
        points.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(geom, faintLineMaterial);
      globeGroup.add(line);
    }

    // Extended Orbit Ring Group (tilted -23° rising right)
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.z = THREE.MathUtils.degToRad(ORB_CONFIG.orbitAngleDeg);
    scene.add(orbitGroup);

    const orbitA = R * ORB_CONFIG.ringScale;
    const orbitB = orbitA * ORB_CONFIG.ringSemiMinorFactor;
    const orbitPoints = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const theta = (i / SEGMENTS) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(theta) * orbitA, Math.sin(theta) * orbitB, 0));
    }
    const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x7c5cfc,
      transparent: true,
      opacity: 0.22,
    });
    const orbitLine = new THREE.LineLoop(orbitGeom, orbitMaterial);
    orbitGroup.add(orbitLine);

    // Traveling Nodes (4-6 nodes along ring and meridians)
    const nodeGeom = new THREE.SphereGeometry(0.024, 12, 12);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xf5452c });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const indigoMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });

    const nodes = [
      { mesh: new THREE.Mesh(nodeGeom, redMat), speed: 0.08, offset: 0, orbit: true },
      { mesh: new THREE.Mesh(nodeGeom, whiteMat), speed: 0.05, offset: 2.5, orbit: true },
      { mesh: new THREE.Mesh(nodeGeom, redMat), speed: 0.07, offset: 4.8, orbit: true },
      { mesh: new THREE.Mesh(nodeGeom, indigoMat), speed: 0.06, offset: 1.2, meridian: 2 },
      { mesh: new THREE.Mesh(nodeGeom, whiteMat), speed: 0.04, offset: 3.4, meridian: 5 },
    ];

    nodes.forEach((n) => {
      if (n.orbit) orbitGroup.add(n.mesh);
      else globeGroup.add(n.mesh);
    });

    // Visibility Observer to pause when scrolled off-screen (§5.7)
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow idle rotation (~140s per rev) + scroll linked
      globeGroup.rotation.y = elapsed * 0.045 + scrollRotation * 0.8;

      // Update traveling nodes
      nodes.forEach((n) => {
        const t = elapsed * n.speed + n.offset;
        if (n.orbit) {
          n.mesh.position.x = Math.cos(t) * orbitA;
          n.mesh.position.y = Math.sin(t) * orbitB;
          n.mesh.position.z = 0;
        } else {
          const phi = (n.meridian / MERIDIAN_COUNT) * Math.PI;
          n.mesh.position.x = R * Math.cos(t) * Math.cos(phi);
          n.mesh.position.y = R * Math.sin(t);
          n.mesh.position.z = R * Math.cos(t) * Math.sin(phi);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
      renderer.dispose();
      lineMaterial.dispose();
      faintLineMaterial.dispose();
      orbitMaterial.dispose();
      redMat.dispose();
      whiteMat.dispose();
      indigoMat.dispose();
      nodeGeom.dispose();
    };
  }, [shouldReduceMotion, scrollRotation]);

  return (
    <div
      ref={containerRef}
      id="coordination-orb-container"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(340px, 48vh, 520px)',
        height: 'clamp(340px, 48vh, 520px)',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      {hasWebGL && !shouldReduceMotion ? (
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      ) : (
        /* Static SVG Fallback (§4.2, §11) */
        <svg
          viewBox="0 0 600 600"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <g transform="translate(300, 300) rotate(18)">
            {/* Parallels */}
            <ellipse rx="190" ry="42" fill="none" stroke="#5a3cf0" strokeWidth="1" opacity="0.4" />
            <ellipse rx="170" ry="34" cy="-70" fill="none" stroke="#5a3cf0" strokeWidth="0.8" opacity="0.3" />
            <ellipse rx="170" ry="34" cy="70" fill="none" stroke="#5a3cf0" strokeWidth="0.8" opacity="0.3" />
            <ellipse rx="110" ry="20" cy="-130" fill="none" stroke="#5a3cf0" strokeWidth="0.7" opacity="0.25" />
            <ellipse rx="110" ry="20" cy="130" fill="none" stroke="#5a3cf0" strokeWidth="0.7" opacity="0.25" />
            {/* Meridians */}
            <ellipse rx="60" ry="190" fill="none" stroke="#5a3cf0" strokeWidth="0.8" opacity="0.3" />
            <ellipse rx="130" ry="190" fill="none" stroke="#5a3cf0" strokeWidth="0.8" opacity="0.3" />
            <circle r="190" fill="none" stroke="#5a3cf0" strokeWidth="1.2" opacity="0.45" />
          </g>
          {/* Extended Orbit Ring */}
          <g transform="translate(300, 300) rotate(-23)">
            <ellipse rx="360" ry="76" fill="none" stroke="#6e52f8" strokeWidth="1.2" opacity="0.38" />
            <circle cx="200" cy="50" r="3.5" fill="#f5452c" />
            <circle cx="-160" cy="-55" r="3" fill="#ffffff" opacity="0.9" />
          </g>
        </svg>
      )}

      {/* Atmospheric Sector Labels (§4) - inside globe bounds, >= 3:1 contrast */}
      {sectorLabels.map((item, idx) => (
        <div
          key={idx}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: 0.75,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '9.5px',
            fontWeight: 600,
            color: '#e2e8f0',
            letterSpacing: '0.14em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          <span
            style={{
              width: '4.5px',
              height: '4.5px',
              borderRadius: '50%',
              backgroundColor: item.isRed ? '#f5452c' : '#c7d2fe',
              boxShadow: item.isRed ? '0 0 6px #f5452c' : '0 0 4px #818cf8',
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default CoordinationOrb;
