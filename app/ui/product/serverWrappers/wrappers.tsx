'use server';

import { fetchProductSellerPricingBoxplotStats, fetchProductHistogramStats } from '@/app/lib/data';
import ProductSellerBoxplotClient from '../boxplots';
import ProductHistogramClient from '../histogram';

export async function ProductSellerBoxplotWrapper() {
  const stats = await fetchProductSellerPricingBoxplotStats();
  return <ProductSellerBoxplotClient stats={stats} />;
}

export async function ProductSellerHistogramWrapper() {
    const stats = await fetchProductHistogramStats();
    return <ProductHistogramClient data={stats} />;
}