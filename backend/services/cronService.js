import cron from 'node-cron';
import PulsePost from '../models/PulsePost.js';

const deleteExpiredPosts = async () => {
  const now = new Date();
  const result = await PulsePost.deleteMany({ expiresAt: { $lte: now } });
  if (result.deletedCount > 0) {
    console.log(`Deleted ${result.deletedCount} expired pulse posts`);
  }
};

export const startCronJobs = () => {
  cron.schedule('*/15 * * * *', deleteExpiredPosts);
  console.log('Cron jobs started');
};
