'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Heart,
  Navigation,
  ExternalLink,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

export interface MapDonor {
  id: string;
  userId: string;
  fullName: string;
  bloodGroup: string;
  divisionId: string;
  divisionName: string;
  divisionBnName?: string;
  districtId: string;
  districtName: string;
  districtBnName?: string;
  upazilaId?: string;
  upazilaName?: string;
  areaName: string;
  addressDetails?: string | null;
  latitude: number;
  longitude: number;
  availabilityStatus: string;
  isInCooldown: boolean;
  isClinicallyAvailable: boolean;
  verificationStatus: string;
  lastDonationDate?: string | null;
  nextEligibleDate?: string | null;
  responseRate: number;
  totalDonationsCount: number;
  preferredContactMethod?: string;
  phone: string;
  isPhoneMasked: boolean;
  distanceKm?: number | null;
}

interface LiveDonorsMapProps {
  donors: MapDonor[];
  selectedDonorId?: string | null;
  onSelectDonor?: (donor: MapDonor) => void;
  onRequestBlood?: (donor: MapDonor) => void;
  seekerLocation?: { lat: number; lng: number } | null;
  radiusKm?: number | null;
  initialCenter?: [number, number];
  initialZoom?: number;
  heightClass?: string;
}

export default function LiveDonorsMap({
  donors,
  selectedDonorId,
  onSelectDonor,
  onRequestBlood,
  seekerLocation,
  radiusKm,
  initialCenter = [23.8103, 90.4125], // Dhaka center
  initialZoom = 7,
  heightClass = 'h-[600px]',
}: LiveDonorsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const seekerMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | BloodBond Bangladesh',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Seeker Position & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing seeker marker and circle
    if (seekerMarkerRef.current) {
      seekerMarkerRef.current.remove();
      seekerMarkerRef.current = null;
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (seekerLocation) {
      const seekerIcon = L.divIcon({
        className: 'custom-seeker-icon',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 22px; height: 22px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      seekerMarkerRef.current = L.marker([seekerLocation.lat, seekerLocation.lng], {
        icon: seekerIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 13px; text-align: center; padding: 4px;">
            <b style="color: #1e40af;">📍 Your Search Location</b><br/>
            <span style="color: #64748b; font-size: 11px;">Latitude: ${seekerLocation.lat.toFixed(4)}, Longitude: ${seekerLocation.lng.toFixed(4)}</span>
          </div>
        `);

      if (radiusKm && radiusKm > 0) {
        radiusCircleRef.current = L.circle([seekerLocation.lat, seekerLocation.lng], {
          radius: radiusKm * 1000,
          color: '#3b82f6',
          fillColor: '#93c5fd',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);
      }
    }
  }, [seekerLocation, radiusKm]);

  // Update Donor Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    donors.forEach((donor) => {
      if (!donor.latitude || !donor.longitude) return;

      const isSelected = selectedDonorId === donor.id;

      // Color logic
      let badgeColor = '#059669'; // Emerald Available
      let badgeBorder = '#047857';
      let statusText = 'Ready to Donate';
      let statusBg = '#ecfdf5';
      let statusTextColor = '#065f46';

      if (donor.isInCooldown) {
        badgeColor = '#6366f1'; // Indigo Cooldown
        badgeBorder = '#4f46e5';
        statusText = 'In 90-Day Cooldown';
        statusBg = '#eef2ff';
        statusTextColor = '#3730a3';
      } else if (donor.availabilityStatus === 'TEMPORARILY_BUSY') {
        badgeColor = '#d97706'; // Amber Busy
        badgeBorder = '#b45309';
        statusText = 'Temporarily Busy';
        statusBg = '#fffbeb';
        statusTextColor = '#92400e';
      }

      const pulseHtml = donor.isClinicallyAvailable
        ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: ${badgeColor}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
        : '';

      const markerHtml = `
        <div style="position: relative; width: 38px; height: 38px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          ${pulseHtml}
          <div style="
            position: relative;
            width: 34px;
            height: 34px;
            background: ${badgeColor};
            border: 2.5px solid ${isSelected ? '#ffffff' : '#ffffff'};
            box-shadow: ${isSelected ? '0 0 0 3px #dc2626, 0 8px 16px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.2)'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <div style="
              transform: rotate(45deg);
              font-family: ui-sans-serif, system-ui, sans-serif;
              font-size: 11px;
              font-weight: 800;
              color: #ffffff;
              letter-spacing: -0.5px;
            ">
              ${donor.bloodGroup}
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-donor-marker',
        html: markerHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([donor.latitude, donor.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : (donor.isClinicallyAvailable ? 200 : 100),
      });

      // Distance snippet
      const distHtml = donor.distanceKm !== null && donor.distanceKm !== undefined
        ? `<span style="display: inline-block; background: #f1f5f9; color: #0f172a; padding: 2px 7px; border-radius: 9999px; font-weight: 700; font-size: 11px; margin-left: 6px;">
            ${donor.distanceKm < 1 ? '<1 km' : `${donor.distanceKm.toFixed(1)} km`}
           </span>`
        : '';

      // Verification icon
      const verifiedHtml = donor.verificationStatus === 'VERIFIED'
        ? `<span title="Verified Clinical Profile" style="color: #2563eb; display: inline-flex; vertical-align: middle; margin-left: 4px;">✓ Verified</span>`
        : '';

      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 240px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: #dc2626; color: white; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 14px;">
                ${donor.bloodGroup}
              </span>
              <div>
                <div style="font-weight: 700; color: #0f172a; font-size: 14px; line-height: 1.2;">
                  ${donor.fullName} ${verifiedHtml}
                </div>
                <div style="font-size: 11px; color: #64748b;">${donor.districtName}, ${donor.divisionName}</div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <div style="display: inline-block; background: ${statusBg}; color: ${statusTextColor}; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
              ${statusText} ${distHtml}
            </div>
          </div>

          <div style="font-size: 12px; color: #334155; line-height: 1.5; margin-bottom: 10px;">
            <div>📍 <b>Area:</b> ${donor.areaName}</div>
            <div>💉 <b>Total Donations:</b> ${donor.totalDonationsCount} times</div>
            <div>⚡ <b>Emergency Response:</b> ${(donor.responseRate * 100).toFixed(0)}%</div>
            ${
              donor.isInCooldown && donor.nextEligibleDate
                ? `<div style="color: #6366f1; font-weight: 600; margin-top: 2px;">⏳ Eligible after: ${new Date(donor.nextEligibleDate).toLocaleDateString()}</div>`
                : ''
            }
          </div>

          <div style="display: flex; gap: 6px;">
            <a href="tel:${donor.phone}" style="
              flex: 1;
              background: #059669;
              color: white;
              padding: 7px 10px;
              border-radius: 6px;
              text-align: center;
              font-size: 12px;
              font-weight: 700;
              text-decoration: none;
              display: inline-block;
            ">
              📞 Call ${donor.phone}
            </a>
            <button id="btn-donor-${donor.id}" style="
              background: #dc2626;
              color: white;
              border: none;
              padding: 7px 10px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
            ">
              Request Blood
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('click', () => {
        onSelectDonor?.(donor);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-donor-${donor.id}`);
        if (btn) {
          btn.onclick = () => onRequestBlood?.(donor);
        }
      });

      markersLayer.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // If a specific donor is selected, fly smoothly to that donor
    if (selectedDonorId) {
      const selected = donors.find((d) => d.id === selectedDonorId);
      if (selected && selected.latitude && selected.longitude) {
        map.flyTo([selected.latitude, selected.longitude], 13, { duration: 1.2 });
      }
    }
  }, [donors, selectedDonorId]);

  // Center on Bangladesh
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([23.8103, 90.4125], 7, { duration: 1 });
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-lg border border-gray-200`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Overlay Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleResetView}
          className="bg-white/95 backdrop-blur hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border border-gray-200 flex items-center space-x-1.5 transition-all hover:shadow-lg"
          title="Reset map view to entire Bangladesh"
        >
          <Navigation className="w-3.5 h-3.5 text-blood-600" />
          <span>Full Bangladesh</span>
        </button>
      </div>

      {/* Map Legend HUD */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-lg border border-gray-200 text-xs hidden sm:block">
        <div className="font-bold text-gray-800 mb-1.5 flex items-center space-x-1">
          <Heart className="w-3.5 h-3.5 text-blood-600 fill-blood-600" />
          <span>Live Donor Status</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-gray-700 font-medium">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Available ({donors.filter((d) => d.isClinicallyAvailable).length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>In Cooldown ({donors.filter((d) => d.isInCooldown).length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Busy ({donors.filter((d) => d.availabilityStatus === 'TEMPORARILY_BUSY').length})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
