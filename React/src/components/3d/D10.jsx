import React, { useMemo, forwardRef, useRef, useEffect } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const D10 = forwardRef(({ onRest, isRolling, serverRoll, ...props }, ref) => {
  // 1. Generate Geometry Data (Pentagonal Bipyramid D10 with 10 Triangular Faces)
  const { vertices, faces, textPlacements } = useMemo(() => {
    const r = 1.1; // radius
    const h = 1.25; // height to apex
    const v = [];
    
    // Equator vertices (5 vertices at y = 0)
    for (let i = 0; i < 5; i++) {
      const theta = (i * 2 * Math.PI) / 5;
      v.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
    }
    // Apex vertices
    v.push(new THREE.Vector3(0, h, 0));  // 5: Top Apex
    v.push(new THREE.Vector3(0, -h, 0)); // 6: Bottom Apex

    const rawVertices = v.map(p => [p.x, p.y, p.z]);
    const rawFaces = [];
    const textPlacements = [];

    // 0 to 9 numbers (0 is treated as 10 in the game)
    const topNumbers = [8, 1, 4, 6, 2];
    const bottomNumbers = [3, 0, 5, 7, 9];
    
    // Create Top Faces (5 faces)
    let topIdx = 0;
    for (let i = 0; i < 5; i++) {
      const next = (i + 1) % 5;
      // CCW winding order: Apex, next, i
      rawFaces.push([5, next, i]);
      
      const A = v[5];
      const B = v[next];
      const C = v[i];
      const edge1 = new THREE.Vector3().subVectors(B, A);
      const edge2 = new THREE.Vector3().subVectors(C, A);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

      // Centroid of the triangle
      const center = new THREE.Vector3()
        .addVectors(A, B)
        .add(C)
        .multiplyScalar(1 / 3);

      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      textPlacements.push({ pos: center.toArray(), quat: quaternion.toArray(), num: topNumbers[topIdx++] });
    }

    // Create Bottom Faces (5 faces)
    let botIdx = 0;
    for (let i = 0; i < 5; i++) {
      const next = (i + 1) % 5;
      // CCW winding order: Bottom Apex, i, next
      rawFaces.push([6, i, next]);
      
      const A = v[6];
      const B = v[i];
      const C = v[next];
      const edge1 = new THREE.Vector3().subVectors(B, A);
      const edge2 = new THREE.Vector3().subVectors(C, A);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
      
      const center = new THREE.Vector3()
        .addVectors(A, B)
        .add(C)
        .multiplyScalar(1 / 3);

      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

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

  // Create visual geometry based on vertices/faces with soft blended normals for rounded corners
  const geo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    
    // Calculate face normals
    const faceNormals = [];
    const faceVertices = [];
    faces.forEach(face => {
      const A = vertices[face[0]];
      const B = vertices[face[1]];
      const C = vertices[face[2]];
      const vA = new THREE.Vector3(...A);
      const vB = new THREE.Vector3(...B);
      const vC = new THREE.Vector3(...C);
      const edge1 = new THREE.Vector3().subVectors(vB, vA);
      const edge2 = new THREE.Vector3().subVectors(vC, vA);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
      faceNormals.push(normal);
      faceVertices.push([face[0], face[1], face[2]]);
    });

    // Calculate shared vertex normals for interpolation (softens the edges)
    const vertexNormalsShared = Array(vertices.length).fill(null).map(() => new THREE.Vector3());
    faceVertices.forEach((fVerts, fIdx) => {
      const normal = faceNormals[fIdx];
      vertexNormalsShared[fVerts[0]].add(normal);
      vertexNormalsShared[fVerts[1]].add(normal);
      vertexNormalsShared[fVerts[2]].add(normal);
    });
    vertexNormalsShared.forEach(vn => vn.normalize());

    // Build position and blended normal buffers
    const positions = [];
    const normals = [];
    
    faces.forEach((face, fIdx) => {
      const fNormal = faceNormals[fIdx];
      
      face.forEach(vIdx => {
        const v = vertices[vIdx];
        positions.push(...v);
        
        // Blend face normal (35%) and shared vertex normal (65%) to simulate very smooth rounded corners
        const sharedNormal = vertexNormalsShared[vIdx];
        const blendedNormal = new THREE.Vector3()
          .addScaledVector(fNormal, 0.35)
          .addScaledVector(sharedNormal, 0.65)
          .normalize();
          
        normals.push(blendedNormal.x, blendedNormal.y, blendedNormal.z);
      });
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    
    // Generate UVs for marble texture mapping
    const uvs = [];
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i+1];
      const z = positions[i+2];
      const vec = new THREE.Vector3(x, y, z).normalize();
      const u = 0.5 + Math.atan2(vec.z, vec.x) / (2 * Math.PI);
      const v = 0.5 + Math.asin(vec.y) / Math.PI;
      uvs.push(u, v);
    }
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    return geometry;
  }, [vertices, faces]);

  const marbleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fill base dark teal
    ctx.fillStyle = '#053f44';
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw soft marbled clouds (Radial Gradients)
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 35 + Math.random() * 95;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      const r = Math.random();
      if (r < 0.25) {
        grad.addColorStop(0, 'rgba(168, 238, 218, 0.25)'); // Light pearlescent mint
      } else if (r < 0.5) {
        grad.addColorStop(0, 'rgba(2, 28, 30, 0.55)');    // Deep dark teal vein
      } else if (r < 0.75) {
        grad.addColorStop(0, 'rgba(13, 137, 148, 0.45)');   // Vibrant turquoise
      } else {
        grad.addColorStop(0, 'rgba(6, 88, 96, 0.55)');     // Mid teal
      }
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add diagonal pearlescent shimmer bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const w = 25 + Math.random() * 75;
      const offset = (Math.random() - 0.5) * 220;
      ctx.moveTo(-100 + offset, -100);
      ctx.lineTo(-100 + w + offset, -100);
      ctx.lineTo(612 + w + offset, 612);
      ctx.lineTo(612 + offset, 612);
      ctx.closePath();
      ctx.fill();
    }

    // Draw fine wiggly white lines (cracks/veins)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 90;
        y += (Math.random() - 0.5) * 90;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Update text placements to point toward the top apex for consistent, readable orientation
  const orientedPlacements = useMemo(() => {
    return textPlacements.map(tp => {
      const posVec = new THREE.Vector3(...tp.pos);
      const normalVec = new THREE.Vector3(0, 0, 1).applyQuaternion(new THREE.Quaternion().fromArray(tp.quat));
      
      // Calculate rotation pointing toward the top apex (vertices[5])
      const topApex = new THREE.Vector3(0, 1.25, 0);
      const upDir = new THREE.Vector3().subVectors(topApex, posVec).projectOnPlane(normalVec).normalize();
      
      const newQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec);
      const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(newQuat);
      const angle = currentUp.angleTo(upDir);
      const cross = currentUp.clone().cross(upDir);
      
      if (cross.dot(normalVec) < 0) {
        newQuat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle));
      } else {
        newQuat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle));
      }

      return {
        ...tp,
        quat: newQuat.toArray()
      };
    });
  }, [textPlacements]);

  const hasAligned = useRef(false);
  const isSleeping = useRef(false);
  const velocity = useRef([0,0,0]);
  const angularVelocity = useRef([0,0,0]);

  // 3. Trigger Roll when isRolling changes
  useEffect(() => {
    if (isRolling) {
      console.log("Triggering 3D roll physics!");
      hasAligned.current = false;
      api.wakeUp();
      api.position.set(0, 5, 0);
      api.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      
      api.applyLocalImpulse(
         [(Math.random() - 0.5) * 5, -10, (Math.random() - 0.5) * 5], 
         [Math.random(), Math.random(), Math.random()]
      );
      isSleeping.current = false;
    }
  }, [isRolling, api]);

  // 4. Track Sleep State to calculate result
  useEffect(() => {
    const unsubVel = api.velocity.subscribe(v => velocity.current = v);
    const unsubAng = api.angularVelocity.subscribe(v => angularVelocity.current = v);
    
    const interval = setInterval(() => {
      const speed = Math.abs(velocity.current[0]) + Math.abs(velocity.current[1]) + Math.abs(velocity.current[2]);
      const angSpeed = Math.abs(angularVelocity.current[0]) + Math.abs(angularVelocity.current[1]) + Math.abs(angularVelocity.current[2]);
      
      // Force alignment when die is settling (speed < 0.08) so it visualizes the server roll perfectly
      if (speed < 0.08 && angSpeed < 0.08 && !isSleeping.current && !hasAligned.current) {
        hasAligned.current = true;
        if (serverRoll !== null) {
          const targetNum = serverRoll === 10 ? 0 : serverRoll;
          const targetPlacement = orientedPlacements.find(tp => tp.num === targetNum);
          
          if (targetPlacement) {
            const localQuat = new THREE.Quaternion().fromArray(targetPlacement.quat);
            const localNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(localQuat);
            
            const qAlign = new THREE.Quaternion().setFromUnitVectors(localNormal, new THREE.Vector3(0, 1, 0));
            const randomYAngle = Math.random() * Math.PI * 2;
            const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYAngle);
            const targetBodyQuat = qY.multiply(qAlign);
            
            api.quaternion.set(targetBodyQuat.x, targetBodyQuat.y, targetBodyQuat.z, targetBodyQuat.w);
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
          }
        }
      }

      if (speed < 0.05 && angSpeed < 0.05 && !isSleeping.current) {
        setTimeout(() => {
           if (!bodyRef.current) return;
           isSleeping.current = true;
           
           const bodyQuat = new THREE.Quaternion().copy(bodyRef.current.quaternion);
           let bestFace = null;
           let maxDot = -Infinity;
           
           orientedPlacements.forEach(tp => {
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
  }, [api, onRest, bodyRef, serverRoll, orientedPlacements]);

  return (
    <mesh ref={bodyRef} geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial 
        color="#ffffff" 
        map={marbleTexture}
        roughness={0.65} 
        metalness={0.0}
        clearcoat={0.15}
        clearcoatRoughness={0.6}
        envMapIntensity={0.6}
        transparent={false}
        opacity={1.0}
        side={THREE.DoubleSide}
      />
      {orientedPlacements.map((tp, i) => (
        <group key={i} position={tp.pos} quaternion={tp.quat}>
          <Text
            fontSize={0.45}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.015]} // Pushed out to 0.015 to prevent any z-fighting / clipping
            font="https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJG.ttf"
            outlineWidth={0.015}
            outlineColor="#021a1d"
          >
            {tp.num}
          </Text>
        </group>
      ))}
    </mesh>
  );
});

export default D10;
