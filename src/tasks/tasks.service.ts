import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task.status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getAllTasks(
    getTasksWithFilters: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = getTasksWithFilters;
    const query = this.tasksRepository.createQueryBuilder('task');

    query.where({ user });
    if (status) {
      query.andWhere('status = :status', { status });
    }
    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('(title ILIKE :search OR description ILIKE :search)', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const tasks = await query.getMany();

    console.log(tasks);
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.tasksRepository.save(task);
    return task;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id, user } });

    if (!found) throw new NotFoundException(`Task with ID: ${id} not found`);
    return found;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const deleted = await this.tasksRepository.delete({ id, user });
    if (deleted.affected == 0) {
      throw new NotFoundException(`Task with ID: ${id} not found`);
    }
  }

  async updateStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;

    const task = await this.getTaskById(id, user);
    await this.tasksRepository.update(id, { status: status });

    return task;
  }
}
