import React, { useCallback, useEffect, useMemo } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";
import { BillboardDto } from "../../../types/billboard";
import {
  DANANG_CENTER,
  getBillboardRentalStatus,
  getGoogleMapsApiKey,
  resolveBillboardPosition,
} from "../../utils/billboardMap";

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

function FitBoundsHandler({
  markers,
  enabled,
}: {
  markers: MapMarkerBillboard[];
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !enabled || markers.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend(m.position));
    map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
  }, [map, markers, enabled]);

  return null;
}

function MapInner({
  billboards,
  selectedId,
  onSelect,
  fitBounds,
  zoom = 13,
  singleMarker,
}: BillboardGoogleMapProps) {
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

  const handleSelect = useCallback(
    (id: number) => {
      if (!onSelect) return;
      onSelect(selectedId === id ? null : id);
    },
    [onSelect, selectedId]
  );

  return (
    <Map
      defaultCenter={center}
      defaultZoom={zoom}
      gestureHandling="greedy"
      disableDefaultUI={false}
      className="w-full h-full"
      colorScheme="LIGHT"
    >
      {fitBounds && !singleMarker && (
        <FitBoundsHandler markers={markers} enabled />
      )}
      {markers.map((m) => (
        <Marker
          key={m.billboard.id}
          position={m.position}
          title={m.billboard.title}
          icon={{
            url: markerIcon(m.status, selectedId === m.billboard.id),
            scaledSize: new google.maps.Size(40, 48),
            anchor: new google.maps.Point(20, 48),
          }}
          onClick={() => handleSelect(m.billboard.id)}
        />
      ))}
    </Map>
  );
}

export function BillboardGoogleMap(props: BillboardGoogleMapProps) {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center bg-[#0f172a] text-white p-8 ${props.className ?? ""}`}
      >
        <div className="max-w-md text-center space-y-3">
          <p className="text-lg font-semibold">Cần Google Maps API Key</p>
          <p className="text-sm text-slate-300">
            Tạo file <code className="bg-white/10 px-1 rounded">.env</code> và thêm{" "}
            <code className="bg-white/10 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code>.
            Bật Maps JavaScript API trong Google Cloud Console.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={props.className ?? "w-full h-full"}>
      <APIProvider apiKey={apiKey} language="vi" region="VN">
        <MapInner {...props} />
      </APIProvider>
    </div>
  );
}
