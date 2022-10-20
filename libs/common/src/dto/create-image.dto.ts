import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateImageDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsOptional()
    readonly alt: string;
}
