import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import * as schema from '../db/schema';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findAll(filters?: {
    status?: string;
    taskType?: string;
    assignedUserId?: number;
  }) {
    return await this.tasksRepository.findAll(filters);
  }

  async findByUuid(uuid: string) {
    const task = await this.tasksRepository.findByUuid(uuid);

    if (!task) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    return task;
  }

  async findByInvoiceId(invoiceId: number) {
    return await this.tasksRepository.findByInvoiceId(invoiceId);
  }

  async findOpenTasks() {
    return await this.tasksRepository.findOpenTasks();
  }

  async findClosedTasks() {
    return await this.tasksRepository.findClosedTasks();
  }

  async findUserTasks(userId: number) {
    return await this.tasksRepository.findUserTasks(userId);
  }

  async create(task: typeof schema.tasks.$inferInsert) {
    return await this.tasksRepository.create(task);
  }

  async update(
    uuid: string,
    task: Partial<typeof schema.tasks.$inferInsert>,
  ) {
    const existingTask = await this.tasksRepository.findByUuid(uuid);

    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    return await this.tasksRepository.update(uuid, task);
  }

  async delete(uuid: string) {
    const existingTask = await this.tasksRepository.findByUuid(uuid);

    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    return await this.tasksRepository.delete(uuid);
  }

  async assignToUser(uuid: string, userId: number) {
    const existingTask = await this.tasksRepository.findByUuid(uuid);

    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    return await this.tasksRepository.assignToUser(uuid, userId);
  }

  async updateStatus(uuid: string, status: string) {
    const existingTask = await this.tasksRepository.findByUuid(uuid);

    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    const completedAt = status === 'COMPLETED' ? new Date() : undefined;

    return await this.tasksRepository.updateStatus(uuid, status, completedAt);
  }
}
