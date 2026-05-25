import React, { useEffect, useMemo, useRef } from "react";
import { Map, MapMarker, type MapRef } from "@/components/ui/map";
import { BillboardDto } from "../../../types/billboard";
import {
  DANANG_CENTER,
  getBillboardRentalStatus,
  resolveBillboardPosition,
} from "../../utils/billboardMap";
import maplibregl from "maplibre-gl";

export interface MapMarkerBillboard {
  billboard: BillboardDto;
  position: { lat: number; lng: number };
  status: "available" | "booked";
}

interface BillboardGoogleMapProps {
  billboards: BillboardDto[];
  selectedId?: number | null;
  onSelect?: (id: number | null) => void;
  className?: string;
  fitBounds?: boolean;
  zoom?: number;
  singleMarker?: boolean;
}

function markerIcon(status: "available" | "booked", selected: boolean): string {
  const fill = status === "available" ? "#10B981" : "#F59E0B";
  const ring = selected
    ? `<circle cx="20" cy="20" r="18" fill="none" stroke="${fill}" stroke-width="3" opacity="0.45"/>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    ${ring}
    <path d="M20 2C11.16 2 4 9.16 4 18c0 11.25 16 28 16 28s16-16.75 16-28C36 9.16 28.84 2 20 2z" fill="${fill}" stroke="#fff" stroke-width="2"/>
    <circle cx="20" cy="18" r="6" fill="#fff"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function BillboardGoogleMap({
  billboards,
  selectedId,
  onSelect,
  className,
  fitBounds = true,
  zoom = 13,
  singleMarker,
}: BillboardGoogleMapProps) {
  const mapRef = useRef<MapRef>(null);

  const markers = useMemo<MapMarkerBillboard[]>(
    () =>
      billboards.map((b, i) => ({
        billboard: b,
        position: resolveBillboardPosition(b, i),
        status: getBillboardRentalStatus(b),
      })),
    [billboards]
  );

  const selectedMarker = markers.find((m) => m.billboard.id === selectedId);
  const center = selectedMarker?.position ?? DANANG_CENTER;

  // Fit bounds when markers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitBounds || markers.length === 0 || singleMarker) return;

    const bounds = new maplibregl.LngLatBounds();
    markers.forEach((m) => bounds.extend([m.position.lng, m.position.lat]));

    map.fitBounds(bounds, { padding: 80, duration: 800 });
  }, [markers, fitBounds, singleMarker]);

  // Center on selected marker when it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedId == null || !selectedMarker) return;

    map.easeTo({
      center: [selectedMarker.position.lng, selectedMarker.position.lat],
      zoom: 15,
      duration: 800,
    });
  }, [selectedId]);

  return (
    <div className={className ?? "w-full h-full relative"}>
      <Map
        ref={mapRef}
        center={[center.lng, center.lat]} // [lng, lat]
        zoom={zoom}
        styles={{
          light: "https://tiles.openfreemap.org/styles/bright",
        }}
      >
        {markers.map((m) => (
          <MapMarker
            key={m.billboard.id}
            longitude={m.position.lng}
            latitude={m.position.lat}
            onClick={() => onSelect?.(selectedId === m.billboard.id ? null : m.billboard.id)}
            anchor="bottom"
          >
            <img
              src={markerIcon(m.status, selectedId === m.billboard.id)}
              className="w-10 h-12 select-none"
              alt={m.billboard.title}
              title={m.billboard.title}
            />
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
