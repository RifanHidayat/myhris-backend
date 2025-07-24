// import { Injectable } from '@nestjs/common';
// import { ReportPermissionsService } from './report-permissions.service';
// import { ReportLeavesService } from './report-leaves.service';
// import { ReportOfficialDutyService } from './report-official-duty.service';
// import { ReportFieldAssigmentService } from './report-field-assigment.service';
// import { ReportDayOffService } from './report-dayoff.service';
// import { DbService } from '../../../config/database.service';

// @Injectable()
// export class ReportsService {
//   constructor(
//     private readonly reportPermissionsService: ReportPermissionsService,
//     private readonly reportLeavesService: ReportLeavesService,
//     private readonly reportOfficialDutyService: ReportOfficialDutyService,
//     private readonly reportFieldAssigmentService: ReportFieldAssigmentService,
//     private readonly reportDayOffService: ReportDayOffService,
//     private readonly dbService: DbService,
//   ) {}

//   async index(dto: any): Promise<any> {
//     const { database, bulan, tahun, branchId, type } = dto;
//     const ajuanStatus = "a.leave_status != 'Cancel'";
//     const namaDatabaseDynamic = `${database}_hrm${tahun.substring(2, 4)}${bulan}`;
//     let query = '';
//     if (type === 'izin') {
//       query = this.reportPermissionsService.getQuery1Izin(
//         namaDatabaseDynamic,
//         database,
//         bulan,
//         tahun,
//         ajuanStatus,
//         branchId
//       );
//     } else if (type === 'cuti') {
//       query = this.reportLeavesService.getQuery1Cuti(
//         namaDatabaseDynamic,
//         database,
//         bulan,
//         tahun,
//         ajuanStatus,
//         branchId
//       );
//     } else if (type === 'dinas_luar') {
//       query = this.reportOfficialDutyService.getQuery1DinasLuar(
//         namaDatabaseDynamic,
//         database,
//         bulan,
//         tahun,
//         ajuanStatus,
//         branchId
//       );
//     } else if (type === 'tugas_luar') {
//       query = this.reportFieldAssigmentService.getQuery1TugasLuar(
//         namaDatabaseDynamic,
//         database,
//         bulan,
//         tahun,
//         ajuanStatus,
//         branchId
//       );
//     } else if (type === 'dayoff') {
//       query = this.reportDayOffService.getQuery1DayOff(
//         namaDatabaseDynamic,
//         database,
//         bulan,
//         tahun,
//         ajuanStatus,
//         branchId
//       );
//     } else {
//       return { status: false, message: 'Unknown report type' };
//     }
//     try {
//       const knex = this.dbService.getConnection(database);
//       const results = await knex.raw(query);
//       return {
//         status: true,
//         message: 'Berhasil ambil data',
//         data: results[0],
//       };
//     } catch (e) {
//       return {
//         status: false,
//         message: 'Gagal ambil data',
//         error: e.message,
//       };
//     }
//   }
// } 