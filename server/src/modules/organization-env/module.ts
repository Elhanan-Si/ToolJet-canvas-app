import { DynamicModule } from '@nestjs/common';
import { SubModule } from '@modules/app/sub-module';
import { OrganizationRepository } from '@modules/organizations/repository';
import { OrganizationGitSyncRepository } from '@modules/git-sync/repository';
import { GitSyncEnvUtilService as EEGitsyncService } from '@ee/organization-env/services/gitsync.util.service';

export class OrganizationEnvModule extends SubModule {
  private static cachedModule: DynamicModule | null = null;

  static async register(configs: { IS_GET_CONTEXT: boolean }): Promise<DynamicModule> {
    if (this.cachedModule) {
      return this.cachedModule;
    }

    const { OrganizationEnvRegistryService, GitSyncEnvUtilService, OrganizationEnvUtilService } = await this.getProviders(configs, 'organization-env', [
      'service',
      'services/gitsync.util.service',
      'util.service',
    ]);

    this.cachedModule = {
      module: OrganizationEnvModule,
      global: true,
      imports: [],
      providers: [
        OrganizationEnvRegistryService,
        GitSyncEnvUtilService,
        {
          provide: EEGitsyncService,
          useExisting: GitSyncEnvUtilService,
        },
        OrganizationEnvUtilService,
        OrganizationRepository,
        OrganizationGitSyncRepository,
      ],
      exports: [GitSyncEnvUtilService, EEGitsyncService, OrganizationEnvUtilService],
    };

    return this.cachedModule;
  }
}
