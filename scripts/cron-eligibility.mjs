import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runEligibilityRecalculation() {
  console.log('[CRON] Starting periodic eligibility recalculation job...');
  const now = new Date();

  // Get active eligibility policy
  const activePolicy = await prisma.eligibilityPolicy.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  const intervalDays = activePolicy?.intervalDays || 90;

  // Find all donors with a last donation date
  const donors = await prisma.donorProfile.findMany({
    where: {
      lastDonationDate: { not: null },
    },
    include: {
      user: true,
    },
  });

  let updatedCount = 0;
  let remindersSent = 0;

  for (const donor of donors) {
    if (!donor.lastDonationDate) continue;

    const nextDate = new Date(donor.lastDonationDate.getTime());
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const isNowEligible = now >= nextDate;
    const daysUntilEligible = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Update estimated next eligible date if different
    if (
      !donor.nextEligibleDate ||
      Math.abs(donor.nextEligibleDate.getTime() - nextDate.getTime()) > 60000
    ) {
      await prisma.donorProfile.update({
        where: { id: donor.id },
        data: { nextEligibleDate: nextDate },
      });
      updatedCount++;
    }

    // Send reminder if estimated date is within 3 days and hasn't donated yet
    if (daysUntilEligible > 0 && daysUntilEligible <= 3) {
      // Check if reminder was already sent today
      const existing = await prisma.notification.findFirst({
        where: {
          userId: donor.userId,
          type: 'REMINDER',
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: donor.userId,
            type: 'REMINDER',
            title: 'Upcoming Blood Donation Eligibility',
            message: `Hello ${donor.fullName}, your safety cooldown period finishes in ${daysUntilEligible} day(s). You will soon be eligible to save lives again!`,
            linkUrl: '/donor/dashboard',
          },
        });
        remindersSent++;
      }
    }
  }

  // Record audit log
  await prisma.auditLog.create({
    data: {
      action: 'CRON_ELIGIBILITY_RECALCULATION',
      resource: 'DonorProfile',
      details: JSON.stringify({
        processedDonors: donors.length,
        updatedNextEligibleDates: updatedCount,
        remindersDispatched: remindersSent,
        policyIntervalDays: intervalDays,
      }),
    },
  });

  console.log(`[CRON] Complete. Processed: ${donors.length}, Updated: ${updatedCount}, Reminders: ${remindersSent}`);
}

runEligibilityRecalculation()
  .catch((e) => {
    console.error('[CRON ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
