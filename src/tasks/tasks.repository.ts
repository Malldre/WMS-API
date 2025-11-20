import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, and, or, desc, asc } from 'drizzle-orm';

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
  }) {
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.db
      .select()
      .from(schema.tasks)
      .where(whereClause)
      .orderBy(desc(schema.tasks.createdAt));
  }

  async findByUuid(uuid: string) {
    const result = await this.db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.uuid, uuid))
      .limit(1);

    return result[0] || null;
  }

  async findByInvoiceId(invoiceId: number) {
    return await this.db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.invoiceId, invoiceId))
      .orderBy(desc(schema.tasks.createdAt));
  }

  async findOpenTasks() {
    return await this.db
      .select()
      .from(schema.tasks)
      .where(
        or(
          eq(schema.tasks.status, 'PENDING'),
          eq(schema.tasks.status, 'IN_PROGRESS'),
        ),
      )
      .orderBy(desc(schema.tasks.createdAt));
  }

  async findClosedTasks() {
    return await this.db
      .select()
      .from(schema.tasks)
      .where(
        or(
          eq(schema.tasks.status, 'COMPLETED'),
          eq(schema.tasks.status, 'CANCELLED'),
        ),
      )
      .orderBy(desc(schema.tasks.completedAt));
  }

  async findUserTasks(userId: number) {
    return await this.db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.assignedUserId, userId))
      .orderBy(desc(schema.tasks.createdAt));
  }

  async create(task: typeof schema.tasks.$inferInsert) {
    const result = await this.db
      .insert(schema.tasks)
      .values(task)
      .returning();

    return result[0];
  }

  async update(uuid: string, task: Partial<typeof schema.tasks.$inferInsert>) {
    const result = await this.db
      .update(schema.tasks)
      .set(task)
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] || null;
  }

  async delete(uuid: string) {
    const result = await this.db
      .delete(schema.tasks)
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] || null;
  }

  async assignToUser(uuid: string, userId: number) {
    const result = await this.db
      .update(schema.tasks)
      .set({ assignedUserId: userId })
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] || null;
  }

  async updateStatus(uuid: string, status: string, completedAt?: Date) {
    const updateData: any = { status };

    if (status === 'COMPLETED' && completedAt) {
      updateData.completedAt = completedAt;
    }

    const result = await this.db
      .update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.uuid, uuid))
      .returning();

    return result[0] || null;
  }
}
