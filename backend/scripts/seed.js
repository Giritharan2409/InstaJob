const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instajob');
    console.log('Connected to MongoDB. Wiping existing data...');

    // Wipe collections
    await Worker.deleteMany({});
    await Employer.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Attendance.deleteMany({});
    await Payment.deleteMany({});
    await Rating.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});
    await Complaint.deleteMany({});

    console.log('Data wiped. Inserting sample data...');

    // 1. Seed Workers
    const workers = await Worker.insertMany([
      {
        name: 'Jane Doe',
        email: 'jane@student.edu',
        password: 'password123',
        phone: '9876543210',
        skills: ['React.js', 'CSS', 'JavaScript', 'Node.js', 'Figma'],
        preferredCategory: 'Web Development',
        availability: 'Weekends',
        trustScore: 98,
        earnings: 750,
        badges: ['Quick Starter', 'Star Performer'],
        bio: 'CS Sophomore at City University. Active web design hobbyist looking for short coding and design gigs.'
      },
      {
        name: 'Alex Smith',
        email: 'alex@work.com',
        password: 'password123',
        phone: '8765432109',
        skills: ['Event Setup', 'Crowd Management', 'Customer Service', 'Public Speaking'],
        preferredCategory: 'Event Management',
        availability: 'Flexible',
        trustScore: 92,
        earnings: 450,
        badges: ['Punctual'],
        bio: 'Reliable event host and coordinator. Available for weekend event setups, catering support, and host operations.'
      },
      {
        name: 'Liam Johnson',
        email: 'liam@logistic.org',
        password: 'password123',
        phone: '7654321098',
        skills: ['Driving', 'Inventory Management', 'Lifting', 'Packaging'],
        preferredCategory: 'Logistics',
        availability: 'Evenings',
        trustScore: 100,
        earnings: 1200,
        badges: ['Elite Earner', 'Power Lifter'],
        bio: 'Fast, reliable courier and packing assistant. Hard worker with a perfect attendance record.'
      }
    ]);

    // 2. Seed Employers
    const employers = await Employer.insertMany([
      {
        name: 'Sophia Patel',
        companyName: 'TechCorp Solutions',
        email: 'sophia@techcorp.com',
        password: 'password123',
        phone: '9988776655',
        industry: 'Software & Technology',
        rating: 4.8,
        description: 'Boutique software development firm specialized in prototyping products for early stage startups.',
        address: '102 Tech Plaza, Electronic City, Bangalore'
      },
      {
        name: 'Mark Davis',
        companyName: 'Epic Events Inc.',
        email: 'mark@epicevents.com',
        password: 'password123',
        phone: '8877665544',
        industry: 'Entertainment & Events',
        rating: 4.5,
        description: 'Full-service event marketing and hosting agency specializing in corporate tech summits and concert management.',
        address: '404 Arena Boulevard, Indiranagar, Bangalore'
      }
    ]);

    // 3. Seed Jobs
    const jobs = await Job.insertMany([
      {
        title: 'React Landing Page Prototype',
        employerId: employers[0]._id,
        companyName: employers[0].companyName,
        category: 'Web Development',
        description: 'Need a fast React developer to assemble a clean landing page prototype based on Figma wireframes. 3 days engagement.',
        salary: 40,
        workingHours: '10 AM - 6 PM',
        duration: 3,
        vacancies: 2,
        skillsRequired: ['React.js', 'Tailwind CSS', 'JavaScript'],
        locationName: 'TechCorp HQ, Electronic City',
        latitude: 12.9716, // Indiranagar area coordinates
        longitude: 77.5946,
        date: '2026-08-10',
        dressCode: 'Smart Casual',
        contactPerson: 'Sophia Patel',
        emergency: false,
        aiFakeScore: 5,
        aiAnalysis: 'Legitimate job listing from a verified corporate provider.'
      },
      {
        title: 'Urgent: Technical Seminar Host Assist',
        employerId: employers[1]._id,
        companyName: employers[1].companyName,
        category: 'Event Management',
        description: 'Urgent support needed today to assist with guest check-ins, registration, and seating logistics at our tech summit.',
        salary: 22,
        workingHours: '8 AM - 4 PM',
        duration: 2,
        vacancies: 3,
        skillsRequired: ['Customer Service', 'Event Setup'],
        locationName: 'Epic Arena, Indiranagar',
        latitude: 12.9784,
        longitude: 77.6408,
        date: '2026-08-02',
        dressCode: 'Black Blazer & Trousers',
        contactPerson: 'Mark Davis',
        emergency: true,
        aiFakeScore: 8,
        aiAnalysis: 'Urgent emergency listing. Verified employer.'
      },
      {
        title: 'Warehouse Boxing & Loading',
        employerId: employers[0]._id,
        companyName: employers[0].companyName,
        category: 'Logistics',
        description: 'Help load computing server equipment into boxes and log serial numbers. Heavy lifting of up to 15kg is required.',
        salary: 25,
        workingHours: '9 AM - 5 PM',
        duration: 4,
        vacancies: 5,
        skillsRequired: ['Lifting', 'Packaging'],
        locationName: 'TechCorp Warehouse, Hosur Road',
        latitude: 12.9141,
        longitude: 77.6108,
        date: '2026-08-15',
        dressCode: 'Comfortable Sneakers & Jeans',
        contactPerson: 'Sophia Patel',
        emergency: false,
        aiFakeScore: 12,
        aiAnalysis: 'Legitimate packing role from tech corp logistics division.'
      }
    ]);

    // 4. Seed Applications
    const applications = await Application.insertMany([
      {
        jobId: jobs[0]._id,
        workerId: workers[0]._id,
        status: 'completed',
        aiMatchScore: 95,
        aiMatchExplanation: 'Excellent alignment: Jane Doe is a CS student with matching React and JavaScript skills.',
        appliedAt: new Date('2026-07-20'),
        selectedAt: new Date('2026-07-21'),
        completedAt: new Date('2026-07-24')
      },
      {
        jobId: jobs[1]._id,
        workerId: workers[1]._id,
        status: 'applied',
        aiMatchScore: 88,
        aiMatchExplanation: 'High alignment: Alex has event crowd management experience and is available for immediate setup.',
        appliedAt: new Date('2026-07-30')
      }
    ]);

    // 5. Seed Attendance Logs
    await Attendance.insertMany([
      {
        applicationId: applications[0]._id,
        jobId: jobs[0]._id,
        workerId: workers[0]._id,
        checkInTime: new Date('2026-07-22T10:02:00Z'),
        checkInLat: 12.9715,
        checkInLng: 77.5945,
        checkOutTime: new Date('2026-07-22T18:05:00Z'),
        checkOutLat: 12.9716,
        checkOutLng: 77.5946,
        status: 'checked_out',
        gpsVerified: true
      }
    ]);

    // 6. Seed Payments
    await Payment.insertMany([
      {
        applicationId: applications[0]._id,
        jobId: jobs[0]._id,
        workerId: workers[0]._id,
        employerId: employers[0]._id,
        amount: 960, // 3 days * 8 hours * $40
        upiId: 'jane@okaxis',
        transactionId: 'UPI-TXN-773821038491',
        status: 'success',
        releasedAt: new Date('2026-07-25')
      }
    ]);

    // 7. Seed Certificates
    await Certificate.create({
      workerId: workers[0]._id,
      jobId: jobs[0]._id,
      title: jobs[0].title,
      companyName: jobs[0].companyName,
      description: 'Jane Doe demonstrated outstanding technical proficiency in constructing client landing interfaces.',
      verificationCode: 'CERT-INSTA-1002-738'
    });

    // 8. Seed Notifications
    await Notification.insertMany([
      {
        recipientId: workers[0]._id,
        recipientType: 'Worker',
        title: 'Welcome to Insta Job!',
        message: 'Your profile has been created successfully. Browse nearby gigs or check out AI recommendations.'
      },
      {
        recipientId: employers[0]._id,
        recipientType: 'Employer',
        title: 'New Account Verified',
        message: 'Your company "TechCorp Solutions" is verified. You can now post emergency hiring orders.'
      }
    ]);

    // 9. Seed Ratings
    await Rating.create({
      jobId: jobs[0]._id,
      reviewerId: employers[0]._id,
      reviewerType: 'Employer',
      revieweeId: workers[0]._id,
      revieweeType: 'Worker',
      punctuality: 5,
      workQuality: 5,
      behaviour: 5,
      communication: 5,
      overallRating: 5,
      comment: 'Excellent worker! Jane delivered the project landing page code a day early and did an outstanding job.'
    });

    console.log('Database successfully seeded with mock entries!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
