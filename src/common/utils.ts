import * as crypto from 'crypto';

export function formatDbName(date: string, db: string): string {
  const [year, month] = date.split('-');
  const shortYear = year.slice(-2);
  const formattedMonth = month.padStart(2, '0');
  return `${db}_hrm${shortYear}${formattedMonth}`;
}
export function formatDbNameNow(db: string): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // bulan dari 0-11, jadi +1
  const shortYear = year.slice(-2);
  return `${db}_hrm${shortYear}${month}`;
}
export function convertDaysToYMD(totalDays: number) {
  const daysInYear = 365;
  const daysInMonth = 30;
  const years = Math.floor(totalDays / daysInYear);
  totalDays -= years * daysInYear;
  const months = Math.floor(totalDays / daysInMonth);
  totalDays -= months * daysInMonth;
  const days = totalDays;
  return { tahun: years, bulan: months, hari: days };
}

export function databaseMaster(db: string): string {
  return `${db}_hrm`;
}
export function getDateNow(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function decryptText(textToDecrypt: string, key: string): string {
  const ciphering = 'aes-256-cbc';
  const decryptionIv = Buffer.from('1983759874219020', 'utf-8');
  const decryptionKey = Buffer.from(key, 'utf-8');
  const encryptedText = Buffer.from(textToDecrypt, 'base64');
  const decipher = crypto.createDecipheriv(ciphering, decryptionKey, decryptionIv);
  let decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString('utf-8');
}  