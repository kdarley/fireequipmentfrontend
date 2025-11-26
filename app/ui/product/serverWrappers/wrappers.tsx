'use server';

import { fetchProductSellerPricingBoxplotStats, fetchSellerHistogramPricingStats } from '@/app/lib/data';
import ProductSellerBoxplotClient from '../boxplots';
import ProductSellerHistogram from '../histogram';

export async function ProductSellerBoxplotWrapper() {
  const stats = await fetchProductSellerPricingBoxplotStats();
  return <ProductSellerBoxplotClient stats={stats} />;
}

export async function ProductSellerHistogramWrapper() {
    const stats = await fetchSellerHistogramPricingStats();
    return <ProductSellerHistogram stats={stats} />;
}