const BASE_URL = 'http://localhost:3000';

// Helper function to make requests
async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data, status: response.status };
  } catch (err) {
    console.error(`Error calling ${method} ${endpoint}:`, err.message);
    return { ok: false, data: null, error: err.message };
  }
}

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

async function seedDatabase() {
  console.log('\n🌱 Starting Database Seeding...\n');

  const createdData = {
    users: [],
    companies: [],
    suppliers: [],
    categories: [],
    materials: [],
    invoices: [],
    invoiceItems: [],
    tasks: [],
  };

  // ==================== CREATE USERS ====================
  log('👥', 'Creating users...');

  const users = [
    { username: 'joao.silva', email: 'joao.silva@malldre.com', password: 'senha123', name: 'João Silva' },
    { username: 'maria.santos', email: 'maria.santos@malldre.com', password: 'senha123', name: 'Maria Santos' },
    { username: 'fulano.ciclano', email: 'fulano.ciclano@malldre.com', password: 'senha123', name: 'Fulano Ciclano da Silva' },
    { username: 'marlon.rodrigues', email: 'marlon.rodrigues@malldre.com', password: 'senha123', name: 'Marlon Palata Fanger Rodrigues' },
  ];

  for (const user of users) {
    const res = await request('POST', '/users/register', user);
    if (res.ok && res.data) {
      createdData.users.push(res.data);
      log('  ✓', `User created: ${user.username} (${res.data.uuid})`);
    } else if (res.status === 409) {
      // User already exists, try to fetch it
      const getRes = await request('GET', '/users');
      if (getRes.ok && getRes.data) {
        const existingUser = getRes.data.find(u => u.username === user.username);
        if (existingUser) {
          createdData.users.push(existingUser);
          log('  ⚠', `User already exists: ${user.username} (${existingUser.uuid})`);
        }
      }
    } else {
      log('  ✗', `Failed to create user: ${user.username}`);
    }
  }

  // ==================== CREATE SUPPLIERS ====================
  log('\n📦', 'Creating suppliers...');

  const suppliers = [
    {
      cnpj: '12345678000190',
      name: 'PI Indústria e Comércio LTDA',
      street: 'Rua da Indústria, 123',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      postalCode: '01234-567',
    },
    {
      cnpj: '98765432000111',
      name: 'Fornecedor Alpha',
      street: 'Av. Principal, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      postalCode: '20000-000',
    },
    {
      cnpj: '11223344000155',
      name: 'Beta Equipamentos',
      street: 'Rua Beta, 789',
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil',
      postalCode: '30000-000',
    },
  ];

  for (const supplier of suppliers) {
    const res = await request('POST', '/suppliers', supplier);
    if (res.ok && res.data) {
      createdData.suppliers.push(res.data);
      log('  ✓', `Supplier created: ${supplier.name} (${res.data.uuid})`);
    } else if (res.status === 409) {
      // Supplier already exists, try to fetch it
      const getRes = await request('GET', '/suppliers');
      if (getRes.ok && getRes.data) {
        const existingSupplier = getRes.data.find(s => s.company?.cnpj === supplier.cnpj);
        if (existingSupplier) {
          createdData.suppliers.push(existingSupplier);
          log('  ⚠', `Supplier already exists: ${supplier.name} (${existingSupplier.uuid})`);
        }
      }
    } else {
      log('  ✗', `Failed to create supplier: ${supplier.name}`);
    }
  }

  // ==================== CREATE MATERIAL CATEGORIES ====================
  log('\n📋', 'Creating material categories...');

  const categories = [
    { name: 'Calçados', description: 'Botas, sapatos e calçados em geral', materialUnit: 'UN' },
    { name: 'Equipamentos', description: 'Equipamentos diversos', materialUnit: 'UN' },
    { name: 'Ferramentas', description: 'Ferramentas e utensílios', materialUnit: 'UN' },
    { name: 'Materiais Elétricos', description: 'Cabos, fios e componentes elétricos', materialUnit: 'MT' },
  ];

  for (const category of categories) {
    const res = await request('POST', '/material-categories', category);
    if (res.ok) {
      createdData.categories.push(res.data);
      log('  ✓', `Category created: ${category.name} (${res.data.uuid})`);
    } else {
      log('  ✗', `Failed to create category: ${category.name}`);
    }
  }

  // ==================== CREATE MATERIALS ====================
  log('\n🔧', 'Creating materials...');

  if (createdData.categories.length > 0) {
    const materials = [
      {
        externalCode: 'CAT-23456',
        description: 'Bota CAT Industrial',
        materialUnit: 'UN',
        status: 'ACTIVE',
        categoryId: createdData.categories[0].uuid,
      },
      {
        externalCode: 'LUVA-001',
        description: 'Luva de Proteção',
        materialUnit: 'UN',
        status: 'ACTIVE',
        categoryId: createdData.categories[1].uuid,
      },
      {
        externalCode: 'CAPACETE-100',
        description: 'Capacete de Segurança',
        materialUnit: 'UN',
        status: 'ACTIVE',
        categoryId: createdData.categories[1].uuid,
      },
      {
        externalCode: 'CABO-EL-500',
        description: 'Cabo Elétrico 2.5mm',
        materialUnit: 'MT',
        status: 'ACTIVE',
        categoryId: createdData.categories[3].uuid,
      },
    ];

    for (const material of materials) {
      const res = await request('POST', '/materials', material);
      if (res.ok) {
        createdData.materials.push(res.data);
        log('  ✓', `Material created: ${material.externalCode} (${res.data.uuid})`);
      } else {
        log('  ✗', `Failed to create material: ${material.externalCode}`);
      }
    }
  }

  // ==================== CREATE INVOICES ====================
  log('\n📄', 'Creating invoices...');

  if (createdData.suppliers.length > 0) {
    const invoices = [
      {
        invoiceNumber: '1234567',
        supplierId: createdData.suppliers[0].uuid,
        status: 'PENDING',
        receivedDate: new Date().toISOString(),
      },
      {
        invoiceNumber: '1234568',
        supplierId: createdData.suppliers[1].uuid,
        status: 'WAITING_INSPECTION',
        receivedDate: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        invoiceNumber: '1234569',
        supplierId: createdData.suppliers[2].uuid,
        status: 'RECEIVED',
        receivedDate: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    for (const invoice of invoices) {
      const res = await request('POST', '/invoices', invoice);
      if (res.ok) {
        createdData.invoices.push(res.data);
        log('  ✓', `Invoice created: ${invoice.invoiceNumber} (${res.data.uuid})`);
      } else {
        log('  ✗', `Failed to create invoice: ${invoice.invoiceNumber}`);
      }
    }
  }

  // ==================== CREATE TASKS ====================
  log('\n✅', 'Creating tasks matching Figma designs...');

  if (createdData.invoices.length > 0 && createdData.materials.length > 0 && createdData.users.length > 0) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    const yesterday = new Date(now.getTime() - 86400000);

    const tasks = [
      {
        title: 'Conferência - Nota 1234567',
        description: 'Caixa com equipamento de PI Incluindo bota, luva, capacete e vários outros equipamentos muito importantes.',
        taskType: 'CONFERENCE',
        status: 'PENDING',
        invoiceId: createdData.invoices[0].uuid,
        materialId: createdData.materials[0].uuid,
        itemSpecification: 'Bota CAT-23456',
        issuedBy: 'Fulano Ciclano da Silva',
        entryDate: new Date('2025-02-11T12:55:42'),
        dueDate: new Date('2025-10-10'),
      },
      {
        title: 'Armazenamento - Nota 1234567',
        description: 'Caixa com equipamento de PI Incluindo bota, luva, capacete e vários outros equipamentos muito importantes.',
        taskType: 'STORAGE',
        status: 'PENDING',
        invoiceId: createdData.invoices[0].uuid,
        materialId: createdData.materials[0].uuid,
        itemSpecification: 'Bota CAT-23456',
        issuedBy: 'Fulano Ciclano da Silva',
        entryDate: new Date('2025-02-11T12:55:42'),
        dueDate: new Date('2025-10-10'),
      },
      {
        title: 'Estoque - Nota 1234567',
        description: 'Caixa com equipamento de PI Incluindo bota, luva, capacete e vários outros equipamentos muito importantes.',
        taskType: 'INVENTORY',
        status: 'PENDING',
        invoiceId: createdData.invoices[0].uuid,
        materialId: createdData.materials[0].uuid,
        itemSpecification: 'Bota CAT-23456',
        issuedBy: 'Fulano Ciclano da Silva',
        entryDate: new Date('2025-02-11T12:55:42'),
        dueDate: new Date('2025-10-10'),
      },
      {
        title: 'Separação - Nota 1234567',
        description: 'Caixa com equipamento de PI Incluindo bota, luva, capacete e vários outros equipamentos muito importantes.',
        taskType: 'PICKING',
        status: 'PENDING',
        invoiceId: createdData.invoices[0].uuid,
        materialId: createdData.materials[0].uuid,
        itemSpecification: 'Bota CAT-23456',
        issuedBy: 'Fulano Ciclano da Silva',
        entryDate: new Date('2025-02-11T12:55:42'),
        dueDate: new Date('2025-10-10'),
      },
      {
        title: 'Desmobilização - Nota 1234567',
        description: 'Caixa com equipamento de PI Incluindo bota, luva, capacete e vários outros equipamentos muito importantes.',
        taskType: 'DEMOBILIZATION',
        status: 'PENDING',
        invoiceId: createdData.invoices[0].uuid,
        materialId: createdData.materials[0].uuid,
        itemSpecification: 'Bota CAT-23456',
        issuedBy: 'Fulano Ciclano da Silva',
        entryDate: new Date('2025-02-11T12:55:42'),
        dueDate: new Date('2025-10-10'),
      },
      {
        title: 'Conferência - Nota 1234568',
        description: 'Lote de luvas de proteção para conferência',
        taskType: 'CONFERENCE',
        status: 'IN_PROGRESS',
        invoiceId: createdData.invoices[1].uuid,
        materialId: createdData.materials[1].uuid,
        itemSpecification: 'Luva de Proteção LUVA-001',
        assignedUserId: createdData.users[0].uuid,
        issuedBy: 'Maria Santos',
        entryDate: yesterday,
        dueDate: tomorrow,
      },
      {
        title: 'Armazenamento - Nota 1234569',
        description: 'Capacetes de segurança já conferidos',
        taskType: 'STORAGE',
        status: 'COMPLETED',
        invoiceId: createdData.invoices[2].uuid,
        materialId: createdData.materials[2].uuid,
        itemSpecification: 'Capacete CAPACETE-100',
        assignedUserId: createdData.users[1].uuid,
        issuedBy: 'João Silva',
        entryDate: new Date(Date.now() - 172800000),
        dueDate: yesterday,
        completedAt: yesterday,
      },
    ];

    for (const task of tasks) {
      const res = await request('POST', '/tasks', task);
      if (res.ok) {
        createdData.tasks.push(res.data);
        log('  ✓', `Task created: ${task.taskType} - ${task.status} (${res.data.uuid})`);
      } else {
        log('  ✗', `Failed to create task: ${task.title}`);
      }
    }
  }

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Seeding Summary');
  console.log('='.repeat(60));
  console.log(`👥 Users created: ${createdData.users.length}`);
  console.log(`📦 Suppliers created: ${createdData.suppliers.length}`);
  console.log(`📋 Categories created: ${createdData.categories.length}`);
  console.log(`🔧 Materials created: ${createdData.materials.length}`);
  console.log(`📄 Invoices created: ${createdData.invoices.length}`);
  console.log(`✅ Tasks created: ${createdData.tasks.length}`);
  console.log('='.repeat(60));

  console.log('\n🎉 Database seeding completed!\n');
  console.log('You can now test the API with:');
  console.log('  - Open tasks: GET http://localhost:3000/tasks/open');
  console.log('  - Closed tasks: GET http://localhost:3000/tasks/closed');
  console.log('  - User tasks: GET http://localhost:3000/tasks/user/:userId');
  console.log('');
}

// Run seeding
console.log('⏳ Make sure the server is running on http://localhost:3000');
console.log('   Start it with: npm run start:dev\n');

seedDatabase().catch(err => {
  console.error('💥 Seeding failed:', err.message);
  process.exit(1);
});
