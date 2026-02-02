#!/usr/bin/env node

/**
 * PocketBase Setup Script
 * Creates collections with proper permissions and demo data
 * 
 * Run this ONCE after PocketBase starts:
 *   node setup-pocketbase.js
 */

const http = require('http');

const PB_URL = 'http://localhost:8091';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PB_URL);
    const defaultHeaders = { 'Content-Type': 'application/json' };
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { ...defaultHeaders, ...headers }
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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createCollection(name, fields) {
  const schema = fields.map((f, idx) => ({
    id: String(idx),
    name: f.name,
    type: f.type,
    required: f.required || false,
    options: f.options || {}
  }));

  // Public permissions for development
  const collection = {
    name,
    type: 'base',
    schema,
    createRule: null,   // Anyone can create
    readRule: null,     // Anyone can read
    updateRule: null,   // Anyone can update
    deleteRule: '@request.auth.id != ""' // Only authenticated can delete
  };

  const res = await makeRequest('POST', '/api/collections', collection);
  
  if (res.status === 200 || res.status === 201) {
    console.log(`✅ Collection "${name}" created`);
    return true;
  } else if (res.data?.message?.includes('already exists')) {
    console.log(`⚠️  Collection "${name}" already exists, updating rules...`);
    
    // Try to update permissions
    const updateRes = await makeRequest('PATCH', `/api/collections/${name}`, {
      createRule: null,
      readRule: null,
      updateRule: null,
      deleteRule: '@request.auth.id != ""'
    });
    
    if (updateRes.status === 200) {
      console.log(`✅ Updated permissions for "${name}"`);
    }
    return true;
  } else {
    console.log(`❌ Error: ${res.data?.message || JSON.stringify(res.data)}`);
    return false;
  }
}

async function setup() {
  console.log('🔧 PocketBase Setup\n');
  console.log('=' .repeat(50));

  try {
    // Check PocketBase
    console.log('⏳ Waiting for PocketBase...');
    let health;
    for (let i = 0; i < 30; i++) {
      try {
        health = await makeRequest('GET', '/api/health');
        if (health.status === 200) break;
      } catch {}
      await sleep(1000);
    }
    if (health.status !== 200) throw new Error('PocketBase not responding');
    console.log('✅ PocketBase is running\n');

    // Create collections
    console.log('📋 Creating collections...\n');

    const clients = await createCollection('clients', [
      { name: 'name', type: 'text', required: true },
      { name: 'api_key', type: 'text', required: true },
      { name: 'allowed_origins', type: 'json' },
      { name: 'is_active', type: 'bool' }
    ]);

    const staff = await createCollection('staff', [
      { name: 'name', type: 'text', required: true },
      { name: 'skills', type: 'json' },
      { name: 'capacity', type: 'json' },
      { name: 'start_location', type: 'json', required: true },
      { name: 'current_location', type: 'json' },
      { name: 'is_available', type: 'bool' }
    ]);

    const tasks = await createCollection('tasks', [
      { 
        name: 'type', 
        type: 'select', 
        required: true,
        options: { values: ['service', 'shipment'] }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: { values: ['pending', 'optimized', 'in_progress', 'completed'] }
      },
      { name: 'client_id', type: 'relation', required: true },
      { name: 'staff_id', type: 'relation' },
      { name: 'data', type: 'json', required: true },
      { name: 'sort_order', type: 'number' },
      { name: 'scheduled_at', type: 'date' },
      { name: 'completed_at', type: 'date' }
    ]);

    if (!clients || !staff || !tasks) {
      throw new Error('Failed to create collections');
    }

    console.log('\n✅ Collections created\n');

    // Wait a bit for collections to be available
    await sleep(2000);

    // Create demo data
    console.log('📝 Creating demo data...\n');

    // Create client
    console.log('→ Demo client');
    const clientRes = await makeRequest('POST', '/api/collections/clients/records', {
      name: 'Demo Client',
      api_key: 'demo-key-for-development',
      allowed_origins: ['http://localhost:5175', 'http://localhost:5174'],
      is_active: true
    });

    const clientId = clientRes.data?.id;
    if (!clientId) {
      console.log('❌ Failed to create client');
      throw new Error('No client ID returned');
    }
    console.log(`✅ Created (ID: ${clientId.substring(0, 8)}...)`);

    // Create staff
    console.log('→ Demo staff');
    await makeRequest('POST', '/api/collections/staff/records', {
      name: 'John Driver',
      skills: [1, 2],
      capacity: { weight: 100, volume: 50 },
      start_location: { lat: 50.8503, lng: 4.3517 },
      current_location: { lat: 50.8503, lng: 4.3517 },
      is_available: true
    });
    console.log('✅ Created');

    // Create service task
    console.log('→ Service task');
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

    // Create shipment task
    console.log('→ Shipment task');
    await makeRequest('POST', '/api/collections/tasks/records', {
      type: 'shipment',
      status: 'pending',
      client_id: clientId,
      data: {
        pickup_lat: 50.84,
        pickup_lng: 4.34,
        delivery_lat: 50.86,
        delivery_lng: 4.36,
        weight: 5,
        description: 'Package delivery'
      }
    });
    console.log('✅ Created');

    console.log('\n' + '='.repeat(50));
    console.log('\n✨ Setup complete!\n');
    console.log('Access points:');
    console.log('  • Frontend:         http://localhost:5175');
    console.log('  • API Gateway:      http://localhost:4002');
    console.log('  • PocketBase Admin: http://localhost:8091/_/');
    console.log('\nDemo credentials:');
    console.log('  • API Key: demo-key-for-development\n');

  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
