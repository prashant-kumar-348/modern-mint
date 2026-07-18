import React, { useMemo, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const D10 = forwardRef(({ onRest, isRolling, ...props }, ref) => {
  // 1. Generate Geometry Data
    const { vertices, faces, textPlacements } = useMemo(() => {
      const r = 1.0;
      const h = 1.05;
      const e = 0.1;
      const v = [];
    
    // Equator vertices
    for (let i = 0; i < 10; i++) {
      const theta = (i * 2 * Math.PI) / 10;
      const y = i % 2 === 0 ? e : -e;
      v.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    // Apex vertices
    v.push(new THREE.Vector3(0, h, 0));  // 10: Top
    v.push(new THREE.Vector3(0, -h, 0)); // 11: Bottom

    const rawVertices = v.map(p => [p.x, p.y, p.z]);
    const rawFaces = [];
    const textPlacements = [];

    const topNumbers = [0, 7, 4, 1, 6];
    const bottomNumbers = [8, 5, 2, 9, 3];
    
    // Create Top Faces
    let topIdx = 0;
    for (let i = 0; i < 10; i += 2) {
      // Triangles for physics (Counter-Clockwise winding order)
      rawFaces.push([10, (i + 1) % 10, i]);
      rawFaces.push([10, i, (i - 1 + 10) % 10]);
      
      const A = v[10];
      const B = v[(i + 1) % 10];
      const C = v[i];
      const edge1 = new THREE.Vector3().subVectors(B, A);
      const edge2 = new THREE.Vector3().subVectors(C, A);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

      // Project center onto the plane defined by A and normal to ensure it's perfectly on the surface
      const rawCenter = new THREE.Vector3()
        .addVectors(v[10], v[i])
        .add(v[(i + 1) % 10])
        .add(v[(i - 1 + 10) % 10])
        .multiplyScalar(0.25);
      
      const distance = new THREE.Vector3().subVectors(rawCenter, A).dot(normal);
      const center = rawCenter.clone().sub(normal.clone().multiplyScalar(distance));
      
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      const up = new THREE.Vector3().subVectors(A, center).projectOnPlane(normal).normalize(); // Point towards Apex A
      const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);
      const angle = currentUp.angleTo(up);
      const cross = currentUp.clone().cross(up);
      if (cross.dot(normal) < 0) quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), -angle));
      else quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), angle));

      textPlacements.push({ pos: center.toArray(), quat: quaternion.toArray(), num: topNumbers[topIdx++] });
    }

    // Create Bottom Faces
    let botIdx = 0;
    for (let i = 1; i < 10; i += 2) {
      // Triangles for physics (Counter-Clockwise winding order)
      rawFaces.push([11, i, (i + 1) % 10]);
      rawFaces.push([11, (i - 1 + 10) % 10, i]);
      
      const A = v[11];
      const B = v[i];
      const C = v[(i + 1) % 10];
      const edge1 = new THREE.Vector3().subVectors(B, A);
      const edge2 = new THREE.Vector3().subVectors(C, A);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
      
      const rawCenter = new THREE.Vector3()
        .addVectors(v[11], v[i])
        .add(v[(i + 1) % 10])
        .add(v[(i - 1 + 10) % 10])
        .multiplyScalar(0.25);

      const distance = new THREE.Vector3().subVectors(rawCenter, A).dot(normal);
      const center = rawCenter.clone().sub(normal.clone().multiplyScalar(distance));
      
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      const up = new THREE.Vector3().subVectors(A, center).projectOnPlane(normal).normalize(); // Point towards Apex A (which is bottom apex)
      const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);
      const angle = currentUp.angleTo(up);
      const cross = currentUp.clone().cross(up);
      if (cross.dot(normal) < 0) quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), -angle));
      else quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), angle));

      textPlacements.push({ pos: center.toArray(), quat: quaternion.toArray(), num: bottomNumbers[botIdx++] });
    }

    return { vertices: rawVertices, faces: rawFaces, textPlacements };
  }, []);

  // 2. Physics Body
  const [bodyRef, api] = useConvexPolyhedron(() => ({
    mass: 1,
    args: [vertices, faces],
    position: [0, 5, 0],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 0.1,
    ...props
  }));

  // 3. Trigger Roll when isRolling changes
  useEffect(() => {
    if (isRolling) {
      console.log("Triggering 3D roll physics!");
      api.wakeUp();
      // Start perfectly centered
      api.position.set(0, 5, 0);
      api.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      // Reset velocities
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      
      // Apply a modest local impulse to cause a tumble, rather than just pushing it off screen
      api.applyLocalImpulse(
         [(Math.random() - 0.5) * 5, -10, (Math.random() - 0.5) * 5], 
         [Math.random(), Math.random(), Math.random()]
      );
      isSleeping.current = false;
    }
  }, [isRolling, api]);

  // 4. Track Sleep State to calculate result
  const isSleeping = useRef(false);
  const velocity = useRef([0,0,0]);
  const angularVelocity = useRef([0,0,0]);

  useEffect(() => {
    const unsubVel = api.velocity.subscribe(v => velocity.current = v);
    const unsubAng = api.angularVelocity.subscribe(v => angularVelocity.current = v);
    
    // Check if stopped every 200ms
    const interval = setInterval(() => {
      const speed = Math.abs(velocity.current[0]) + Math.abs(velocity.current[1]) + Math.abs(velocity.current[2]);
      const angSpeed = Math.abs(angularVelocity.current[0]) + Math.abs(angularVelocity.current[1]) + Math.abs(angularVelocity.current[2]);
      
      if (speed < 0.05 && angSpeed < 0.05 && !isSleeping.current) {
        // It has stopped! Give it a tiny bit of time to settle flat.
        setTimeout(() => {
           if (!bodyRef.current) return;
           isSleeping.current = true;
           
           // Calculate which face is pointing up
           // Since textPlacements have the normals built into their quaternions, we can check which text normal is closest to Vector3(0,1,0)
           const bodyQuat = new THREE.Quaternion().copy(bodyRef.current.quaternion);
           let bestFace = null;
           let maxDot = -Infinity;
           
           textPlacements.forEach(tp => {
              const localQuat = new THREE.Quaternion().fromArray(tp.quat);
              const worldQuat = localQuat.premultiply(bodyQuat);
              const worldNormal = new THREE.Vector3(0,0,1).applyQuaternion(worldQuat);
              const dot = worldNormal.dot(new THREE.Vector3(0, 1, 0));
              if (dot > maxDot) {
                 maxDot = dot;
                 bestFace = tp.num;
              }
           });
           
           if (bestFace !== null && onRest) {
              const finalNumber = bestFace === 0 ? 10 : bestFace;
              onRest(finalNumber);
           }
        }, 500);
      }
    }, 200);

    return () => {
      unsubVel();
      unsubAng();
      clearInterval(interval);
    };
  }, [api, textPlacements, onRest, bodyRef]);

  // Create visual geometry based on vertices/faces
  const geo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    faces.forEach(face => {
      positions.push(...vertices[face[0]]);
      positions.push(...vertices[face[1]]);
      positions.push(...vertices[face[2]]);
    });
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, [vertices, faces]);

  return (
    <mesh ref={bodyRef} geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial 
        color="#0d6568" 
        roughness={0.1} 
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        envMapIntensity={0.8}
        transparent={false}
        opacity={1.0}
        side={THREE.DoubleSide}
      />
      {textPlacements.map((tp, i) => (
        <group key={i} position={tp.pos} quaternion={tp.quat}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.02]} // pushed out just enough
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {tp.num}
          </Text>
        </group>
      ))}
    </mesh>
  );
});

export default D10;
