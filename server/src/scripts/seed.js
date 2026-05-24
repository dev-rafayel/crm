import { connectDatabase, disconnectDatabase } from '../config/database.js';
import Client from '../modules/clients/clients.model.js';
import Deal from '../modules/deals/deals.model.js';

const clients = [
  {
    name: 'Наринэ Саргсян',
    company: 'Alfa Group',
    email: 'n.sargsyan@alfa.am',
    phone: '+374 91 000 111',
    status: 'hot',
    position: 'CEO',
    source: 'Referral',
    added: 'Jan 12, 2024',
    tags: ['VIP', 'Hot'],
  },
  {
    name: 'Tigran Petrosyan',
    company: 'Beta Systems',
    email: 't.pet@beta.am',
    phone: '+374 77 222 333',
    status: 'warm',
    position: 'Sales Lead',
    source: 'Advertisement',
    added: 'Feb 5, 2024',
    tags: ['Warm'],
  },
  {
    name: 'Анна Ковалёва',
    company: 'DataCore LLC',
    email: 'a.k@datacore.ru',
    phone: '+7 495 000 00 00',
    status: 'warm',
    position: 'CTO',
    source: 'Conference',
    added: 'Mar 2, 2024',
    tags: ['Warm'],
  },
  {
    name: 'Armen Grigoryan',
    company: 'Yerevan Tech',
    email: 'armen@yt.am',
    phone: '+374 93 444 555',
    status: 'cold',
    position: 'Product Manager',
    source: 'Lead list',
    added: 'Apr 10, 2024',
    tags: ['Cold'],
  },
  {
    name: 'Сергей Мартынов',
    company: 'NovaSoft',
    email: 's.mart@nova.ru',
    phone: '+7 812 111 22 33',
    status: 'hot',
    position: 'Head of Sales',
    source: 'Referral',
    added: 'Apr 18, 2024',
    tags: ['VIP', 'Hot'],
  },
  {
    name: 'Lilit Avetisyan',
    company: 'ArmBusiness',
    email: 'lilit@ab.am',
    phone: '+374 91 666 777',
    status: 'cold',
    position: 'Operations Lead',
    source: 'Inbound',
    added: 'May 1, 2024',
    tags: ['Cold'],
  },
  {
    name: 'Дмитрий Орлов',
    company: 'CloudBase',
    email: 'd.orlov@cloudbase.io',
    phone: '+7 916 333 44 55',
    status: 'warm',
    position: 'Engineering Director',
    source: 'Partner',
    added: 'May 8, 2024',
    tags: ['Warm'],
  },
  {
    name: 'Karen Hakobyan',
    company: 'Armsoft',
    email: 'karen@armsoft.am',
    phone: '+374 94 888 999',
    status: 'hot',
    position: 'CEO',
    source: 'Referral',
    added: 'May 12, 2024',
    tags: ['VIP', 'Hot'],
  },
];

const deals = [
  {
    name: 'Corporate License',
    company: 'Yerevan Tech',
    amount: 5000,
    date: new Date('2024-05-15'),
    stage: 'new',
  },
  {
    name: 'Pro Subscription',
    company: 'ArmBusiness',
    amount: 2400,
    date: new Date('2024-05-16'),
    stage: 'new',
  },
  {
    name: 'Consulting',
    company: 'Beta Systems',
    amount: 1200,
    date: new Date('2024-05-17'),
    stage: 'new',
  },
  {
    name: 'API Integration',
    company: 'DataCore LLC',
    amount: 17000,
    date: new Date('2024-05-14'),
    stage: 'inProgress',
  },
  {
    name: 'Annual Plan',
    company: 'Alfa Group',
    amount: 12000,
    date: new Date('2024-05-13'),
    stage: 'inProgress',
  },
  {
    name: 'Expansion',
    company: 'NovaSoft',
    amount: 9500,
    date: new Date('2024-05-12'),
    stage: 'inProgress',
  },
  {
    name: 'Enterprise',
    company: 'Alfa Group',
    amount: 24000,
    date: new Date('2024-05-10'),
    stage: 'negotiation',
  },
  {
    name: '24/7 Support',
    company: 'NovaSoft',
    amount: 8000,
    date: new Date('2024-05-09'),
    stage: 'negotiation',
  },
  {
    name: 'Starter Plan',
    company: 'Alfa Group',
    amount: 3600,
    date: new Date('2024-05-08'),
    stage: 'closed',
  },
  {
    name: 'Data Migration',
    company: 'NovaSoft',
    amount: 6200,
    date: new Date('2024-05-05'),
    stage: 'closed',
  },
];

async function seed() {
  await connectDatabase();

  await Deal.deleteMany();
  await Client.deleteMany();

  const createdClients = await Client.insertMany(clients);
  const clientMap = new Map(createdClients.map((client) => [client.company, client._id]));

  const staffUsers = [];
  // Seed has no users created here; if your DB already has staff users, we can reuse them.
  // To keep seed idempotent, we fall back to leaving createdBy empty when no users exist.
  // (If you want deterministic managers/activities, you should also seed staff users.)

  // eslint-disable-next-line no-empty
  for (const _u of staffUsers) {}

  const dealsToInsert = deals.map((deal) => ({
    ...deal,
    clientId: clientMap.get(deal.company) || null,
    createdBy: null,
  }));


  await Deal.insertMany(dealsToInsert);

  console.log(`Seeded ${createdClients.length} clients and ${dealsToInsert.length} deals.`);
}

seed()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await disconnectDatabase();
    process.exit(1);
  });
