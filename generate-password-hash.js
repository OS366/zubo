import bcrypt from 'bcryptjs';

const password = 'OS366'; // Replace with your actual password
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL to update your admin user:');
  console.log(`UPDATE zubo_admin SET password_hash = '${hash}' WHERE username = 'os366';`);
}); 