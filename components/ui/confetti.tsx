"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  duration?: number;
  colors?: string[];
}

export function Confetti({
  duration = 3000,
  colors = [
    "bg-rose-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-cyan-500",
    "bg-emerald-500",
  ],
}: ConfettiProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  // Create confetti pieces with different animations
  const confettiPieces = Array.from({ length: 50 }, (_, i) => {
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    const animationDelay = Math.random() * 3;
    const left = Math.random() * 100;
    const animationDuration = 3 + Math.random() * 2;

    return (
      <div
        key={i}
        className={`absolute w-2 h-2 ${colorClass} opacity-80 animate-bounce`}
        style={{
          left: `${left}%`,
          animationDelay: `${animationDelay}s`,
          animationDuration: `${animationDuration}s`,
          transform: `translateY(-100px) rotate(${Math.random() * 360}deg)`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces}
    </div>
  );
}
