import postgres from 'postgres';
import {
  SellerProductTotal,
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  SellerPricingBoxplotStats,
  SellerHistogramBucket

} from './definitions';
import { formatCurrency } from './utils';
import { sqlData } from './sql';

export async function fetchSellerHistogramPricingStats() {
  const rows = await sqlData<SellerHistogramBucket[]>`
    SELECT
      s.seller_id,
      s.seller_name,
      width_bucket(p.lowest_price, 0, 10000, 100) as bucket,
      COUNT(*) as count,
      MIN(p.lowest_price) AS bucket_min_price,
      MAX(p.lowest_price) AS bucket_max_price
    FROM pricing p
    JOIN product pr ON p.product_id = pr.product_id
    JOIN seller s ON pr.seller_id = s.seller_id
    WHERE p.lowest_price IS NOT NULL
    GROUP BY s.seller_id, s.seller_name, bucket
    ORDER BY s.seller_name, bucket;
    `;

  return rows.map(r => ({
    seller_id: r.seller_id.toString(),
    seller_name: r.seller_name,
    bucket: r.bucket,
    count: Number(r.count),
    bucket_min_price: Number(r.bucket_min_price),
    bucket_max_price: Number(r.bucket_max_price),
  }));
}

export async function fetchProductSellerPricingBoxplotStats(){
   try {
    const rows = await sqlData<SellerPricingBoxplotStats[]>`
    SELECT sb.*, seller_name
    FROM seller_boxplot_pricing_stats sb
    JOIN seller s ON sb.seller_id = s.seller_id
    WHERE sb.date = (
      SELECT MAX(date)
      FROM seller_boxplot_pricing_stats
   )
      ORDER BY s.seller_name;
      `
    return rows.map(r => ({
      seller_id: String(r.seller_id),
      seller_name: String(r.seller_name),
      min_price: Number(r.min_value),
      q1_price: Number(r.q1),
      median_price: Number(r.median),
      q3_price: Number(r.q3),
      max_price: Number(r.max_value),
      lower_fence: Number(r.lower_fence),
      upper_fence: Number(r.upper_fence),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch seller pricing boxplot stats.');
  }
}

export async function fetchTotalCountProductPages() {
  try {
    const rows = await sqlData<SellerProductTotal[]>`
      SELECT 
        seller.seller_id,
        seller.seller_name, 
        COUNT(product_group.group_id) AS total
      FROM product_group
      LEFT JOIN seller 
        ON product_group.seller_id = seller.seller_id
      GROUP BY 
        seller.seller_id,
        seller.seller_name;
    `

    return rows.map(r => ({
      seller_id: String(r.seller_id),
      seller_name: String(r.seller_name),
      total: Number(r.total ?? 0),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of product pages.');
  }
}

export async function fetchTotalCountProductVariants() {
  try {
    const rows = await sqlData<SellerProductTotal[]>`
      SELECT 
        seller.seller_id,
        seller.seller_name, 
        COUNT(product.product_id) AS total
      FROM product
      LEFT JOIN seller 
        ON product.seller_id = seller.seller_id
      GROUP BY 
        seller.seller_id,
        seller.seller_name;
    `

    return rows.map(r => ({
      seller_id: String(r.seller_id),
      seller_name: String(r.seller_name),
      total: Number(r.total ?? 0),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of product pages.');
  }
}

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });



export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));
    console.log(invoice);
    return invoice[0];
    
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC;
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
