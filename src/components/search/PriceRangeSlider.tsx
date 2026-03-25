import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
  step?: number;
  className?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  currency = 'PKR',
  step = 100,
  className = '',
}) => {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);
  const [minInput, setMinInput] = useState(String(value[0]));
  const [maxInput, setMaxInput] = useState(String(value[1]));
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
    setMinInput(String(value[0]));
    setMaxInput(String(value[1]));
  }, [value]);

  const getPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const handleMouseDown = useCallback(
    (handle: 'min' | 'max') => (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(handle);
    },
    []
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      if (dragging === 'min') {
        const clamped = Math.max(min, Math.min(newValue, localMax - step));
        setLocalMin(clamped);
        setMinInput(String(clamped));
      } else {
        const clamped = Math.min(max, Math.max(newValue, localMin + step));
        setLocalMax(clamped);
        setMaxInput(String(clamped));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      onChange([localMin, localMax]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, localMin, localMax, min, max, step, getValueFromPosition, onChange]);

  const commitMinInput = () => {
    const val = parseInt(minInput);
    if (isNaN(val)) {
      setMinInput(String(localMin));
      return;
    }
    const clamped = Math.max(min, Math.min(val, localMax - step));
    setLocalMin(clamped);
    setMinInput(String(clamped));
    onChange([clamped, localMax]);
  };

  const commitMaxInput = () => {
    const val = parseInt(maxInput);
    if (isNaN(val)) {
      setMaxInput(String(localMax));
      return;
    }
    const clamped = Math.min(max, Math.max(val, localMin + step));
    setLocalMax(clamped);
    setMaxInput(String(clamped));
    onChange([localMin, clamped]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, commit: () => void) => {
    if (e.key === 'Enter') {
      commit();
    }
  };

  const minPercent = getPercentage(localMin);
  const maxPercent = getPercentage(localMax);

  return (
    <div className={`w-full ${className}`}>
      {/* Slider track */}
      <div className="px-2 py-4">
        <div ref={trackRef} className="relative h-1 bg-neutral-200 rounded-full">
          {/* Active range */}
          <div
            className="absolute h-full bg-neutral-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Min handle */}
          <button
            onMouseDown={handleMouseDown('min')}
            className={`
              absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full
              bg-white border-2 border-neutral-600 shadow-md cursor-grab
              hover:scale-110 transition-transform
              ${dragging === 'min' ? 'scale-110 cursor-grabbing' : ''}
            `}
            style={{ left: `${minPercent}%` }}
          />

          {/* Max handle */}
          <button
            onMouseDown={handleMouseDown('max')}
            className={`
              absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full
              bg-white border-2 border-neutral-600 shadow-md cursor-grab
              hover:scale-110 transition-transform
              ${dragging === 'max' ? 'scale-110 cursor-grabbing' : ''}
            `}
            style={{ left: `${maxPercent}%` }}
          />
        </div>
      </div>

      {/* Input fields */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1">
          <label className="text-xs text-neutral-400 mb-1 block">Minimum</label>
          <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
            <span className="px-3 py-2 bg-neutral-50 text-sm text-neutral-400 border-r border-neutral-200">
              {currency}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={commitMinInput}
              onKeyDown={(e) => handleInputKeyDown(e, commitMinInput)}
              placeholder={String(min)}
              className="w-full px-3 py-2 text-sm text-neutral-600 outline-none"
            />
          </div>
        </div>
        <span className="text-neutral-300 mt-5">-</span>
        <div className="flex-1">
          <label className="text-xs text-neutral-400 mb-1 block">Maximum</label>
          <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
            <span className="px-3 py-2 bg-neutral-50 text-sm text-neutral-400 border-r border-neutral-200">
              {currency}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={commitMaxInput}
              onKeyDown={(e) => handleInputKeyDown(e, commitMaxInput)}
              placeholder={String(max)}
              className="w-full px-3 py-2 text-sm text-neutral-600 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
