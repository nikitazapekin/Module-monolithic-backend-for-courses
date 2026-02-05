import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { Auditory, UserRole } from '../../domain/entities/auditory.entity';
import { Client } from '../../domain/entities/client.entity';
import { Admin } from '../../domain/entities/admin.entity';
import { AuditoryOrmEntity } from '../typeorm/auditory.orm-entity';
import { ClientOrmEntity } from '../typeorm/client.orm-entity';
import { AdminOrmEntity } from '../typeorm/admin.orm-entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(AuditoryOrmEntity)
    private readonly auditoryRepository: Repository<AuditoryOrmEntity>,
    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,
    @InjectRepository(AdminOrmEntity)
    private readonly adminRepository: Repository<AdminOrmEntity>,
  ) {}

  // Auditory методы
  async findAuditoryByEmail(email: string): Promise<Auditory | null> {
    const entity = await this.auditoryRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['client', 'admin'],
    });
    
    return entity ? this.toAuditoryDomain(entity) : null;
  }

  async findAuditoryById(id: string): Promise<Auditory | null> {
    const entity = await this.auditoryRepository.findOne({
      where: { id },
      relations: ['client', 'admin'],
    });
    
    return entity ? this.toAuditoryDomain(entity) : null;
  }

  async saveAuditory(auditory: Auditory): Promise<Auditory> {
    const entity = this.toAuditoryOrmEntity(auditory);
    const saved = await this.auditoryRepository.save(entity);
    return this.toAuditoryDomain(saved);
  }

/*   async updateAuditory(id: string, updates: Partial<Auditory>): Promise<boolean> {
    const result = await this.auditoryRepository.update(id, updates);
    return result.affected > 0;
  } */

      async updateAuditory(id: string, updates: Partial<Auditory>): Promise<boolean> {
   return false
  }

  // Client методы
  async findClientByAuditoryId(auditoryId: string): Promise<Client | null> {
    const entity = await this.clientRepository.findOne({
      where: { auditoryId },
    });
    
    return entity ? this.toClientDomain(entity) : null;
  }

  async saveClient(client: Client): Promise<Client> {
    const entity = this.toClientOrmEntity(client);
    const saved = await this.clientRepository.save(entity);
    return this.toClientDomain(saved);
  }

 /*  async updateClient(id: string, updates: Partial<Client>): Promise<boolean> {
    const result = await this.clientRepository.update(id, updates);
    return result.affected > 0;
  } */

     async updateClient(id: string, updates: Partial<Client>): Promise<boolean> {
  return true
  }


  // Admin методы
  async findAdminByAuditoryId(auditoryId: string): Promise<Admin | null> {
    const entity = await this.adminRepository.findOne({
      where: { auditoryId },
    });
    
    return entity ? this.toAdminDomain(entity) : null;
  }

  async saveAdmin(admin: Admin): Promise<Admin> {
    const entity = this.toAdminOrmEntity(admin);
    const saved = await this.adminRepository.save(entity);
    return this.toAdminDomain(saved);
  }

/*   async updateAdmin(id: string, updates: Partial<Admin>): Promise<boolean> {
    const result = await this.adminRepository.update(id, updates);
    return result.affected > 0;
  }
 */
  async updateAdmin(id: string, updates: Partial<Admin>): Promise<boolean> {
   return true
  }

  // Общие методы
  async deactivateUser(auditoryId: string): Promise<boolean> {
   /*  const result = await this.auditoryRepository.update(auditoryId, {
      isActive: false,
      updatedAt: new Date(),
    });
    return result.affected > 0; */
    return true
  }

  // Преобразования Domain ↔ ORM
  private toAuditoryDomain(entity: AuditoryOrmEntity): Auditory {
    const auditory = new Auditory(
      entity.email,
      entity.password,
      entity.role as UserRole
    );
 
    Object.assign(auditory, {
      id: entity.id,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastLoginAt: entity.lastLoginAt,
    });
    
    return auditory;
  }

  private toAuditoryOrmEntity(auditory: Auditory): AuditoryOrmEntity {
    const entity = new AuditoryOrmEntity();
    entity.id = auditory.id;
    entity.email = auditory.email;
    entity.password = auditory.password;
    entity.role = auditory.role;
    entity.isActive = auditory.isActive;
    entity.createdAt = auditory.createdAt;
    entity.updatedAt = auditory.updatedAt;
    entity.lastLoginAt = auditory.lastLoginAt!;
    
    return entity;
  }

  private toClientDomain(entity: ClientOrmEntity): Client {
    const client = new Client(
      entity.auditoryId,
      entity.firstName,
      entity.lastName,
      entity.phone,
      entity.country,
      entity.middleName,
      entity.description
    );
    
    Object.assign(client, {
      id: entity.id,
      registeredAt: entity.registeredAt,
      updatedAt: entity.updatedAt,
    });
    
    return client;
  }

  private toClientOrmEntity(client: Client): ClientOrmEntity {
    const entity = new ClientOrmEntity();
    entity.id = client.id;
    entity.auditoryId = client.auditoryId;
    entity.firstName = client.firstName;
    entity.lastName = client.lastName;
    entity.middleName = client.middleName!;
    entity.phone = client.phone;
    entity.country = client.country;
    entity.description = client.description!;
    entity.registeredAt = client.registeredAt;
    entity.updatedAt = client.updatedAt;
    
    return entity;
  }

  private toAdminDomain(entity: AdminOrmEntity): Admin {
    const admin = new Admin(
      entity.auditoryId,
      entity.firstName,
      entity.lastName,
      entity.phone,
      entity.country,
      entity.permissions,
      entity.middleName,
      entity.description
    );
    
    Object.assign(admin, {
      id: entity.id,
      registeredAt: entity.registeredAt,
      updatedAt: entity.updatedAt,
    });
    
    return admin;
  }

  private toAdminOrmEntity(admin: Admin): AdminOrmEntity {
    const entity = new AdminOrmEntity();
    entity.id = admin.id;
    entity.auditoryId = admin.auditoryId;
    entity.firstName = admin.firstName;
    entity.lastName = admin.lastName;
    entity.middleName = admin.middleName!;
    entity.phone = admin.phone;
    entity.country = admin.country;
    entity.description = admin.description!;
    entity.permissions = admin.permissions;
    entity.registeredAt = admin.registeredAt;
    entity.updatedAt = admin.updatedAt;
    
    return entity;
  }
}
