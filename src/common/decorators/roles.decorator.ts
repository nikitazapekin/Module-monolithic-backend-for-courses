import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@modules/auth/domain/entities/auditory.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
