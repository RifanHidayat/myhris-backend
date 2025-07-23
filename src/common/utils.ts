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
