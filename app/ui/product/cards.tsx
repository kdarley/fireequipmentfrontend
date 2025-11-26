import { lusitana } from '@/app/ui/fonts';
import { 
        fetchTotalCountProductPages, 
        fetchTotalCountProductVariants,
 } from '@/app/lib/data';

interface Seller {
  seller_id: string;
  seller_name: string;
  total: number;
}

export async function ProductPageCardsWrapper() {
    const sellers: Seller[] = await fetchTotalCountProductPages();

    return (
        <>
            {sellers.map((seller) => (
                <Card
                    key={seller.seller_id}
                    id={seller.seller_id}
                    title={seller.seller_name}
                    value={seller.total.toString()}
                />
            ))}
        </>
    );
}

export async function ProductVariantCardsWrapper() {
    const sellers: Seller[] = await fetchTotalCountProductVariants();
    return (
        <>
            {sellers.map((seller) => (
                <Card
                    key={seller.seller_id}
                    id={seller.seller_id}
                    title={seller.seller_name}
                    value={seller.total.toString()}
                />
            ))}
        </>
    );
}


export function Card({
    id,
    title,
    value,
}: {
    id: string;
    title: string;
    value: string;
}) {
    return (
        <div key={id} className="rounded-xl bg-gray-50 p-2 shadow-sm">
            <div className="flex p-4">
                <h3 className="ml-2 text-sm font-medium">{title}</h3>
            </div>
            <p 
            className={`${lusitana.className} 
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}>{value}</p>
        </div>
    );
}