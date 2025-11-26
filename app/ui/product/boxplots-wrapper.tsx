'use server';

import { fetchProductSellerPricingBoxplotStats } from '@/app/lib/data';
import ProductSellerBoxplotClient from './boxplots';

export async function ProductSellerBoxplotWrapper() {
  const stats = await fetchProductSellerPricingBoxplotStats();
  return <ProductSellerBoxplotClient stats={stats} />;
}