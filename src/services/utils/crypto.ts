import CryptoJS from 'crypto-js';

export const encryptPassword = (password: string, nonce: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, nonce).toString();
    return encrypted;
  } catch (error) {
    console.error('Password encryption failed:', error);
    throw new Error('Failed to encrypt password');
  }
};

export const decryptPassword = (encryptedPassword: string, nonce: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, nonce);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Password decryption failed:', error);
    throw new Error('Failed to decrypt password');
  }
};
