import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodeExecutionJobOrmEntity } from '../../infra/typeorm/code-execution-job.orm-entity';
import { CodeExecutionNotificationOrmEntity } from '../../infra/typeorm/code-execution-notification.orm-entity';
import type { SupportedLanguage } from '../dtos/execute-code.dto';

export interface QueueExecutionMetadata {
  sourceType?: string;
  taskId?: string | null;
  clientId?: string | null;
}

export interface ExecutionNotificationPayload {
  jobId: string;
  eventType: string;
  message: string;
  language: SupportedLanguage;
  sourceType: string;
  status?: string;
  workerId?: string;
  attempt?: number;
  payload?: Record<string, unknown>;
}

@Injectable()
export class CodeExecutionJobsService {
  constructor(
    @InjectRepository(CodeExecutionJobOrmEntity)
    private readonly jobsRepository: Repository<CodeExecutionJobOrmEntity>,
    @InjectRepository(CodeExecutionNotificationOrmEntity)
    private readonly notificationsRepository: Repository<CodeExecutionNotificationOrmEntity>,
  ) {}

  async createQueuedJob(params: {
    language: SupportedLanguage;
    code: string;
    routingKey: string;
    maxAttempts: number;
    metadata?: QueueExecutionMetadata;
  }): Promise<CodeExecutionJobOrmEntity> {
    const job = this.jobsRepository.create({
      language: params.language,
      code: params.code,
      routingKey: params.routingKey,
      status: 'queued',
      maxAttempts: params.maxAttempts,
      attempts: 0,
      queuedAt: new Date(),
      sourceType: params.metadata?.sourceType ?? 'code',
      taskId: params.metadata?.taskId ?? null,
      clientId: params.metadata?.clientId ?? null,
    });

    return this.jobsRepository.save(job);
  }

  async markRunning(
    jobId: string,
    attempt: number,
    workerId: string,
  ): Promise<CodeExecutionJobOrmEntity | null> {
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });
    if (!job) {
      return null;
    }

    job.status = 'running';
    job.attempts = attempt;
    job.workerId = workerId;
    job.startedAt = new Date();
    if (!job.queuedAt) {
      job.queuedAt = new Date();
    }

    return this.jobsRepository.save(job);
  }

  async markCompleted(params: {
    jobId: string;
    attempt: number;
    workerId: string;
    output: string;
    error?: string;
    executionTimeMs: number;
  }): Promise<CodeExecutionJobOrmEntity | null> {
    const job = await this.jobsRepository.findOne({ where: { id: params.jobId } });
    if (!job) {
      return null;
    }

    job.status = params.error ? 'completed_with_error' : 'completed';
    job.attempts = params.attempt;
    job.workerId = params.workerId;
    job.resultOutput = params.output;
    job.resultError = params.error ?? null;
    job.executionTimeMs = params.executionTimeMs;
    job.finishedAt = new Date();
    if (!job.startedAt) {
      job.startedAt = new Date(job.finishedAt.getTime() - params.executionTimeMs);
    }

    return this.jobsRepository.save(job);
  }

  async markRetryScheduled(params: {
    jobId: string;
    attempt: number;
    workerId: string;
    error: string;
  }): Promise<CodeExecutionJobOrmEntity | null> {
    const job = await this.jobsRepository.findOne({ where: { id: params.jobId } });
    if (!job) {
      return null;
    }

    job.status = 'retry_scheduled';
    job.attempts = params.attempt;
    job.workerId = params.workerId;
    job.resultError = params.error;

    return this.jobsRepository.save(job);
  }

  async markFailed(params: {
    jobId: string;
    attempt: number;
    workerId: string;
    error: string;
  }): Promise<CodeExecutionJobOrmEntity | null> {
    const job = await this.jobsRepository.findOne({ where: { id: params.jobId } });
    if (!job) {
      return null;
    }

    job.status = 'failed';
    job.attempts = params.attempt;
    job.workerId = params.workerId;
    job.resultError = params.error;
    job.finishedAt = new Date();

    return this.jobsRepository.save(job);
  }

  async storeNotification(
    payload: ExecutionNotificationPayload,
  ): Promise<CodeExecutionNotificationOrmEntity> {
    const notification = this.notificationsRepository.create({
      jobId: payload.jobId,
      eventType: payload.eventType,
      message: payload.message,
      language: payload.language,
      sourceType: payload.sourceType,
      status: payload.status ?? null,
      workerId: payload.workerId ?? null,
      attempt: payload.attempt ?? 0,
      payload: payload.payload ?? null,
    });

    return this.notificationsRepository.save(notification);
  }

  async getJobById(jobId: string): Promise<CodeExecutionJobOrmEntity | null> {
    return this.jobsRepository.findOne({ where: { id: jobId } });
  }

  async listJobs(limit = 20): Promise<CodeExecutionJobOrmEntity[]> {
    return this.jobsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async listNotifications(limit = 50): Promise<CodeExecutionNotificationOrmEntity[]> {
    return this.notificationsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
