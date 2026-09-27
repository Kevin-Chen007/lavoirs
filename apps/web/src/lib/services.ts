import type { AppServices } from '../../../../packages/shared/src/auth';
import { createDemoServices } from './demo-services';

// The only production wiring point: replace this with your auth/profile adapters.
export const services: AppServices = createDemoServices();
