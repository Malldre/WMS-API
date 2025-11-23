import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { InvoiceItemService } from '../invoice_items/invoice_item.service';
import * as schema from '../db/schema';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly invoiceItemService: InvoiceItemService,
  ) {}

  async findAll(filters?: {
    status?: string;
    taskType?: string;
    assignedUserId?: number;
  }): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    return await this.tasksRepository.findAll(filters);
  }

  async findByUuid(
    uuid: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    const task = await this.tasksRepository.findByUuid(uuid);
    if (!task) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }
    return task;
  }

  async findByInvoiceId(
    invoiceId: number,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    return await this.tasksRepository.findByInvoiceId(invoiceId);
  }

  async findOpenTasks(
    taskType?: string,
    filters?: { assignedUserId?: number },
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    return await this.tasksRepository.findOpenTasks(taskType, filters);
  }

  async findClosedTasks(
    taskType?: string,
    filters?: { assignedUserId?: number },
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    return await this.tasksRepository.findClosedTasks(taskType, filters);
  }

  async findUserTasks(
    userId: number,
    taskType?: string,
    status?: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    return await this.tasksRepository.findUserTasks(userId, taskType, status);
  }

  async create(
    task: typeof schema.tasks.$inferInsert,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    return await this.tasksRepository.create(task);
  }

  async update(
    uuid: string,
    task: Partial<typeof schema.tasks.$inferInsert>,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    const existingTask = await this.tasksRepository.findByUuid(uuid);
    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    const updated = await this.tasksRepository.update(uuid, task);
    if (!updated) {
      throw new NotFoundException(`Failed to update task with UUID ${uuid}`);
    }

    return updated;
  }

  async updateStatus(
    uuid: string,
    status: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    const existingTask = await this.tasksRepository.findByUuid(uuid);
    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    const completedAt = status === 'COMPLETED' ? new Date() : undefined;

    const updated = await this.tasksRepository.updateStatus(
      uuid,
      status,
      completedAt,
    );
    if (!updated) {
      throw new NotFoundException(`Failed to update task status`);
    }

    return updated;
  }

  async assignToUser(
    uuid: string,
    userId: number,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    const existingTask = await this.tasksRepository.findByUuid(uuid);
    if (!existingTask) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    const updated = await this.tasksRepository.assignToUser(uuid, userId);
    if (!updated) {
      throw new NotFoundException(`Failed to assign task`);
    }

    return updated;
  }

  async performConference(
    taskUuid: string,
    quantityFound: number,
    userId: number,
  ): Promise<{
    success: boolean;
    message: string;
    quantityFound: number;
    requiresReview: boolean;
  }> {
    const task = await this.tasksRepository.findByUuid(taskUuid);
    if (!task) {
      throw new NotFoundException(`Task with UUID ${taskUuid} not found`);
    }

    if (!task.invoiceId || !task.materialId) {
      throw new NotFoundException(
        'Task must have invoiceId and materialId for conference',
      );
    }

    const invoiceItem = await this.invoiceItemService.findByInvoiceAndMaterial(
      task.invoiceId,
      task.materialId,
    );

    if (!invoiceItem) {
      throw new NotFoundException('Invoice item not found');
    }

    const invoiceQuantity = parseFloat(invoiceItem.quantity.toString());
    const isConforming = quantityFound === invoiceQuantity;

    await this.invoiceItemService.update(invoiceItem.uuid, {
      status: isConforming ? 'CONFORMING' : 'DIVERGENT',
      remark: isConforming
        ? 'Material conforme nota'
        : `Divergência: Esperado ${invoiceQuantity}, Encontrado ${quantityFound}`,
    });

    await this.tasksRepository.update(taskUuid, {
      status: 'COMPLETED',
      completedAt: new Date(),
      countedQuantity: quantityFound.toString(),
      assignedUserId: userId,
    });

    return {
      success: isConforming,
      message: isConforming
        ? 'Conferência realizada com sucesso. Quantidade está conforme a nota fiscal.'
        : 'DIVERGÊNCIA DETECTADA: A quantidade informada não corresponde à nota fiscal.',
      quantityFound,
      requiresReview: !isConforming,
    };
  }

  async delete(
    uuid: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    const task = await this.tasksRepository.findByUuid(uuid);
    if (!task) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    const deleted = await this.tasksRepository.delete(uuid);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete task`);
    }

    return deleted;
  }
}