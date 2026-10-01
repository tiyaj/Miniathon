import User from '../../models/User.js';
import { ROLES } from '../../utils/constants.js';

export const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'PulseDemo@2026!';

export const getDemoUsersData = async () => {
  const passwordHash = await User.hashPassword(DEMO_USER_PASSWORD);

  return [
    {
      name: 'Vikramaditya Singhania',
      email: 'superadmin@pulse-demo.local',
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Sunita Deshmukh',
      email: 'admin@pulse-demo.local',
      passwordHash,
      role: ROLES.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Rajesh Kulkarni',
      email: 'coordinator@pulse-demo.local',
      passwordHash,
      role: ROLES.COORDINATOR,
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Kavita Chawla',
      email: 'ops.coordinator@pulse-demo.local',
      passwordHash,
      role: ROLES.COORDINATOR,
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Dr. Anjali Sawant',
      email: 'medical.coordinator@pulse-demo.local',
      passwordHash,
      role: ROLES.COORDINATOR,
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Aarav Mehta',
      email: 'volunteer@pulse-demo.local',
      passwordHash,
      role: ROLES.VOLUNTEER,
      isEmailVerified: true,
      isActive: true,
    },
  ];
};

/**
 * Clean existing demo users safely without touching real accounts.
 */
export const cleanDemoUsers = async () => {
  const result = await User.deleteMany({ email: { $regex: /@pulse-demo\.local$/i } });
  return result.deletedCount;
};

/**
 * Seed demo users idempotently.
 */
export const seedDemoUsers = async () => {
  await cleanDemoUsers();
  const usersData = await getDemoUsersData();
  const createdUsers = await User.insertMany(usersData);
  return createdUsers;
};
