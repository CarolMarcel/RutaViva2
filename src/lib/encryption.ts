const ENCRYPTION_KEY = 'rutaviva-secure-key-2024';

export function encryptData(data: string): string {
  if (!data) return '';

  try {
    const encoded = btoa(unescape(encodeURIComponent(data + ENCRYPTION_KEY)));
    return encoded;
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
}

export function decryptData(encryptedData: string): string {
  if (!encryptedData) return '';

  try {
    const decoded = decodeURIComponent(escape(atob(encryptedData)));
    return decoded.replace(ENCRYPTION_KEY, '');
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
}
