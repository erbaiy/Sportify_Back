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
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { multerOptions } from './../common/configs/multer.config';
import { AuthGuard } from '../auth/guards/auth.guard';

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
      const organizer = req.user.sub; // JWT sub is passed from the auth guard
      if (file) {
        createEventDto.image = file.filename; // If a file is uploaded, add the file name to DTO
      }
      return await this.eventsService.create(createEventDto, organizer); // Call the service to create event
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
      return await this.eventsService.findAll(query); // Fetch events from service
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
      const event = await this.eventsService.findOne(id); // Fetch the event by ID
      return event;
    } catch (error) {
      // Handle the error if the event is not found or any other internal error occurs
      throw new HttpException(
        error.message || 'Failed to fetch event',
        HttpStatus.NOT_FOUND, // Update this to 404 when the error is related to resource not found
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
        updateEventDto.image = file.filename; // If a file is uploaded, update image field
      }

      // Call the service to update the event
      const updatedEvent = await this.eventsService.update(id, updateEventDto);

      return updatedEvent; // If the event is updated successfully, return the updated event
    } catch (error) {
      // Handle the error and throw an appropriate HTTP exception
      throw new HttpException(
        error.message || 'Failed to update event',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete an event
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const deletedEvent = await this.eventsService.delete(id); // Call the service to delete event
      if (!deletedEvent) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND); // If event not found, throw 404
      }
      return deletedEvent;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete event',
        HttpStatus.NOT_FOUND, // Not Found as per deletion
      );
    }
  }
}
