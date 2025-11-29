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
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { InvoiceService } from '../invoices/invoice.service';
import * as schema from '../db/schema';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('taskType') taskType?: string,
    @Query('assignedUserUuid') assignedUserUuid?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (taskType) filters.taskType = taskType;
    
    if (assignedUserUuid) {
      const userId = await this.usersService.getInternalIdByUuid(assignedUserUuid);
      if (userId) {
        filters.assignedUserId = userId;
      }
    }

    return await this.tasksService.findAll(filters);
  }

  @Get('my-tasks')
  async findMyTasks(
    @Request() req,
    @Query('status') status?: string,
    @Query('taskType') taskType?: string,
  ) {
    const userUuid = req.user.uuid;
    const userId = await this.usersService.getInternalIdByUuid(userUuid);

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return await this.tasksService.findUserTasks(userId, taskType, status);
  }

  @Get('open')
  async findOpenTasks(
    @Query('taskType') taskType?: string,
    @Query('assignedUserUuid') assignedUserUuid?: string,
  ) {
    const filters: any = {};
    
    if (assignedUserUuid) {
      const userId = await this.usersService.getInternalIdByUuid(assignedUserUuid);
      if (userId) {
        filters.assignedUserId = userId;
      }
    }
    
    return await this.tasksService.findOpenTasks(taskType, filters);
  }

  @Get('closed')
  async findClosedTasks(
    @Query('taskType') taskType?: string,
    @Query('assignedUserUuid') assignedUserUuid?: string,
  ) {
    const filters: any = {};
    
    if (assignedUserUuid) {
      const userId = await this.usersService.getInternalIdByUuid(assignedUserUuid);
      if (userId) {
        filters.assignedUserId = userId;
      }
    }
    
    return await this.tasksService.findClosedTasks(taskType, filters);
  }

  @Get('user/:userUuid')
  async findUserTasks(
    @Param('userUuid') userUuid: string,
    @Query('taskType') taskType?: string,
    @Query('status') status?: string,
  ) {
    const userId = await this.usersService.getInternalIdByUuid(userUuid);
    
    if (!userId) {
      throw new NotFoundException(`User with UUID ${userUuid} not found`);
    }
    
    return await this.tasksService.findUserTasks(
      userId,
      taskType,
      status,
    );
  }

  @Get('invoice/:invoiceUuid')
  async findByInvoiceId(@Param('invoiceUuid') invoiceUuid: string) {
    const invoiceId = await this.invoiceService.getInternalIdByUuid(invoiceUuid);
    
    if (!invoiceId) {
      throw new NotFoundException(`Invoice with UUID ${invoiceUuid} not found`);
    }
    
    return await this.tasksService.findByInvoiceId(invoiceId);
  }

  @Get(':uuid')
  async findByUuid(@Param('uuid') uuid: string) {
    return await this.tasksService.findByUuid(uuid);
  }

  @Post()
  async create(@Body() task: typeof schema.tasks.$inferInsert) {

    // Converter timestamp strings para Date objects
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
    @Body() body: { userUuid: string },
  ) {
    // Converter userUuid para userId interno
    const userId = await this.usersService.getInternalIdByUuid(body.userUuid);
    
    if (!userId) {
      throw new NotFoundException(`User with UUID ${body.userUuid} not found`);
    }
    
    return await this.tasksService.assignToUser(uuid, userId);
  }

  @Post('conference')
  async performConference(
    @Body() body: { 
      taskUuid: string; 
      quantityFound: number; 
      userUuid: string;
      storageId?: number;
    },
  ) {
    // Converter userUuid para userId interno
    const userId = await this.usersService.getInternalIdByUuid(body.userUuid);
    
    if (!userId) {
      throw new NotFoundException(`User with UUID ${body.userUuid} not found`);
    }
    
    return await this.tasksService.performConference(
      body.taskUuid,
      body.quantityFound,
      userId,
      body.storageId,
    );
  }

  @Put(':uuid/complete-conference')
  async completeConference(
    @Param('uuid') uuid: string,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.tasksService.completeConference(uuid, userId);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    return await this.tasksService.delete(uuid);
  }
}