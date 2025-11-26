'use client';

import { useState, useRef, useEffect } from 'react';

interface Stat {
  seller_id: string;
  seller_name: string;
  min_price: number;
  q1_price: number;
  median_price: number;
  q3_price: number;
  max_price: number;
  lower_fence: number;
  upper_fence: number;
}

export default function ProductSellerBoxplotClient({ stats }: { stats: Stat[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoverInfo, setHoverInfo] = useState<{
    seller: string;
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Dynamically measure container width for scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth - 128); // subtract left label width
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxValue = Math.max(...stats.map((s) => s.upper_fence));
  const scale = (v: number) => (v / maxValue) * width;

  const tickCount = 5;
  const xTicks = Array.from({ length: tickCount + 1 }, (_, i) => (i / tickCount) * maxValue);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden">
      {/* Chart area */}
      <div className="flex flex-col gap-4">
        {stats.map((s) => (
          <div key={s.seller_id} className="flex items-center gap-4">
            {/* Y-axis label */}
            <span className="w-32 text-right text-sm font-medium truncate">
              {s.seller_name}
            </span>

            {/* Boxplot */}
            <div
              className="relative h-[40px] flex items-center bg-gray-50 rounded"
              style={{ width: `${width}px` }}
              onMouseLeave={() => setHoverInfo(null)}
            >
              {/* Lower whisker */}
              <div
                className="absolute h-px bg-gray-400"
                style={{
                  left: `${scale(s.min_price)}px`,
                  width: `${scale(s.q1_price - s.min_price)}px`,
                }}
              />

              {/* IQR box */}
              <div
                className="absolute h-5 bg-blue-300 rounded"
                style={{
                  left: `${scale(s.q1_price)}px`,
                  width: `${scale(s.q3_price - s.q1_price)}px`,
                }}
                onMouseEnter={(e) =>
                  setHoverInfo({
                    seller: s.seller_name,
                    text: `Q1: ${s.q1_price.toFixed(2)}, Median: ${s.median_price.toFixed(2)}, Q3: ${s.q3_price.toFixed(2)}`,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
              >
                {/* Median line */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-600"
                  style={{ left: `${scale(s.median_price - s.q1_price)}px` }}
                />
              </div>

              {/* Upper whisker */}
              <div
                className="absolute h-px bg-gray-400"
                style={{
                  left: `${scale(s.q3_price)}px`,
                  width: `${scale(s.max_price - s.q3_price)}px`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* X-axis with ticks */}
      <div className="relative mt-6 ml-[8rem]" style={{ width: `${width}px` }}>
        <div className="border-t border-gray-400"></div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          {xTicks.map((tick) => (
            <span key={tick}>{Math.round(tick)}</span>
          ))}
        </div>
        <div className="text-center text-sm text-gray-700 mt-2 font-medium">
          Price (USD)
        </div>
      </div>

      {/* Tooltip */}
      {hoverInfo && (
        <div
          className="fixed z-50 rounded bg-gray-800 px-3 py-2 text-xs text-white shadow-md"
          style={{
            left: hoverInfo.x + 12,
            top: hoverInfo.y - 32,
          }}
        >
          <div className="font-semibold">{hoverInfo.seller}</div>
          <div>{hoverInfo.text}</div>
        </div>
      )}
    </div>
  );
}

