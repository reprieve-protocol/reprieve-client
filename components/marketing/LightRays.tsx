"use client";

import { useEffect, useRef } from "react";

export type RaysOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "right"
  | "left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

interface WebGlRefs {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  positionBuffer: WebGLBuffer;
  positionLocation: number;
  uniforms: {
    iTime: WebGLUniformLocation | null;
    iResolution: WebGLUniformLocation | null;
    rayPos: WebGLUniformLocation | null;
    rayDir: WebGLUniformLocation | null;
    raysColor: WebGLUniformLocation | null;
    raysSpeed: WebGLUniformLocation | null;
    lightSpread: WebGLUniformLocation | null;
    rayLength: WebGLUniformLocation | null;
    pulsating: WebGLUniformLocation | null;
    fadeDistance: WebGLUniformLocation | null;
    saturation: WebGLUniformLocation | null;
    mousePos: WebGLUniformLocation | null;
    mouseInfluence: WebGLUniformLocation | null;
    noiseAmount: WebGLUniformLocation | null;
    distortion: WebGLUniformLocation | null;
  };
}

const DEFAULT_COLOR = "#ffffff";
const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec2 rayDir;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2 mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(
  vec2 raySource,
  vec2 rayRefDirection,
  vec2 coord,
  float seedA,
  float seedB,
  float speed
) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp(
    (iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance),
    0.5,
    1.0
  );
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0,
    1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
  vec4 color = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    color.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  color.x *= 0.1 + brightness * 0.8;
  color.y *= 0.3 + brightness * 0.6;
  color.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);
  }

  color.rgb *= raysColor;
  gl_FragColor = color;
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.trim();
  const match =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized) ??
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(normalized)?.map(
      (segment, index) => (index === 0 ? segment : segment + segment),
    );

  if (!match) {
    return [1, 1, 1];
  }

  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
}

function getAnchorAndDir(
  origin: RaysOrigin,
  width: number,
  height: number,
): { anchor: [number, number]; dir: [number, number] } {
  const outside = 0.2;

  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * height], dir: [0, 1] };
    case "top-right":
      return { anchor: [width, -outside * height], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * width, 0.5 * height], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * width, 0.5 * height], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * height], dir: [0, -1] };
    case "bottom-center":
      return {
        anchor: [0.5 * width, (1 + outside) * height],
        dir: [0, -1],
      };
    case "bottom-right":
      return { anchor: [width, (1 + outside) * height], dir: [0, -1] };
    default:
      return { anchor: [0.5 * width, -outside * height], dir: [0, 1] };
  }
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Failed to create WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Failed to create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown link error";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export default function LightRays({
  raysOrigin = "top-center",
  raysColor = DEFAULT_COLOR,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className = "",
}: LightRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const webglRef = useRef<WebGlRefs | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    try {
      const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      });

      if (!gl) {
        return;
      }

      const program = createProgram(gl);
      const positionLocation = gl.getAttribLocation(program, "position");
      const positionBuffer = gl.createBuffer();

      if (!positionBuffer || positionLocation < 0) {
        gl.deleteProgram(program);
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
        ]),
        gl.STATIC_DRAW,
      );

      webglRef.current = {
        gl,
        program,
        positionBuffer,
        positionLocation,
        uniforms: {
          iTime: gl.getUniformLocation(program, "iTime"),
          iResolution: gl.getUniformLocation(program, "iResolution"),
          rayPos: gl.getUniformLocation(program, "rayPos"),
          rayDir: gl.getUniformLocation(program, "rayDir"),
          raysColor: gl.getUniformLocation(program, "raysColor"),
          raysSpeed: gl.getUniformLocation(program, "raysSpeed"),
          lightSpread: gl.getUniformLocation(program, "lightSpread"),
          rayLength: gl.getUniformLocation(program, "rayLength"),
          pulsating: gl.getUniformLocation(program, "pulsating"),
          fadeDistance: gl.getUniformLocation(program, "fadeDistance"),
          saturation: gl.getUniformLocation(program, "saturation"),
          mousePos: gl.getUniformLocation(program, "mousePos"),
          mouseInfluence: gl.getUniformLocation(program, "mouseInfluence"),
          noiseAmount: gl.getUniformLocation(program, "noiseAmount"),
          distortion: gl.getUniformLocation(program, "distortion"),
        },
      };
    } catch (error) {
      console.warn("Light rays WebGL initialization failed:", error);
      return;
    }

    const resize = () => {
      const entry = webglRef.current;
      if (!entry) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      entry.gl.viewport(0, 0, width, height);
    };

    const onPointerMove = (event: MouseEvent) => {
      if (!followMouse) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      mouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    const render = (time: number) => {
      const entry = webglRef.current;
      if (!entry) {
        return;
      }

      resize();

      const { gl: currentGl, program: currentProgram, positionLocation: loc } =
        entry;
      const width = currentGl.canvas.width;
      const height = currentGl.canvas.height;
      const { anchor, dir } = getAnchorAndDir(raysOrigin, width, height);
      const color = hexToRgb(raysColor);

      currentGl.useProgram(currentProgram);
      currentGl.bindBuffer(currentGl.ARRAY_BUFFER, entry.positionBuffer);
      currentGl.enableVertexAttribArray(loc);
      currentGl.vertexAttribPointer(loc, 2, currentGl.FLOAT, false, 0, 0);

      smoothMouseRef.current.x =
        smoothMouseRef.current.x * 0.92 + mouseRef.current.x * 0.08;
      smoothMouseRef.current.y =
        smoothMouseRef.current.y * 0.92 + mouseRef.current.y * 0.08;

      currentGl.uniform1f(entry.uniforms.iTime, time * 0.001);
      currentGl.uniform2f(entry.uniforms.iResolution, width, height);
      currentGl.uniform2f(entry.uniforms.rayPos, anchor[0], anchor[1]);
      currentGl.uniform2f(entry.uniforms.rayDir, dir[0], dir[1]);
      currentGl.uniform3f(entry.uniforms.raysColor, color[0], color[1], color[2]);
      currentGl.uniform1f(entry.uniforms.raysSpeed, raysSpeed);
      currentGl.uniform1f(entry.uniforms.lightSpread, lightSpread);
      currentGl.uniform1f(entry.uniforms.rayLength, rayLength);
      currentGl.uniform1f(entry.uniforms.pulsating, pulsating ? 1 : 0);
      currentGl.uniform1f(entry.uniforms.fadeDistance, fadeDistance);
      currentGl.uniform1f(entry.uniforms.saturation, saturation);
      currentGl.uniform2f(
        entry.uniforms.mousePos,
        smoothMouseRef.current.x,
        smoothMouseRef.current.y,
      );
      currentGl.uniform1f(
        entry.uniforms.mouseInfluence,
        followMouse ? mouseInfluence : 0,
      );
      currentGl.uniform1f(entry.uniforms.noiseAmount, noiseAmount);
      currentGl.uniform1f(entry.uniforms.distortion, distortion);

      currentGl.clearColor(0, 0, 0, 0);
      currentGl.clear(currentGl.COLOR_BUFFER_BIT);
      currentGl.drawArrays(currentGl.TRIANGLES, 0, 6);

      frameRef.current = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onPointerMove);
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (webglRef.current) {
        const { gl: currentGl, program: currentProgram, positionBuffer: buffer } =
          webglRef.current;
        currentGl.deleteBuffer(buffer);
        currentGl.deleteProgram(currentProgram);
        webglRef.current = null;
      }
    };
  }, [
    distortion,
    fadeDistance,
    followMouse,
    lightSpread,
    mouseInfluence,
    noiseAmount,
    pulsating,
    rayLength,
    raysColor,
    raysOrigin,
    raysSpeed,
    saturation,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
