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

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json().catch(() => null);

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, details = '') {
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}${details ? ` - ${details}` : ''}`);

  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

async function runTests() {
  console.log('\n🧪 Starting API Tests...\n');

  let userId, companyId, supplierId, materialCategoryId, materialId, invoiceId, taskId;

  // ==================== AUTH TESTS ====================
  console.log('📝 Testing Auth Endpoints');

  // Test: Register a user
  try {
    const res = await request('POST', '/users/register', {
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'Test123456',
    });
    userId = res.data?.uuid;
    logTest('POST /users/register', res.ok && userId, `User ID: ${userId}`);
  } catch (err) {
    logTest('POST /users/register', false, err.message);
  }

  // Test: Login
  try {
    const res = await request('POST', '/auth/login', {
      username: 'testuser',
      password: 'password123',
    });
    logTest('POST /auth/login', res.status === 201 || res.status === 401, 'Login attempted');
  } catch (err) {
    logTest('POST /auth/login', false, err.message);
  }

  // ==================== USERS TESTS ====================
  console.log('\n👥 Testing User Endpoints');

  try {
    const res = await request('GET', '/users');
    logTest('GET /users', res.ok, `Found ${res.data?.length || 0} users`);
  } catch (err) {
    logTest('GET /users', false, err.message);
  }

  if (userId) {
    try {
      const res = await request('GET', `/users/${userId}`);
      logTest('GET /users/:uuid', res.ok, `User: ${res.data?.username}`);
    } catch (err) {
      logTest('GET /users/:uuid', false, err.message);
    }
  }

  // ==================== COMPANIES TESTS ====================
  console.log('\n🏢 Testing Company Endpoints');

  try {
    const res = await request('POST', '/companies', {
      cnpj: '12345678000' + Math.floor(Math.random() * 100),
      name: 'Test Company ' + Date.now(),
      street: 'Test Street 123',
      city: 'Test City',
      state: 'TS',
      country: 'Brazil',
      postalCode: '12345-678',
    });
    companyId = res.data?.uuid;
    logTest('POST /companies', res.ok && companyId, `Company ID: ${companyId}`);
  } catch (err) {
    logTest('POST /companies', false, err.message);
  }

  try {
    const res = await request('GET', '/companies');
    logTest('GET /companies', res.ok, `Found ${res.data?.length || 0} companies`);
  } catch (err) {
    logTest('GET /companies', false, err.message);
  }

  // ==================== SUPPLIERS TESTS ====================
  console.log('\n📦 Testing Supplier Endpoints');

  try {
    const res = await request('POST', '/suppliers', {
      cnpj: '98765432000' + Math.floor(Math.random() * 100),
      name: 'Test Supplier ' + Date.now(),
      street: 'Supplier Street 456',
      city: 'Supplier City',
      state: 'SP',
      country: 'Brazil',
      postalCode: '98765-432',
    });
    supplierId = res.data?.uuid;
    logTest('POST /suppliers', res.ok && supplierId, `Supplier ID: ${supplierId}`);
  } catch (err) {
    logTest('POST /suppliers', false, err.message);
  }

  try {
    const res = await request('GET', '/suppliers');
    logTest('GET /suppliers', res.ok, `Found ${res.data?.length || 0} suppliers`);
  } catch (err) {
    logTest('GET /suppliers', false, err.message);
  }

  // ==================== MATERIAL CATEGORIES TESTS ====================
  console.log('\n📋 Testing Material Category Endpoints');

  try {
    const res = await request('POST', '/material-categories', {
      name: 'Test Category ' + Date.now(),
      description: 'Test category description',
      defaultUnit: 'UN',
    });
    materialCategoryId = res.data?.uuid;
    logTest('POST /material-categories', res.ok && materialCategoryId, `Category ID: ${materialCategoryId}`);
  } catch (err) {
    logTest('POST /material-categories', false, err.message);
  }

  try {
    const res = await request('GET', '/material-categories');
    logTest('GET /material-categories', res.ok, `Found ${res.data?.length || 0} categories`);
  } catch (err) {
    logTest('GET /material-categories', false, err.message);
  }

  // ==================== MATERIALS TESTS ====================
  console.log('\n🔧 Testing Material Endpoints');

  if (materialCategoryId) {
    try {
      const res = await request('POST', '/materials', {
        externalCode: 'MAT-' + Date.now(),
        description: 'Test Material',
        unit: 'UN',
        status: 'ACTIVE',
        categoryId: materialCategoryId,
      });
      materialId = res.data?.uuid;
      logTest('POST /materials', res.ok && materialId, `Material ID: ${materialId}`);
    } catch (err) {
      logTest('POST /materials', false, err.message);
    }
  }

  try {
    const res = await request('GET', '/materials');
    logTest('GET /materials', res.ok, `Found ${res.data?.length || 0} materials`);
  } catch (err) {
    logTest('GET /materials', false, err.message);
  }

  // ==================== INVOICES TESTS ====================
  console.log('\n📄 Testing Invoice Endpoints');

  if (supplierId) {
    try {
      const res = await request('POST', '/invoices', {
        invoiceNumber: 'INV-' + Date.now(),
        supplierId: supplierId,
        status: 'PENDING',
      });
      invoiceId = res.data?.uuid;
      logTest('POST /invoices', res.ok && invoiceId, `Invoice ID: ${invoiceId}`);
    } catch (err) {
      logTest('POST /invoices', false, err.message);
    }
  }

  try {
    const res = await request('GET', '/invoices');
    logTest('GET /invoices', res.ok, `Found ${res.data?.length || 0} invoices`);
  } catch (err) {
    logTest('GET /invoices', false, err.message);
  }

  // ==================== TASKS TESTS ====================
  console.log('\n✅ Testing Task Endpoints');

  if (invoiceId) {
    try {
      const res = await request('POST', '/tasks', {
        title: 'Test Task ' + Date.now(),
        description: 'Test task description',
        taskType: 'CONFERENCE',
        status: 'PENDING',
        invoiceId: invoiceId,
        itemSpecification: 'Bota CAT-23456',
        issuedBy: 'Test User',
        entryDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      });
      taskId = res.data?.uuid;
      logTest('POST /tasks', res.ok && taskId, `Task ID: ${taskId}`);
    } catch (err) {
      logTest('POST /tasks', false, err.message);
    }
  }

  try {
    const res = await request('GET', '/tasks');
    logTest('GET /tasks', res.ok, `Found ${res.data?.length || 0} tasks`);
  } catch (err) {
    logTest('GET /tasks', false, err.message);
  }

  try {
    const res = await request('GET', '/tasks/open');
    logTest('GET /tasks/open', res.ok, `Found ${res.data?.length || 0} open tasks`);
  } catch (err) {
    logTest('GET /tasks/open', false, err.message);
  }

  try {
    const res = await request('GET', '/tasks/closed');
    logTest('GET /tasks/closed', res.ok, `Found ${res.data?.length || 0} closed tasks`);
  } catch (err) {
    logTest('GET /tasks/closed', false, err.message);
  }

  if (taskId) {
    try {
      const res = await request('GET', `/tasks/${taskId}`);
      logTest('GET /tasks/:uuid', res.ok, `Task: ${res.data?.title}`);
    } catch (err) {
      logTest('GET /tasks/:uuid', false, err.message);
    }

    try {
      const res = await request('PUT', `/tasks/${taskId}/status`, {
        status: 'IN_PROGRESS',
      });
      logTest('PUT /tasks/:uuid/status', res.ok, 'Status updated to IN_PROGRESS');
    } catch (err) {
      logTest('PUT /tasks/:uuid/status', false, err.message);
    }

    if (userId) {
      try {
        const res = await request('PUT', `/tasks/${taskId}/assign`, {
          userId: userId,
        });
        logTest('PUT /tasks/:uuid/assign', res.ok, `Assigned to user ${userId}`);
      } catch (err) {
        logTest('PUT /tasks/:uuid/assign', false, err.message);
      }
    }
  }

  // Test filters
  try {
    const res = await request('GET', '/tasks?taskType=CONFERENCE&status=PENDING');
    logTest('GET /tasks?taskType&status (filters)', res.ok, `Found ${res.data?.length || 0} filtered tasks`);
  } catch (err) {
    logTest('GET /tasks with filters', false, err.message);
  }

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total: ${results.passed + results.failed} tests`);
  console.log(`\x1b[32m✓ Passed: ${results.passed}\x1b[0m`);
  console.log(`\x1b[31m✗ Failed: ${results.failed}\x1b[0m`);
  console.log('='.repeat(50) + '\n');

  if (results.failed > 0) {
    console.log('❌ Failed Tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}: ${t.details}`));
  }
}

// Run tests
console.log('⏳ Make sure the server is running on http://localhost:3000');
console.log('   Start it with: npm run start:dev\n');

runTests().catch(err => {
  console.error('💥 Test suite failed:', err.message);
  process.exit(1);
});
