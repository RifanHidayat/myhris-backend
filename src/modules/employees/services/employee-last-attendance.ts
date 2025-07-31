import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { formatDbNameNow } from 'src/common/utils';

interface LastAttendanceDto {
  start_periode: string;
  end_periode: string;
  em_id: string;
  approver: string;
  tenant: string;
}

interface TimeConfig {
  startTime: string;
  endTime: string;
}

@Injectable()
export class EmployeeLastAttendanceService {
  constructor(private readonly dbService: DbService) {}

  /**
   * Get time configuration from sysdata with kode 018
   */
  private async getTimeConfig(trx: any, database: string): Promise<TimeConfig> {
    try {
      const sysdata = await trx('sysdata')
        .select('name')
        .where('kode', '018')
        .first();

      if (!sysdata) {
        throw new InternalServerErrorException('Time configuration not found in sysdata');
      }

      // Parse the time configuration from sysdata
      // Assuming the value contains start and end time in format "HH:MM-HH:MM"
      const timeParts = sysdata.name.split(',');
      if (timeParts.length !== 2) {
        throw new InternalServerErrorException('Invalid time configuration format');
      }

      return {
        startTime: timeParts[0].trim(),
        endTime: timeParts[1].trim()
      };
    } catch (error) {
      console.error('Error getting time config:', error);
      throw new InternalServerErrorException('Failed to get time configuration');
    }
  }
    

  /**
   * Calculate time range based on business logic
   * Logic from Flutter: determine start and end time/date based on shift configuration
   */
  private calculateTimeRange(startTime: string, endTime: string): {
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Parse times to minutes for comparison
    const parseTimeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let finalStartTime: string;
    let finalEndTime: string;
    let finalStartDate: string;
    let finalEndDate: string;

    // Normal flow: start time < end time (same day)
    if (startMinutes < endMinutes) {
      console.log('Normal flow: same day shift');
      finalStartTime = startTime;
      finalEndTime = endTime;
      finalStartDate = today;
      finalEndDate = today;
    }
    // Different day flow: start time > end time (overnight shift)
    else if (startMinutes > endMinutes) {
      if (endMinutes > currentMinutes) {
        // Current time is before end time (previous day to today)
        console.log('Overnight shift: previous day to today');
        finalStartTime = endTime;
        finalEndTime = startTime;
        finalStartDate = this.addDays(today, -1);
        finalEndDate = today;
      } else {
        // Current time is after end time (today to next day)
        console.log('Overnight shift: today to next day');
        finalStartTime = endTime;
        finalEndTime = startTime;
        finalStartDate = today;
        finalEndDate = this.addDays(today, 1);
      }
    }
    // Equal times (edge case)
    else {
      console.log('Equal times: same day');
      finalStartTime = startTime;
      finalEndTime = endTime;
      finalStartDate = today;
      finalEndDate = today;
    }

    return {
      startTime: finalStartTime,
      endTime: finalEndTime,
      startDate: finalStartDate,
      endDate: finalEndDate
    };
  }

  /**
   * Add days to a date string
   */
  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get last attendance with automatic time calculation and complex logic
   */
  async getLastAttendanceWithTimeConfig(dto: LastAttendanceDto): Promise<any> {
    const knex = this.dbService.getConnection(dto.tenant);
    let trx;

    try {
      trx = await knex.transaction();

      // Get time configuration from sysdata
      const timeConfig = await this.getTimeConfig(trx, dto.tenant);
      console.log('Time config from sysdata:', timeConfig);

      // Calculate time range based on business logic
      const timeRange = this.calculateTimeRange(timeConfig.startTime, timeConfig.endTime);
      console.log('Calculated time range:', timeRange);

      // Get current date for database naming
      const now = new Date();
      const currentYear = now.getFullYear().toString().slice(-2);
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const namaDatabaseDynamic = `${dto.tenant}_hrm${currentYear}${currentMonth}`;

      // Get last attendance to check if we need to adjust time
      const [absensi] = await trx.raw(
        `SELECT * FROM ${namaDatabaseDynamic}.attendance WHERE em_id = ? ORDER BY id DESC`,
        [dto.em_id]
      );

      // Get sysdata for time adjustment
      const [sysdata] = await trx.raw(
        `SELECT * FROM ${dto.tenant}_hrm.sysdata WHERE kode = '018'`
      );

      let startDate = timeRange.startDate;
      let endDate = timeRange.endDate;
      let startTime = timeRange.startTime;
      let endTime = timeRange.endTime;

      // Adjust time based on sysdata and last attendance
      if (sysdata.length > 0 && absensi.length > 0) {
        const array1 = sysdata[0].name?.split(',') || [];
        if (array1[0]?.trim() === '00:00' && array1[1]?.trim() === '00:00') {
          startTime = absensi[0].signin_time;
          startDate = absensi[0].atten_date;
          endTime = absensi[0].signin_time;
          
          if (startDate) {
            const date = new Date(startDate);
            if (!isNaN(date.getTime())) {
              date.setDate(date.getDate() + 1);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              endDate = `${year}-${month}-${day}`;
            }
          }
        }
      }

      // Build the main attendance query with places_coordinate join
      const attendanceQuery = `
        SELECT places_coordinate.trx, attendance.* 
        FROM ${namaDatabaseDynamic}.attendance 
        LEFT JOIN ${dto.tenant}_hrm.places_coordinate 
          ON attendance.place_in = places_coordinate.place 
        WHERE em_id = ? 
          AND CONCAT(atten_date, ' ', signin_time) BETWEEN ? AND ?
          AND atttype = '1' 
        ORDER BY id DESC 
        LIMIT 1
      `;
      console.log('attendanceQuery : ',attendanceQuery);

      const [absensiNow] = await trx.raw(attendanceQuery, [
        dto.em_id,
        `${startDate} ${startTime}`,
        `${endDate} ${endTime}`
      ]);

      // Build WFH query
      let wfhQuery = '';
      if (dto.approver === '2') {
        wfhQuery = `
          SELECT emp_labor.status, emp_labor.dari_jam as signing_time, emp_labor.nomor_ajuan  
          FROM ${namaDatabaseDynamic}.emp_labor 
          WHERE em_id = ? 
            AND (CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?)
            AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
            AND (ajuan = '4' OR ajuan = '3') 
            AND status_transaksi = '1' 
            AND (status = 'Pending' OR status = 'Approve') 
          ORDER BY id DESC 
          LIMIT 1
        `;
      } else {
        wfhQuery = `
          SELECT emp_labor.status, emp_labor.dari_jam as signing_time, emp_labor.nomor_ajuan  
          FROM ${namaDatabaseDynamic}.emp_labor 
          WHERE em_id = ? 
            AND (CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?)
            AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
            AND (ajuan = '4' OR ajuan = '3') 
            AND status_transaksi = '1' 
            AND status = 'Pending'
          ORDER BY id DESC 
          LIMIT 1
        `;
      }

      // Build offline attendance query
      let absenOfflineQuery = '';
      if (absensiNow.length > 0) {
        if (dto.approver === '2') {
          absenOfflineQuery = `
            SELECT emp_labor.atten_date, emp_labor.status, emp_labor.dari_jam as signing_time, 
                   emp_labor.nomor_ajuan, emp_labor.sampai_jam as signout_time  
            FROM ${namaDatabaseDynamic}.emp_labor 
            WHERE em_id = ? 
              AND (CONCAT(?, ' ', ?) >= ? AND NOW() >= ?)
              AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
              AND ajuan = '5' 
              AND status_transaksi = '1' 
              AND (status = 'Pending' OR status = 'Approve')
            ORDER BY id DESC 
            LIMIT 1
          `;
        } else {
          absenOfflineQuery = `
            SELECT emp_labor.atten_date, emp_labor.status, emp_labor.dari_jam as signing_time, 
                   emp_labor.sampai_jam as signout_time, emp_labor.nomor_ajuan  
            FROM ${namaDatabaseDynamic}.emp_labor 
            WHERE em_id = ? 
              AND (CONCAT(?, ' ', ?) >= ? AND NOW() >= ?)
              AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
              AND ajuan = '5' 
              AND status_transaksi = '1' 
              AND status = 'Pending'
            ORDER BY id DESC 
            LIMIT 1
          `;
        }
      } else {
        if (dto.approver === '2') {
          absenOfflineQuery = `
            SELECT emp_labor.atten_date, emp_labor.status, emp_labor.dari_jam as signing_time, 
                   emp_labor.nomor_ajuan, emp_labor.sampai_jam as signout_time  
            FROM ${namaDatabaseDynamic}.emp_labor 
            WHERE em_id = ? 
              AND (CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?)
              AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
              AND ajuan = '5' 
              AND status_transaksi = '1' 
              AND (status = 'Pending' OR status = 'Approve')
            ORDER BY id DESC 
            LIMIT 1
          `;
        } else {
          absenOfflineQuery = `
            SELECT emp_labor.atten_date, emp_labor.status, emp_labor.dari_jam as signing_time, 
                   emp_labor.sampai_jam as signout_time, emp_labor.nomor_ajuan  
            FROM ${namaDatabaseDynamic}.emp_labor 
            WHERE em_id = ? 
              AND (CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?)
              AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
              AND ajuan = '5' 
              AND status_transaksi = '1' 
              AND status = 'Pending'
            ORDER BY id DESC 
            LIMIT 1
          `;
        }
      }

      // Execute all queries
      const [wfh] = await trx.raw(wfhQuery, [
        dto.em_id,
        `${startDate} ${startTime}`,
        `${startDate} ${startTime}`,
        `${endDate} ${endTime}`,
        `${endDate} ${endTime}`
      ]);

      let offline: any[] = [];
      if (absensiNow.length > 0) {
        const [offlineResult] = await trx.raw(absenOfflineQuery, [
          dto.em_id,
          absensiNow[0].atten_date,
          absensiNow[0].signin_time,
          `${startDate} ${startTime}`,
          `${startDate} ${startTime}`,
          `${endDate} ${endTime}`,
          `${endDate} ${endTime}`
        ]);
        offline = offlineResult;
      } else {
        const [offlineResult] = await trx.raw(absenOfflineQuery, [
          dto.em_id,
          `${startDate} ${startTime}`,
          `${startDate} ${startTime}`,
          `${endDate} ${endTime}`,
          `${endDate} ${endTime}`
        ]);
        offline = offlineResult;
      }

      // Process results with complex logic
      let finalAttendance = absensiNow;
      if (absensiNow.length > 0) {
        if (absensiNow[0].signin_time !== '00:00:00') {
          if (absensiNow[0].signout_time !== '00:00:00') {
            if (offline.length > 0) {
              finalAttendance = [];
              console.log('Attendance cleared due to offline request');
            }
          } else {
            if (offline.length > 0) {
              const date1 = new Date(`${offline[0].atten_date} ${offline[0].signout_time}`);
              const timeDifference = Math.abs(new Date().getTime() - date1.getTime());
              
              const hours = Math.floor(timeDifference / (1000 * 60 * 60));
              const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
              
              console.log(`Time difference: ${hours} hours and ${minutes} minutes`);
              if (hours > 24) {
                offline = [];
              } else {
                console.log('The date is within 24 hours from now.');
              }
            }
          }
        }
      }

      await trx.commit();

      return {
        status: true,
        message: 'Successfully get last attendance with time config',
        data: {
          attendance: wfh.length > 0 ? [] : finalAttendance,
          wfh: wfh,
          offline: offline,
          timeConfig: timeConfig,
          timeRange: timeRange
        }
      };

    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in getLastAttendanceWithTimeConfig:', error);
      throw new InternalServerErrorException('Failed to get last attendance: ' + error.message);
    }
  }

  async getLastAttendanceWithTimeConfigWithParams(dto: LastAttendanceDto): Promise<any> {
    const knex = this.dbService.getConnection(dto.tenant);
    let trx;

    try {
      trx = await knex.transaction();

      // Get time configuration from sysdata
      const timeConfig = await this.getTimeConfig(trx, dto.tenant);
      console.log('Time config from sysdata:', timeConfig);

      // Calculate time range based on business logic
      const timeRange = this.calculateTimeRange(timeConfig.startTime, timeConfig.endTime);
      console.log('Calculated time range:', timeRange);

      // Get current date for database naming
      const now = new Date();
      const currentYear = now.getFullYear().toString().slice(-2);
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const namaDatabaseDynamic = `${dto.tenant}_hrm${currentYear}${currentMonth}`;

      // Get last attendance to check if we need to adjust time
      const [absensi] = await trx.raw(
        `SELECT * FROM ${namaDatabaseDynamic}.attendance WHERE em_id = ? AND atten_date=CURDATE() ORDER BY id DESC`,
        [dto.em_id]
      );
      console.log('absensi : ',absensi);

      // Get sysdata for time adjustment
      const [sysdata] = await trx.raw(
        `SELECT * FROM ${dto.tenant}_hrm.sysdata WHERE kode = '018'`
      );

      let startDate = timeRange.startDate;
      let endDate = timeRange.endDate;
      let startTime = timeRange.startTime;
      let endTime = timeRange.endTime;

      // Adjust time based on sysdata and last attendance
      if (sysdata.length > 0 && absensi.length > 0) {
        const array1 = sysdata[0].name?.split(',') || [];
        if (array1[0]?.trim() === '00:00' && array1[1]?.trim() === '00:00') {
          startTime = absensi[0].signin_time;
          startDate = absensi[0].atten_date;
          endTime = absensi[0].signin_time;
          
          if (startDate) {
            const date = new Date(startDate);
            if (!isNaN(date.getTime())) {
              date.setDate(date.getDate() + 1);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              endDate = `${year}-${month}-${day}`;
            }
          }
        }
      }

      // Build the main attendance query with places_coordinate join
      const attendanceQuery = `
        SELECT places_coordinate.trx, attendance.* 
        FROM ${namaDatabaseDynamic}.attendance 
        LEFT JOIN ${dto.tenant}_hrm.places_coordinate 
          ON attendance.place_in = places_coordinate.place 
        WHERE em_id = ? 
          AND CONCAT(atten_date, ' ', signin_time) BETWEEN ? AND ?
          AND atttype = '1' 
        ORDER BY id DESC 
        LIMIT 1
      `;

      const [absensiNow] = await trx.raw(attendanceQuery, [
        dto.em_id,
        `${startDate} ${startTime}`,
        `${endDate} ${endTime}`
      ]);

      // Build WFH query
      const wfhQuery = `
        SELECT emp_labor.status, emp_labor.dari_jam as signing_time, emp_labor.nomor_ajuan  
        FROM ${namaDatabaseDynamic}.emp_labor 
        WHERE em_id = ? 
          AND (CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?)
          AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
          AND (ajuan = '4' OR ajuan = '3') 
          AND status_transaksi = '1' 
          AND (status = 'Pending' OR status = 'Approve') 
        ORDER BY id DESC 
        LIMIT 1
      `;

      const [wfh] = await trx.raw(wfhQuery, [
        dto.em_id,
        `${startDate} ${startTime}`,
        `${startDate} ${startTime}`,
        `${endDate} ${endTime}`,
        `${endDate} ${endTime}`
      ]);

      // Build offline query
      const offlineQuery = `
        SELECT emp_labor.status, emp_labor.dari_jam as signing_time, emp_labor.nomor_ajuan  
        FROM ${namaDatabaseDynamic}.emp_labor 
        WHERE em_id = ? 
          AND (CONCAT(atten_date, ' ', dari_jam) >= ? AND NOW() >= ?)
          AND (CONCAT(atten_date, ' ', dari_jam) <= ? AND NOW() <= ?)
          AND (ajuan = '4' OR ajuan = '3') 
          AND status_transaksi = '1' 
          AND (status = 'Pending' OR status = 'Approve') 
        ORDER BY id DESC 
        LIMIT 1
      `;

      let [offline] = await trx.raw(offlineQuery, [
        dto.em_id,
        `${startDate} ${startTime}`,
        `${startDate} ${startTime}`,
        `${endDate} ${endTime}`,
        `${endDate} ${endTime}`
      ]);

      // Process results with complex logic
      let finalAttendance = absensiNow;
      if (absensiNow.length > 0) {
        if (absensiNow[0].signin_time !== '00:00:00') {
          if (absensiNow[0].signout_time !== '00:00:00') {
            if (offline.length > 0) {
              finalAttendance = [];
              console.log('Attendance cleared due to offline request');
            }
          } else {
            if (offline.length > 0) {
              const date1 = new Date(`${offline[0].atten_date} ${offline[0].signout_time}`);
              const timeDifference = Math.abs(new Date().getTime() - date1.getTime());
              
              const hours = Math.floor(timeDifference / (1000 * 60 * 60));
              const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
              
              console.log(`Time difference: ${hours} hours and ${minutes} minutes`);
              if (hours > 24) {
                offline = [];
              } else {
                console.log('The date is within 24 hours from now.');
              }
            }
          }
        }
      }

      await trx.commit();

      return {
        status: true,
        message: 'Successfully get last attendance with time config and parameters',
        data: {
          attendance: wfh.length > 0 ? [] : finalAttendance,
          wfh: wfh,
          offline: offline,
          timeConfig: timeConfig,
          timeRange: timeRange
        }
      };

    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in getLastAttendanceWithTimeConfigWithParams:', error);
      throw new InternalServerErrorException('Failed to get last attendance: ' + error.message);
    }
  }

  async viewLastAbsen(dto: LastAttendanceDto): Promise<any> {
    const knex = this.dbService.getConnection(dto.tenant);
    const dbnow=formatDbNameNow(dto.tenant);
    console.log('dbnow : ',dbnow);
    let trx;

    try {
      trx = await knex.transaction();

      const attendanceQuery = `
        SELECT * FROM ${dbnow}.attendance 
        WHERE em_id = ? 
        AND tgl_attendance >= ? 
        AND tgl_attendance <= ?
        AND waktu_attendance >= ? 
        AND waktu_attendance <= ?
        ORDER BY tgl_attendance DESC, waktu_attendance DESC 
        LIMIT 1
      `;

      const [attendance] = await trx.raw(attendanceQuery, [
        dto.em_id,
        dto.start_periode,
        dto.end_periode,
        '00:00:00',
        '23:59:59'
      ]);

      await trx.commit();

      return {
        status: true,
        message: 'Successfully get last attendance',
        data: attendance.length > 0 ? attendance[0] : null
      };

    } catch (error) {
      if (trx) await trx.rollback();
      console.error('Error in viewLastAbsen:', error);
      throw new InternalServerErrorException('Failed to get last attendance: ' + error.message);
    }
  }
}
