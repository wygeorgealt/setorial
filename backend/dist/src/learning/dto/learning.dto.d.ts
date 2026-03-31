export declare class CreateSubjectDto {
    name: string;
}
export declare class CreateTopicDto {
    name: string;
    subjectId: string;
}
export declare class CreateQuestionDto {
    text: string;
    options: string[];
    correctOption: number;
}
export declare class CreateLessonDto {
    name: string;
    topicId: string;
    content?: string;
    order?: number;
    rewardPoints?: number;
    questions: CreateQuestionDto[];
}
export declare class SubmitLessonDto {
    lessonId: string;
    answers: number[];
}
export declare class GenerateAiLevelsDto {
    subjectId: string;
    topicName: string;
    numLevels: number;
}
