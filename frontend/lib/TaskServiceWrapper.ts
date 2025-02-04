import { TasksService } from "@/services"; // Ajuste o caminho se necessário
import type { UploadFileData, UploadFileResponse } from "@/services/types.gen";
import { CancelablePromise } from "@/services/core/CancelablePromise";

export class TaskServiceWrapper {
  static uploadFile(data: UploadFileData): CancelablePromise<UploadFileResponse> {
    console.log("Chamando uploadFile com taskId:", data.taskId);

    if (!data.taskId) {
      console.error("⚠️ Erro: Tentativa de upload antes da criação da tarefa! Abortando...");
      throw new Error("Tentativa de upload sem um taskId válido.");
    }

    return TasksService.uploadFile(data);
  }
}
