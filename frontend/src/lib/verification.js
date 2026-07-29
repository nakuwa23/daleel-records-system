import { getInstitutions, verifyRecord, syncOfflineVerifications } from "./api";
import { verifyRecordSignature } from "./offlineCrypto";
import {
  cacheInstitutions,
  getCachedInstitutions,
  getInstitutionsSyncedAt,
  queueVerification,
  getQueuedVerifications,
  removeQueuedVerifications,
  getQueueCount,
} from "./offlineDb";

export async function refreshInstitutionDirectory() {
  const institutions = await getInstitutions();
  await cacheInstitutions(institutions);
  return institutions;
}

export { getInstitutionsSyncedAt, getQueueCount };

export async function verifyRecordSmart(payload) {
  const shouldTryOnline = typeof navigator === "undefined" || navigator.onLine !== false;

  if (shouldTryOnline) {
    try {
      const result = await verifyRecord(payload);
      return { ...result, mode: "ONLINE", pendingSync: false };
    } catch (err) {
      if (!(err instanceof TypeError)) throw err;
    }
  }

  return verifyRecordOffline(payload);
}

async function verifyRecordOffline(payload) {
  const record = payload?.record;
  const signature = payload?.signature;
  const issuerId = payload?.issuerId;

  if (!record || !signature || !issuerId) {
    return { authentic: false, detail: "Incomplete record data", mode: "OFFLINE", pendingSync: false };
  }

  const directory = await getCachedInstitutions();
  const issuer = directory.find((inst) => inst.institution_id === issuerId);

  if (!issuer) {
    await queueVerification({ qrPayload: payload });
    return {
      authentic: false,
      detail: "Unknown issuer on this device — connect once to sync the issuer directory",
      mode: "OFFLINE",
      pendingSync: true,
    };
  }

  const authentic = await verifyRecordSignature(record, signature, issuer.public_key);
  await queueVerification({ qrPayload: payload });

  if (!authentic) {
    return {
      authentic: false,
      detail: "Signature invalid — record may have been altered",
      mode: "OFFLINE",
      pendingSync: true,
    };
  }

  return {
    authentic: true,
    detail: "Record is authentic and unaltered",
    mode: "OFFLINE",
    pendingSync: true,
    record,
    issuer_name: issuer.name,
    // Learner name/photo come from the backend and aren't cached on-device.
    learner_name: null,
    learner_photo: null,
  };
}

export async function flushOfflineVerificationQueue() {
  const queued = await getQueuedVerifications();
  if (queued.length === 0) return 0;

  await syncOfflineVerifications(
    queued.map((item) => ({ qr_payload: item.qrPayload }))
  );
  await removeQueuedVerifications(queued.map((item) => item.id));
  return queued.length;
}
