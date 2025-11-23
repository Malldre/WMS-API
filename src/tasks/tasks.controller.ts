import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as schema from '../db/schema';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
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

  @Get('my-tasks')
  async findMyTasks(
    @Request() req,
    @Query('status') status?: string,
    @Query('taskType') taskType?: string,
  ) {
    const userId = req.user.userId;
    return await this.tasksService.findUserTasks(userId, taskType, status);
  }

  @Get('open')
  async findOpenTasks(
    @Query('taskType') taskType?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    const filters: any = {};
    if (assignedUserId) {
      filters.assignedUserId = parseInt(assignedUserId, 10);
    }
    return await this.tasksService.findOpenTasks(taskType, filters);
  }

  @Get('closed')
  async findClosedTasks(
    @Query('taskType') taskType?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    const filters: any = {};
    if (assignedUserId) {
      filters.assignedUserId = parseInt(assignedUserId, 10);
    }
    return await this.tasksService.findClosedTasks(taskType, filters);
  }

  @Get('user/:userId')
  async findUserTasks(
    @Param('userId') userId: string,
    @Query('taskType') taskType?: string,
    @Query('status') status?: string,
  ) {
    return await this.tasksService.findUserTasks(
      parseInt(userId, 10),
      taskType,
      status,
    );
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
    if (task.entryDate) {
      task.entryDate = new Date(task.entryDate);
    }
    if (task.dueDate) {
      task.dueDate = new Date(task.dueDate);
    }
    if (task.completedAt) {
      task.completedAt = new Date(task.completedAt);
    }
    if (task.lastCountAt) {
      task.lastCountAt = new Date(task.lastCountAt);
    }
    return await this.tasksService.update(uuid, task);
  }

  @Put(':uuid/status')
  async updateStatus(
    @Param('uuid') uuid: string,
    @Body() body: { status: string },
  ) {
    return await this.tasksService.updateStatus(uuid, body.status);
  }

  @Put(':uuid/assign')
  async assignToUser(
    @Param('uuid') uuid: string,
    @Body() body: { userId: number },
  ) {
    return await this.tasksService.assignToUser(uuid, body.userId);
  }

  @Post('conference')
  async performConference(
    @Body() body: { taskUuid: string; quantityFound: number; userId: number },
  ) {
    return await this.tasksService.performConference(
      body.taskUuid,
      body.quantityFound,
      body.userId,
    );
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    return await this.tasksService.delete(uuid);
  }
}