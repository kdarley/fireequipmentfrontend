import { lusitana } from '@/app/ui/fonts';
import { fetchTotalCountProductPages } from '@/app/lib/data';
import { Suspense } from 'react';
import { CardsSkeleton } from '@/app/ui/skeletons';

export const revalidate = 0;

export default async function Page() {
  const sellers = await fetchTotalCountProductPages();

  // Sort by total descending
  sellers.sort((a, b) => b.total - a.total);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Product Dashboard
      </h1>
        <div>
            <h2 className={`${lusitana.className} mb-4 text-lg md:text-xl`}>
                Product Page Count by Seller
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    {sellers.length === 0 ? (
                        <div className="col-span-full rounded-xl bg-gray-50 p-6 text-center text-gray-500">
                        No products found.
                        </div>
                    ) : (
                        sellers.map((s) => (
                        <div
                            key={s.seller_id}
                            className="rounded-xl bg-gray-50 p-2 shadow-sm"
                        >
                            <div className="flex p-4">
                                <h3 className="ml-2 text-sm font-medium text-gray-700">
                                    {s.seller_name}
                                </h3>
                            </div>
                                <p
                                className={`${lusitana.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
                                >
                                {s.total}
                            </p>
                        </div>
                        ))
                    )}
                </Suspense>
            </div>
        </div>
    </main>
  );
}
