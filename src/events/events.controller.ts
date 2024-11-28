import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  HttpStatus,
  Headers,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { multerOptions } from './../common/configs/multer.config';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Create a new event
   */
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,

  ) {
    try {
      const organizer = req.user.sub;
      if (file) {
        createEventDto.image = file.filename;
      };
      return await this.eventsService.create(createEventDto, organizer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get all events with optional query parameters
   */
  @Get()
  async findAll(@Query() query: any) {
    try {
      return await this.eventsService.findAll(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific event by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const event = await this.eventsService.findOne(id);
      if (!event) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }
      return event;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an existing event
   */
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (file) {
        updateEventDto.image = file.filename;
      }
      const updatedEvent = await this.eventsService.update(id, updateEventDto);
      if (!updatedEvent) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }
      return updatedEvent;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete an event
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const deletedEvent = await this.eventsService.delete(id);
      if (!deletedEvent) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }
      return deletedEvent;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete event',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}

