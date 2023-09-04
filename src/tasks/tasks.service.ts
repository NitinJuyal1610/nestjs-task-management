import { Injectable } from '@nestjs/common';
import { TaskModel, TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { v4 as uuidv4 } from 'uuid';
import { GetTasksFilterDto } from './dto/get-tasks-filter-dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  private tasks: TaskModel[] = [];

  getAllTasks(): TaskModel[] {
    return this.tasks;
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): TaskModel[] {
    const { status, search } = filterDto;

    let tasks = this.getAllTasks();

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(
        (task: TaskModel) =>
          task.title.includes(search) || task.description.includes(search),
      );
    }

    return tasks;
  }

  createTask(createTaskDto: CreateTaskDto): TaskModel {
    const { title, description } = createTaskDto;
    const task: TaskModel = {
      id: uuidv4(),
      title: title,
      description: description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);

    return task;
  }

  getTaskById(id: string): TaskModel {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID: ${id} not found`);
    }

    return task;
  }

  deleteTask(id: string) {
    const found = this.getTaskById(id);
    this.tasks = this.tasks.filter((task) => task.id !== found.id);
    return this.tasks;
  }

  updateStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): TaskModel {
    const { status } = updateTaskStatusDto;
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
