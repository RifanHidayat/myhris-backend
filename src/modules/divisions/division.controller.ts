import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { DivisionListService } from './service/division.list.service';
import { GlobalParamsDto } from '../../common/dto/global-params.dto';

@Controller('divisions')
export class DivisionController {
  constructor(private readonly divisionListService: DivisionListService) {}

  @Post('/supervisor')
  async getEmployeeDivisi(
    @Body() body: { database?: string; em_id?: string },
    @Query() globalParams: GlobalParamsDto
  ) {
    const database =globalParams.tenant;
    const em_id = body.em_id || globalParams.em_id;
    
    // Validate required parameters
    if (!database) {
      throw new BadRequestException('Database/tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    
    // globalParams.branch_id, globalParams.start_periode, globalParams.end_periode bisa diteruskan ke service jika diperlukan
    return this.divisionListService.employeeDivisi(database, em_id);
  }
}
