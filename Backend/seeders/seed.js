const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Counselor = require('../models/Counselor');
const connectDB = require('../database/connect');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Counselor.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@socialcare.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin created:', admin.email);

    // Create Test Counselors
    const counselors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah@counselor.com',
        password: 'counselor123',
        specialization: 'Family Counseling',
        bio: 'Experienced family counselor with 10+ years helping families navigate challenges.',
        experience: 10,
        certifications: ['Licensed Family Therapist', 'Certified Mediator']
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael@counselor.com',
        password: 'counselor123',
        specialization: 'Mental Health',
        bio: 'Specialized in anxiety, depression, and stress management.',
        experience: 8,
        certifications: ['Licensed Clinical Psychologist', 'CBT Certified']
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily@counselor.com',
        password: 'counselor123',
        specialization: 'Relationship Counseling',
        bio: 'Helping couples and individuals build healthier relationships.',
        experience: 12,
        certifications: ['Licensed Marriage and Family Therapist', 'Gottman Method Certified']
      },
      {
        name: 'Dr. James Wilson',
        email: 'james@counselor.com',
        password: 'counselor123',
        specialization: 'Addiction Recovery',
        bio: 'Supporting individuals on their journey to recovery and sobriety.',
        experience: 15,
        certifications: ['Licensed Addiction Counselor', 'Certified Recovery Specialist']
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'lisa@counselor.com',
        password: 'counselor123',
        specialization: 'Youth Counseling',
        bio: 'Specialized in working with adolescents and young adults.',
        experience: 7,
        certifications: ['Licensed Professional Counselor', 'Youth Mental Health First Aid']
      }
    ];

    for (const counselorData of counselors) {
      const { name, email, password, specialization, bio, experience, certifications } = counselorData;
      
      // Check if user already exists
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          password,
          role: 'counselor'
        });
        console.log('Counselor user created:', user.email);
      }

      // Check if counselor profile already exists
      let counselor = await Counselor.findOne({ userId: user._id });
      if (!counselor) {
        counselor = await Counselor.create({
          userId: user._id,
          specialization,
          bio,
          experience,
          certifications,
          isAvailable: true
        });
        console.log('Counselor profile created:', user.name);
      }
    }

    // Create Test Users
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@user.com',
        password: 'user123'
      },
      {
        name: 'Jane Smith',
        email: 'jane@user.com',
        password: 'user123'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@user.com',
        password: 'user123'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create({
          ...userData,
          role: 'user'
        });
        console.log('Test user created:', userData.email);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@socialcare.com / admin123');
    console.log('Counselors: [email]@counselor.com / counselor123');
    console.log('Users: [email]@user.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

