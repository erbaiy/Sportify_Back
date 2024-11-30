import { 
    Controller, 
    HttpException, 
    HttpStatus, 
    Post, 
    Get, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Query 
} from "@nestjs/common";
import { RegistrationService } from "./registration.service";
import { CreateRegistrationDto } from "./dto/registration.dto";

@Controller('registrations')
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}

    @Post()
    async create(@Body() createRegistrationDto: CreateRegistrationDto) {
        try {
            return await this.registrationService.create(createRegistrationDto);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Failed to create registration',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get()
    async findAll(@Query() query: Record<string, any>) {
        return await this.registrationService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const registration = await this.registrationService.findOne(id);
        if (!registration) {
            throw new HttpException('Registration not found', HttpStatus.NOT_FOUND);
        }
        return registration;
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRegistrationDto: Partial<CreateRegistrationDto>
    ) {
        return await this.registrationService.update(id, updateRegistrationDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.registrationService.remove(id);
    }
}
