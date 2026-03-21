export class AdminResponseDto {
  id: string;
  auditoryId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  country: string;
  description?: string;
  permissions: string[];
  registeredAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
