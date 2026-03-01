import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreateSubjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateTopicDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    subjectId: string;
}

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    topicId: string;
}

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsArray()
    options: string[];

    @IsNumber()
    correctOption: number;
}

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    lessonId: string;

    @IsArray()
    questions: CreateQuestionDto[];
}

export class SubmitQuizDto {
    @IsString()
    @IsNotEmpty()
    quizId: string;

    @IsArray()
    answers: number[];
}
