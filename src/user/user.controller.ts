import { 
    Controller, 
    Get, 
    Query, 
    UsePipes,
    ValidationPipe
} from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { CreateUserDto } from './dto/create-user.dto'


@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) {}

    @Get('auth')
    @UsePipes(new ValidationPipe({ transform: true }))
    protected updateUser(
        @Query() createUserDto: CreateUserDto
    ) {
        return this.userService.createUser(createUserDto.code, createUserDto.chatId)
    }

}
