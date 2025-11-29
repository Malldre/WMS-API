require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { eq } = require('drizzle-orm');
const schema = require('./src/db/schema');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema });

async function test() {
  const invoiceUuid = '9924c1d6-89b5-4088-b628-3ae34511708a';
  
  console.log('1. Buscando invoice pelo UUID...');
  const invoice = await db.select()
    .from(schema.invoices)
    .where(eq(schema.invoices.uuid, invoiceUuid))
    .limit(1);
  
  console.log('Invoice encontrada:', invoice);
  
  if (invoice.length > 0) {
    console.log('\n2. Buscando invoice items pelo invoiceId...');
    const items = await db.select()
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.invoiceId, invoice[0].id));
    
    console.log('Items encontrados:', items.length);
    console.log('Items:', JSON.stringify(items, null, 2));
    
    console.log('\n3. Testando query com JOIN (como está no código)...');
    const itemsWithJoin = await db.select({
      uuid: schema.invoiceItems.uuid,
      quantity: schema.invoiceItems.quantity,
      totalValue: schema.invoiceItems.totalValue,
      unitValue: schema.invoiceItems.unitValue,
      materialId: schema.invoiceItems.materialId,
    })
    .from(schema.invoiceItems)
    .leftJoin(schema.materials, eq(schema.invoiceItems.materialId, schema.materials.id))
    .leftJoin(schema.invoices, eq(schema.invoiceItems.invoiceId, schema.invoices.id))
    .where(eq(schema.invoices.uuid, invoiceUuid));
    
    console.log('Items com JOIN:', itemsWithJoin.length);
    console.log('Resultado:', JSON.stringify(itemsWithJoin, null, 2));
  } else {
    console.log('Invoice não encontrada!');
  }
  
  await pool.end();
}

test().catch(console.error);
