import * as crypto from 'crypto';

export function formatDbName(date: string, db: string): string {
  const [year, month] = date.split('-');
  const shortYear = year.slice(-2);
  const formattedMonth = month.padStart(2, '0');
  return `${db}_hrm${shortYear}${formattedMonth}`;
}

/**
 * Determines if a period spans different months
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns boolean - true if different periods (different months), false if same period (same month)
 */
export function isDifferentPeriod(startDate: string, endDate: string): boolean {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Extract year and month from both dates
    const startYear = start.getFullYear();
    const startMonth = start.getMonth() + 1; // getMonth() returns 0-11, so +1
    const endYear = end.getFullYear();
    const endMonth = end.getMonth() + 1;
    
    // Compare year and month
    // If year is different, it's definitely a different period
    if (startYear !== endYear) {
      return true;
    }
    
    // If year is same but month is different, it's a different period
    if (startMonth !== endMonth) {
      return true;
    }
    
    // If both year and month are same, it's the same period
    return false;
  } catch (error) {
    console.error('Error in isDifferentPeriod:', error);
    throw new Error('Invalid date format provided to isDifferentPeriod function');
  }
}

/**
 * Alternative function that returns the opposite logic for better naming
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns boolean - true if same period (same month), false if different periods (different months)
 */
export function isSamePeriod(startDate: string, endDate: string): boolean {
  return !isDifferentPeriod(startDate, endDate);
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

/**
 * Get current time in HH:mm:ss format
 * @returns string - Current time in format HH:mm:ss (e.g., "08:30:45")
 */
export function getTimeNow(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get current date and time in YYYY-MM-DD HH:mm:ss format
 * @returns string - Current date and time in format YYYY-MM-DD HH:mm:ss
 */
export function getDateTimeNow(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function decryptText(textToDecrypt: string, key: string): string {
  const ciphering = 'aes-256-cbc';
  const decryptionIv = Buffer.from('1983759874219020', 'utf-8');
  const decryptionKey = Buffer.from(key, 'utf-8');
  const encryptedText = Buffer.from(textToDecrypt, 'base64');
  const decipher = crypto.createDecipheriv(
    ciphering,
    decryptionKey,
    decryptionIv,
  );
  let decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString('utf-8');
}
