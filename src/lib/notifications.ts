// Notification & Gateway Service for BloodBond Bangladesh

import prisma from './prisma';

export interface NotificationPayload {
  userId: string;
  type: 'EMERGENCY_REQUEST' | 'REMINDER' | 'ELIGIBILITY_UPDATE' | 'VERIFICATION' | 'REQUEST_STATUS';
  title: string;
  message: string;
  linkUrl?: string;
  recipientPhone?: string;
  recipientEmail?: string | null;
  preferredMethod?: string;
}

export interface DispatchResult {
  inAppNotificationId: string;
  smsSent: boolean;
  emailSent: boolean;
  smsLog?: string;
  emailLog?: string;
}

/**
 * Creates an in-app notification and dispatches mock/live SMS and Email.
 */
export async function sendNotification(payload: NotificationPayload): Promise<DispatchResult> {
  // 1. Always create the in-app notification record
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      linkUrl: payload.linkUrl,
    },
  });

  let smsSent = false;
  let smsLog: string | undefined;
  let emailSent = false;
  let emailLog: string | undefined;

  // 2. Dispatch SMS (Bangladesh Gateway Adapter)
  if (payload.recipientPhone && (payload.preferredMethod === 'SMS' || payload.preferredMethod === 'PHONE' || payload.type === 'EMERGENCY_REQUEST')) {
    // In development mode, log to console & system logs
    smsSent = true;
    smsLog = `[BD-SMS-GATEWAY] To: ${payload.recipientPhone} | Msg: "${payload.title}: ${payload.message}"`;
    console.log(smsLog);
  }

  // 3. Dispatch Email
  if (payload.recipientEmail) {
    emailSent = true;
    emailLog = `[EMAIL-GATEWAY] To: ${payload.recipientEmail} | Subject: "${payload.title}"`;
    console.log(emailLog);
  }

  return {
    inAppNotificationId: notification.id,
    smsSent,
    emailSent,
    smsLog,
    emailLog,
  };
}
