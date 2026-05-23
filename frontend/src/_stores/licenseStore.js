import { create, zustandDevTools } from './utils';
import { licenseService, appsService } from '@/_services';
import { shallow } from 'zustand/shallow';
import { authenticationService } from '@/_services/authentication.service';

const initialState = {
  featureAccess: {},
  featuresLoaded: false,
  hasModuleAccess: true, // Default to true, will be updated after permission check
  moduleAccessLoading: false, // Track if module access check is in progress
};

export const useLicenseStore = create(
  zustandDevTools(
    (set, get) => ({
      ...initialState,
      actions: {
        fetchFeatureAccess: () => {
          licenseService.getFeatureAccess().then((data) => {
            const allFeatures = {
              ...(data || {}),
              modulesEnabled: true,
              multiPlayerEdit: true,
              appPagesHeaderAndLogoEnabled: true,
              appPagesAddNavGroupEnabled: true,
              appPermissionQuery: true,
              appPermissionComponent: true,
              appPermissionPages: true,
              canvasPageHeaderEnabled: true,
              canvasPageFooterEnabled: true,
              multiEnvironment: true,
              gitSync: true,
              appHistory: true,
              appJsLibraries: true,
              ai: true,
              serverSideGlobalResolve: true,
              licenseStatus: {
                isExpired: false,
                isLicenseValid: true,
                plan: 'enterprise',
              }
            };
            const unlockedFeatures = new Proxy(allFeatures, {
              get: (target, prop) => {
                if (prop in target) {
                  return target[prop];
                }
                if (prop === 'licenseStatus') {
                  return {
                    isExpired: false,
                    isLicenseValid: true,
                    plan: 'enterprise',
                  };
                }
                // Fallback to true for any other premium checks
                return true;
              }
            });
            set({ featureAccess: unlockedFeatures, featuresLoaded: true });
          });
        },

        checkModuleAccess: () => {
          // Check if user is an end-user; if so, do not give module access
          const currentSession = authenticationService.currentSessionValue;
          if (
            !currentSession?.user_permissions?.app_create &&
            !currentSession?.super_admin &&
            !currentSession?.admin &&
            currentSession?.role?.name !== 'builder'
          ) {
            set({ hasModuleAccess: false, moduleAccessLoading: false });
          } else {
            set({ hasModuleAccess: true, moduleAccessLoading: false });
          }
        },
      },
    }),
    { name: 'License Store' }
  )
);

export const useLicenseState = () => useLicenseStore((state) => state, shallow);
