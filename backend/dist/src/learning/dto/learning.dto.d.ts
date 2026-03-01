export declare class CreateSubjectDto {
    name: string;
}
export declare class CreateTopicDto {
    name: string;
    subjectId: string;
}
export declare class CreateLessonDto {
    name: string;
    topicId: string;
}
export declare class CreateQuestionDto {
    text: string;
    options: string[];
    correctOption: number;
}
export declare class CreateQuizDto {
    title: string;
    lessonId: string;
    questions: CreateQuestionDto[];
}
export declare class SubmitQuizDto {
    quizId: string;
    answers: number[];
}
