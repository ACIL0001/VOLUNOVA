import { AuditLog } from '../models';

export async function logAuditEvent(action: string, actorId: string, metadata?: any) {
  try {
    await AuditLog.create({
      action,
      actorId,
      metadata,
    });
  } catch (err: any) {
    console.error(`[Audit Log Error] ${action}: ${err.message}`);
  }
}
