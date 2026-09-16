"use client";

import React from "react";
import TutorialPreviewBoard from "@/components/tutorial/TutorialPreviewBoard";
import TutorialOverlay from "@/components/tutorial/TutorialOverlay";

export default function TutorialPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      <TutorialPreviewBoard />
      <TutorialOverlay />
    </div>
  );
}
