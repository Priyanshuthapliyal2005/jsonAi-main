"use client";

import React from "react";

const VideoBackground = () => (
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
    style={{ position: "absolute", inset: 0 }}
  >
    <source src="/waterfall.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
);

export default VideoBackground;