'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Check } from 'lucide-react';

interface ProfileLocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
  heightClass?: string;
}

export default function ProfileLocationPickerMap({
  initialLat = 23.8103,
  initialLng = 90.4125,
  onChangeLocation,
  heightClass = 'h-72',
}: ProfileLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 23.8103,
    lng: initialLng || 90.4125,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const startLat = initialLat || 23.8103;
    const startLng = initialLng || 90.4125;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: initialLat ? 14 : 9,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | BloodBond',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'picker-pin-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(220, 38, 38, 0.2); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            background: #dc2626;
            border: 2px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 34],
    });

    const marker = L.marker([startLat, startLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    marker.bindTooltip('Drag me or click anywhere on the map to set your location', {
      permanent: false,
      direction: 'top',
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCurrentCoords({ lat: pos.lat, lng: pos.lng });
      onChangeLocation(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      onChangeLocation(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        setGpsSuccess(true);
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setCurrentCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
          markerRef.current.setLatLng([lat, lng]);
        }
        onChangeLocation(lat, lng);
        setTimeout(() => setGpsSuccess(false), 3000);
      },
      (err) => {
        setIsDetecting(false);
        alert('Could not retrieve your location. Please click on the map to set your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-700">
        <span className="font-semibold flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-blood-600" />
          <span>Click on map or drag pin to your exact location</span>
        </span>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetecting}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-sm ${
            gpsSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-blood-50 text-blood-700 hover:bg-blood-100 border border-blood-200'
          }`}
        >
          {gpsSuccess ? (
            <>
              <Check className="w-3 h-3 text-white" />
              <span>Location Detected!</span>
            </>
          ) : (
            <>
              <Crosshair className={`w-3 h-3 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Detecting...' : 'Detect My GPS'}</span>
            </>
          )}
        </button>
      </div>

      <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-gray-300 shadow-inner`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-[11px] font-mono text-gray-700 shadow border border-gray-200">
          Lat: {currentCoords.lat.toFixed(4)}, Lng: {currentCoords.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
