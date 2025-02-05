// This file is auto-generated by @hey-api/openapi-ts

import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';
import type { GetTasksResponse, CreateTaskData, CreateTaskResponse, GetArchivedTasksResponse, GetTaskData, GetTaskResponse, UpdateTaskData, UpdateTaskResponse, DeleteTaskData, DeleteTaskResponse, ForceDeleteTaskData, ForceDeleteTaskResponse, RestoreTaskData, RestoreTaskResponse, UploadFileData, UploadFileResponse, DeleteFileData, DeleteFileResponse, GetNotificationsResponse, MarkAllReadResponse } from './types.gen';

export class TasksService {
    /**
     * Get Tasks
     * @returns TaskSchema OK
     * @throws ApiError
     */
    public static getTasks(): CancelablePromise<GetTasksResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tasks'
        });
    }
    
    /**
     * Create Task
     * @param data The data for the request.
     * @param data.requestBody
     * @returns TaskSchema OK
     * @throws ApiError
     */
    public static createTask(data: CreateTaskData): CancelablePromise<CreateTaskResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tasks',
            body: data.requestBody,
            mediaType: 'application/json'
        });
    }
    
    /**
     * Get Archived Tasks
     * @returns TaskSchema OK
     * @throws ApiError
     */
    public static getArchivedTasks(): CancelablePromise<GetArchivedTasksResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tasks/archived'
        });
    }
    
    /**
     * Get Task
     * @param data The data for the request.
     * @param data.taskId
     * @returns DetailTaskSchema OK
     * @throws ApiError
     */
    public static getTask(data: GetTaskData): CancelablePromise<GetTaskResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tasks/{task_id}',
            path: {
                task_id: data.taskId
            }
        });
    }
    
    /**
     * Update Task
     * @param data The data for the request.
     * @param data.taskId
     * @param data.requestBody
     * @returns TaskSchema OK
     * @throws ApiError
     */
    public static updateTask(data: UpdateTaskData): CancelablePromise<UpdateTaskResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tasks/{task_id}',
            path: {
                task_id: data.taskId
            },
            body: data.requestBody,
            mediaType: 'application/json'
        });
    }
    
    /**
     * Delete Task
     * @param data The data for the request.
     * @param data.taskId
     * @returns void No Content
     * @throws ApiError
     */
    public static deleteTask(data: DeleteTaskData): CancelablePromise<DeleteTaskResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/tasks/{task_id}',
            path: {
                task_id: data.taskId
            }
        });
    }
    
    /**
     * Force Delete Task
     * @param data The data for the request.
     * @param data.taskId
     * @returns void No Content
     * @throws ApiError
     */
    public static forceDeleteTask(data: ForceDeleteTaskData): CancelablePromise<ForceDeleteTaskResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/tasks/{task_id}/force',
            path: {
                task_id: data.taskId
            }
        });
    }
    
    /**
     * Restore Task
     * @param data The data for the request.
     * @param data.taskId
     * @returns TaskSchema OK
     * @throws ApiError
     */
    public static restoreTask(data: RestoreTaskData): CancelablePromise<RestoreTaskResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tasks/{task_id}/restore',
            path: {
                task_id: data.taskId
            }
        });
    }
    
    /**
     * Upload File
     * @param data The data for the request.
     * @param data.formData
     * @param data.taskId
     * @returns MediaSchema OK
     * @throws ApiError
     */
    public static uploadFile(data: UploadFileData): CancelablePromise<UploadFileResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/files/upload',
            query: {
                task_id: data.taskId
            },
            formData: data.formData,
            mediaType: 'multipart/form-data'
        });
    }
    
    /**
     * Delete File
     * @param data The data for the request.
     * @param data.fileId
     * @returns void No Content
     * @throws ApiError
     */
    public static deleteFile(data: DeleteFileData): CancelablePromise<DeleteFileResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/files/{file_id}',
            path: {
                file_id: data.fileId
            }
        });
    }
    
    /**
     * Get Notifications
     * @returns NotificationSchema OK
     * @throws ApiError
     */
    public static getNotifications(): CancelablePromise<GetNotificationsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notifications'
        });
    }
    
    /**
     * Mark All Read
     * @returns unknown OK
     * @throws ApiError
     */
    public static markAllRead(): CancelablePromise<MarkAllReadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notifications/mark-all-read'
        });
    }
    
}