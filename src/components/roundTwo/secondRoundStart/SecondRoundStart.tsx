"use client";

import Button from "@/components/share/ButtonPrimary";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useCallback, useEffect } from "react";

interface Contestant {
  id: number;
  name: string;
  avatar: string;
  active: boolean;
}

const PLACEHOLDER_AVATARS = Array.from(
  { length: 8 },
  (_, i) => `https://api.dicebear.com/8.x/adventurer/svg?seed=${i + 1}`,
);

const INITIAL_CONTESTANTS: Contestant[] = PLACEHOLDER_AVATARS.map((av, i) => ({
  id: i + 1,
  name: `Contestant ${i + 1}`,
  avatar: av,
  active: true,
}));

type InputMode = "choose" | "camera" | "file";

export default function RoundTwoStart() {
  const [contestants] = useState<Contestant[]>(INITIAL_CONTESTANTS);
  const [activeContestant, setActiveContestant] = useState<number>(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Camera state
  const [inputMode, setInputMode] = useState<InputMode>("choose");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashActive, setFlashActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const current = contestants.find((c) => c.id === activeContestant)!;

  const { sendEvent, isConnected } = useSocket({
    GAME_EVENT: (payload) => {
      console.log("🎮 Game Event received:", payload);
    },
  });

  // -- Send image via socket with SUBMIT_DATA payload ------------------------
  const handleSendImage = () => {
    if (!uploadedImage) return;

    sendEvent(
      "GAME_EVENT",
      {
        gameId: "internet-bachelor-123", // TODO: replace with your real gameId (e.g. from context/env/props)
        type: "SUBMIT_DATA",
        payload: {
          data: {
            imageUrl:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7y8SjE0wkKdyFNVpuAwO__8n1YLRWaSlRdg&s", // data URL from camera capture or file upload
            // NOTE: If your server expects a hosted URL, upload the image to
            // your storage first and pass the resulting CDN URL here instead.
          },
        },
      },
      (response) => {
        console.log("✅ Server ACK:", response);
        // router.push("/round-two/round-two-two");
      },
    );
  };
  // -------------------------------------------------------------------------

  // Upload progress simulation
  useEffect(() => {
    if (!isUploading) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2500);
          return 100;
        }
        return p + Math.random() * 18;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isUploading]);

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, inputMode]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = useCallback(() => {
    setCameraStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    setIsCameraReady(false);
    setCameraError(null);
  }, []);

  const startCamera = useCallback(
    async (facing: "user" | "environment" = facingMode) => {
      setCameraError(null);
      setIsCameraReady(false);
      // Stop existing stream first
      setCameraStream((prev) => {
        if (prev) prev.getTracks().forEach((t) => t.stop());
        return null;
      });
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        setCameraStream(stream);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "NotAllowedError") {
          setCameraError(
            "Camera permission denied. Please allow camera access and try again.",
          );
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found on this device.");
        } else {
          setCameraError(
            "Could not access camera. Please try file upload instead.",
          );
        }
      }
    },
    [facingMode],
  );

  const handleSwitchCamera = useCallback(async () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    await startCamera(newFacing);
  }, [facingMode, startCamera]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setUploadedImage(dataUrl);
    stopCamera();
    setInputMode("choose");
    setIsUploading(true);
  }, [isCameraReady, facingMode, stopCamera]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setIsUploading(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const clearImage = () => {
    setUploadedImage(null);
    setUploadProgress(0);
    setShowSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModeSelect = async (mode: InputMode) => {
    if (mode === "camera") {
      setInputMode("camera");
      await startCamera();
    } else if (mode === "file") {
      setInputMode("file");
      stopCamera();
    } else {
      setInputMode("choose");
      stopCamera();
    }
  };

  return (
    <div className=" ">
      {/* main card */}
      <p> {isConnected() ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <main className="relative z-10 w-full ">
        <div
          className="rounded-2xl border w-full border-red-600/40 bg-black/60 backdrop-blur-md overflow-hidden"
          style={{
            boxShadow:
              "0 0 0 1px rgba(220,38,38,0.15), 0 0 60px -10px rgba(220,38,38,0.3)",
          }}
        >
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-white/5">
            <h2 className="text-lg sm:text-xl font-bold text-center text-red-500 tracking-wide">
              Take Photo
            </h2>
            <p className="text-sm text-center text-gray-400 mt-0.5">
              Take your photo and send it
            </p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {showSuccess && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Photo uploaded successfully!
              </div>
            )}

            {/* -- CHOOSE MODE -- */}
            {inputMode === "choose" && !uploadedImage && (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Camera option */}
                <button
                  onClick={() => handleModeSelect("camera")}
                  className="flex-1 relative cursor-pointer rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-red-500/50 hover:bg-red-500/5 flex flex-col items-center justify-center gap-4 min-h-[200px] sm:min-h-[280px] transition-all duration-300 group select-none"
                >
                  <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-red-500/10 transition-all duration-300">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 group-hover:text-red-400 transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                      />
                    </svg>
                  </div>
                  <div className="text-center px-4">
                    <p className="font-semibold text-base sm:text-lg text-gray-300 group-hover:text-white transition-colors duration-300">
                      Use Camera
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Take a real-time photo
                    </p>
                  </div>
                  {/* corner accents */}
                  <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-600/40 rounded-tl-sm" />
                  <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-600/40 rounded-tr-sm" />
                  <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-600/40 rounded-bl-sm" />
                  <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-600/40 rounded-br-sm" />
                </button>

                {/* File upload option */}
                <button
                  onClick={() => {
                    handleModeSelect("file");
                    fileInputRef.current?.click();
                  }}
                  className="flex-1 relative cursor-pointer rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-red-500/50 hover:bg-red-500/5 flex flex-col items-center justify-center gap-4 min-h-[200px] sm:min-h-[280px] transition-all duration-300 group select-none"
                >
                  <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-red-500/10 transition-all duration-300">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 group-hover:text-red-400 transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <div className="text-center px-4">
                    <p className="font-semibold text-base sm:text-lg text-gray-300 group-hover:text-white transition-colors duration-300">
                      Upload File
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      PNG, JPG, WEBP from your device
                    </p>
                  </div>
                  <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-600/40 rounded-tl-sm" />
                  <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-600/40 rounded-tr-sm" />
                  <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-600/40 rounded-bl-sm" />
                  <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-600/40 rounded-br-sm" />
                </button>
              </div>
            )}

            {/* -- FILE UPLOAD MODE (drag & drop) -- */}
            {inputMode === "file" && !uploadedImage && (
              <div>
                <button
                  onClick={() => setInputMode("choose")}
                  className="mb-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>
                <div
                  onDrop={onDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 min-h-[220px] sm:min-h-[280px] md:min-h-[320px] transition-all duration-300 group select-none ${
                    isDragging
                      ? "border-red-500 bg-red-500/10 scale-[1.01]"
                      : "border-white/10 bg-white/[0.02] hover:border-red-500/50 hover:bg-red-500/5"
                  }`}
                >
                  {isDragging && (
                    <div className="absolute inset-0 rounded-xl border-2 border-red-400 animate-pulse" />
                  )}
                  <div
                    className={`p-4 rounded-2xl transition-all duration-300 ${isDragging ? "bg-red-500/20" : "bg-white/5 group-hover:bg-red-500/10"}`}
                  >
                    <svg
                      className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-300 ${isDragging ? "text-red-400" : "text-gray-500 group-hover:text-red-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <div className="text-center px-4">
                    <p
                      className={`font-semibold text-base sm:text-lg transition-colors duration-300 ${isDragging ? "text-red-300" : "text-gray-300 group-hover:text-white"}`}
                    >
                      {isDragging ? "Drop your photo here" : "Choose File"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Drag & drop or click to browse · PNG, JPG, WEBP
                    </p>
                  </div>
                  <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-600/40 rounded-tl-sm" />
                  <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-600/40 rounded-tr-sm" />
                  <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-600/40 rounded-bl-sm" />
                  <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-600/40 rounded-br-sm" />
                </div>
              </div>
            )}

            {/* -- CAMERA MODE -- */}
            {inputMode === "camera" && !uploadedImage && (
              <div>
                <button
                  onClick={() => {
                    handleModeSelect("choose");
                  }}
                  className="mb-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>

                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black min-h-[260px] sm:min-h-[360px] flex items-center justify-center">
                  {/* Flash overlay */}
                  {flashActive && (
                    <div className="absolute inset-0 bg-white z-20 pointer-events-none" />
                  )}

                  {cameraError ? (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <svg
                        className="w-10 h-10 text-red-500/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <p className="text-sm text-gray-400">{cameraError}</p>
                      <button
                        onClick={() => startCamera()}
                        className="mt-1 px-4 py-2 text-xs font-medium rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Loading state */}
                      {!isCameraReady && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/80">
                          <div className="w-8 h-8 border-2 border-red-500/40 border-t-red-500 rounded-full animate-spin" />
                          <p className="text-xs text-gray-500">
                            Starting camera…
                          </p>
                        </div>
                      )}

                      {/* Video feed */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onCanPlay={() => setIsCameraReady(true)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraReady ? "opacity-100" : "opacity-0"} ${facingMode === "user" ? "-scale-x-100" : ""}`}
                        style={{ minHeight: "260px", maxHeight: "420px" }}
                      />

                      {/* Viewfinder overlay */}
                      {isCameraReady && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Corner brackets */}
                          <span className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-500/70" />
                          <span className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-500/70" />
                          <span className="absolute bottom-16 left-4 w-6 h-6 border-b-2 border-l-2 border-red-500/70" />
                          <span className="absolute bottom-16 right-4 w-6 h-6 border-b-2 border-r-2 border-red-500/70" />
                          {/* Scanline */}
                          <div className="absolute left-4 right-4 top-1/2 h-px bg-red-500/20" />
                        </div>
                      )}

                      {/* Camera controls */}
                      {isCameraReady && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 px-6 py-4 bg-gradient-to-t from-black/80 to-transparent">
                          {/* Flip camera */}
                          <button
                            onClick={handleSwitchCamera}
                            className="p-2.5 rounded-full bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 transition-all"
                            title="Flip camera"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>

                          {/* Capture button */}
                          <button
                            onClick={handleCapture}
                            className="relative w-16 h-16 rounded-full flex items-center justify-center group"
                          >
                            <span className="absolute inset-0 rounded-full border-4 border-white/80 group-hover:border-white transition-colors" />
                            <span className="w-11 h-11 rounded-full bg-white group-hover:bg-red-100 group-active:scale-90 transition-all duration-100" />
                          </button>

                          {/* Spacer to balance layout */}
                          <div className="w-10 h-10" />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">
                  {facingMode === "user" ? "Front camera" : "Rear camera"} ·
                  Press the button to capture
                </p>
              </div>
            )}

            {/* -- IMAGE PREVIEW -- */}
            {uploadedImage && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={uploadedImage}
                  alt="Uploaded preview"
                  className="w-full object-cover max-h-[320px] sm:max-h-[400px]"
                  style={{ objectPosition: "center top" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                {isUploading && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100 ease-linear"
                        style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                      />
                    </div>
                    <div className="px-4 pb-3 pt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-300">Uploading…</span>
                      <span className="text-xs text-red-400 font-medium">
                        {Math.min(Math.round(uploadProgress), 100)}%
                      </span>
                    </div>
                  </div>
                )}
                {!isUploading && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => {
                        clearImage();
                        setInputMode("choose");
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black/60 backdrop-blur border border-white/20 text-white hover:bg-white/10 transition-all"
                    >
                      Retake
                    </button>
                    <button
                      onClick={clearImage}
                      className="p-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/20 text-gray-300 hover:text-red-400 hover:border-red-500/50 transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onInputChange}
            />

            {/* -- SEND PHOTO BUTTON — wired to handleSendImage via socket -- */}
            {uploadedImage && !isUploading && (
              <div className="mt-6 flex justify-center">
                <Button variant="game" onClick={handleSendImage}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send Photo
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
