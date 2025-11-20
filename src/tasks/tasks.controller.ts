import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import * as schema from '../db/schema';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('taskType') taskType?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (taskType) filters.taskType = taskType;
    if (assignedUserId) filters.assignedUserId = parseInt(assignedUserId, 10);

    return await this.tasksService.findAll(filters);
  }

  @Get('open')
  async findOpenTasks() {
    return await this.tasksService.findOpenTasks();
  }

  @Get('closed')
  async findClosedTasks() {
    return await this.tasksService.findClosedTasks();
  }

  @Get('user/:userId')
  async findUserTasks(@Param('userId') userId: string) {
    return await this.tasksService.findUserTasks(parseInt(userId, 10));
  }

  @Get('invoice/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string) {
    return await this.tasksService.findByInvoiceId(parseInt(invoiceId, 10));
  }

  @Get(':uuid')
  async findByUuid(@Param('uuid') uuid: string) {
    return await this.tasksService.findByUuid(uuid);
  }

  @Post()
  async create(@Body() task: typeof schema.tasks.$inferInsert) {
    return await this.tasksService.create(task);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() task: Partial<typeof schema.tasks.$inferInsert>,
  ) {
    return await this.tasksService.update(uuid, task);
  }

  @Put(':uuid/assign')
  async assignToUser(
    @Param('uuid') uuid: string,
    @Body('userId') userId: number,
  ) {
    return await this.tasksService.assignToUser(uuid, userId);
  }

  @Put(':uuid/status')
  async updateStatus(
    @Param('uuid') uuid: string,
    @Body('status') status: string,
  ) {
    return await this.tasksService.updateStatus(uuid, status);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    return await this.tasksService.delete(uuid);
  }
}
