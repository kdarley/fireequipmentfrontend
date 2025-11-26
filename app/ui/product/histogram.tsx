'use client';

import { useState } from "react";
import {
  SellerHistogramBucket,
} from '../../lib/definitions';

export default function ProductSellerHistogramClient({ stats }: { stats: SellerHistogramBucket[] }) {
    const [hover, setHover] = useState<null | {
        seller: string;
        bucketLabel: string;
        count: number;
        x: number;
        y: number;
    }>(null);

    const sellers = [...new Set(stats.map(s => s.seller_name))]

    const maxCount = Math.max(...stats.map(s => s.count));

    const scale = (v: number) => (v / maxCount) * 300; 

    return (
        <div className="flex flex-col gap-10">
            {sellers.map(seller => {
                const buckets = stats.filter(s => s.seller_name === seller);
                return (
                    <div key = {seller} className = "border p-4 rounded-xl bg-gray-50">
                        <h2 className="font-semibold text-lg mb-3">{seller}</h2>

                        <div className="flex flex-col gap-2">
                            {buckets.map(b=> {
                                const label = `$${b.bucket_min_price.toFixed(0)} - $${b.bucket_max_price.toFixed(0)}`;
                                return (
                                    <div key = {b.bucket} className="flex items-center gap-4">
                                        <span className="w-32 text-right text-xs text-gray-600">
                                            {label}
                                        </span>


                                        <div 
                                            className = "h-5 bg-blue-400 rounded relative"
                                            style={{ width: `${scale(b.count)}px`}}
                                            onMouseEnter={e =>
                                                setHover({
                                                    seller,
                                                    bucketLabel: label,
                                                    count: b.count,
                                                    x: e.clientX,
                                                    y: e.clientY,
                                                })
                                            }
                                            onMouseLeave={() => setHover(null)}
                                        />

                                        <span className = "text-xs text-gray-800">{b.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
            {hover && (
                <div
                    className="fixed bg-gray-800 text-white text-xs px-3 py-2 rounded shadow z-50"
                    style={{ top: hover.y -40, left: hover.x +10}}
                >
                    <div className="font-semibold">{hover.seller}</div>
                    <div>{hover.bucketLabel}</div>
                    <div>{hover.count}</div>
                </div>
            )}
        </div>
    );
}

