#!/usr/bin/env node

/**
 * Initialize PocketBase collections and demo data
 * Run this after PocketBase starts: node init-pocketbase.js
 */

const http = require('http');

const PB_URL = 'http://localhost:8091';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PB_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function init() {
  console.log('🔧 Initializing PocketBase...\n');

  try {
    // Check if health endpoint works
    console.log('⏳ Checking PocketBase...');
    const health = await makeRequest('GET', '/api/health');
    if (health.status !== 200) {
      throw new Error('PocketBase not responding');
    }
    console.log('✅ PocketBase is running\n');

    // Create clients collection
    console.log('📋 Creating "clients" collection...');
    const clientsCollection = {
      name: 'clients',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'api_key', type: 'text', required: true },
        { name: 'allowed_origins', type: 'json' },
        { name: 'is_active', type: 'bool' }
      ]
    };
    const clientsRes = await makeRequest('POST', '/api/collections', clientsCollection);
    if (clientsRes.status !== 200 && clientsRes.status !== 201) {
      console.log('⚠️  Clients collection might already exist');
    } else {
      console.log('✅ Clients collection created');
    }

    // Create staff collection
    console.log('📋 Creating "staff" collection...');
    const staffCollection = {
      name: 'staff',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'skills', type: 'json' },
        { name: 'capacity', type: 'json' },
        { name: 'start_location', type: 'json', required: true },
        { name: 'current_location', type: 'json' },
        { name: 'is_available', type: 'bool' }
      ]
    };
    const staffRes = await makeRequest('POST', '/api/collections', staffCollection);
    if (staffRes.status !== 200 && staffRes.status !== 201) {
      console.log('⚠️  Staff collection might already exist');
    } else {
      console.log('✅ Staff collection created');
    }

    // Create tasks collection
    console.log('📋 Creating "tasks" collection...');
    const tasksCollection = {
      name: 'tasks',
      type: 'base',
      schema: [
        { name: 'type', type: 'select', required: true, options: { values: ['service', 'shipment'] } },
        { name: 'status', type: 'select', required: true, options: { values: ['pending', 'optimized', 'in_progress', 'completed'] } },
        { name: 'client_id', type: 'relation', required: true },
        { name: 'staff_id', type: 'relation' },
        { name: 'data', type: 'json', required: true },
        { name: 'sort_order', type: 'number' },
        { name: 'scheduled_at', type: 'date' },
        { name: 'completed_at', type: 'date' }
      ]
    };
    const tasksRes = await makeRequest('POST', '/api/collections', tasksCollection);
    if (tasksRes.status !== 200 && tasksRes.status !== 201) {
      console.log('⚠️  Tasks collection might already exist');
    } else {
      console.log('✅ Tasks collection created');
    }

    console.log('\n✨ Collections initialization complete!\n');

    // Now create demo data
    console.log('📝 Creating demo data...\n');

    // Create demo client
    console.log('→ Demo client...');
    await makeRequest('POST', '/api/collections/clients/records', {
      name: 'Demo Client',
      api_key: 'demo-key-for-development',
      allowed_origins: ['http://localhost:5175', 'http://localhost:5174'],
      is_active: true
    });
    console.log('✅ Created');

    // Get client ID
    const clientsListRes = await makeRequest('GET', '/api/collections/clients/records?limit=1');
    const clientId = clientsListRes.data?.items?.[0]?.id;

    if (clientId) {
      // Create demo staff
      console.log('→ Demo staff...');
      await makeRequest('POST', '/api/collections/staff/records', {
        name: 'John Driver',
        skills: [1, 2],
        capacity: { weight: 100 },
        start_location: { lat: 50.8503, lng: 4.3517 },
        is_available: true
      });
      console.log('✅ Created');

      // Create demo tasks
      console.log('→ Demo service task...');
      await makeRequest('POST', '/api/collections/tasks/records', {
        type: 'service',
        status: 'pending',
        client_id: clientId,
        data: {
          location: { lat: 50.85, lng: 4.35 },
          duration: 600,
          description: 'Service visit at main office'
        }
      });
      console.log('✅ Created');

      console.log('→ Demo shipment task...');
      await makeRequest('POST', '/api/collections/tasks/records', {
        type: 'shipment',
        status: 'pending',
        client_id: clientId,
        data: {
          pickup_lat: 50.84,
          pickup_lng: 4.34,
          delivery_lat: 50.86,
          delivery_lng: 4.36,
          weight: 5
        }
      });
      console.log('✅ Created');
    }

    console.log('\n==================================================');
    console.log('✨ Demo data created successfully!');
    console.log('==================================================\n');
    console.log('Access the application at: http://localhost:5175\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

init();
