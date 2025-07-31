import { Controller, Post, Body, Query, BadRequestException, Get } from '@nestjs/common';
import { DelegationListService } from './services/deletegation.list.service';
import { GlobalParamsDto } from '../../common/dto/global-params.dto';

@Controller('delegations')
export class DelegationController {
  constructor(private readonly delegationListService: DelegationListService) {}

  @Get('supervisor')
  async getDelegasiList(
    
    @Query() globalParams: GlobalParamsDto
  ) {
    const database =  globalParams.tenant;
    const em_id =  globalParams.em_id;
    
    // Validate required parameters
    if (!database) {
      throw new BadRequestException('Database/tenant parameter is required');
    }
    if (!em_id) {
      throw new BadRequestException('Employee ID parameter is required');
    }
    
    // globalParams.branch_id, globalParams.start_periode, globalParams.end_periode bisa diteruskan ke service jika diperlukan
    return this.delegationListService.employeeDelegasi(database, em_id);
  }
}
