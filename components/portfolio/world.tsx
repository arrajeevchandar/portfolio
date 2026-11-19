"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type SceneState = { chapter: number; progress: number; openingProgress: number; openingExit: number; mindsetProgress?: number; worldChapter?: number; paused: boolean; reduced: boolean; exploded: boolean; pointer: { x: number; y: number }; invalidate?: () => void };

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);

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
      return new THREE.Vector3(3.2 * Math.sign(c) * Math.pow(Math.abs(c), 0.65), 2 * Math.sign(s) * Math.pow(Math.abs(s), 0.65), 0);
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
    const coilPositions=new Float32Array(sourcePositions.count*3),coilNormals=new Float32Array(sourcePositions.count*3);
    for(let i=0;i<sourcePositions.count;i++){
      const u=uv.getX(i)*Math.PI*2,v=uv.getY(i)*Math.PI*2,a=u*3;
      const n=new THREE.Vector3(Math.cos(a)*Math.cos(v),Math.sin(v),Math.sin(a)*Math.cos(v));
      coilPositions.set([Math.cos(a)*1.9+n.x*.14,Math.cos(u)*1.5+n.y*.14,Math.sin(a)*1.9+n.z*.14],i*3);coilNormals.set(n.toArray(),i*3);
    }
    knotGeometry.morphAttributes.position.push(new THREE.BufferAttribute(coilPositions,3));
    knotGeometry.morphAttributes.normal.push(new THREE.BufferAttribute(coilNormals,3));
    const sculptureMaterial = chrome.clone();
    sculptureMaterial.transparent = true;
    const knot = new THREE.Mesh(knotGeometry, sculptureMaterial); sculpture.add(knot);
    const systemNodes = Array.from({ length: 4 }, () => {
      const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), acid);
      sculpture.add(node); return node;
    });
    const arcs: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>[] = [];
    for (let i = 0; i < 4; i++) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(2.5 + (i % 3) * 0.12, 0.012, 6, 60, Math.PI * 0.35), (i % 3 ? chrome : acid).clone());
      arc.material.transparent = true;
      arc.rotation.set(i * 0.53, i * 0.31, i * 1.13); arcs.push(arc); sculpture.add(arc);
    }
    world.add(sculpture);
    const portal = new THREE.Mesh(new THREE.TorusGeometry(2.15,.22,22,180),chrome);
    scene.add(portal);
    const portalCenter = new THREE.Vector3();
    const destination = document.querySelector<HTMLElement>('.mindset-sticky');
    // The same instanced geometry becomes a signal field, classroom network,
    // distributed ledger, and training waveform as the story progresses.
    const count = innerWidth < 800 ? 240 : 520;
    const points = Array.from({ length: count }, (_, index) => {
      const t = index / count;
      const angle = t * Math.PI * 2 * 8;
      const classroomRadius = 1.1 + (index % 4) * .55;
      const phi = Math.acos(1 - 2 * t);
      return {
        t,
        angle,
        column: (t - .5) * 8,
        scale: .7 + Math.sin(index * 1.7) * .3,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        cosDouble: Math.cos(angle * 2),
        sinDouble: Math.sin(angle * 2),
        classroomRadius,
        envelope: Math.sin(t * Math.PI) * 2,
        sphereRadius: Math.sin(phi) * 3,
        sphereDepth: Math.cos(phi) * 3,
        azimuth: index * 2.39996,
      };
    });
    const blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.058, 0.058, 0.058), acid, count);
    blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(blocks);
    const nodeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd1ff40, metalness: 0.6, roughness: 0.22, clearcoat: 1 });
    const nodes: THREE.Mesh[] = [];
    const wireNodes: THREE.LineSegments[] = [];
    const nodeGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const wireGeometry = new THREE.EdgesGeometry(nodeGeometry);
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0x93d8ff, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 8; i++) {
      const node = new THREE.Mesh(nodeGeometry, i % 2 ? chrome : nodeMaterial); nodes.push(node); world.add(node);
      const wire = new THREE.LineSegments(wireGeometry, wireMaterial); wireNodes.push(wire); world.add(wire);
    }
    const linePositions = new Float32Array(8 * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0xcaff30, transparent: true, opacity: 0.2 })); world.add(lines);
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(330 * 3);
    for (let i = 0; i < 330; i++) { dustPositions[i * 3] = Math.sin(i * 47.1) * 13; dustPositions[i * 3 + 1] = Math.cos(i * 31.7) * 8; dustPositions[i * 3 + 2] = -3 - ((i * 13.17) % 16); }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xdceac1, size: 0.022, transparent: true, opacity: 0.4 })); scene.add(dust);
    const dummy = new THREE.Object3D();
    const targetColor = new THREE.Color();
    const colors = ["#d3ff40", "#d3ff40", "#c1abff", "#c7ff65", "#8dd8ff", "#ffad77", "#d3ff40"].map(color => new THREE.Color(color));
    const pointTarget = new THREE.Vector3();
    const nodeTarget = new THREE.Vector3();
    const stagedMindset = matchMedia("(min-width:901px), (min-height:600px), (max-width:600px) and (min-height:500px)");
    let ticking = false, time = 0, lastTime = 0, lost = false;
    let chapter = 0, progress = 0, explosion = 0, needsRender = true;
    let staticFrame: Pick<SceneState, "chapter" | "progress" | "openingProgress" | "openingExit" | "exploded" | "worldChapter"> | undefined;
    let clip = "", layer = "", passageLight = -1;
    const setDestinationClip = (value: string) => {
      if (destination && value !== clip) {
        destination.style.clipPath = value;
        clip = value;
      }
    };
    const destinationPosition = new THREE.Vector3(), destinationScale = new THREE.Vector3();
    const cameraPointer = new THREE.Vector2();
    const about = document.getElementById("about");
    const phoneStage = document.querySelector(".orbital-stage");
    const desktopStage = document.querySelector(".mindset-studio");
    let canvasWidth = 0, canvasHeight = 0, pixelRatio = 0;
    let signalSin = 0, signalCos = 1, classroomSin = 0, classroomCos = 1;
    const placePoint = (point: (typeof points)[number], mode: number, target: THREE.Vector3) => {
      if (mode === 2) {
        target.set(point.column, (point.sin * signalCos + point.cos * signalSin) * (.6 + progress * .8),
          (point.cos * signalCos - point.sin * signalSin) * .85);
      } else if (mode === 3) {
        target.set(point.cos * point.classroomRadius, point.sin * point.classroomRadius,
          (point.sinDouble * classroomCos + point.cosDouble * classroomSin) * .4);
      } else if (mode === 4) {
        target.set(point.column, Math.sin(point.t * Math.PI * 3 + progress * 2) * 1.3, point.cos * .25);
      } else if (mode === 5) {
        target.set(point.column, Math.sin(point.t * 38 + time) * point.envelope, point.cos * .6);
      } else {
        target.set(Math.cos(point.azimuth + time * .12) * point.sphereRadius,
          Math.sin(point.azimuth + time * .12) * point.sphereRadius, point.sphereDepth);
      }
    };
    container.style.opacity = "1";
    const resize = (width: number, height: number) => {
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio, width < 800 ? 1.25 : 1.75);
      if (width === canvasWidth && height === canvasHeight && ratio === pixelRatio) return;
      canvasWidth = width;
      canvasHeight = height;
      pixelRatio = ratio;
      renderer.setDrawingBufferSize(width, height, ratio);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      needsRender = true;
      requestFrame();
    };
    const requestFrame = () => {
      if (ticking || document.hidden || lost) return;
      ticking = true;
      // GSAP updates scroll timelines before rendering their state to the canvas.
      gsap.ticker.add(tick);
    };
    const suspend = () => {
      if (ticking) gsap.ticker.remove(tick);
      ticking = false;
      lastTime = 0;
    };
    const visibility = () => {
      if (document.hidden) suspend();
      else requestFrame();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      suspend();
      setDestinationClip("none");
      container.dataset.renderer = "fallback";
    };
    const contextRestored = () => {
      lost = false;
      needsRender = true;
      container.dataset.renderer = "webgl";
      requestFrame();
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
    document.addEventListener("visibilitychange", visibility);
    const tick = () => {
      const now = performance.now();
      const s = state.current;
      const still = s.paused || s.reduced;
      // Use the scrubbed clock directly so the canvas follows the DOM on reversal.
      const { openingProgress, openingExit } = s;
      if (openingExit >= 1.05 && s.chapter >= 6 && s.progress > 0) {
        // Journey, toolkit and contact cover the entire WebGL layer.
        needsRender = true;
        suspend();
        return;
      }
      if (still && !needsRender && staticFrame?.chapter === s.chapter &&
          staticFrame.progress === s.progress && staticFrame.openingProgress === openingProgress &&
          staticFrame.openingExit === openingExit && staticFrame.exploded === s.exploded &&
          staticFrame.worldChapter === s.worldChapter) {
        suspend();
        return;
      }
      staticFrame = still ? { chapter: s.chapter, progress: s.progress, openingProgress, openingExit, exploded: s.exploded, worldChapter: s.worldChapter } : undefined;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .04) : 1 / 60;
      lastTime = still ? 0 : now;
      if (!still) time += dt;
      const ease = still ? 1 : 1 - Math.exp(-dt * 7);
      chapter += (s.chapter - chapter) * ease;
      progress += (s.progress - progress) * ease;
      explosion += ((s.exploded ? 1 : 0) - explosion) * ease;
      const width = innerWidth, height = innerHeight;
      const mobile = width < 800;
      const phone = width <= 600;
      const stage = phone ? phoneStage : desktopStage;
      const stageRect = !still && stagedMindset.matches && s.chapter <= 2 && openingProgress > .75 && about && about.getBoundingClientRect().bottom > 0
        ? stage?.getBoundingClientRect() : undefined;
      const connected = !!stageRect?.height;
      const fieldChapter = THREE.MathUtils.clamp(still ? s.chapter : s.worldChapter ?? chapter, 0, colors.length - 1);
      const fieldFrom = Math.floor(fieldChapter);
      const fieldTo = Math.ceil(fieldChapter);
      const blend = THREE.MathUtils.smoothstep(fieldChapter - fieldFrom, 0, 1);
      targetColor.copy(colors[fieldFrom]).lerp(colors[fieldTo], blend);
      acid.color.copy(targetColor); nodeMaterial.color.copy(targetColor); rim.color.copy(targetColor);
      acid.emissive.copy(acid.color).multiplyScalar(0.18);
      const entrance = s.reduced || s.paused ? 1 : 1 - Math.pow(1 - Math.min(time / 1.8, 1), 3);
      const unfold = THREE.MathUtils.smoothstep(openingProgress, 0.18, 0.72);
      const gateway = s.reduced || s.paused ? 0 : THREE.MathUtils.smoothstep(openingProgress, 0.76, 1);
      const flight = still ? 0 : THREE.MathUtils.smoothstep(openingExit, phone ? .08 : 0, 0.98)
        * THREE.MathUtils.smoothstep(gateway, .75, 1);
      const inPassage = gateway > 0 && openingExit < 1.05;
      // Keep the ring above the incoming surface from the start. Changing its
      // layer only after the morph begins made it disappear and then pop back.
      const nextLayer = connected || openingExit < 1.05 ? "4" : "0";
      if (nextLayer !== layer) {
        layer = nextLayer;
        container.style.zIndex = layer;
      }
      const nextLight = .65 * flight;
      if (nextLight !== passageLight) {
        passageLight = nextLight;
        container.style.setProperty("--passage-light", String(passageLight));
      }
      const settle=THREE.MathUtils.smootherstep(flight,0,.72);
      const mind=s.mindsetProgress??0;
      const layerBeat=THREE.MathUtils.smoothstep(mind,.22,.4)*(1-THREE.MathUtils.smoothstep(mind,.58,.8));
      // Open the ring into a wide lens, then pass through its uninterrupted centre.
      const turn = Math.sin(time * 0.18) * 0.18;
      cameraPointer.x += (s.pointer.x * .35 - cameraPointer.x) * ease;
      cameraPointer.y += (-s.pointer.y * .25 - cameraPointer.y) * ease;
      sculpture.visible = connected || openingExit < (gateway ? 1.05 : 1.35);
      sculpture.scale.setScalar(mobile ? 0.63 : 0.88);
      sculpture.rotation.set(
        THREE.MathUtils.lerp(0.35 + turn - cameraPointer.y * .6, 0.12 * (1 - gateway), unfold),
        THREE.MathUtils.lerp(0.5 + turn + cameraPointer.x * (4 / 7) + (1 - entrance) * 0.7, -0.18 * (1 - gateway), unfold),
        THREE.MathUtils.lerp(-0.3, 0, unfold)
      );
      // Exit with the opening's sticky viewport, like the typography, without
      // a scale-to-zero or opacity handoff when the chapter changes.
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(19)) * (mobile ? 17 : 13);
      sculpture.position.set(mobile ? 0 : 3.25, THREE.MathUtils.lerp(mobile ? -0.8 - unfold * 0.7 : 0.1, 0.1, gateway) + openingExit * viewHeight * (1 - gateway) - (1 - entrance) * 0.5, 0);
      knot.morphTargetInfluences![0] = unfold;
      knot.morphTargetInfluences![1] = 0;
      knot.morphTargetInfluences![2]=0;
      if(connected&&stageRect){
        const fullHeight=2*Math.tan(THREE.MathUtils.degToRad(19))*(mobile?17:13);
        const tx=((stageRect.left+stageRect.width/2)/width-.5)*fullHeight*camera.aspect;
        const ty=(.5-(stageRect.top+stageRect.height/2)/height)*fullHeight;
        const scale=Math.min(stageRect.width,stageRect.height)*.85/height*fullHeight/5.2;
        sculpture.position.lerp(destinationPosition.set(tx,ty,0),settle);
        sculpture.scale.lerp(destinationScale.set(scale,scale,scale),settle);
        sculpture.rotation.x=THREE.MathUtils.lerp(sculpture.rotation.x,.35+mind*.7,settle);
        sculpture.rotation.y=THREE.MathUtils.lerp(sculpture.rotation.y,-.3+mind*1.7,settle);
        sculpture.rotation.z=THREE.MathUtils.lerp(sculpture.rotation.z,-.18+mind*.35,settle);
        knot.morphTargetInfluences![0]*=1-settle;
        knot.morphTargetInfluences![1]*=1-settle;
        knot.morphTargetInfluences![2]=layerBeat*settle;
      }
      knot.scale.setScalar(1);
      sculptureMaterial.opacity = 1;
      // The entrance ring passes the lens; the destination sculpture is a
      // separate depth layer, revealed only once the aperture fills the view.
      if (connected && flight > 0) {
        sculpture.visible = true;
        sculpture.scale.multiplyScalar(.45+.55*settle);
        knot.morphTargetInfluences![0] = 0;
        sculptureMaterial.opacity = THREE.MathUtils.smootherstep(flight,0,.14);
      }
      systemNodes.forEach((node, i) => {
        const a = i * Math.PI / 2 + Math.PI / 4;
        node.position.set(Math.cos(a) * 2.15, Math.sin(a) * 2.15, 0.24);
        node.scale.setScalar(THREE.MathUtils.smoothstep(unfold, 0.65, 1) * (1 - gateway));
      });
      arcs.forEach((arc, i) => {
        arc.visible = gateway < 0.99 || connected;
        const openingOpacity = phone ? 1 - THREE.MathUtils.smoothstep(gateway, .05, .55) : 1;
        arc.material.opacity = openingOpacity*(1-gateway) + .25*THREE.MathUtils.smootherstep(flight,.72,1);
        arc.scale.setScalar(1 + gateway * 0.3);
        const a = i * Math.PI / 2;
        arc.position.set(Math.cos(a) * explosion * 0.65, Math.sin(a) * explosion * 0.65, Math.sin(i) * explosion * 0.3);
        arc.rotation.set(i * 0.53 * (1 - unfold), i * 0.31 * (1 - unfold), a + time * 0.025 + explosion);
      });
      const fieldReveal = THREE.MathUtils.smoothstep(fieldChapter, 1, 2) * (1 - THREE.MathUtils.smoothstep(fieldChapter, 5, 6));
      blocks.visible = fieldReveal > .002 && !inPassage;
      const right = mobile ? 0 : 1.9;
      if (blocks.visible) {
        signalSin = Math.sin(time * .7);
        signalCos = Math.cos(time * .7);
        classroomSin = Math.sin(time * .3);
        classroomCos = Math.cos(time * .3);
        for (let i = 0; i < count; i++) {
          const point = points[i];
          placePoint(point, fieldFrom, dummy.position);
          if (fieldFrom !== fieldTo) {
            placePoint(point, fieldTo, pointTarget);
            dummy.position.lerp(pointTarget, blend);
          }
          dummy.position.x += right;
          dummy.position.z -= 1;
          dummy.rotation.set(point.angle, time * .2, point.angle * .4);
          dummy.scale.setScalar(point.scale * fieldReveal);
          dummy.updateMatrix();
          blocks.setMatrixAt(i, dummy.matrix);
        }
        blocks.instanceMatrix.needsUpdate = true;
      }
      const nodeReveal = THREE.MathUtils.smoothstep(fieldChapter, 2.4, 3) * (1 - THREE.MathUtils.smoothstep(fieldChapter, 4, 4.6));
      const nodeVisibility = nodeReveal > .002 && !inPassage;
      const nodeBlend = THREE.MathUtils.smoothstep(fieldChapter, 3, 4);
      nodes.forEach((node, i) => {
        const wire = wireNodes[i];
        node.visible = nodeVisibility;
        wire.visible = nodeVisibility;
        if (!nodeVisibility) return;
        const a = (i / 8) * Math.PI * 2 + time * 0.09;
        node.position.set(Math.cos(a) * 2.6 + right, Math.sin(a) * 2.6, Math.sin(a) * 0.35);
        nodeTarget.set((i - 3.5) * 0.94 + right, Math.sin(i * 0.6 + progress * 2) * 1.3, -0.7);
        node.position.lerp(nodeTarget, nodeBlend);
        node.rotation.set(time * 0.12 + i * 0.3, time * 0.16, 0.15);
        node.scale.setScalar((0.7 + progress * 0.2) * nodeReveal);
        wire.position.copy(node.position); wire.rotation.copy(node.rotation); wire.scale.copy(node.scale).multiplyScalar(1.2);
      });
      lines.visible = nodeVisibility;
      if (nodeVisibility) {
        lines.material.opacity = .2 * nodeReveal;
        nodes.forEach((node, i) => {
          node.position.toArray(linePositions, i * 6);
          nodes[(i + 1) % nodes.length].position.toArray(linePositions, i * 6 + 3);
        });
        lineGeometry.attributes.position.needsUpdate = true;
      }
      const pointerWeight = (1 - gateway) * (still ? 0 : 1);
      camera.position.set(cameraPointer.x * pointerWeight, cameraPointer.y * pointerWeight, mobile ? 17 : 13);
      camera.lookAt(0, 0, camera.position.z - 13);
      world.rotation.z = Math.sin(time * 0.12) * 0.035 * (1-gateway);
      portal.visible = connected && flight > 0 && flight < .72;
      if (portal.visible) {
        const advance = THREE.MathUtils.smootherstep(flight,0,.72);
        portal.scale.setScalar(mobile ? .63 : .88);
        portal.position.set((mobile ? 0 : 3.25)*(1-advance), .1*(1-advance), camera.position.z*advance);
      }
      if (connected && destination && flight > 0 && flight < .7) {
        camera.updateMatrixWorld();
        portalCenter.copy(portal.position);
        portalCenter.z = Math.min(portalCenter.z,camera.position.z-.01);
        portalCenter.project(camera);
        const depth = Math.max(.01,camera.position.z-portal.position.z);
        const aperture = THREE.MathUtils.smootherstep(flight, 0, .09);
        const radius = 1.92 * portal.scale.x / depth / (2 * Math.tan(THREE.MathUtils.degToRad(19))) * canvasHeight * aperture;
        const rect = destination.getBoundingClientRect();
        const x = (portalCenter.x * .5 + .5) * canvasWidth - rect.left;
        const y = (-portalCenter.y * .5 + .5) * canvasHeight - rect.top;
        const safeRadius = Math.min(radius, Math.hypot(canvasWidth, canvasHeight) * 2);
        setDestinationClip(`circle(${safeRadius}px at ${x}px ${y}px)`);
      } else {
        const open = connected ? flight >= .7 : still || !stagedMindset.matches || openingExit >= 1;
        setDestinationClip(open ? "none" : "circle(0px at 50% 50%)");
      }
      renderer.render(scene, camera);
      needsRender = false;
      if (still) suspend();
    };
    const input = state.current;
    input.invalidate = requestFrame;
    resize(container.clientWidth, container.clientHeight);
    const resizeObserver = new ResizeObserver(([entry]) => resize(entry.contentRect.width, entry.contentRect.height));
    resizeObserver.observe(container);
    requestFrame();
    return () => {
      if(destination) destination.style.removeProperty('clip-path');

      if (input.invalidate === requestFrame) delete input.invalidate;
      suspend(); resizeObserver.disconnect(); document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost); renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
      const materials = new Set<THREE.Material>(); const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse(object => { const mesh = object as THREE.Mesh; if (mesh.geometry) geometries.add(mesh.geometry); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => materials.add(m)); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); env.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [state]);
  return <div ref={host} className="world" aria-hidden="true"><div className="passage-title"><span>01 / THE WAY I WORK</span><strong>MINDSET</strong></div><div className="world-fallback">RC<span>FULL-STACK / HUMAN-CENTERED</span></div></div>;
}
