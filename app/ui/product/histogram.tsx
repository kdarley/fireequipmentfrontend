'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { HistogramRow } from '../../lib/definitions';

const SELLER_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

interface BucketGroup {
  start: number;
  end: number;
  sellers: HistogramRow[];
}

export default function ProductHistogramClient({
  data,
}: {
  data: {
    under1k: HistogramRow[];
    over1k: HistogramRow[];
  };
}) {
  const formatBuckets = (rows: HistogramRow[]): BucketGroup[] => {
    const grouped: Record<string, BucketGroup> = {};
    rows.forEach((r) => {
      const key = `${r.bucket_start}-${r.bucket_end}`;
      if (!grouped[key]) {
        grouped[key] = { start: r.bucket_start, end: r.bucket_end, sellers: [] };
      }
      grouped[key].sellers.push(r);
    });
    return Object.values(grouped).sort((a, b) => a.start - b.start);
  };

  const under1k = useMemo(() => formatBuckets(data.under1k), [data]);
  const over1k = useMemo(() => formatBuckets(data.over1k), [data]);

  return (
    <div className="space-y-16">
      <SectionHeader title="Prices under $1,000 (Bucket = $50)" />
      <Histogram buckets={under1k} />

      <SectionHeader title="Prices $1,000 and up (Bucket = $1,000)" />
      <Histogram buckets={over1k} />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold mb-4">{title}</h2>;
}

function useSellerColors(buckets: BucketGroup[]) {
  return useMemo(() => {
    const mapping: Record<number, string> = {};
    let idx = 0;
    buckets.forEach((b) =>
      b.sellers.forEach((s) => {
        if (!mapping[s.seller_id]) {
          mapping[s.seller_id] = SELLER_COLORS[idx % SELLER_COLORS.length];
          idx++;
        }
      })
    );
    return mapping;
  }, [buckets]);
}

function Legend({
  sellers,
  sellerColors,
}: {
  sellers: { seller_id: number; seller_name: string }[];
  sellerColors: Record<number, string>;
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {sellers.map((s) => (
        <div key={s.seller_id} className="flex items-center gap-2 text-sm">
          <span className={`w-4 h-4 rounded ${sellerColors[s.seller_id]}`} />
          <span className="text-gray-700">{s.seller_name}</span>
        </div>
      ))}
    </div>
  );
}

function Histogram({ buckets }: { buckets: BucketGroup[] }) {
  const sellerColors = useSellerColors(buckets);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(300);

  // Fixed label widths
  const LABEL_WIDTH = 80;
  const COUNT_WIDTH = 30; // Reserve space for the count at the end of bars

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Subtract label + count space
        setContainerWidth(containerRef.current.offsetWidth - LABEL_WIDTH - COUNT_WIDTH);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxCount = Math.max(...buckets.flatMap((b) => b.sellers.map((s) => s.count)));
  const scale = (v: number) => (v / maxCount) * containerWidth;

  const uniqueSellers = useMemo(() => {
    const map: Record<number, string> = {};
    buckets.forEach((b) =>
      b.sellers.forEach((s) => { map[s.seller_id] = s.seller_name; })
    );
    return Object.entries(map).map(([seller_id, seller_name]) => ({ 
      seller_id: Number(seller_id), 
      seller_name 
    }));
  }, [buckets]);

  return (
    <div ref={containerRef}>
      <Legend sellers={uniqueSellers} sellerColors={sellerColors} />

      <div className="flex flex-col gap-2">
        {buckets.map((bucket) => (
          <div key={`${bucket.start}-${bucket.end}`} className="flex items-start gap-4">

            {/* Fixed-width bucket label */}
            <div
              className="text-xs text-gray-600 text-right pt-1"
              style={{ width: `${LABEL_WIDTH}px`, flexShrink: 0 }}
            >
              ${bucket.start}–${bucket.end}
            </div>

            {/* Bars stacked */}
            <div className="flex flex-col gap-1 flex-1">
              {bucket.sellers.map((s, index) => {
                const barWidth = scale(s.count);
                const color = sellerColors[s.seller_id];
                const uniqueKey = s.seller_id 
                  ? `${bucket.start}-${bucket.end}-${s.seller_id}`
                  : `${bucket.start}-${bucket.end}-${index}`;

                return (
                  <div key={uniqueKey} className="flex items-center gap-2">
                    <div
                      className={`h-6 rounded ${color}`}
                      style={{ width: `${Math.max(barWidth, 8)}px` }}
                    />
                    {/* Count displayed at the end */}
                    <div
                      className="text-xs text-gray-700 flex-shrink-0"
                      style={{ width: `${COUNT_WIDTH}px` }}
                    >
                      {s.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}