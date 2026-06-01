"use client";

import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
// @ts-ignore – alias in vite.config.ts points to dist/vietmap-gl.js
import vietmapgl from "@vietmap/vietmap-gl-js";
import { useThemeContext } from "@/app/context/ThemeContext";
// Use VietmapGL's own CSS to ensure correct marker positioning and map controls.
// We use a relative path here to bypass Vite's alias resolution.
import "../../../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export type MapRef = any;

export type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapProps = {
  children?: ReactNode;
  className?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  styles?: { light?: string; dark?: string };
  pitch?: number;
  bearing?: number;
  [key: string]: any;
};

const MapContext = createContext<any>(null);

export function useMap() {
  return useContext(MapContext);
}

export const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    children,
    className,
    center = [108.2022, 16.0544],
    zoom = 13,
    styles,
    pitch = 0,
    bearing = 0,
    ...props
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useThemeContext();

  useImperativeHandle(ref, () => mapInstance, [mapInstance]);

  // Get Vietmap style URL directly. No proxy is needed because Vietmap's CDN
  // has CORS enabled (*) for both style JSON and vector pbf tiles.
  // Using direct URLs prevents proxy-induced corruption of vector tiles.
  const getStyleUrl = (): string => {
    const isDark = resolvedTheme === "dark";

    if (isDark && styles?.dark) return styles.dark;
    if (!isDark && styles?.light) return styles.light;

    const key = (import.meta.env.VITE_VIETMAP_TILEMAP_API_KEY ?? "").trim();
    const validKey =
      key &&
      key !== "your_vietmap_tilemap_api_key_here" &&
      !key.toUpperCase().includes("YOUR_");

    if (validKey) {
      return isDark
        ? `https://maps.vietmap.vn/api/maps/dark/styles.json?apikey=${key}`
        : `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${key}`;
    }
    // Fallback when no tile key is configured
    return isDark
      ? "https://tiles.openfreemap.org/styles/dark"
      : "https://tiles.openfreemap.org/styles/bright";
  };

  // ── Initialize Map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const style = getStyleUrl();
    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: style,
      center,
      zoom,
      pitch,
      bearing,
      attributionControl: true,
      ...props,
    });

    map.on("load", () => setIsLoaded(true));
    map.on("error", (e: any) =>
      console.warn("[VietmapGL] Error:", e?.error?.message ?? e)
    );

    setMapInstance(map);

    return () => {
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync map style when theme changes ──────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;
    const style = getStyleUrl();
    mapInstance.setStyle(style);
  }, [mapInstance, isLoaded, resolvedTheme, styles]);

  // ── Sync viewport props ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance || mapInstance.isMoving()) return;
    mapInstance.setCenter(center);
  }, [mapInstance, center[0], center[1]]);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setZoom(zoom);
  }, [mapInstance, zoom]);

  return (
    <MapContext.Provider value={mapInstance}>
      <div
        ref={containerRef}
        className={className ?? "w-full h-full relative"}
        style={{ minHeight: "200px" }}
      >
        {mapInstance && isLoaded && children}
      </div>
    </MapContext.Provider>
  );
});

// ── MapMarker ─────────────────────────────────────────────────────────────────

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children?: ReactNode;
  onClick?: (e: MouseEvent) => void;
  anchor?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
};

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  anchor = "bottom",
}: MapMarkerProps) {
  const map = useMap();
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    const el = document.createElement("div");
    el.style.cursor = "pointer";

    const markerInstance = new vietmapgl.Marker({
      element: children ? el : undefined,
      anchor,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = markerInstance;
    setElement(el);

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (onClick) onClick(e);
    };

    if (children) {
      el.addEventListener("click", handleClick);
    } else {
      markerInstance.getElement().addEventListener("click", handleClick);
    }

    return () => {
      if (children) {
        el.removeEventListener("click", handleClick);
      } else {
        markerInstance.getElement()?.removeEventListener("click", handleClick);
      }
      markerInstance.remove();
      setElement(null);
    };
  }, [map, children !== undefined]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }, [longitude, latitude]);

  if (children && element) {
    return createPortal(children, element);
  }
  return null;
}

export { MapMarker as Marker };
