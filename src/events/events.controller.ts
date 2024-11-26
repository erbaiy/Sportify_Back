import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { EventsService } from './events.service';


@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

}