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
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapRef = maplibregl.Map;

export type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

const defaultStyles = {
  light: "https://tiles.openfreemap.org/styles/bright",
  dark: "https://tiles.openfreemap.org/styles/bright", // fallback to bright if no dark
};

type MapProps = {
  children?: ReactNode;
  className?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  styles?: {
    light?: string;
    dark?: string;
  };
  pitch?: number;
  bearing?: number;
} & Omit<maplibregl.MapOptions, "container" | "style">;

const MapContext = createContext<maplibregl.Map | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  return context;
}

export const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    children,
    className,
    center = [108.2022, 16.0544], // Default: Danang Center [lng, lat]
    zoom = 13,
    styles,
    pitch = 0,
    bearing = 0,
    ...props
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeStyle = styles?.light ?? defaultStyles.light;

  // Expose the map instance to parent via ref
  useImperativeHandle(ref, () => mapInstance as maplibregl.Map, [mapInstance]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: activeStyle,
      center: center,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      attributionControl: true,
      ...props,
    });

    map.on("load", () => {
      setIsLoaded(true);
    });

    setMapInstance(map);

    return () => {
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    };
  }, []);

  // Sync style changes
  const styleRef = useRef(activeStyle);
  useEffect(() => {
    if (!mapInstance || styleRef.current === activeStyle) return;
    styleRef.current = activeStyle;
    mapInstance.setStyle(activeStyle);
  }, [mapInstance, activeStyle]);

  // Sync center/zoom/pitch/bearing when changed from props
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

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children?: ReactNode;
  onClick?: (e: MouseEvent) => void;
  anchor?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
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
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    const el = document.createElement("div");
    el.style.cursor = "pointer";

    const markerInstance = new maplibregl.Marker({
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
        markerInstance.getElement().removeEventListener("click", handleClick);
      }
      markerInstance.remove();
      setElement(null);
    };
  }, [map, children !== undefined]);

  // Sync position changes
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

// Export as Marker too for convenience
export { MapMarker as Marker };
