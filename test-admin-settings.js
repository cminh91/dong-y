const fetch = require('node-fetch');

async function testAdminSettings() {
  console.log('=== TESTING ADMIN SETTINGS API ===');
  
  try {
    // 1. Test GET settings
    console.log('1. Testing GET /api/admin/affiliate/settings');
    const getResponse = await fetch('http://localhost:3000/api/admin/affiliate/settings');
    const getResult = await getResponse.json();
    
    console.log('GET Response:', getResponse.status);
    console.log('GET Data:', JSON.stringify(getResult, null, 2));
    
    // 2. Test PUT settings (save commission settings)
    console.log('\n2. Testing PUT /api/admin/affiliate/settings (commissions)');
    const putResponse = await fetch('http://localhost:3000/api/admin/affiliate/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        section: 'commissions',
        settings: {
          defaultRate: 0.20,
          level1Rate: 0.20,
          level2Rate: 0.10,
          minWithdrawal: 50000,
          withdrawalFee: 3000,
          paymentSchedule: 'weekly'
        }
      })
    });
    
    const putResult = await putResponse.json();
    console.log('PUT Response:', putResponse.status);
    console.log('PUT Data:', JSON.stringify(putResult, null, 2));
    
    // 3. Test GET again to verify save
    console.log('\n3. Testing GET again to verify save');
    const getResponse2 = await fetch('http://localhost:3000/api/admin/affiliate/settings');
    const getResult2 = await getResponse2.json();
    
    console.log('GET2 Response:', getResponse2.status);
    console.log('Commission settings after save:', JSON.stringify(getResult2.data.commissions, null, 2));
    
  } catch (error) {
    console.error('Error testing admin settings:', error);
  }
}

testAdminSettings();
