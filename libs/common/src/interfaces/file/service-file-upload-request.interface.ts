export interface IServiceFileUploadRequest {
    buffer: {
        data: any;
        type: string;
    };
    name: string;
    alt?: string;
};