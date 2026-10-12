"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { fabric } from "fabric";
import {
  FiCamera,
  FiTrash2,
  FiRotateCcw,
  FiUploadCloud,
  FiType,
  FiLoader,
  FiBold,
  FiItalic,
} from "react-icons/fi";
import { BsBrush, BsEraser } from "react-icons/bs";
import { MdOutlinePanTool } from "react-icons/md";

/* --- Types --------------------------------------------------------------- */
type Tool = "brush" | "eraser" | "text" | "select";
type BrushSize = "Fine" | "Small" | "Medium" | "Large" | "XL";

export interface SnapEditorProps {
  /**
   * Called when the user taps "Submit Photo".
   * Receives the final composited PNG as a Blob.
   * The PARENT handles the API call — SnapEditor stays dumb.
   */
  onSubmit: (blob: Blob) => void;
  /** Parent sets true while its API call is in-flight */
  isUploading?: boolean;
  /** Parent passes back any error string */
  uploadError?: string | null;
  /** Parent passes back the returned image URL on success */
  uploadedUrl?: string | null;
}

/* --- Constants ----------------------------------------------------------- */
const FONT_FAMILIES = [
  { label: "Sans", value: "Arial, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "Courier New, monospace" },
  { label: "Display", value: "Impact, fantasy" },
  { label: "Round", value: "Trebuchet MS, sans-serif" },
];

const COLORS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#3b82f6",
  "#14b8a6",
  "#22c55e",
  "#f59e0b",
  "#f97316",
];

const SIZE_MAP: Record<BrushSize, number> = {
  Fine: 2,
  Small: 5,
  Medium: 10,
  Large: 18,
  XL: 30,
};

const CANVAS_W = 1000;
const CANVAS_H = 600;

/* --- Composite photo + annotation layer → PNG Blob ----------------------- */
async function buildFinalBlob(
  photoDataURL: string,
  annotationCanvas: fabric.Canvas,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const off = document.createElement("canvas");
    off.width = CANVAS_W;
    off.height = CANVAS_H;
    const ctx = off.getContext("2d")!;

    const bg = new Image();
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, CANVAS_W, CANVAS_H);
      const overlayURL = annotationCanvas.toDataURL({
        format: "png",
        quality: 1,
      });
      const ov = new Image();
      ov.onload = () => {
        ctx.drawImage(ov, 0, 0);
        off.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/png",
        );
      };
      ov.onerror = reject;
      ov.src = overlayURL;
    };
    bg.onerror = reject;
    bg.src = photoDataURL;
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   SnapEditor component
══════════════════════════════════════════════════════════════════════════ */
export default function SnapEditor({
  onSubmit,
  isUploading = false,
  uploadError = null,
  uploadedUrl = null,
}: SnapEditorProps) {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [captured, setCaptured] = useState(false);

  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#ec4899");
  const [size, setSize] = useState<BrushSize>("Medium");

  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textMode, setTextMode] = useState<"composing" | "ready">("composing");

  /* -- Init Fabric ------------------------------------------------------- */
  useEffect(() => {
    if (!captured || !canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "transparent",
    });
    canvas.setWidth(CANVAS_W);
    canvas.setHeight(CANVAS_H);
    fabricRef.current = canvas;
    applyTool(canvas, "brush", color, size);
    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captured]);

  /* -- Keep tool props in sync ------------------------------------------- */
  useEffect(() => {
    if (!fabricRef.current) return;
    applyTool(fabricRef.current, tool, color, size);
  }, [tool, color, size]);

  function applyTool(c: fabric.Canvas, t: Tool, col: string, s: BrushSize) {
    if (t === "brush") {
      c.isDrawingMode = true;
      c.selection = false;
      if (c.freeDrawingBrush) {
        c.freeDrawingBrush.color = col;
        c.freeDrawingBrush.width = SIZE_MAP[s];
      }
    } else if (t === "eraser") {
      c.isDrawingMode = true;
      c.selection = false;
      if (c.freeDrawingBrush) {
        c.freeDrawingBrush.color = "rgba(0,0,0,1)";
        c.freeDrawingBrush.width = SIZE_MAP[s];
      }
    } else {
      c.isDrawingMode = false;
      c.selection = true;
    }
  }

  /* -- Eraser: destination-out (annotation layer only) ------------------ */
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // const onPath = (e: fabric.IEvent) => {
    //   if (tool !== "eraser") return;
    //   const path = e.path as fabric.Path;
    //   if (!path) return;
    //   path.globalCompositeOperation = "destination-out";
    //   path.selectable = false;
    //   canvas.renderAll();
    // };

    const onPath = (e: fabric.IEvent<Event>) => {
      if (tool !== "eraser") return;

      const path = (e as any).path as fabric.Path;

      if (!path) return;

      path.globalCompositeOperation = "destination-out";
      path.selectable = false;

      canvas.renderAll();
    };

    canvas.on("path:created", onPath);
    return () => {
      canvas.off("path:created", onPath);
    };
  }, [tool, captured]);

  /* -- Text: place IText on canvas click -------------------------------- */
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const onDown = (e: fabric.IEvent) => {
      if (tool !== "text" || textMode !== "ready" || e.target) return;
      const ptr = canvas.getPointer(e.e);
      const text = new fabric.IText(textInput.trim() || "Text", {
        left: ptr.x,
        top: ptr.y,
        fontSize,
        fill: color,
        fontFamily,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        selectable: true,
        editable: true,
        hasControls: true,
        hasBorders: true,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.6)",
          blur: 5,
          offsetX: 1,
          offsetY: 1,
        }),
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setTool("select");
      setTextMode("composing");
    };
    canvas.on("mouse:down", onDown);
    return () => {
      canvas.off("mouse:down", onDown);
    };
  }, [
    tool,
    textMode,
    textInput,
    color,
    fontSize,
    fontFamily,
    isBold,
    isItalic,
    captured,
  ]);

  /* -- Handlers ---------------------------------------------------------- */
  const handleCapture = () => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) return;
    setPhotoDataURL(shot);
    setCaptured(true);
  };

  const handleUndo = () => {
    const c = fabricRef.current;
    if (!c) return;
    const objs = c.getObjects();
    if (objs.length) {
      c.remove(objs[objs.length - 1]);
      c.renderAll();
    }
  };

  const handleClear = () => {
    const c = fabricRef.current;
    if (!c) return;
    c.clear();
    c.backgroundColor = "transparent";
    c.renderAll();
  };

  const handleRetake = () => {
    fabricRef.current?.dispose();
    fabricRef.current = null;
    setCaptured(false);
    setPhotoDataURL(null);
  };

  const handleSubmit = async () => {
    if (!photoDataURL || !fabricRef.current || isUploading) return;
    const blob = await buildFinalBlob(photoDataURL, fabricRef.current);
    onSubmit(blob);
  };

  /* -- JSX --------------------------------------------------------------- */
  return (
    <div
      className="w-full flex items-start justify-center p-3"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-5xl flex gap-3">
        {/* Canvas / Webcam */}
        <div
          className="flex-1 rounded-2xl overflow-hidden relative shadow-2xl"
          style={{
            minHeight: 460,
            background: "#111220",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {!captured ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/png"
                mirrored
                className="w-full object-cover"
                style={{ height: 460 }}
              />
              <button
                onClick={handleCapture}
                className="absolute bottom-4 flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#f43f8e,#a855f7)",
                }}
              >
                <FiCamera size={15} /> Capture Photo
              </button>
            </div>
          ) : (
            <div className="relative" style={{ width: "100%", height: 460 }}>
              {photoDataURL && (
                <img
                  src={photoDataURL}
                  alt="captured"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              )}
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  cursor:
                    tool === "text"
                      ? "text"
                      : tool === "select"
                        ? "default"
                        : "crosshair",
                }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        {captured && (
          <div
            className="w-68 rounded-2xl p-3 text-white flex flex-col gap-3 shadow-2xl overflow-y-auto"
            style={{
              background: "#13152a",
              border: "1px solid rgba(255,255,255,0.06)",
              maxHeight: 460,
            }}
          >
            {/* Tool selector */}
            <SS label="Tool">
              <div className="grid grid-cols-2 gap-1.5">
                <TB
                  active={tool === "brush"}
                  onClick={() => setTool("brush")}
                  accent="pink"
                >
                  <BsBrush size={11} />
                  Brush
                </TB>
                <TB
                  active={tool === "eraser"}
                  onClick={() => setTool("eraser")}
                  accent="orange"
                >
                  <BsEraser size={11} />
                  Eraser
                </TB>
                <TB
                  active={tool === "text"}
                  onClick={() => {
                    setTool("text");
                    setTextMode("composing");
                  }}
                  accent="blue"
                >
                  <FiType size={11} />
                  Text
                </TB>
                <TB
                  active={tool === "select"}
                  onClick={() => setTool("select")}
                  accent="teal"
                >
                  <MdOutlinePanTool size={11} />
                  Select
                </TB>
              </div>
            </SS>

            {/* Color */}
            {tool !== "eraser" && (
              <SS label="Color">
                <div className="grid grid-cols-5 gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-6 h-6 rounded-md transition-transform"
                      style={{
                        backgroundColor: c,
                        border:
                          color === c
                            ? "2px solid white"
                            : "2px solid transparent",
                        transform: color === c ? "scale(1.15)" : "scale(1)",
                        boxShadow:
                          c === "#ffffff"
                            ? "inset 0 0 0 1px rgba(255,255,255,0.25)"
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              </SS>
            )}

            {/* Brush size */}
            {(tool === "brush" || tool === "eraser") && (
              <SS label="Size">
                <div className="flex flex-col gap-1">
                  {(Object.keys(SIZE_MAP) as BrushSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition"
                      style={{
                        background:
                          size === s
                            ? "linear-gradient(135deg,#f43f8e,#a855f7)"
                            : "#1e2140",
                      }}
                    >
                      <span
                        className="rounded-full bg-white flex-shrink-0"
                        style={{
                          width: Math.max(3, SIZE_MAP[s] / 2.5),
                          height: Math.max(3, SIZE_MAP[s] / 2.5),
                        }}
                      />
                      {s}
                    </button>
                  ))}
                </div>
              </SS>
            )}

            {/* Text panel */}
            {tool === "text" && (
              <SS label="Add Text">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your text…"
                  rows={2}
                  className="w-full rounded-xl px-2 py-1.5 text-xs resize-none outline-none"
                  style={{
                    background: "#1e2140",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily,
                    fontWeight: isBold ? "bold" : "normal",
                    fontStyle: isItalic ? "italic" : "normal",
                  }}
                />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {FONT_FAMILIES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFontFamily(f.value)}
                      className="px-1.5 py-0.5 rounded-md text-[10px] transition"
                      style={{
                        fontFamily: f.value,
                        background:
                          fontFamily === f.value
                            ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                            : "#1e2140",
                        color: "#fff",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => setIsBold((v) => !v)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                    style={{ background: isBold ? "#3b82f6" : "#1e2140" }}
                  >
                    <FiBold size={11} />
                  </button>
                  <button
                    onClick={() => setIsItalic((v) => !v)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                    style={{ background: isItalic ? "#3b82f6" : "#1e2140" }}
                  >
                    <FiItalic size={11} />
                  </button>
                  <input
                    type="range"
                    min={12}
                    max={120}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-[10px] text-gray-400 w-5 text-right">
                    {fontSize}
                  </span>
                </div>
                {textMode === "composing" ? (
                  <button
                    onClick={() => {
                      if (textInput.trim()) setTextMode("ready");
                    }}
                    disabled={!textInput.trim()}
                    className="mt-2 w-full py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    }}
                  >
                    Click photo to place →
                  </button>
                ) : (
                  <div
                    className="mt-2 w-full py-1.5 rounded-xl text-xs font-semibold text-center"
                    style={{
                      background: "linear-gradient(135deg,#22c55e,#14b8a6)",
                      color: "#fff",
                      animation: "snapPulse 1.4s ease-in-out infinite",
                    }}
                  >
                    🎯 Click on the photo
                  </div>
                )}
              </SS>
            )}

            {/* Actions */}
            <SS label="Actions">
              <div className="grid grid-cols-2 gap-1.5">
                <AB onClick={handleUndo} bg="#2563eb">
                  <FiRotateCcw size={11} />
                  Undo
                </AB>
                <AB onClick={handleClear} bg="#ef4444">
                  <FiTrash2 size={11} />
                  Clear
                </AB>
              </div>
            </SS>

            {/* Submit */}
            <div className="mt-auto flex flex-col gap-1.5">
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg,#f43f8e,#a855f7)",
                }}
              >
                {isUploading ? (
                  <>
                    <FiLoader
                      size={13}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Uploading…
                  </>
                ) : (
                  <>
                    <FiUploadCloud size={13} />
                    Submit Photo ✨
                  </>
                )}
              </button>

              {uploadError && (
                <div
                  className="rounded-xl p-2 text-[11px]"
                  style={{ background: "#ef444422", color: "#f87171" }}
                >
                  ✗ {uploadError}
                </div>
              )}
              {uploadedUrl && !uploadError && (
                <div
                  className="rounded-xl p-2 text-[11px]"
                  style={{ background: "#16a34a22", color: "#4ade80" }}
                >
                  ✓ Photo submitted!
                </div>
              )}

              <button
                onClick={handleRetake}
                className="py-2 rounded-xl text-xs font-medium transition hover:opacity-80"
                style={{ background: "#1e2140" }}
              >
                ↩ Retake
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes snapPulse { 0%,100%{opacity:1} 50%{opacity:.55} }
      `}</style>
    </div>
  );
}

/* --- Micro helpers --------------------------------------------------------- */
function SS({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function TB({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent: "pink" | "orange" | "blue" | "teal";
  children: React.ReactNode;
}) {
  const M: Record<string, string> = {
    pink: "linear-gradient(135deg,#f43f8e,#a855f7)",
    orange: "linear-gradient(135deg,#f97316,#f59e0b)",
    blue: "linear-gradient(135deg,#3b82f6,#6366f1)",
    teal: "linear-gradient(135deg,#14b8a6,#22c55e)",
  };
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-all"
      style={{
        background: active ? M[accent] : "#1e2140",
        transform: active ? "scale(1.03)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

function AB({
  onClick,
  bg,
  children,
}: {
  onClick: () => void;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition hover:opacity-85 active:scale-95"
      style={{ background: bg }}
    >
      {children}
    </button>
  );
}
