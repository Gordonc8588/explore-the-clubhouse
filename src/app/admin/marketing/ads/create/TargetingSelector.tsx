"use client";

import { useState } from "react";
import {
  Users,
  MapPin,
  Calendar,
  Target,
  RefreshCw,
  UserPlus,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface TargetingConfig {
  preset: string;
  ageMin: number;
  ageMax: number;
  genders: number[]; // 1 = male, 2 = female, empty = all
  radius: number; // in kilometers
  latitude: number;
  longitude: number;
}

interface TargetingSelectorProps {
  value: TargetingConfig;
  onChange: (config: TargetingConfig) => void;
}

// Craigies Farm, South Queensferry, Scotland
const CRAIGIES_FARM_LAT = 55.983;
const CRAIGIES_FARM_LNG = -3.402;

const TARGETING_PRESETS = [
  {
    id: "local_parents",
    name: "Local Parents",
    description: "Parents aged 25-45 within 20 miles of South Queensferry",
    icon: Users,
    config: {
      ageMin: 25,
      ageMax: 45,
      genders: [],
      radius: 32, // ~20 miles in km
      latitude: CRAIGIES_FARM_LAT,
      longitude: CRAIGIES_FARM_LNG,
    },
  },
  {
    id: "school_holiday",
    name: "School Holiday",
    description: "Broader reach for holiday periods, ages 25-50",
    icon: Calendar,
    config: {
      ageMin: 25,
      ageMax: 50,
      genders: [],
      radius: 48, // ~30 miles in km
      latitude: CRAIGIES_FARM_LAT,
      longitude: CRAIGIES_FARM_LNG,
    },
  },
  {
    id: "retargeting",
    name: "Website Visitors",
    description: "People who visited your website (requires pixel setup)",
    icon: RefreshCw,
    config: {
      ageMin: 18,
      ageMax: 65,
      genders: [],
      radius: 100,
      latitude: CRAIGIES_FARM_LAT,
      longitude: CRAIGIES_FARM_LNG,
    },
  },
  {
    id: "lookalike",
    name: "Lookalike Audience",
    description: "People similar to your existing customers",
    icon: UserPlus,
    config: {
      ageMin: 25,
      ageMax: 50,
      genders: [],
      radius: 100,
      latitude: CRAIGIES_FARM_LAT,
      longitude: CRAIGIES_FARM_LNG,
    },
  },
];

export function TargetingSelector({ value, onChange }: TargetingSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    const preset = TARGETING_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onChange({
        preset: presetId,
        ...preset.config,
      });
    }
  };

  const handleAdvancedChange = (field: keyof TargetingConfig, val: number | number[]) => {
    onChange({
      ...value,
      preset: "custom",
      [field]: val,
    });
  };

  const selectedPreset = TARGETING_PRESETS.find((p) => p.id === value.preset);

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div
        className="flex items-start gap-2 rounded-lg px-3 py-2"
        style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
      >
        <Info
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          style={{ color: "var(--craigies-olive)" }}
        />
        <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
          Choose a targeting preset to reach the right audience. Meta will
          optimize delivery within your target audience.
        </p>
      </div>

      {/* Preset Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TARGETING_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = value.preset === preset.id;
          const isDisabled = preset.id === "retargeting" || preset.id === "lookalike";

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => !isDisabled && handlePresetSelect(preset.id)}
              disabled={isDisabled}
              className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-[var(--craigies-olive)] bg-[rgba(122,124,74,0.05)]"
                  : isDisabled
                  ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    isSelected
                      ? "bg-[var(--craigies-olive)] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {preset.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {preset.description}
                  </p>
                </div>
              </div>
              {isDisabled && (
                <span className="absolute right-2 top-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  Coming Soon
                </span>
              )}
              {isSelected && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--craigies-olive)]">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Advanced Settings Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Advanced Targeting Settings
        </span>
        {showAdvanced ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {/* Age Range */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Age Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={18}
                max={65}
                value={value.ageMin}
                onChange={(e) =>
                  handleAdvancedChange("ageMin", parseInt(e.target.value) || 18)
                }
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="number"
                min={18}
                max={65}
                value={value.ageMax}
                onChange={(e) =>
                  handleAdvancedChange("ageMax", parseInt(e.target.value) || 65)
                }
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
              />
              <span className="text-sm text-gray-500">years old</span>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Gender
            </label>
            <div className="flex gap-2">
              {[
                { value: [], label: "All" },
                { value: [2], label: "Women" },
                { value: [1], label: "Men" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAdvancedChange("genders", option.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    JSON.stringify(value.genders) === JSON.stringify(option.value)
                      ? "border-[var(--craigies-olive)] bg-[var(--craigies-olive)] text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Radius */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              <MapPin className="mr-1 inline h-4 w-4" />
              Radius from Craigies Farm
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={80}
                value={value.radius}
                onChange={(e) =>
                  handleAdvancedChange("radius", parseInt(e.target.value))
                }
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
                style={{
                  accentColor: "var(--craigies-olive)",
                }}
              />
              <span className="w-24 text-sm text-gray-600">
                ~{Math.round(value.radius * 0.621)} miles
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Audience Summary */}
      {selectedPreset && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs font-medium text-gray-500">Estimated Reach</p>
          <p className="text-lg font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
            {value.preset === "local_parents"
              ? "50,000 - 100,000"
              : value.preset === "school_holiday"
              ? "150,000 - 300,000"
              : "Varies"}{" "}
            people
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Ages {value.ageMin}-{value.ageMax} •{" "}
            {value.genders.length === 0
              ? "All genders"
              : value.genders.includes(2)
              ? "Women"
              : "Men"}{" "}
            • ~{Math.round(value.radius * 0.621)} mile radius
          </p>
        </div>
      )}
    </div>
  );
}

export { TARGETING_PRESETS };
