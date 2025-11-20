const BASE_URL = 'http://localhost:3000';

async function request(method, endpoint, body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data, status: response.status };
  } catch (err) {
    return { ok: false, data: null, error: err.message };
  }
}

async function seedTasks() {
  console.log('\n🌱 Seeding Tasks with Existing Data...\n');

  // Fetch existing data
  const users = await request('GET', '/users');
  const suppliers = await request('GET', '/suppliers');
  const categories = await request('GET', '/material-categories');
  const materials = await request('GET', '/materials');
  const invoices = await request('GET', '/invoices');

  console.log(`Found: ${users.data?.length || 0} users, ${suppliers.data?.length || 0} suppliers`);
  console.log(`Found: ${categories.data?.length || 0} categories, ${materials.data?.length || 0} materials`);
  console.log(`Found: ${invoices.data?.length || 0} invoices\n`);

  // Create or use existing invoice
  let invoice = invoices.data?.[0];
  if (!invoice && suppliers.data?.length > 0) {
    console.log('Creating invoice...');
    const res = await request('POST', '/invoices', {
      invoiceNumber: '1234567',
      supplierId: suppliers.data[0].uuid,
      status: 'PENDING',
    });
    invoice = res.data;
    console.log(`✓ Invoice created: ${invoice?.uuid}\n`);
  }

  if (!invoice) {
    console.log('❌ No invoice available. Please create suppliers first.');
    return;
  }

  // Create tasks
  console.log('Creating tasks...\n');
  const now = new Date();
  const entryDate = '2025-02-11T12:55:42.000Z';
  const dueDate = '2025-10-10T00:00:00.000Z';

  const taskTypes = [
    { type: 'CONFERENCE', label: 'Conferência' },
    { type: 'STORAGE', label: 'Armazenamento' },
    { type: 'INVENTORY', label: 'Estoque' },
    { type: 'PICKING', label: 'Separação' },
    { type: 'DEMOBILIZATION', label: 'Desmobilização' },
  ];

  for (const { type, label } of taskTypes) {
    const res = await request('POST', '/tasks', {
      title: `${label} - Nota 1234567`,
      description: 'Caixa com equipamento de PI Incluindo bota, luva, capacete e vários outros equipamentos muito importantes.',
      taskType: type,
      status: 'PENDING',
      invoiceId: invoice.id,
      materialId: materials.data?.[0]?.id || null,
      itemSpecification: 'Bota CAT-23456',
      issuedBy: 'Fulano Ciclano da Silva',
    });
    if (res.ok) {
      console.log(`✓ Task created: ${label} (${type})`);
    } else {
      console.log(`✗ Failed to create task: ${label}`, res.data);
    }
  }

  // Create an in-progress task
  if (users.data?.length > 0) {
    const res = await request('POST', '/tasks', {
      title: 'Conferência - Nota 1234568',
      description: 'Lote de luvas de proteção para conferência',
      taskType: 'CONFERENCE',
      status: 'IN_PROGRESS',
      invoiceId: invoice.id,
      itemSpecification: 'Luva de Proteção LUVA-001',
      assignedUserId: users.data[0].id,
      issuedBy: 'Maria Santos',
    });
    console.log(res.ok ? '✓ In-progress task created' : '✗ Failed to create in-progress task');
  }

  // Create a completed task
  if (users.data?.length > 1) {
    const res = await request('POST', '/tasks', {
      title: 'Armazenamento - Nota 1234569',
      description: 'Capacetes de segurança já conferidos',
      taskType: 'STORAGE',
      status: 'COMPLETED',
      invoiceId: invoice.id,
      itemSpecification: 'Capacete CAPACETE-100',
      assignedUserId: users.data[1].id,
      issuedBy: 'João Silva',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    });
    console.log(res.ok ? '✓ Completed task created' : '✗ Failed to create completed task');
  }

  console.log('\n✅ Task seeding complete!');
  console.log('\nTest endpoints:');
  console.log(`  GET ${BASE_URL}/tasks/open`);
  console.log(`  GET ${BASE_URL}/tasks/closed`);
  console.log(`  GET ${BASE_URL}/tasks`);
}

seedTasks().catch(console.error);
