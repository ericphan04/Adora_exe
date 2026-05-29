import React, { useState, useEffect, useCallback } from "react";
import { Map, MapMarker, useMap } from "@/components/ui/map";
import { MapPin, Search, Loader2, Compass } from "lucide-react";
import { getGoogleMapsApiKey } from "../../utils/billboardMap";

// Helper component to bind map click events
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handleMapClick = (e: any) => {
      onClick(e.lngLat.lat, e.lngLat.lng);
    };
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onClick]);
  return null;
}

// Helper component to center map when selected position changes
function MapCenterSync({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map || latitude == null || longitude == null) return;
    map.easeTo({
      center: [longitude, latitude],
      zoom: 15,
      duration: 500,
    });
  }, [map, latitude, longitude]);
  return null;
}

export interface LocationPickerValue {
  formattedAddress: string;
  addressDetail?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  value: LocationPickerValue;
  onChange: (val: LocationPickerValue) => void;
}



// Clean and standardize fields returned by OpenStreetMap Nominatim for Vietnamese addresses
function parseNominatimAddress(addr: any) {
  if (!addr) return { city: "", district: "", ward: "" };

  // 1. Province/City (highest administrative level)
  // If province exists, it's the province (e.g., Tỉnh Quảng Nam). Otherwise, it's the municipality (e.g., Thành phố Đà Nẵng).
  const city = addr.province || addr.state || addr.city || addr.municipality || "";
  
  // 2. District (second administrative level)
  // If city exists AND province exists, then city is actually the district/town (e.g. Thành phố Hội An).
  // Otherwise, district is the usual district fields.
  let district = "";
  if (addr.province && addr.city) {
    district = addr.city;
  } else {
    district = addr.subdistrict || addr.district || addr.county || addr.city_district || addr.town || addr.village || "";
  }

  // 3. Ward (third administrative level)
  let ward = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.ward || addr.hamlet || "";

  // If district and ward are the same, clear ward to prevent duplication
  if (district === ward) {
    ward = "";
  }

  return {
    city: city.replace(/Thành phố /i, "").replace(/Tỉnh /i, "").trim(),
    district: district.replace(/Quận /i, "").replace(/Huyện /i, "").replace(/Thị xã /i, "").replace(/Thành phố /i, "").trim(),
    ward: ward.replace(/Phường /i, "").replace(/Xã /i, "").replace(/Thị trấn /i, "").trim(),
  };
}

// Prepend house number prefix (if present in the query) to the suggestion name if it's missing
function getFormattedSuggestionName(sugName: string, searchQuery: string): string {
  let displayAddress = sugName;
  const houseNumberRegex = /^((?:kiệt|k|hẻm|ngõ)?\s*\d+[\w\/\-\.]*)/i;
  const queryMatch = searchQuery.trim().match(houseNumberRegex);
  if (queryMatch) {
    const houseNumber = queryMatch[1];
    const cleanDisplayName = sugName.trim();
    
    const digitMatch = houseNumber.match(/\d+/);
    const digitPart = digitMatch ? digitMatch[0] : null;
    
    let alreadyHasHouseNumber = false;
    if (digitPart) {
      const checkRegex = new RegExp(`\\b${digitPart}(?!\\d)`, 'i');
      alreadyHasHouseNumber = checkRegex.test(cleanDisplayName);
    } else {
      alreadyHasHouseNumber = cleanDisplayName.toLowerCase().includes(houseNumber.toLowerCase());
    }

    if (!alreadyHasHouseNumber) {
      // Check if suggestion starts with a different house number (e.g., 158 instead of 156)
      const sugMatch = cleanDisplayName.match(/^(\d+[\w\/\-\.]*)\s*,?\s*/);
      if (sugMatch) {
        displayAddress = `${houseNumber}, ${cleanDisplayName.slice(sugMatch[0].length)}`;
      } else {
        displayAddress = `${houseNumber} ${cleanDisplayName}`;
      }
    }
  }
  return displayAddress;
}

function getVietmapApiKey(): string {
  const key = import.meta.env.VITE_VIETMAP_API_KEY?.trim() ?? "";
  if (
    !key ||
    key === "YOUR_VIETMAP_API_KEY" ||
    key === "your_vietmap_api_key_here" ||
    key.includes("YOUR_")
  ) {
    return "";
  }
  return key;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value.formattedAddress || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync internal search query state with external formatted address
  useEffect(() => {
    if (value.formattedAddress) {
      setSearchQuery(value.formattedAddress);
    }
  }, [value.formattedAddress]);

  // Debounced search suggestion fetcher
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery === value.formattedAddress) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setSearching(true);
      setError(null);

      const originalQuery = searchQuery.trim();
      let fullQuery = originalQuery;
      
      // Prioritize Da Nang or check if city is specified.
      const q = fullQuery.toLowerCase();
      const hasCity = q.includes("đà nẵng") || q.includes("da nang") || 
                      q.includes("hồ chí minh") || q.includes("ho chi minh") || q.includes("hcm") ||
                      q.includes("hà nội") || q.includes("ha noi") ||
                      q.includes("sài gòn") || q.includes("sai gon");
      if (!hasCity) {
        fullQuery = `${fullQuery}, Đà Nẵng`;
      }

      // 1. Try Vietmap Autocomplete API if key is available
      const vietmapKey = getVietmapApiKey();
      if (vietmapKey) {
        try {
          const res = await fetch(
            `https://maps.vietmap.vn/api/autocomplete/v4?apikey=${vietmapKey}&text=${encodeURIComponent(
              fullQuery
            )}&display_type=2`
          );
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            const mappedSuggestions = data.map((item: any) => {
              let city = "";
              let district = "";
              let ward = "";

              if (item.boundaries && Array.isArray(item.boundaries)) {
                for (const b of item.boundaries) {
                  if (b.type === 0) city = b.full_name || b.name || "";
                  else if (b.type === 1) district = b.full_name || b.name || "";
                  else if (b.type === 2) ward = b.full_name || b.name || "";
                }
              } else if (item.data_old) {
                city = item.data_old.city || "";
                district = item.data_old.district || "";
                ward = item.data_old.ward || "";
              }

              const displayAddress = (item.name && item.address && !item.address.toLowerCase().includes(item.name.toLowerCase()))
                ? `${item.name}, ${item.address}`
                : item.display || item.address || item.name || "";

              return {
                ref_id: item.ref_id,
                lat: (item.lat || item.lng ? item.lat : 0).toString(),
                lon: (item.lng || item.lat ? item.lng : 0).toString(),
                display_name: displayAddress,
                address: {
                  province: city,
                  city: district,
                  suburb: ward,
                }
              };
            });
            setSuggestions(mappedSuggestions);
            setSearching(false); // ✅ stop spinner before early return
            return;
          }
        } catch (vietmapErr) {
          console.error("Vietmap Autocomplete error, falling back to Google/OSM", vietmapErr);
        }
      }

      // 2. Try Google Geocoding API if key is available
      const googleKey = getGoogleMapsApiKey();
      if (googleKey) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              fullQuery
            )}&key=${googleKey}&language=vi`
          );
          const data = await res.json();
          if (data && data.status === "OK" && data.results && data.results.length > 0) {
            const mappedSuggestions = data.results.map((r: any) => {
              let city = "";
              let district = "";
              let ward = "";
              
              for (const comp of r.address_components) {
                if (comp.types.includes("administrative_area_level_1")) {
                  city = comp.long_name;
                } else if (comp.types.includes("administrative_area_level_2")) {
                  district = comp.long_name;
                } else if (
                  comp.types.includes("sublocality_level_1") || 
                  comp.types.includes("sublocality") || 
                  comp.types.includes("ward")
                ) {
                  ward = comp.long_name;
                }
              }
              
              return {
                lat: r.geometry.location.lat.toString(),
                lon: r.geometry.location.lng.toString(),
                display_name: r.formatted_address,
                address: {
                  province: city,
                  city: district,
                  suburb: ward,
                }
              };
            });
            setSuggestions(mappedSuggestions);
            setSearching(false); // ✅ stop spinner before early return
            return;
          }
        } catch (googleErr) {
          console.error("Google Geocoding error, falling back to Nominatim", googleErr);
        }
      }

      // 2. Fallback: Nominatim Geocoding
      try {
        // Try querying the full address with house number first
        let res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            fullQuery
          )}&countrycodes=vn&viewbox=108.0,16.2,108.4,15.9&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "vi,en;q=0.9",
              "User-Agent": "AdoraBillboardRentalApp/1.0",
            },
          }
        );
        let data = await res.json();

        // If no results found, check if there's a house number and fall back to searching the street only
        if (!data || data.length === 0) {
          const houseNumberRegex = /^((?:kiệt|k|hẻm|ngõ)?\s*\d+[\w\/\-\.]*)\s+/i;
          const match = originalQuery.match(houseNumberRegex);
          if (match) {
            let strippedQuery = originalQuery.slice(match[0].length).trim();
            if (strippedQuery) {
              if (!hasCity) {
                strippedQuery = `${strippedQuery}, Đà Nẵng`;
              }
              const fallbackRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  strippedQuery
                )}&countrycodes=vn&viewbox=108.0,16.2,108.4,15.9&addressdetails=1&limit=5`,
                {
                  headers: {
                    "Accept-Language": "vi,en;q=0.9",
                    "User-Agent": "AdoraBillboardRentalApp/1.0",
                  },
                }
              );
              data = await fallbackRes.json();
            }
          }
        }

        setSuggestions(data || []);
      } catch (err) {
        console.error("Nominatim search error", err);
        setError("Không thể tìm kiếm địa chỉ");
      } finally {
        setSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, value.formattedAddress]);

  const handleSelectSuggestion = async (sug: any) => {
    let lat = parseFloat(sug.lat);
    let lon = parseFloat(sug.lon);
    let city = "";
    let district = "";
    let ward = "";
    let displayAddress = sug.display_name;

    const vietmapKey = getVietmapApiKey();
    if (sug.ref_id && vietmapKey) {
      try {
        setLoading(true);
        // Fetch detailed info including precise lat/lng and parsed address boundaries
        const res = await fetch(
          `https://maps.vietmap.vn/api/place/v3?apikey=${vietmapKey}&refid=${encodeURIComponent(sug.ref_id)}`
        );
        const details = await res.json();
        if (details && details.lat != null && details.lng != null) {
          lat = details.lat;
          lon = details.lng;
          city = details.city || "";
          district = details.district || "";
          ward = details.ward || "";
          displayAddress = details.display || details.address || sug.display_name;
        }
      } catch (err) {
        console.error("Vietmap Place details fetch error, using autocomplete fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!city && !district && !ward) {
      const parsed = parseNominatimAddress(sug.address);
      city = parsed.city;
      district = parsed.district;
      ward = parsed.ward;
    }

    const formattedAddress = getFormattedSuggestionName(displayAddress, searchQuery);

    const newLoc: LocationPickerValue = {
      latitude: lat,
      longitude: lon,
      formattedAddress: formattedAddress,
      city: city.replace(/Thành phố /i, "").replace(/Tỉnh /i, "").trim() || "Đà Nẵng",
      district: district.replace(/Quận /i, "").replace(/Huyện /i, "").replace(/Thị xã /i, "").replace(/Thành phố /i, "").trim() || "",
      ward: ward.replace(/Phường /i, "").replace(/Xã /i, "").replace(/Thị trấn /i, "").trim() || "",
      addressDetail: value.addressDetail || "",
    };

    setSearchQuery(formattedAddress);
    setShowDropdown(false);
    onChange(newLoc);
  };

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      
      const houseNumberRegex = /^((?:kiệt|k|hẻm|ngõ)?\s*\d+[\w\/\-\.]*)/i;
      const queryMatch = searchQuery.trim().match(houseNumberRegex) || (value.formattedAddress || "").trim().match(houseNumberRegex);
      const houseNumber = queryMatch ? queryMatch[1] : null;

      // 1. Try Vietmap Reverse Geocoding API if key is available
      const vietmapKey = getVietmapApiKey();
      if (vietmapKey) {
        try {
          const res = await fetch(
            `https://maps.vietmap.vn/api/reverse/v4?apikey=${vietmapKey}&lat=${lat}&lng=${lng}&display_type=2`
          );
          const responseData = await res.json();
          const results = Array.isArray(responseData) ? responseData : (responseData?.data || []);
          if (results && results.length > 0) {
            const firstResult = results[0];
            let city = "";
            let district = "";
            let ward = "";

            if (firstResult.boundaries && Array.isArray(firstResult.boundaries)) {
              for (const b of firstResult.boundaries) {
                if (b.type === 0) city = b.full_name || b.name || "";
                else if (b.type === 1) district = b.full_name || b.name || "";
                else if (b.type === 2) ward = b.full_name || b.name || "";
              }
            } else if (firstResult.data_old) {
              city = firstResult.data_old.city || "";
              district = firstResult.data_old.district || "";
              ward = firstResult.data_old.ward || "";
            }

            let displayAddress = (firstResult.name && firstResult.address && !firstResult.address.toLowerCase().includes(firstResult.name.toLowerCase()))
              ? `${firstResult.name}, ${firstResult.address}`
              : firstResult.display || firstResult.address || firstResult.name || "";

            if (houseNumber) {
              const cleanDisplayName = displayAddress.trim();
              const digitMatch = houseNumber.match(/\d+/);
              const digitPart = digitMatch ? digitMatch[0] : null;
              
              let alreadyHasHouseNumber = false;
              if (digitPart) {
                const checkRegex = new RegExp(`\\b${digitPart}(?!\\d)`, 'i');
                alreadyHasHouseNumber = checkRegex.test(cleanDisplayName);
              } else {
                alreadyHasHouseNumber = cleanDisplayName.toLowerCase().includes(houseNumber.toLowerCase());
              }

              if (!alreadyHasHouseNumber) {
                const sugMatch = cleanDisplayName.match(/^(\d+[\w\/\-\.]*)\s*,?\s*/);
                if (sugMatch) {
                  displayAddress = `${houseNumber}, ${cleanDisplayName.slice(sugMatch[0].length)}`;
                } else {
                  displayAddress = `${houseNumber} ${cleanDisplayName}`;
                }
              }
            }

            const newLoc: LocationPickerValue = {
              latitude: lat,
              longitude: lng,
              formattedAddress: displayAddress,
              city: city.replace(/Thành phố /i, "").replace(/Tỉnh /i, "").trim() || "Đà Nẵng",
              district: district.replace(/Quận /i, "").replace(/Huyện /i, "").replace(/Thị xã /i, "").replace(/Thành phố /i, "").trim() || "",
              ward: ward.replace(/Phường /i, "").replace(/Xã /i, "").replace(/Thị trấn /i, "").trim() || "",
              addressDetail: value.addressDetail || "",
            };
            setSearchQuery(displayAddress);
            onChange(newLoc);
            setLoading(false);
            return;
          }
        } catch (vietmapErr) {
          console.error("Vietmap Reverse Geocoding error, falling back to Google/OSM", vietmapErr);
        }
      }

      const googleKey = getGoogleMapsApiKey();
      if (googleKey) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}&language=vi`
          );
          const data = await res.json();
          if (data && data.status === "OK" && data.results && data.results.length > 0) {
            const firstResult = data.results[0];
            
            let city = "";
            let district = "";
            let ward = "";
            
            for (const comp of firstResult.address_components) {
              if (comp.types.includes("administrative_area_level_1")) {
                city = comp.long_name;
              } else if (comp.types.includes("administrative_area_level_2")) {
                district = comp.long_name;
              } else if (
                comp.types.includes("sublocality_level_1") || 
                comp.types.includes("sublocality") || 
                comp.types.includes("ward")
              ) {
                ward = comp.long_name;
              }
            }

            let displayAddress = firstResult.formatted_address;
            
            if (houseNumber) {
              const cleanDisplayName = displayAddress.trim();
              const digitMatch = houseNumber.match(/\d+/);
              const digitPart = digitMatch ? digitMatch[0] : null;
              
              let alreadyHasHouseNumber = false;
              if (digitPart) {
                const checkRegex = new RegExp(`\\b${digitPart}(?!\\d)`, 'i');
                alreadyHasHouseNumber = checkRegex.test(cleanDisplayName);
              } else {
                alreadyHasHouseNumber = cleanDisplayName.toLowerCase().includes(houseNumber.toLowerCase());
              }

              if (!alreadyHasHouseNumber) {
                const sugMatch = cleanDisplayName.match(/^(\d+[\w\/\-\.]*)\s*,?\s*/);
                if (sugMatch) {
                  displayAddress = `${houseNumber}, ${cleanDisplayName.slice(sugMatch[0].length)}`;
                } else {
                  displayAddress = `${houseNumber} ${cleanDisplayName}`;
                }
              }
            }

            const newLoc: LocationPickerValue = {
              latitude: lat,
              longitude: lng,
              formattedAddress: displayAddress,
              city: city.replace(/Thành phố /i, "").replace(/Tỉnh /i, "").trim() || "Đà Nẵng",
              district: district.replace(/Quận /i, "").replace(/Huyện /i, "").replace(/Thị xã /i, "").replace(/Thành phố /i, "").trim() || "",
              ward: ward.replace(/Phường /i, "").replace(/Xã /i, "").replace(/Thị trấn /i, "").trim() || "",
              addressDetail: value.addressDetail || "",
            };
            setSearchQuery(displayAddress);
            onChange(newLoc);
            setLoading(false);
            return;
          }
        } catch (googleErr) {
          console.error("Google Reverse Geocoding error, falling back to Nominatim", googleErr);
        }
      }

      // Fallback: Nominatim Reverse Geocoding
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "vi,en;q=0.9",
              "User-Agent": "AdoraBillboardRentalApp/1.0",
            },
          }
        );
        const data = await res.json();
        if (data) {
          const { city, district, ward } = parseNominatimAddress(data.address);
          
          let displayAddress = data.display_name;
          if (houseNumber) {
            const cleanDisplayName = displayAddress.trim();
            const digitMatch = houseNumber.match(/\d+/);
            const digitPart = digitMatch ? digitMatch[0] : null;
            
            let alreadyHasHouseNumber = false;
            if (digitPart) {
              const checkRegex = new RegExp(`\\b${digitPart}(?!\\d)`, 'i');
              alreadyHasHouseNumber = checkRegex.test(cleanDisplayName);
            } else {
              alreadyHasHouseNumber = cleanDisplayName.toLowerCase().includes(houseNumber.toLowerCase());
            }

            if (!alreadyHasHouseNumber) {
              const sugMatch = cleanDisplayName.match(/^(\d+[\w\/\-\.]*)\s*,?\s*/);
              if (sugMatch) {
                displayAddress = `${houseNumber}, ${cleanDisplayName.slice(sugMatch[0].length)}`;
              } else {
                displayAddress = `${houseNumber} ${cleanDisplayName}`;
              }
            }
          }

          const newLoc: LocationPickerValue = {
            latitude: lat,
            longitude: lng,
            formattedAddress: displayAddress,
            city: city || "Đà Nẵng",
            district: district || "",
            ward: ward || "",
            addressDetail: value.addressDetail || "",
          };
          setSearchQuery(displayAddress);
          onChange(newLoc);
        }
      } catch (err) {
        console.error("Nominatim reverse error", err);
        setError("Không thể lấy thông tin địa chỉ từ bản đồ. Đã lưu tọa độ.");
        onChange({
          ...value,
          latitude: lat,
          longitude: lng,
        });
      } finally {
        setLoading(false);
      }
    },
    [value, onChange, searchQuery]
  );

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <label className="block font-medium text-[#6B7A8D] mb-1.5">
          Tìm kiếm địa chỉ trên bản đồ *
        </label>
        <div className="relative flex items-center bg-white border border-[#E3E8EF] rounded-lg px-3 py-2 shadow-sm focus-within:border-[#1D4ED8] transition-colors">
          <Search className="w-4 h-4 text-[#6B7A8D] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Nhập địa chỉ để tìm kiếm vị trí..."
            className="w-full text-xs text-foreground bg-transparent border-none outline-none focus:ring-0 p-0"
          />
          {(searching || loading) && (
            <Loader2 className="w-4 h-4 text-[#1D4ED8] animate-spin ml-2 shrink-0" />
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-[#E3E8EF] rounded-lg mt-1 shadow-lg z-30 max-h-60 overflow-y-auto">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-[#F0F9FF] hover:text-[#1D4ED8] border-b border-[#F8FAFC] last:border-0 transition-colors flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-accent shrink-0" />
                <span className="truncate">{getFormattedSuggestionName(sug.display_name, searchQuery)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Dropdown Backdrop to close on blur */}
        {showDropdown && suggestions.length > 0 && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Map Preview */}
      <div className="relative border border-[#E3E8EF] rounded-xl overflow-hidden bg-slate-100 h-64 shadow-inner">
        <Map
          center={
            value.latitude != null && value.longitude != null
              ? [value.longitude, value.latitude]
              : [108.2022, 16.0544] // default Danang
          }
          zoom={value.latitude != null ? 15 : 12}
          className="w-full h-full"
        >
          <MapClickHandler onClick={handleMapClick} />
          <MapCenterSync latitude={value.latitude} longitude={value.longitude} />

          {value.latitude != null && value.longitude != null && (
            <MapMarker latitude={value.latitude} longitude={value.longitude} anchor="bottom">
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 text-red-500 fill-red-100 filter drop-shadow-md animate-bounce" />
                <div className="bg-[#1D4ED8] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md mt-0.5 whitespace-nowrap">
                  Vị trí đã chọn
                </div>
              </div>
            </MapMarker>
          )}
        </Map>

        {/* Helper Instructions Overlay */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border border-[#E3E8EF] rounded-lg p-2 text-[10px] text-[#6B7A8D] font-medium pointer-events-none max-w-xs shadow-sm flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-accent animate-spin" />
          <span>Click trực tiếp trên bản đồ để chọn vị trí</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-[11px] text-red-500 font-semibold bg-red-50 p-2 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Display coordinates and address fields */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-[#E3E8EF] rounded-xl p-4.5 text-xs">
        <div className="col-span-2">
          <label className="block font-bold text-[#1D4ED8] mb-1">
            Địa chỉ hiển thị trên bản đồ
          </label>
          <input
            type="text"
            placeholder="Địa chỉ chưa được xác định trên bản đồ..."
            value={value.formattedAddress || ""}
            onChange={(e) => onChange({ ...value, formattedAddress: e.target.value })}
            className="w-full bg-white border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div className="col-span-2">
          <label className="block font-medium text-[#6B7A8D] mb-1">
            Mô tả chi tiết vị trí (ngõ/ngách, đối diện, gần...)
          </label>
          <input
            type="text"
            value={value.addressDetail || ""}
            onChange={(e) => onChange({ ...value, addressDetail: e.target.value })}
            placeholder="VD: Gần ngã ba, đối diện tòa nhà..."
            className="w-full bg-white border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="block font-medium text-[#6B7A8D] mb-1">Phường / Xã</label>
          <input
            type="text"
            value={value.ward || ""}
            onChange={(e) => onChange({ ...value, ward: e.target.value })}
            placeholder="VD: Khuê Mỹ"
            className="w-full bg-white border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="block font-medium text-[#6B7A8D] mb-1">Quận / Huyện *</label>
          <input
            required
            type="text"
            value={value.district || ""}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            placeholder="VD: Ngũ Hành Sơn"
            className="w-full bg-white border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="block font-medium text-[#6B7A8D] mb-1">Thành phố *</label>
          <input
            required
            type="text"
            value={value.city || ""}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="VD: Đà Nẵng"
            className="w-full bg-white border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="block font-medium text-[#6B7A8D] mb-1">Tọa độ đã chọn</label>
          <div className="w-full bg-slate-100 border border-[#E3E8EF] rounded-lg p-2 text-slate-600 truncate font-mono">
            {value.latitude != null && value.longitude != null
              ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
              : "Chưa chọn tọa độ"}
          </div>
        </div>
      </div>
    </div>
  );
}
