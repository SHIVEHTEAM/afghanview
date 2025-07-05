import React from "react";
import { SlideMedia, SlideshowSettings } from "./types";

interface TransitionWrapperProps {
  media: SlideMedia[];
  currentSlide: number;
  settings: SlideshowSettings;
  children: React.ReactNode;
}

export default function TransitionWrapper({
  media,
  currentSlide,
  settings,
  children,
}: TransitionWrapperProps) {
  const getTransitionStyle = () => {
    const duration = settings.transitionDuration;

    switch (settings.transition) {
      case "fade":
        return {
          transition: `opacity ${duration}ms ease-in-out`,
        };

      case "slide":
        return {
          transition: `transform ${duration}ms ease-in-out`,
        };

      case "zoom":
        return {
          transition: `transform, opacity ${duration}ms ease-in-out`,
        };

      case "flip":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transformStyle: "preserve-3d" as const,
        };

      case "bounce":
        return {
          transition: `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
        };

      case "cube":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transformStyle: "preserve-3d" as const,
        };

      case "page":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transformStyle: "preserve-3d" as const,
        };

      case "wipe":
        return {
          transition: `clip-path ${duration}ms ease-in-out`,
        };

      default:
        return {
          transition: `opacity ${duration}ms ease-in-out`,
        };
    }
  };

  const getTransitionClass = () => {
    switch (settings.transition) {
      case "fade":
        return "transition-opacity";
      case "slide":
        return "transition-transform";
      case "zoom":
        return "transition-transform";
      case "flip":
        return "transition-transform transform-style-preserve-3d";
      case "bounce":
        return "transition-transform";
      case "cube":
        return "transition-transform transform-style-preserve-3d";
      case "page":
        return "transition-transform transform-style-preserve-3d";
      case "wipe":
        return "transition-all";
      default:
        return "transition-opacity";
    }
  };

  return (
    <div
      className={`w-full h-full ${getTransitionClass()}`}
      style={getTransitionStyle()}
    >
      {children}
    </div>
  );
}
