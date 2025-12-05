import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import {
  omitAllInternalIds,
  omitAllInternalIdsFromArray,
} from '../common/utils/omit-id.util';

export interface TaskWithRelations {
  uuid: string;
  title: string;
  description: string | null;
  taskType: string;
  status: string;
  entryDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  itemSpecification: string | null;
  createdAt: Date;
  invoiceUuid: string | null;
  materialUuid: string | null;
  assignedUserUuid: string | null;
  invoiceId: number | null;
  materialId: number | null;
  assignedUserId: number | null;
  countAttempts: number | null;
  countedQuantity: string | null;
  lastCountAt: Date | null;
}

@Injectable()
export class TasksRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private getTaskWithRelationsSelect() {
    return {
      uuid: schema.tasks.uuid,
      title: schema.tasks.title,
      description: schema.tasks.description,
      taskType: schema.tasks.taskType,
      status: schema.tasks.status,
      entryDate: schema.tasks.entryDate,
      dueDate: schema.tasks.dueDate,
      completedAt: schema.tasks.completedAt,
      itemSpecification: schema.tasks.itemSpecification,
      createdAt: schema.tasks.createdAt,
      invoiceUuid: schema.invoices.uuid,
      materialUuid: schema.materials.uuid,
      assignedUserUuid: schema.users.uuid,
      invoiceId: schema.tasks.invoiceId,
      materialId: schema.tasks.materialId,
      assignedUserId: schema.tasks.assignedUserId,
      countAttempts: schema.tasks.countAttempts,
      countedQuantity: schema.tasks.countedQuantity,
      lastCountAt: schema.tasks.lastCountAt,
    };
  }

  async findAll(filters?: {
    status?: string;
    taskType?: string;
    assignedUserId?: number;
  }): Promise<TaskWithRelations[]> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(schema.tasks.status, filters.status as any));
    }
    if (filters?.taskType) {
      conditions.push(eq(schema.tasks.taskType, filters.taskType as any));
    }
    if (filters?.assignedUserId) {
      conditions.push(eq(schema.tasks.assignedUserId, filters.assignedUserId));
    }

    let query = this.db
      .select(this.getTaskWithRelationsSelect())
      .from(schema.tasks)
      .leftJoin(schema.invoices, eq(schema.tasks.invoiceId, schema.invoices.id))
      .leftJoin(schema.materials, eq(schema.tasks.materialId, schema.materials.id))
      .leftJoin(schema.users, eq(schema.tasks.assignedUserId, schema.users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(desc(schema.tasks.createdAt));

    return result;
  }

  async findByUuid(
    uuid: string,
  ): Promise<TaskWithRelations | null> {
    const result = await this.db
      .select(this.getTaskWithRelationsSelect())
      .from(schema.tasks)
      .leftJoin(schema.invoices, eq(schema.tasks.invoiceId, schema.invoices.id))
      .leftJoin(schema.materials, eq(schema.tasks.materialId, schema.materials.id))
      .leftJoin(schema.users, eq(schema.tasks.assignedUserId, schema.users.id))
      .where(eq(schema.tasks.uuid, uuid))
      .limit(1);

    return result[0] || null;
  }

  async findByInvoiceId(
    invoiceId: number,
  ): Promise<TaskWithRelations[]> {
    const result = await this.db
      .select(this.getTaskWithRelationsSelect())
      .from(schema.tasks)
      .leftJoin(schema.invoices, eq(schema.tasks.invoiceId, schema.invoices.id))
      .leftJoin(schema.materials, eq(schema.tasks.materialId, schema.materials.id))
      .leftJoin(schema.users, eq(schema.tasks.assignedUserId, schema.users.id))
      .where(eq(schema.tasks.invoiceId, invoiceId))
      .orderBy(desc(schema.tasks.createdAt));

    return result;
  }

  async findOpenTasks(
    taskType?: string,
    filters?: { assignedUserId?: number },
  ): Promise<TaskWithRelations[]> {
    const conditions = [
      or(
        eq(schema.tasks.status, 'PENDING'),
        eq(schema.tasks.status, 'IN_PROGRESS'),
      ),
    ];

    if (taskType) {
      conditions.push(eq(schema.tasks.taskType, taskType as any));
    }

    if (filters?.assignedUserId) {
      conditions.push(eq(schema.tasks.assignedUserId, filters.assignedUserId));
    }

    const result = await this.db
      .select(this.getTaskWithRelationsSelect())
      .from(schema.tasks)
      .leftJoin(schema.invoices, eq(schema.tasks.invoiceId, schema.invoices.id))
      .leftJoin(schema.materials, eq(schema.tasks.materialId, schema.materials.id))
      .leftJoin(schema.users, eq(schema.tasks.assignedUserId, schema.users.id))
      .where(and(...conditions))
      .orderBy(desc(schema.tasks.createdAt));

    return result;
  }

  async findClosedTasks(
    taskType?: string,
    filters?: { assignedUserId?: number },
  ): Promise<TaskWithRelations[]> {
    const conditions = [
      or(
        eq(schema.tasks.status, 'COMPLETED'),
        eq(schema.tasks.status, 'CANCELLED'),
      ),
    ];

    if (taskType) {
      conditions.push(eq(schema.tasks.taskType, taskType as any));
    }

    if (filters?.assignedUserId) {
      conditions.push(eq(schema.tasks.assignedUserId, filters.assignedUserId));
    }

    const result = await this.db
      .select(this.getTaskWithRelationsSelect())
      .from(schema.tasks)
      .leftJoin(schema.invoices, eq(schema.tasks.invoiceId, schema.invoices.id))
      .leftJoin(schema.materials, eq(schema.tasks.materialId, schema.materials.id))
      .leftJoin(schema.users, eq(schema.tasks.assignedUserId, schema.users.id))
      .where(and(...conditions))
      .orderBy(desc(schema.tasks.createdAt));

    return result;
  }

  async findUserTasks(
    userId: number,
    taskType?: string,
    status?: string,
  ): Promise<TaskWithRelations[]> {
    const conditions = [eq(schema.tasks.assignedUserId, userId)];

    if (taskType) {
      conditions.push(eq(schema.tasks.taskType, taskType as any));
    }

    if (status) {
      conditions.push(eq(schema.tasks.status, status as any));
    }

    const result = await this.db
      .select(this.getTaskWithRelationsSelect())
      .from(schema.tasks)
      .leftJoin(schema.invoices, eq(schema.tasks.invoiceId, schema.invoices.id))
      .leftJoin(schema.materials, eq(schema.tasks.materialId, schema.materials.id))
      .leftJoin(schema.users, eq(schema.tasks.assignedUserId, schema.users.id))
      .where(and(...conditions))
      .orderBy(desc(schema.tasks.createdAt));

    return result;
  }

  async create(
    task: typeof schema.tasks.$inferInsert,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>> {
    const result = await this.db.insert(schema.tasks).values(task).returning();
    return omitAllInternalIds(result[0]);
  }

  async update(
    uuid: string,
    task: Partial<typeof schema.tasks.$inferInsert>,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'> | null> {
    const result = await this.db
      .update(schema.tasks)
      .set(task)
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }

  async delete(
    uuid: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'> | null> {
    const result = await this.db
      .delete(schema.tasks)
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }

  async assignToUser(
    uuid: string,
    userId: number,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'> | null> {
    const result = await this.db
      .update(schema.tasks)
      .set({ assignedUserId: userId, status: 'IN_PROGRESS' })
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }

  async updateStatus(
    uuid: string,
    status: string,
    completedAt?: Date,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'> | null> {
    const updateData: any = { status };

    if (completedAt) {
      updateData.completedAt = completedAt;
    }

    const result = await this.db
      .update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }
}