import { lusitana } from '@/app/ui/fonts';
import { fetchTotalCountProductPages } from '@/app/lib/data';
import { Suspense } from 'react';
import { CardsSkeleton } from '@/app/ui/skeletons';
import {ProductPageCardsWrapper, ProductVariantCardsWrapper } from '@/app/ui/product/cards';
// import { ProductSellerBoxplotWrapper } from '@/app/ui/product/boxplots-wrapper';
import { ProductSellerBoxplotWrapper, ProductSellerHistogramWrapper } from '@/app/ui/product/serverWrappers/wrappers'

// export const revalidate = 0;

export default async function Page() {
  return (
    <main> 
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Product Dashboard
        </h1>
        <div>
            <h2 className={`${lusitana.className} mb-4 text-lg md:text-xl `}>
                Product Page Count by Seller
            </h2>
            <div className="grid gap-6 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] lg:grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]">
            {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 bg-green-100"> */}
                <Suspense fallback={<CardsSkeleton />}>
                    <ProductPageCardsWrapper />
                </Suspense>
            </div>
        </div>
        <div>
            <h2 className={`${lusitana.className} mb-4 text-lg md:text-xl`}>
                Product Variant Count by Seller
            </h2>
            <div className="grid gap-6 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] lg:grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]">
            {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 bg-green-100"> */}
                <Suspense fallback={<CardsSkeleton />}>
                    <ProductVariantCardsWrapper />
                </Suspense>
            </div>
        </div>
        <div>
            <h2 className={`${lusitana.className} mb-4 text-lg md:text-xl`}>
                Seller Pricing Boxplot Stats
            </h2>
            <div className="grid gap-6 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] lg:grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]">
                <ProductSellerBoxplotWrapper />
                {/* <Suspense fallback={<CardsSkeleton />}>
                    <ProductSellerPricingBoxplotCardsWrapper />
                </Suspense> */}
            </div>
        </div>
        <div>
            <h2 className={`${lusitana.className} mb-4 text-lg md:text-xl`}>
                Seller Pricing Histogram Distributions
            </h2>
            <div className="">
                <ProductSellerHistogramWrapper />
            </div>
        </div>
    </main>
  );
}
