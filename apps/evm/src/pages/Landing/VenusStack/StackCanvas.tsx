import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createStackFlow } from './StackFlow';
import {
  type GlassFinish,
  type StackAngle,
  createGlassMaterial,
  setupGlassLighting,
} from './glassMaterial';
import { createStackBackground } from './stackBackground';
import { LID_INDEX, SPOKES, STACK_LAYERS, TILE_LAYER_INDEX } from './stackData';
import {
  DEFAULT_STUDIO,
  type StackInteraction,
  type StackPan,
  type StackStudio,
} from './stackView';

type ElementRef<T extends HTMLElement> = { current: T | null };

interface StackCanvasProps {
  /** The tall scrolling wrapper. */
  wrapperRef: ElementRef<HTMLElement>;
  /** The sticky stage inside it. */
  pinRef: ElementRef<HTMLDivElement>;
  /** Progress bar fill, written directly each frame. */
  barRef: ElementRef<HTMLDivElement>;
  /** Tiles on the spoke layer, live plus open. */
  slots: number;
  /** Plate labels in stack order, already translated. */
  names: string[];
  reduceMotion: boolean;
  /** Called only when the open layer changes; -1 before the section starts. */
  onActive: (index: number) => void;
  connectedFlow?: boolean;
  finish?: GlassFinish;
  light?: boolean;
  zoom?: number;
  angle?: StackAngle;
  rotation?: number;
  onRotation?: (rotation: number) => void;
  pan?: StackPan;
  onPan?: (pan: StackPan) => void;
  interaction?: StackInteraction;
  roll?: number;
  studio?: StackStudio;
  onZoom?: (zoom: number) => void;
  elevation?: number;
  onElevation?: (elevation: number) => void;
}

const PLATE_W = 3;
const PLATE_D = 3;
const PLATE_T = 0.12;
const GAP = 0.17;
const BEVEL = 0.022;
const SKIRT = LID_INDEX * GAP + BEVEL;
const WALL = 0.06;
/** Bevel extends the extrusion past PLATE_T, so labels sit above both. */
const LABEL_LIFT = PLATE_T + 0.03;
/** Each layer enters over the first part of its scroll slot. */
const ENTER_SHARE = 0.72;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const labelTexture = (
  text: string,
  { size = 110, color = '#ffffff', weight = 600, track = 0 } = {},
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(10,18,30,0.65)';
  ctx.lineWidth = 2;
  ctx.font = `${weight} ${size}px Roboto, "Proxima Nova", Helvetica, Arial, sans-serif`;
  if (track) {
    const chars = [...text];
    const widths = chars.map(char => ctx.measureText(char).width + track);
    let x = canvas.width / 2 - widths.reduce((a, b) => a + b, 0) / 2;
    chars.forEach((char, i) => {
      ctx.fillText(char, x + widths[i] / 2, canvas.height / 2);
      x += widths[i];
    });
  } else {
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2, 880);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2, 880);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

const roundedRect = <T extends THREE.Shape | THREE.Path>(
  Ctor: new () => T,
  w: number,
  d: number,
  r: number,
): T => {
  const path = new Ctor();
  const x = -w / 2;
  const y = -d / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + d - r);
  path.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  path.lineTo(x + r, y + d);
  path.quadraticCurveTo(x, y + d, x, y + d - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
};

const plateGeometry = (w: number, d: number, t: number, r: number) => {
  const geometry = new THREE.ExtrudeGeometry(roundedRect(THREE.Shape, w, d, r), {
    depth: t,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
};

const skirtGeometry = (w: number, d: number, t: number, r: number) => {
  const shape = roundedRect(THREE.Shape, w, d, r);
  shape.holes.push(roundedRect(THREE.Path, w - WALL * 2, d - WALL * 2, Math.max(r - WALL, 0.02)));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: t,
    bevelEnabled: false,
    curveSegments: 12,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
};

type Label = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

interface PlateRecord {
  group: THREE.Group;
  labelGroup: THREE.Group;
  labels: Label[];
  baseY: number;
}

export const StackCanvas: React.FC<StackCanvasProps> = ({
  wrapperRef,
  pinRef,
  barRef,
  slots,
  names,
  reduceMotion,
  onActive,
  connectedFlow = false,
  finish = 'smoke',
  light = false,
  zoom = 1,
  angle = 'perspective',
  rotation = 0,
  onRotation,
  elevation = 40,
  onElevation,
  pan = { x: 0, y: 0 },
  onPan,
  interaction = 'rotate',
  roll = 0,
  studio = DEFAULT_STUDIO,
  onZoom,
}) => {
  const viewRef = useRef({ zoom, angle, rotation, elevation, pan, roll, studio, interaction });
  const updateViewRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    viewRef.current = { zoom, angle, rotation, elevation, pan, roll, studio, interaction };
    updateViewRef.current?.();
  }, [zoom, angle, rotation, elevation, pan, roll, studio, interaction]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceRef = useRef(reduceMotion);
  const onActiveRef = useRef(onActive);
  const onRotationRef = useRef(onRotation);
  onRotationRef.current = onRotation;
  const onElevationRef = useRef(onElevation);
  onElevationRef.current = onElevation;
  const onPanRef = useRef(onPan);
  onPanRef.current = onPan;
  const onZoomRef = useRef(onZoom);
  onZoomRef.current = onZoom;
  const slotsRef = useRef(slots);
  const namesRef = useRef(names);
  // Kept outside the scene so a rebuild (language switch) does not replay the build-up.
  const smoothRef = useRef(0);
  // The scene rebuilds when the label text changes; a joined string keeps the dependency stable.
  const namesKey = names.join('|');

  namesRef.current = names;
  reduceRef.current = reduceMotion;
  onActiveRef.current = onActive;
  slotsRef.current = slots;

  // namesKey is the trigger; the effect reads the labels through namesRef.
  // biome-ignore lint/correctness/useExhaustiveDependencies: rebuild the scene when the labels change
  useEffect(() => {
    const canvas = canvasRef.current;
    const pin = pinRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !pin || !wrapper) return;

    let width = pin.clientWidth || 1200;
    let height = pin.clientHeight || 700;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height, false);
    const scene = new THREE.Scene();
    const labelScene = new THREE.Scene();
    const background = new THREE.Color();
    const camera = new THREE.PerspectiveCamera(22, width / height, 0.1, 100);
    camera.position.set(7.0, 5.4, 9.7);
    camera.lookAt(0, 0.5, 0);
    const rail = pin.querySelector<HTMLElement>('.venus-stack__rail');
    const navigation = pin.querySelector<HTMLElement>('.venus-stack__under');
    const controls = pin.querySelector<HTMLElement>('.venus-stack__toolbar');
    const frameCamera = () => {
      const azimuth = THREE.MathUtils.degToRad(45 + viewRef.current.rotation);
      const tilt = THREE.MathUtils.degToRad(viewRef.current.elevation);
      const distance = 13;
      // Preserve orientation while crossing the poles, including upside-down views.
      const cosine = Math.cos(tilt);
      const horizontal = Math.abs(cosine) < 0.001 ? (cosine < 0 ? -0.001 : 0.001) : cosine;
      camera.position.set(
        Math.sin(azimuth) * horizontal * distance,
        0.5 + Math.sin(tilt) * distance,
        Math.cos(azimuth) * horizontal * distance,
      );
      camera.up.set(0, cosine < 0 ? -1 : 1, 0);
      camera.lookAt(0, 0.5, 0);
      camera.rotateZ(THREE.MathUtils.degToRad(viewRef.current.roll));
      camera.updateMatrixWorld();
      camera.aspect = width / height;
      camera.zoom = 1;
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      const pinBounds = pin.getBoundingClientRect();
      const railBounds = rail?.getBoundingClientRect();
      const gutter = rail ? Number.parseFloat(getComputedStyle(rail).paddingLeft) : 0;
      const narrow = width <= 760;
      const left = narrow ? gutter : (railBounds?.right ?? pinBounds.left) - pinBounds.left;
      const top = narrow ? (railBounds?.bottom ?? pinBounds.top) - pinBounds.top : gutter;
      const right = width - gutter;
      const bottom =
        Math.min(
          navigation?.getBoundingClientRect().top ?? pinBounds.bottom,
          controls?.getBoundingClientRect().top ?? pinBounds.bottom,
        ) - pinBounds.top;
      // Fixed model envelope includes an entering plate, avoiding camera jumps per chapter.
      const corners = [-1.75, 1.75].flatMap(x =>
        [-0.4, 2.5].flatMap(y => [-1.75, 1.75].map(z => new THREE.Vector3(x, y, z))),
      );
      const bounds = (points = corners) => {
        const projected = points.map(point => point.clone().project(camera));
        return {
          minX: Math.min(...projected.map(p => p.x)),
          maxX: Math.max(...projected.map(p => p.x)),
          minY: Math.min(...projected.map(p => p.y)),
          maxY: Math.max(...projected.map(p => p.y)),
        };
      };
      const initial = bounds();
      camera.zoom = Math.max(
        0.1,
        Math.min(
          (right - left) / (((initial.maxX - initial.minX) * width) / 2),
          (bottom - top) / (((initial.maxY - initial.minY) * height) / 2),
        ),
      );
      camera.zoom *= viewRef.current.zoom;
      camera.updateProjectionMatrix();
      const fixedBounds = bounds();
      // At close-up scale, centre the visible model rather than the empty entrance space.
      const progress = smoothRef.current * STACK_LAYERS.length;
      const tops = Array.from({ length: LID_INDEX + 1 }, (_, index) => {
        const local = easeOutCubic(clamp01((progress - index) / ENTER_SHARE));
        return local > 0.001
          ? index * GAP + (1 - local) * (index === LID_INDEX ? 2.4 : 1.9) - 0.35 + LABEL_LIFT
          : -0.4;
      });
      const visibleCorners = [-1.75, 1.75].flatMap(x =>
        [-0.4, Math.max(...tops)].flatMap(y => [-1.75, 1.75].map(z => new THREE.Vector3(x, y, z))),
      );
      const closeBounds = bounds(visibleCorners);
      const blend = clamp01(viewRef.current.zoom - 1);
      const fitted = {
        minX: THREE.MathUtils.lerp(fixedBounds.minX, closeBounds.minX, blend),
        maxX: THREE.MathUtils.lerp(fixedBounds.maxX, closeBounds.maxX, blend),
        minY: THREE.MathUtils.lerp(fixedBounds.minY, closeBounds.minY, blend),
        maxY: THREE.MathUtils.lerp(fixedBounds.maxY, closeBounds.maxY, blend),
      };
      const centerX = (((fitted.minX + fitted.maxX) / 2 + 1) * width) / 2;
      const centerY = ((1 - (fitted.minY + fitted.maxY) / 2) * height) / 2;
      camera.setViewOffset(
        width,
        height,
        centerX - (left + right) / 2 - viewRef.current.pan.x * width,
        centerY - (top + bottom) / 2 - viewRef.current.pan.y * height,
        width,
        height,
      );
      camera.updateProjectionMatrix();
    };
    frameCamera();

    const group = new THREE.Group();
    group.position.y = -0.35;
    scene.add(group);
    const labelRoot = new THREE.Group();
    labelScene.add(labelRoot);

    // Reuse the existing primary color for the connected Explorer story.
    const flowColor = new THREE.Color();
    const colorCanvas = document.createElement('canvas');
    const colorContext = colorCanvas.getContext('2d');
    if (colorContext) {
      colorContext.fillStyle = getComputedStyle(wrapper).getPropertyValue('--color-blue').trim();
      colorContext.fillRect(0, 0, 1, 1);
      const [r, g, b] = colorContext.getImageData(0, 0, 1, 1).data;
      flowColor.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }
    // Resolve the same site background used by the accepted glass study.
    if (colorContext) {
      colorContext.fillStyle = getComputedStyle(wrapper)
        .getPropertyValue('--color-background-active')
        .trim();
      colorContext.fillRect(0, 0, 1, 1);
      const [r, g, b] = colorContext.getImageData(0, 0, 1, 1).data;
      background.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }
    if (light) background.setRGB(1, 1, 1);
    // Neutral lights and a world-space ground replace the rejected blue glow.
    const environment = setupGlassLighting(renderer, scene, background, new THREE.Color(0xffffff));
    const backdrop = createStackBackground(scene, renderer, background, light);
    const acrylicPlate = (dim = false) => {
      const pair = [
        createGlassMaterial(flowColor, false, finish),
        createGlassMaterial(flowColor, true, finish),
      ];
      if (light && finish === 'smoke') pair.forEach(m => m.color.multiplyScalar(0.45));
      if (dim) pair.forEach(m => m.color.lerp(background, 0.15));
      return pair;
    };
    const flow = connectedFlow
      ? createStackFlow({
          plateWidth: PLATE_W,
          plateDepth: PLATE_D,
          labelLift: LABEL_LIFT,
          gap: GAP,
          pixelRatio: renderer.getPixelRatio(),
          color: flowColor,
        })
      : null;
    if (flow) {
      group.add(flow.group);
      flow.frame(camera, group);
    }

    const disposables: { dispose(): void }[] = [environment, backdrop];
    const makeLabel = (text: string, w: number, options?: Parameters<typeof labelTexture>[1]) => {
      const texture = labelTexture(text, {
        ...options,
        color: finish === 'pearl' || (light && finish === 'smoke') ? '#101218' : '#ffffff',
      });
      // Transmissive plates render after everything else, so a depth-tested label
      // ends up underneath them. Labels skip the depth test; burial is handled below.
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.02,
        depthWrite: false,
        depthTest: false,
        opacity: 0,
        toneMapped: false,
      });
      const geometry = new THREE.PlaneGeometry(w, w / 4);
      const mesh: Label = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 999;
      disposables.push(texture, material, geometry);
      return mesh;
    };

    const plates: PlateRecord[] = [];
    for (let i = 0; i < LID_INDEX; i += 1) {
      const plateGroup = new THREE.Group();
      plateGroup.position.y = i * GAP;
      group.add(plateGroup);
      const labelGroup = new THREE.Group();
      labelRoot.add(labelGroup);
      const record: PlateRecord = {
        group: plateGroup,
        labelGroup,
        labels: [],
        baseY: i * GAP,
      };

      if (i === TILE_LAYER_INDEX) {
        const count = slotsRef.current;
        const cols = count <= 4 ? 2 : 3;
        const rows = Math.ceil(count / cols);
        const pad = 0.08;
        const tw = (PLATE_W - pad * (cols + 1)) / cols;
        const td = (PLATE_D - pad * (rows + 1)) / rows;
        for (let k = 0; k < count; k += 1) {
          const live = k < SPOKES.length;
          const materials = acrylicPlate(!live);
          const geometry = plateGeometry(tw, td, PLATE_T, 0.075);
          const mesh = new THREE.Mesh(geometry, materials);
          mesh.position.x = -PLATE_W / 2 + pad + tw / 2 + (k % cols) * (tw + pad);
          mesh.position.z = -PLATE_D / 2 + pad + td / 2 + Math.floor(k / cols) * (td + pad);
          plateGroup.add(mesh);
          disposables.push(...materials, geometry);
          if (live) {
            const label = makeLabel(SPOKES[k], tw * 0.9, { size: 90 });
            label.position.set(mesh.position.x, LABEL_LIFT, mesh.position.z);
            labelGroup.add(label);
            record.labels.push(label);
          }
        }
      } else {
        const materials = acrylicPlate();
        const geometry = plateGeometry(PLATE_W, PLATE_D, PLATE_T, 0.22);
        plateGroup.add(new THREE.Mesh(geometry, materials));
        disposables.push(...materials, geometry);
        const label = makeLabel(namesRef.current[i] ?? '', PLATE_W * 0.84);
        label.position.y = LABEL_LIFT;
        labelGroup.add(label);
        record.labels.push(label);
      }
      plates.push(record);
    }

    // the cover
    const lidGroup = new THREE.Group();
    group.add(lidGroup);
    const outerW = PLATE_W + 0.2;
    const outerD = PLATE_D + 0.2;
    // Continuous case surrounds all six internal layers when the seventh chapter lands.
    const topMaterials = acrylicPlate();
    const topGeometry = plateGeometry(outerW, outerD, PLATE_T * 1.25, 0.25);
    lidGroup.add(new THREE.Mesh(topGeometry, topMaterials));
    const skirtMaterial = createGlassMaterial(flowColor, false, finish);
    const skirtGeo = skirtGeometry(outerW, outerD, SKIRT, 0.25);
    const skirt = new THREE.Mesh(skirtGeo, skirtMaterial);
    skirt.position.y = -SKIRT;
    lidGroup.add(skirt);
    disposables.push(...topMaterials, topGeometry, skirtMaterial, skirtGeo);
    const lidLabel = makeLabel('VENUS', PLATE_W * 0.6, { size: 110, track: 10, weight: 700 });
    lidLabel.position.y = PLATE_T * 1.25 + 0.03;
    const lidLabelGroup = new THREE.Group();
    lidLabelGroup.add(lidLabel);
    labelRoot.add(lidLabelGroup);

    group.traverse(item => {
      if (item instanceof THREE.Mesh) item.castShadow = true;
    });

    let visible = true;
    let frameId = 0;
    const observer = new IntersectionObserver(
      entries => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) requestRender();
        else {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(wrapper);

    const resizeObserver = new ResizeObserver(() => {
      width = pin.clientWidth;
      height = pin.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      frameCamera();
      flow?.frame(camera, group);
      requestRender();
    });
    updateViewRef.current = () => {
      frameCamera();
      backdrop.update(viewRef.current.studio, camera.position.y);
      flow?.frame(camera, group);
      requestRender();
    };
    resizeObserver.observe(pin);
    if (controls) resizeObserver.observe(controls);
    if (rail) resizeObserver.observe(rail);

    let lastActive = -2;
    const renderFrame = () => {
      frameId = 0;
      if (!visible || document.visibilityState !== 'visible') return;

      // Progress is how far the sticky stage has been pushed down its wrapper,
      // which works whatever element is doing the scrolling.
      const wrapperRect = wrapper.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();
      const span = Math.max(wrapperRect.height - pinRect.height, 1);
      const target = clamp01((pinRect.top - wrapperRect.top) / span);
      // Same feel as the reference: time eases toward the scroll target, never jumps.
      smoothRef.current += (target - smoothRef.current) * (reduceRef.current ? 1 : 0.1);
      if (Math.abs(target - smoothRef.current) < 0.0001) smoothRef.current = target;
      const smooth = smoothRef.current;

      const layerCount = STACK_LAYERS.length;
      const p = smooth * layerCount;
      const active = smooth > 0.001 ? Math.min(layerCount - 1, Math.floor(p)) : -1;
      if (active !== lastActive) {
        lastActive = active;
        onActiveRef.current(active);
      }
      if (barRef.current) barRef.current.style.width = `${(smooth * 100).toFixed(2)}%`;

      const locals = plates.map((_, i) => easeOutCubic(clamp01((p - i) / ENTER_SHARE)));
      const lidLocal = easeOutCubic(clamp01((p - LID_INDEX) / ENTER_SHARE));

      plates.forEach((record, i) => {
        const local = locals[i];
        record.group.position.y = record.baseY + (1 - local) * 1.9;
        record.group.visible = local > 0.001;
        // Keep exposed surface print clear; covered lettering fades into the case.
        const covered = i + 1 < locals.length ? locals[i + 1] : lidLocal;
        // Buried names remain in the text rail; keep them from overlapping the exposed print.
        const labelOpacity = local * (1 - covered) * (1 - lidLocal);
        record.labelGroup.position.copy(record.group.position);
        record.labelGroup.visible = record.group.visible;
        for (const label of record.labels) label.material.opacity = labelOpacity;
      });

      lidGroup.position.y = LID_INDEX * GAP + (1 - lidLocal) * 2.4;
      lidGroup.visible = lidLocal > 0.001;
      lidLabel.material.opacity = lidLocal;
      lidLabelGroup.position.copy(lidGroup.position);
      lidLabelGroup.visible = lidGroup.visible;

      // a slow drift across the whole section, as on the reference
      group.rotation.y = -0.1 + smooth * 0.2;
      labelRoot.position.copy(group.position);
      labelRoot.rotation.copy(group.rotation);

      flow?.update(
        p,
        performance.now() / 1000,
        reduceRef.current,
        width < 760,
        plates[p < 1 ? 0 : 1].group.position.y + LABEL_LIFT,
      );

      if (viewRef.current.zoom > 1) frameCamera();
      backdrop.update(viewRef.current.studio, camera.position.y);
      renderer.render(scene, camera);
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(labelScene, camera);
      renderer.autoClear = true;
      // Standard transmission needs no per-layer framebuffer capture or idle redraws.
      if (Math.abs(target - smooth) > 0.0001 || (flow && !reduceRef.current)) requestRender();
    };
    const requestRender = () => {
      if (!frameId && visible && document.visibilityState === 'visible')
        frameId = requestAnimationFrame(renderFrame);
    };
    const handleVisibility = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      requestRender();
    };
    // Mode toggle also works on touch. Shift/right-drag pans on desktop.
    let drag: {
      id: number;
      x: number;
      y: number;
      rotation: number;
      elevation: number;
      pan: StackPan;
      move: boolean;
    } | null = null;
    const wrap = (value: number) => ((value % 360) + 360) % 360;
    const pointerDown = (event: PointerEvent) => {
      if ((event.button !== 0 && event.button !== 2) || !event.isPrimary) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        rotation: viewRef.current.rotation,
        elevation: viewRef.current.elevation,
        pan: { ...viewRef.current.pan },
        move: viewRef.current.interaction === 'move' || event.shiftKey || event.button === 2,
      };
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-dragging');
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (drag.move) {
        const nextPan = { x: drag.pan.x + dx / width, y: drag.pan.y + dy / height };
        viewRef.current.pan = nextPan;
        onPanRef.current?.(nextPan);
      } else {
        const degrees = Math.round(wrap(drag.rotation + (dx / Math.max(width * 0.6, 1)) * 360));
        const tilt = Math.round(
          wrap(drag.elevation + (dy / Math.max(height * 0.7, 1)) * 360 + 180) - 180,
        );
        viewRef.current.rotation = degrees;
        viewRef.current.elevation = tilt;
        onRotationRef.current?.(degrees);
        onElevationRef.current?.(tilt);
      }
      updateViewRef.current?.();
    };
    const pointerUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      canvas.classList.remove('is-dragging');
    };
    const contextMenu = (event: Event) => event.preventDefault();
    const wheel = (event: WheelEvent) => {
      // Normal scrolling still builds the story; modifier + wheel zooms the model.
      if (!event.ctrlKey && !event.metaKey && !event.altKey) return;
      event.preventDefault();
      const next = Math.max(0.8, Math.min(2, viewRef.current.zoom - event.deltaY * 0.002));
      viewRef.current.zoom = next;
      onZoomRef.current?.(next);
      updateViewRef.current?.();
    };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('lostpointercapture', pointerUp);
    canvas.addEventListener('contextmenu', contextMenu);
    canvas.addEventListener('wheel', wheel, { passive: false });
    // Reduced motion renders on interaction, rather than running an idle GPU loop.
    document.addEventListener('scroll', requestRender, true);
    document.addEventListener('visibilitychange', handleVisibility);
    requestRender();

    return () => {
      updateViewRef.current = null;
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('lostpointercapture', pointerUp);
      canvas.classList.remove('is-dragging');
      canvas.removeEventListener('contextmenu', contextMenu);
      canvas.removeEventListener('wheel', wheel);
      cancelAnimationFrame(frameId);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('scroll', requestRender, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      for (const item of disposables) item.dispose();
      flow?.dispose();
      renderer.dispose();
    };
  }, [barRef, pinRef, wrapperRef, namesKey, connectedFlow, reduceMotion, finish, light]);

  // Decorative: the chip rail carries the same copy as text. A canvas with no
  // fallback content is skipped by screen readers.
  return <canvas ref={canvasRef} className="venus-stack__canvas" />;
};
