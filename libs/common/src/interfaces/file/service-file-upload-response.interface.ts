export interface IServiceFileUploadResponse {
    _id: string;
    key: string;
    uri: string;
    bucket: string;
    contentType: string;
    size: number;
};