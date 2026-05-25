import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../modules/users/users.model.js';
import { hashPassword } from '../modules/users/users.utils.js';
import { RoleNames, UserStatuses } from '../constants.js';

const email = (process.env.ADMIN_EMAIL || 'admin@salecrm.local').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || 'Admin123!';
const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
const lastName = process.env.ADMIN_LAST_NAME || 'User';

async function seedAdmin() {
  await connectDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== RoleNames.ADMIN) {
      existing.role = RoleNames.ADMIN;
      existing.status = UserStatuses.ACTIVE;
      await existing.save();
      console.log(`Updated existing user to admin: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    return;
  }

  await User.create({
    firstName,
    lastName,
    email,
    password: await hashPassword(password),
    role: RoleNames.ADMIN,
    status: UserStatuses.ACTIVE,
  });

  console.log('Admin created successfully.');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD ? '(from ADMIN_PASSWORD)' : password}`);
  console.log('Sign in at /login, then change the password in Profile if needed.');
}

seedAdmin()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('seed-admin failed:', error.message);
    await disconnectDatabase();
    process.exit(1);
  });
