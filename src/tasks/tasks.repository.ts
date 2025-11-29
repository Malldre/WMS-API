import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import {
  omitAllInternalIds,
  omitAllInternalIdsFromArray,
} from '../common/utils/omit-id.util';

@Injectable()
export class TasksRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(filters?: {
    status?: string;
    taskType?: string;
    assignedUserId?: number;
  }): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
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

    const query = this.db.select().from(schema.tasks);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(schema.tasks.createdAt));

    return omitAllInternalIdsFromArray(result);
  }

  async findByUuid(
    uuid: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'> | null> {
    const result = await this.db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.uuid, uuid))
      .limit(1);

    return result[0] ? omitAllInternalIds(result[0]) : null;
  }

  async findByInvoiceId(
    invoiceId: number,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    const result = await this.db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.invoiceId, invoiceId))
      .orderBy(desc(schema.tasks.createdAt));

    return omitAllInternalIdsFromArray(result);
  }

  async findOpenTasks(
    taskType?: string,
    filters?: { assignedUserId?: number },
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
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
      .select()
      .from(schema.tasks)
      .where(and(...conditions))
      .orderBy(desc(schema.tasks.createdAt));

    return omitAllInternalIdsFromArray(result);
  }

  async findClosedTasks(
    taskType?: string,
    filters?: { assignedUserId?: number },
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
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
      .select()
      .from(schema.tasks)
      .where(and(...conditions))
      .orderBy(desc(schema.tasks.createdAt));

    return omitAllInternalIdsFromArray(result);
  }

  async findUserTasks(
    userId: number,
    taskType?: string,
    status?: string,
  ): Promise<Omit<typeof schema.tasks.$inferSelect, 'id'>[]> {
    const conditions = [eq(schema.tasks.assignedUserId, userId)];

    if (taskType) {
      conditions.push(eq(schema.tasks.taskType, taskType as any));
    }

    if (status) {
      conditions.push(eq(schema.tasks.status, status as any));
    }

    const result = await this.db
      .select()
      .from(schema.tasks)
      .where(and(...conditions))
      .orderBy(desc(schema.tasks.createdAt));

    return omitAllInternalIdsFromArray(result);
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