"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type SceneState = { chapter: number; progress: number; openingProgress: number; openingExit: number; paused: boolean; reduced: boolean; exploded: boolean; pointer: { x: number; y: number }; };

export default function World({ state }: { state: RefObject<SceneState> }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch { container.dataset.renderer = "fallback"; return; }
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.dataset.renderer = "webgl";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, innerWidth < 800 ? 1.25 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 13);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x273222, 1.1));
    const key = new THREE.DirectionalLight(0xf0ffca, 2); key.position.set(5, 6, 4); scene.add(key);
    const rim = new THREE.PointLight(0xd1ff3b, 30, 30); rim.position.set(-4, -1, 4); scene.add(rim);
    const world = new THREE.Group(); scene.add(world);
    const chrome = new THREE.MeshPhysicalMaterial({ color: 0x8d9581, metalness: 0.97, roughness: 0.3, clearcoat: 0.65, clearcoatRoughness: 0.25, envMapIntensity: 1.1 });
    const acid = new THREE.MeshStandardMaterial({ color: 0xccff00, metalness: 0.45, roughness: 0.28, emissive: 0x5f7700, emissiveIntensity: 0.55 });
    const sculpture = new THREE.Group();
    const knotGeometry = new THREE.TorusKnotGeometry(1.6, 0.36, 180, 22, 2, 3);
    // Preserve vertex identity: the same surface untangles into the system ring.
    // Morph normals with positions so the metallic lighting follows the surface.
    const sourcePositions = knotGeometry.attributes.position;
    const uv = knotGeometry.attributes.uv;
    const ringPositions = new Float32Array(sourcePositions.count * 3);
    const ringNormals = new Float32Array(sourcePositions.count * 3);
    for (let i = 0; i < sourcePositions.count; i++) {
      const u = uv.getX(i) * Math.PI * 2, v = uv.getY(i) * Math.PI * 2;
      const radius = 2.15 + Math.cos(v) * 0.22;
      ringPositions.set([radius * Math.cos(u), radius * Math.sin(u), Math.sin(v) * 0.22], i * 3);
      ringNormals.set([Math.cos(u) * Math.cos(v), Math.sin(u) * Math.cos(v), Math.sin(v)], i * 3);
    }
    const framePositions = new Float32Array(sourcePositions.count * 3);
    const frameNormals = new Float32Array(sourcePositions.count * 3);
    const framePoint = (u: number) => {
      const c = Math.cos(u), s = Math.sin(u);
      return new THREE.Vector3(3.2 * Math.sign(c) * Math.pow(Math.abs(c), 0.35), 2 * Math.sign(s) * Math.pow(Math.abs(s), 0.35), 0);
    };
    for (let i = 0; i < sourcePositions.count; i++) {
      const u = uv.getX(i) * Math.PI * 2, v = uv.getY(i) * Math.PI * 2;
      const center = framePoint(u);
      const tangent = framePoint(u + 0.001).sub(framePoint(u - 0.001)).normalize();
      const normal = new THREE.Vector3(tangent.y, -tangent.x, 0).multiplyScalar(Math.cos(v));
      normal.z = Math.sin(v);
      framePositions.set(center.addScaledVector(normal, 0.085).toArray(), i * 3);
      frameNormals.set(normal.toArray(), i * 3);
    }
    knotGeometry.morphAttributes.position = [new THREE.BufferAttribute(ringPositions, 3), new THREE.BufferAttribute(framePositions, 3)];
    knotGeometry.morphAttributes.normal = [new THREE.BufferAttribute(ringNormals, 3), new THREE.BufferAttribute(frameNormals, 3)];
    const knot = new THREE.Mesh(knotGeometry, chrome); sculpture.add(knot);
    const systemNodes = Array.from({ length: 4 }, () => {
      const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), acid);
      sculpture.add(node); return node;
    });
    const arcs: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(2.5 + (i % 3) * 0.12, 0.012, 6, 60, Math.PI * 0.35), i % 3 ? chrome : acid);
      arc.rotation.set(i * 0.53, i * 0.31, i * 1.13); arcs.push(arc); sculpture.add(arc);
    }
    world.add(sculpture);
    // The ring becomes a product window. Two interface layers part as the
    // camera enters the experience, connecting the sculpture to Solenne.
    const interfaceScene = new THREE.Group(); scene.add(interfaceScene);
    const screen = document.createElement("canvas"); screen.width = 1200; screen.height = 740;
    const g = screen.getContext("2d")!;
    g.fillStyle = "#1b1e22"; g.fillRect(0, 0, 1200, 740);
    g.strokeStyle = "#41464d"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 82); g.lineTo(1200, 82); g.stroke();
    g.fillStyle = "#eeeae3"; g.font = "32px Georgia"; g.fillText("solenne ✳", 55, 53);
    g.fillStyle = "#929aa5"; g.font = "16px monospace"; g.fillText("YOUR PRIVATE SPACE", 865, 49);
    g.fillStyle = "#a4a9b2"; g.font = "17px monospace"; g.fillText("A MOMENT TO YOURSELF", 62, 155);
    g.fillStyle = "#f0f0ed"; g.font = "52px Arial"; g.fillText("Some things are", 60, 239); g.fillText("better said.", 60, 302);
    g.fillStyle = "#9ba2ad"; g.font = "23px Arial"; g.fillText("A little space. A clearer mind.", 62, 358);
    g.strokeStyle = "#383d46"; g.strokeRect(62, 422, 449, 155);
    g.fillStyle = "#c3b9df"; g.font = "18px monospace"; g.fillText("VIDEO JOURNAL", 90, 463);
    g.fillStyle = "#d5d6dc"; g.font = "25px Arial"; g.fillText("Start with a real moment.", 90, 520);
    g.strokeStyle = "#454453"; g.lineWidth = 2;
    [72, 95, 122].forEach(r => { g.beginPath(); g.arc(881, 305, r, 0, Math.PI * 2); g.stroke(); });
    g.fillStyle = "#c0b3de"; g.beginPath(); g.roundRect(868, 275, 26, 48, 13); g.fill();
    g.strokeStyle = "#c0b3de"; g.beginPath(); g.arc(881, 307, 27, 0, Math.PI); g.moveTo(881, 334); g.lineTo(881, 350); g.stroke();
    for(let i = 0; i < 65; i++){ const h = 10 + Math.abs(Math.sin(i * 1.7) * Math.sin(i * .21)) * 70; g.fillStyle = i % 3 ? "#7e7c91" : "#c6bddb"; g.fillRect(661+i*7, 485-h/2, 3, h); }
    g.fillStyle = "#9fa4ad"; g.font = "17px monospace"; g.fillText("VOICE  /  SPEECH  /  VISUAL", 690, 576);
    g.strokeStyle = "#353a42"; g.beginPath(); g.moveTo(62, 649); g.lineTo(1138, 649); g.stroke();
    g.fillStyle = "#8f949e"; g.font = "16px monospace"; g.fillText("PRIVATE VIDEO JOURNALING", 62, 697); g.fillText("01 / UNDERSTAND", 933, 697);
    const interfaceTextures: THREE.Texture[] = [];
    const interfaceLayers = [-1, 1].map((side, i) => {
      const texture = new THREE.CanvasTexture(screen); texture.colorSpace = THREE.SRGBColorSpace;
      texture.repeat.x = .5; texture.offset.x = i * .5; interfaceTextures.push(texture);
      const layer = new THREE.Mesh(new THREE.PlaneGeometry(3.08, 3.8), new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide, transparent:true}));
      layer.position.set(side * 1.54, 0, -.12); interfaceScene.add(layer); return layer;
    });
    // The same instanced geometry becomes a signal field, classroom network,
    // distributed ledger, and training waveform as the story progresses.
    const count = innerWidth < 800 ? 240 : 520;
    const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.058, 0.058, 0.058), acid, count);
    blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(blocks);
    const nodeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd1ff40, metalness: 0.6, roughness: 0.22, clearcoat: 1 });
    const nodes: THREE.Mesh[] = [];
    const wireNodes: THREE.LineSegments[] = [];
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const node = new THREE.Mesh(geometry, i % 2 ? chrome : nodeMaterial); nodes.push(node); world.add(node);
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x93d8ff, transparent: true, opacity: 0.5 })); wireNodes.push(wire); world.add(wire);
    }
    const linePositions = new Float32Array(8 * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry(); lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xcaff30, transparent: true, opacity: 0.2 })); world.add(lines);
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(330 * 3);
    for (let i = 0; i < 330; i++) { dustPositions[i * 3] = Math.sin(i * 47.1) * 13; dustPositions[i * 3 + 1] = Math.cos(i * 31.7) * 8; dustPositions[i * 3 + 2] = -3 - ((i * 13.17) % 16); }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xdceac1, size: 0.022, transparent: true, opacity: 0.4 })); scene.add(dust);
    const dummy = new THREE.Object3D();
    const morphPositions = new Float32Array(count * 3);
    const targetColor = new THREE.Color();
    const colors = ["#d3ff40", "#d3ff40", "#c1abff", "#c7ff65", "#8dd8ff", "#ffad77", "#d3ff40"];
    let raf = 0, time = 0, lastTime = 0, hidden = document.hidden, lost = false;
    let chapter = 0, progress = 0, explosion = 0, openingProgress = 0, openingExit = 0;
    const resize = () => { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h); camera.aspect = w / Math.max(h, 1); camera.updateProjectionMatrix(); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const visibility = () => { hidden = document.hidden; };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; container.dataset.renderer = "fallback"; };
    const contextRestored = () => { lost = false; container.dataset.renderer = "webgl"; };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
    document.addEventListener("visibilitychange", visibility);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - lastTime) / 1000, 0.04); lastTime = now;
      if (hidden || lost) return;
      const s = state.current;
      if (!s.paused && !s.reduced) time += dt;
      const ease = s.reduced ? 1 : 1 - Math.exp(-dt * 7);
      chapter += (s.chapter - chapter) * ease;
      progress += (s.progress - progress) * ease;
      explosion += ((s.exploded ? 1 : 0) - explosion) * ease;
      openingProgress += (s.openingProgress - openingProgress) * ease;
      openingExit = s.openingExit;
      const mobile = innerWidth < 800;
      targetColor.set(colors[Math.min(s.chapter, 6)]);
      acid.color.lerp(targetColor, ease); nodeMaterial.color.lerp(targetColor, ease); rim.color.lerp(targetColor, ease);
      acid.emissive.copy(acid.color).multiplyScalar(0.18);
      const entrance = s.reduced || s.paused ? 1 : 1 - Math.pow(1 - Math.min(time / 1.8, 1), 3);
      const unfold = THREE.MathUtils.smoothstep(openingProgress, 0.18, 0.72);
      const gateway = s.reduced || s.paused ? 0 : THREE.MathUtils.smoothstep(openingProgress, 0.76, 1);
      const flight = s.reduced || s.paused ? 0 : THREE.MathUtils.smoothstep(openingExit, 0, 0.98);
      const inPassage = gateway > 0 && openingExit < 1.05;
      container.style.zIndex = inPassage ? "4" : "0";
      interfaceScene.visible = inPassage;
      interfaceScene.position.set(mobile ? 0 : 3.25, 0.1, 0);
      interfaceScene.scale.setScalar(mobile ? .63 : .88);
      const separate = THREE.MathUtils.smoothstep(flight, .04, .62);
      interfaceLayers.forEach((layer, i) => {
        const side = i ? 1 : -1;
        layer.material.opacity = THREE.MathUtils.smoothstep(gateway, .45, 1);
        layer.position.set(side * (1.54 + separate * 3.8), separate * (i ? -.3 : .3), -.12 - separate * (i ? 1.8 : .8));
        layer.rotation.y = -side * separate * .58;
      });
      const turn = Math.sin(time * 0.18) * 0.18;
      sculpture.visible = openingExit < (gateway ? 1.05 : 1.35);
      sculpture.scale.setScalar(mobile ? 0.63 : 0.88);
      sculpture.rotation.set(
        THREE.MathUtils.lerp(0.35 + turn + s.pointer.y * 0.15, 0.12 * (1 - gateway), unfold),
        THREE.MathUtils.lerp(0.5 + turn + s.pointer.x * 0.2 + (1 - entrance) * 0.7, -0.18 * (1 - gateway), unfold),
        THREE.MathUtils.lerp(-0.3, 0, unfold)
      );
      // Exit with the opening's sticky viewport, like the typography, without
      // a scale-to-zero or opacity handoff when the chapter changes.
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(19)) * (mobile ? 17 : 13);
      sculpture.position.set(mobile ? 0 : 3.25, THREE.MathUtils.lerp(mobile ? -0.8 - unfold * 0.7 : 0.1, 0.1, gateway) + openingExit * viewHeight * (1 - gateway) - (1 - entrance) * 0.5, 0);
      knot.morphTargetInfluences![0] = unfold * (1 - gateway);
      knot.morphTargetInfluences![1] = gateway;
      knot.scale.setScalar(1);
      systemNodes.forEach((node, i) => {
        const a = i * Math.PI / 2 + Math.PI / 4;
        node.position.set(Math.cos(a) * 2.15, Math.sin(a) * 2.15, 0.24);
        node.scale.setScalar(THREE.MathUtils.smoothstep(unfold, 0.65, 1) * (1 - gateway));
      });
      arcs.forEach((arc, i) => {
        arc.visible = gateway < 0.99;
        arc.scale.setScalar(1 + gateway * 0.3);
        const a = i * Math.PI / 2;
        arc.position.set(Math.cos(a) * explosion * 0.65, Math.sin(a) * explosion * 0.65, Math.sin(i) * explosion * 0.3);
        arc.rotation.set(i * 0.53 * (1 - unfold), i * 0.31 * (1 - unfold), a + time * 0.025 + explosion);
      });
      blocks.visible = s.chapter >= 2 && s.chapter < 6 && !inPassage;
      const mode = Math.round(chapter);
      const cloudScale = Math.min(Math.max(chapter - 0.9, 0), 1);
      const right = mobile ? 0 : 1.9;
      for (let i = 0; i < count; i++) {
        const t = i / count, a = t * Math.PI * 2 * 8;
        let x = 0, y = 0, z = 0;
        if (mode === 2) { // Multimodal signals braid into a common representation.
          x = (t - 0.5) * 8; y = Math.sin(a + time * 0.7) * (0.6 + progress * 0.8); z = Math.cos(a + time * 0.7) * 0.85;
        } else if (mode === 3) { // Classroom network distributes around its center.
          const band = i % 4; x = Math.cos(a) * (1.1 + band * 0.55); y = Math.sin(a) * (1.1 + band * 0.55); z = Math.sin(a * 2 + time * 0.3) * 0.4;
        } else if (mode === 4) { // Replicated blocks follow a document transaction path.
          x = (t - 0.5) * 8; y = Math.sin(t * Math.PI * 3 + progress * 2) * 1.3; z = Math.cos(a) * 0.25;
        } else if (mode === 5) { // A rhythm field represents personalized routines.
          x = (t - 0.5) * 8; y = Math.sin(t * 38 + time) * Math.sin(t * Math.PI) * 2; z = Math.cos(a) * 0.6;
        } else {
          const phi = Math.acos(1 - 2 * t), theta = i * 2.39996;
          x = Math.cos(theta + time * 0.12) * Math.sin(phi) * 3; y = Math.sin(theta + time * 0.12) * Math.sin(phi) * 3; z = Math.cos(phi) * 3;
        }
        const m = i * 3;
        morphPositions[m] += (x * cloudScale + right - morphPositions[m]) * ease;
        morphPositions[m + 1] += (y * cloudScale - morphPositions[m + 1]) * ease;
        morphPositions[m + 2] += (z - 1 - morphPositions[m + 2]) * ease;
        dummy.position.set(morphPositions[m], morphPositions[m + 1], morphPositions[m + 2]);
        dummy.rotation.set(a, time * 0.2, a * 0.4);
        dummy.scale.setScalar((0.7 + Math.sin(i * 1.7) * 0.3) * cloudScale);
        dummy.updateMatrix(); blocks.setMatrixAt(i, dummy.matrix);
      }
      blocks.instanceMatrix.needsUpdate = true;
      const nodeVisibility = s.chapter < 6 && (mode === 3 || mode === 4);
      nodes.forEach((node, i) => {
        const a = (i / 8) * Math.PI * 2 + time * 0.09;
        node.visible = nodeVisibility; wireNodes[i].visible = nodeVisibility;
        if (mode === 4) node.position.set((i - 3.5) * 0.94 + right, Math.sin(i * 0.6 + progress * 2) * 1.3, -0.7);
        else node.position.set(Math.cos(a) * 2.6 + right, Math.sin(a) * 2.6, Math.sin(a) * 0.35);
        node.rotation.set(time * 0.12 + i * 0.3, time * 0.16, 0.15); node.scale.setScalar(0.7 + progress * 0.2);
        wireNodes[i].position.copy(node.position); wireNodes[i].rotation.copy(node.rotation); wireNodes[i].scale.copy(node.scale).multiplyScalar(1.2);
        const next = (i + 1) % 8; const p = node.position;
        linePositions.set([p.x, p.y, p.z, nodes[next].position.x, nodes[next].position.y, nodes[next].position.z], i * 6);
      });
      lines.visible = nodeVisibility; lineGeometry.attributes.position.needsUpdate = true;
      camera.position.x += ((s.reduced ? 0 : s.pointer.x * 0.35) - camera.position.x) * ease;
      camera.position.y += ((s.reduced ? 0 : -s.pointer.y * 0.25) - camera.position.y) * ease;
      const travel = inPassage ? flight : 0;
      const align = inPassage ? gateway : 0;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mobile ? 0 : 3.25, align);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.1, align);
      camera.position.z = THREE.MathUtils.lerp(mobile ? 17 : 13, -5, travel);
      camera.lookAt(THREE.MathUtils.lerp(0, mobile ? 0 : 3.25, align), 0.1 * align, camera.position.z - 13);
      world.rotation.z = Math.sin(time * 0.12) * 0.035 * (1 - align);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); resizeObserver.disconnect(); document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost); renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
      const materials = new Set<THREE.Material>(); const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse(object => { const mesh = object as THREE.Mesh; if (mesh.geometry) geometries.add(mesh.geometry); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => materials.add(m)); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); interfaceTextures.forEach(texture => texture.dispose()); env.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [state]);
  return <div ref={host} className="world" aria-hidden="true"><div className="world-fallback">RC<span>FULL-STACK / HUMAN-CENTERED</span></div></div>;
}
