require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const usersToCreate = [
  { name: 'Admin Master', email: 'admin@gmail.com', password: 'password123', role: 'admin' },
  { name: 'Project Manager', email: 'pm@gmail.com', password: 'password123', role: 'pm' },
  { name: 'Script Writer', email: 'writer@gmail.com', password: 'password123', role: 'writer' },
  { name: 'Video Editor', email: 'editor@gmail.com', password: 'password123', role: 'editor' },
  { name: 'Sales Exec', email: 'sales@gmail.com', password: 'password123', role: 'sales' }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techency', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    for (const userData of usersToCreate) {
      let user = await User.findOne({ email: userData.email });
      if (user) {
        console.log(`User ${userData.email} already exists. Updating role to ${userData.role}...`);
        user.role = userData.role;
        user.password = userData.password; // This will hash it again because of pre-save hook
        await user.save();
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
