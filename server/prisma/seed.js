const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.join(__dirname, 'dev.db') });
const prisma = new PrismaClient({ adapter });

const sectors = [
  { id: 1,  name: 'Triveni Sangam Ghat',     type: 'Ghat',     requiredSkill: 'Swimmer',      volunteersRequired: 30, priorityLevel: 'High',   adjacentSectors: '2,6' },
  { id: 2,  name: 'Ram Ghat',                 type: 'Ghat',     requiredSkill: 'CrowdControl', volunteersRequired: 25, priorityLevel: 'Medium', adjacentSectors: '1,3,7' },
  { id: 3,  name: 'Medical Post Alpha',       type: 'Medical',  requiredSkill: 'Medical',      volunteersRequired: 15, priorityLevel: 'Medium', adjacentSectors: '2,4,8' },
  { id: 4,  name: 'Entry Gate North',         type: 'EntryExit',requiredSkill: 'CrowdControl', volunteersRequired: 20, priorityLevel: 'Low',    adjacentSectors: '3,5,9' },
  { id: 5,  name: 'Akshayvat Camp',           type: 'Camp',     requiredSkill: 'General',      volunteersRequired: 12, priorityLevel: 'Low',    adjacentSectors: '4,10' },
  { id: 6,  name: 'Dashashwamedh Zone',       type: 'Ghat',     requiredSkill: 'Swimmer',      volunteersRequired: 25, priorityLevel: 'Low',    adjacentSectors: '1,7,11' },
  { id: 7,  name: 'Food Distribution Hub',    type: 'Camp',     requiredSkill: 'Sanitation',   volunteersRequired: 18, priorityLevel: 'Low',    adjacentSectors: '2,6,8,12' },
  { id: 8,  name: 'Emergency Medical Center', type: 'Medical',  requiredSkill: 'Medical',      volunteersRequired: 20, priorityLevel: 'High',   adjacentSectors: '3,7,9,13' },
  { id: 9,  name: 'Translation Kiosk East',   type: 'Helpdesk', requiredSkill: 'Translation',  volunteersRequired: 8,  priorityLevel: 'Low',    adjacentSectors: '4,8,10,14' },
  { id: 10, name: 'VIP Enclosure',            type: 'Camp',     requiredSkill: 'General',      volunteersRequired: 10, priorityLevel: 'Low',    adjacentSectors: '5,9,15' },
  { id: 11, name: 'Sangam Nose Point',        type: 'Ghat',     requiredSkill: 'Swimmer',      volunteersRequired: 22, priorityLevel: 'Medium', adjacentSectors: '6,12,16' },
  { id: 12, name: 'Volunteer Base Camp',      type: 'Camp',     requiredSkill: 'General',      volunteersRequired: 15, priorityLevel: 'Low',    adjacentSectors: '7,11,13,17' },
  { id: 13, name: 'Trauma Care Unit',         type: 'Medical',  requiredSkill: 'Medical',      volunteersRequired: 18, priorityLevel: 'Medium', adjacentSectors: '8,12,14,18' },
  { id: 14, name: 'Lost & Found Center',      type: 'Helpdesk', requiredSkill: 'General',      volunteersRequired: 10, priorityLevel: 'Low',    adjacentSectors: '9,13,15,19' },
  { id: 15, name: 'Exit Gate South',          type: 'EntryExit',requiredSkill: 'CrowdControl', volunteersRequired: 20, priorityLevel: 'Low',    adjacentSectors: '10,14,20' },
  { id: 16, name: 'Yamuna Ghat',              type: 'Ghat',     requiredSkill: 'Swimmer',      volunteersRequired: 22, priorityLevel: 'Low',    adjacentSectors: '11,17,21' },
  { id: 17, name: 'Sanitation Block A',       type: 'Camp',     requiredSkill: 'Sanitation',   volunteersRequired: 12, priorityLevel: 'Low',    adjacentSectors: '12,16,18,22' },
  { id: 18, name: 'First Aid Station',        type: 'Medical',  requiredSkill: 'Medical',      volunteersRequired: 15, priorityLevel: 'Low',    adjacentSectors: '13,17,19,23' },
  { id: 19, name: 'Information Helpdesk',     type: 'Helpdesk', requiredSkill: 'Translation',  volunteersRequired: 10, priorityLevel: 'Low',    adjacentSectors: '14,18,20,24' },
  { id: 20, name: 'Parking Zone East',        type: 'EntryExit',requiredSkill: 'CrowdControl', volunteersRequired: 15, priorityLevel: 'Low',    adjacentSectors: '15,19,25' },
  { id: 21, name: 'Saraswati Ghat',           type: 'Ghat',     requiredSkill: 'CrowdControl', volunteersRequired: 20, priorityLevel: 'Low',    adjacentSectors: '16,22' },
  { id: 22, name: 'Water Supply Point',       type: 'Camp',     requiredSkill: 'Sanitation',   volunteersRequired: 10, priorityLevel: 'Low',    adjacentSectors: '17,21,23' },
  { id: 23, name: 'Ambulance Bay',            type: 'Medical',  requiredSkill: 'Medical',      volunteersRequired: 12, priorityLevel: 'Low',    adjacentSectors: '18,22,24' },
  { id: 24, name: 'Crowd Monitor Tower',      type: 'Helpdesk', requiredSkill: 'CrowdControl', volunteersRequired: 8,  priorityLevel: 'Low',    adjacentSectors: '19,23,25' },
  { id: 25, name: 'VIP Camp Zone',            type: 'Camp',     requiredSkill: 'General',      volunteersRequired: 10, priorityLevel: 'Low',    adjacentSectors: '20,24' },
];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Advaith',
  'Aarush', 'Kabir', 'Ritvik', 'Dhruv', 'Harsh', 'Nishant', 'Rohan', 'Kunal',
  'Vikram', 'Manish', 'Rajesh', 'Suresh', 'Deepak', 'Amit', 'Rahul',
  'Priya', 'Ananya', 'Saanvi', 'Aanya', 'Aadhya', 'Isha', 'Diya', 'Kavya',
  'Meera', 'Neha', 'Pooja', 'Riya', 'Shreya', 'Tanvi', 'Kiara',
  'Sneha', 'Sakshi', 'Nandini', 'Pallavi', 'Swati',
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Yadav', 'Mishra',
  'Pandey', 'Tiwari', 'Dubey', 'Joshi', 'Agarwal', 'Mehta', 'Shah',
  'Reddy', 'Nair', 'Iyer', 'Chopra', 'Malhotra', 'Bhatia', 'Saxena',
  'Chauhan', 'Thakur', 'Rathore',
];

const skills = ['Medical', 'CrowdControl', 'Translation', 'Swimmer', 'Sanitation', 'General'];
const fitnessLevels = ['High', 'Medium', 'Low'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '89', '88'];
  return prefixes[randomInt(0, prefixes.length - 1)] + String(randomInt(10000000, 99999999));
}

async function main() {
  console.log('🌊 Seeding KumbhSync database...\n');

  // Clear existing data
  await prisma.deployment.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.sector.deleteMany();

  // Seed sectors
  for (const sector of sectors) {
    await prisma.sector.create({ data: sector });
  }
  console.log(`✅ Created ${sectors.length} sectors`);

  // Seed volunteers
  const usedPhones = new Set();
  const volunteers = [];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i];
    const lastName = randomChoice(lastNames);
    const name = `${firstName} ${lastName}`;

    let phone;
    do {
      phone = generatePhone();
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    const volunteer = {
      name,
      phone,
      age: randomInt(18, 55),
      primarySkill: randomChoice(skills),
      fitnessLevel: randomChoice(fitnessLevels),
      currentSector: randomInt(1, 25),
      fatigueScore: randomInt(0, 50),
      status: 'Available',
    };
    volunteers.push(volunteer);
  }

  for (const v of volunteers) {
    await prisma.volunteer.create({ data: v });
  }
  console.log(`✅ Created ${volunteers.length} volunteers`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
