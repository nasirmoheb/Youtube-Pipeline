/**
 * Simple test to verify console.log works
 */

console.log('========================================');
console.log('Test 1: Regular console.log');
console.log('========================================');

process.stdout.write('\n========================================\n');
process.stdout.write('Test 2: process.stdout.write\n');
process.stdout.write('========================================\n');

console.error('Test 3: console.error (should appear in red/stderr)');

console.log('\nIf you see all 3 tests above, console logging is working!');
console.log('If you only see some, there might be an issue with your terminal or Node.js');

// Test async logging
setTimeout(() => {
    console.log('\nTest 4: Async console.log (after 1 second)');
    console.log('If you see this, async logging works too!');
}, 1000);
