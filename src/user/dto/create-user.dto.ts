import { Transform } from "class-transformer"
import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateUserDto {

    @IsNumber()
    @IsNotEmpty()
    @Transform(({value}) =>  Number(value))
    public chatId: number

    @IsNotEmpty()
    public code: string

}