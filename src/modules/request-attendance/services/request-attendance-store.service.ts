import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../../config/database.service';
import { NotificationService } from '../../../common/notification.service';
import { formatDbName, getDateNow, databaseMaster } from 'src/common/utils';

interface RequestAttendanceStoreDto {
  tenant: string;
  emId: string;
  request_date: string;
  request_type: string;
  reason: string;
  // tambahkan field lain jika perlu
}

@Injectable()
export class RequestAttendanceStoreService {
  constructor(
    private readonly dbService: DbService,
    private readonly notificationService: NotificationService,
  ) {}

  async store(dto: RequestAttendanceStoreDto): Promise<any> {
    const date = getDateNow();
    const tenant = dto.tenant;
    const emId = dto.emId;
    const databasePerode = formatDbName(date, tenant);
    const database = databaseMaster(dto.tenant);
    const knex = this.dbService.getConnection(tenant);
    try {
      const trx = await knex.transaction();
      // Get employee data for notification
      const employee = await trx(`${database}.employee`).where('em_id', emId).first();
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
      const insertData = {
        em_id: emId,
        request_date: dto.request_date,
        request_type: dto.request_type,
        reason: dto.reason,
        status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const [insertedId] = await trx(`${databasePerode}.request_attendance`).insert(insertData);
      // Send notification to approvers
      if (employee.dep_id) {
        const approvers = await trx(`${database}.employee`).where('dep_id', employee.dep_id).where('em_controlaccess', 'Y').select('em_id');
        if (approvers.length > 0) {
          const approverIds = approvers.map(approver => approver.em_id).join(',');
          await this.notificationService.insertNotification(
            approverIds,
            'Permintaan Absensi Baru',
            'RequestAttendance',
            emId,
            insertedId.toString(),
            `RA${insertedId}`,
            employee.full_name,
            databasePerode,
            database,
          );
        }
      }
      await trx.commit();
      return {
        status: true,
        message: 'Success create request attendance',
        data: {
          id: insertedId,
          ...insertData,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Terjadi kesalahan saat membuat permintaan absensi');
    }
  }
}
