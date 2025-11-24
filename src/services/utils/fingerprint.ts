import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise: Promise<string> | null = null;

export const getDeviceFingerprint = async (): Promise<string> => {
  if (!fingerprintPromise) {
    fingerprintPromise = generateFingerprint();
  }
  return fingerprintPromise;
};

const generateFingerprint = async (): Promise<string> => {
  try {
    // Check if fingerprint is cached in localStorage
    const cachedFingerprint = localStorage.getItem('device_fingerprint');
    if (cachedFingerprint) {
      return cachedFingerprint;
    }

    // Generate new fingerprint
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    // Cache the fingerprint
    localStorage.setItem('device_fingerprint', fingerprint);
    
    return fingerprint;
  } catch (error) {
    console.error('Failed to generate device fingerprint:', error);
    // Fallback to a simple random string
    const fallback = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_fingerprint', fallback);
    return fallback;
  }
};