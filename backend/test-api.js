// Simple test script to verify the API is working
// Run with: node test-api.js

const testProjectCreation = async () => {
  const testData = {
    projectPath: 'C:\\Temp\\Test-YouTube-Project',
    bookContent: 'This is a test book content for the YouTube video pipeline.'
  };

  try {
    console.log('Testing POST /api/project...');
    const response = await fetch('http://localhost:3001/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success:', result.message);
      console.log('Check the directory:', testData.projectPath);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Failed to connect to backend:', error.message);
    console.log('Make sure the backend is running: cd backend && npm run dev');
  }
};

testProjectCreation();
