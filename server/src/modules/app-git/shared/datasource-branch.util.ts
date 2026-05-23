import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class DataSourceBranchUtil {
  async cloneDataSourceVersions(sourceBranchId: string, targetBranchId: string, em: EntityManager): Promise<void> {
    console.log(`DataSourceBranchUtil.cloneDataSourceVersions: source=${sourceBranchId}, target=${targetBranchId}`);
  }
}
