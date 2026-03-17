import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IAvatarRepository } from '../../domain/interfaces/avatar.repository.interface';
import { Avatar } from '../../domain/entities/avatar.entity';
import { CreateAvatarDto } from '../dtos/create-avatar.dto';
import { UpdateAvatarDto } from '../dtos/update-avatar.dto';

@Injectable()
export class AvatarService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
  ];

  constructor(
    @Inject('IAvatarRepository')
    private readonly avatarRepository: IAvatarRepository,
  ) {}

  async create(createAvatarDto: CreateAvatarDto): Promise<Avatar> {
    // Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(createAvatarDto.mimeType)) {
      throw new BadRequestException(
        `Invalid image type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Calculate file size from base64
    const fileSize = Math.ceil((createAvatarDto.imageData.length * 3) / 4);
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Image size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check if avatar already exists for this user
    const existingAvatar = await this.avatarRepository.findByAuditoryId(
      createAvatarDto.auditoryId,
    );
    if (existingAvatar) {
      throw new BadRequestException(
        'Avatar already exists for this user. Use update endpoint instead.',
      );
    }

    const avatar = new Avatar(
      createAvatarDto.auditoryId,
      createAvatarDto.imageData,
      createAvatarDto.mimeType,
      fileSize,
    );

    return this.avatarRepository.save(avatar);
  }

  async findById(id: string): Promise<Avatar> {
    const avatar = await this.avatarRepository.findById(id);
    if (!avatar) {
      throw new NotFoundException(`Avatar with ID ${id} not found`);
    }
    return avatar;
  }

  async findByAuditoryId(auditoryId: string): Promise<Avatar> {
    const avatar = await this.avatarRepository.findByAuditoryId(auditoryId);
    if (!avatar) {
      throw new NotFoundException(`Avatar for user ${auditoryId} not found`);
    }
    return avatar;
  }

  async update(id: string, updateAvatarDto: UpdateAvatarDto): Promise<Avatar> {
    const avatar = await this.avatarRepository.findById(id);
    if (!avatar) {
      throw new NotFoundException(`Avatar with ID ${id} not found`);
    }

    if (updateAvatarDto.imageData || updateAvatarDto.mimeType) {
      const mimeType = updateAvatarDto.mimeType || avatar.mimeType;
      const imageData = updateAvatarDto.imageData || avatar.imageData;

      // Validate MIME type if provided
      if (
        updateAvatarDto.mimeType &&
        !this.ALLOWED_MIME_TYPES.includes(mimeType)
      ) {
        throw new BadRequestException(
          `Invalid image type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
        );
      }

      // Calculate and validate file size
      const fileSize = Math.ceil((imageData.length * 3) / 4);
      if (fileSize > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `Image size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }

      avatar.updateImage(imageData, mimeType, fileSize);
    }

    await this.avatarRepository.update(id, {
      imageData: avatar.imageData,
      mimeType: avatar.mimeType,
      fileSize: avatar.fileSize,
      updatedAt: avatar.updatedAt,
    });

    return this.findById(id);
  }

  async updateByAuditoryId(
    auditoryId: string,
    updateAvatarDto: UpdateAvatarDto,
  ): Promise<Avatar> {
    const avatar = await this.findByAuditoryId(auditoryId);
    return this.update(avatar.id, updateAvatarDto);
  }

  async delete(id: string): Promise<boolean> {
    const avatar = await this.avatarRepository.findById(id);
    if (!avatar) {
      throw new NotFoundException(`Avatar with ID ${id} not found`);
    }
    return this.avatarRepository.delete(id);
  }

  async deleteByAuditoryId(auditoryId: string): Promise<boolean> {
    const avatar = await this.avatarRepository.findByAuditoryId(auditoryId);
    if (!avatar) {
      throw new NotFoundException(`Avatar for user ${auditoryId} not found`);
    }
    return this.avatarRepository.deleteByAuditoryId(auditoryId);
  }
}
