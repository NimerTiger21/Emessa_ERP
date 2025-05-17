const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateRandomToken } = require('../utils/tokens');
require('dotenv').config();
//D:\Emessa\backend>node seeders/userSeeder.js
// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('DB connection for seeding successful!'))
.catch(err => console.error('DB connection error:', err));

// User data to seed
const users = [
  {
    name: 'Admin User',
    email: 'admin@emessadenim.com',
    password: 'admin123',
    role: 'admin',
    department: 'admin'
  },
  {
    name: 'Quality Manager',
    email: 'quality@emessadenim.com',
    password: '1',
    role: 'quality_manager',
    department: 'quality'
  },
  {
    name: 'Production Manager',
    email: 'production@emessadenim.com',
    password: '1',
    role: 'production_manager',
    department: 'production'
  },
  {
    name: 'Wash Supervisor',
    email: 'wash@emessadenim.com',
    password: '1',
    role: 'wash_supervisor',
    department: 'washing'
  },
  {
    name: 'Operator User',
    email: 'operator@emessadenim.com',
    password: '1',
    role: 'operator',
    department: 'production'
  }
];

const seedUsers = async () => {
  try {
    // Delete existing users
    await User.deleteMany();
    console.log('Deleted existing users');

    // Hash passwords and create users
    const hashedUsers = await Promise.all(users.map(async user => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return {
        ...user,
        password: hashedPassword,
        emailVerified: true,
        verificationToken: generateRandomToken()
      };
    }));

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Seeded ${createdUsers.length} users successfully`);

    // Display created users (without passwords)
    console.log('Created users:');
    createdUsers.forEach(user => {
      console.log({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();