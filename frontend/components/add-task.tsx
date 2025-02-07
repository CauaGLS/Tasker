"use client";

import { TaskStatus, TasksService } from "@/services";
import { DetailTaskSchema } from "@/services";
import { TaskServiceWrapper } from "@/lib/task-service-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TagInput } from "emblor";
import { ArchiveIcon, Loader2, PlusIcon, TagIcon, Trash2Icon } from "lucide-react";
import { UploadCloudIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useSession } from "@/lib/auth-client";
import { STATUS } from "@/lib/labels";
import { formatDatetime } from "@/lib/utils";

import { MinimalTiptapEditor } from "./minimal-tiptap";
import { DateTimePicker } from "./ui/datetime-picker";
import { Skeleton } from "./ui/skeleton";
import { StatusDot } from "./ui/status-dot";
import { Textarea } from "./ui/textarea";

// Importe o novo wrapper

const formSchema = z.object({
  title: z.string().min(1, { message: "Adicione um título" }).max(128, { message: "Título muito longo" }),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  expected_date: z.date().optional().nullable(),
  description: z.string(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .optional()
    .default([]),
  file: z.array(z.union([z.instanceof(File), z.object({ id: z.number(), src: z.string() })])).default([]),
});

type FormSchema = z.infer<typeof formSchema>;

export function AddTask() {
  const { data: session } = useSession();
  const [taskId, setTaskId] = useQueryState("t", parseAsInteger);
  const [open, setOpen] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [filesToRemove, setFilesToRemove] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery<DetailTaskSchema>({
    queryKey: ["tasks", Number(taskId)],
    queryFn: () => TasksService.getTask({ taskId: taskId! }),
    enabled: !!taskId,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      status: TaskStatus.PENDING,
      description: "",
      tags: [],
      file: [],
    },
  });

  useEffect(() => {
    if (task && taskId) {
      form.reset({
        title: task.title,
        status: task.status,
        description: task.description,
        expected_date: task.expected_date ? new Date(task.expected_date) : null,
        tags: Array.isArray(task.tags) ? task.tags.map((tag) => ({ id: tag, text: tag })) : [],
        file: Array.isArray(task.medias) && task.medias.length > 0 ? task.medias.map((media) => ({ id: media.id, src: media.file })) : [],
      });
    }
  }, [task, taskId, form]);

  const create = useMutation({
    mutationFn: TasksService.createTask,
    onSuccess: async (task) => {
      console.log("Tarefa criada com sucesso. ID:", task.id);

      const files = form.getValues("file") ?? [];

      if (files.length > 0) {
        toast.info("Enviando mídias associadas à tarefa...");

        try {
          const uploadedFiles = await Promise.all(
            files.map(async (file) => {
              if (file instanceof File) {
                const formData = new FormData();
                formData.append("files", file);

                console.log("Enviando arquivo para a tarefa:", task.id, file.name);

                return await TaskServiceWrapper.uploadFile({
                  formData: { files: [file] },
                  taskId: task.id,
                });
              }
              return null;
            }),
          );

          toast.success("Mídias enviadas com sucesso!");
          form.setValue(
            "file",
            uploadedFiles
              .filter((file) => file !== null)
              .flatMap((mediaArray) => mediaArray.map((media) => ({ id: media.id, src: media.file }))), // ✅ Converte para `{ id, src }`
          );
        } catch (error) {
          console.error("Erro ao enviar mídias:", error);
          toast.error("Erro ao enviar mídias.");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      setOpen(false);
      form.reset();
    },
  });

  const update = useMutation({
    mutationFn: TasksService.updateTask,
    onSuccess: (task) => {
      queryClient.setQueryData(["tasks", Number(taskId)], (oldData: DetailTaskSchema | undefined) => {
        return oldData
          ? { ...oldData, ...task, medias: oldData.medias ?? [] } // ✅ Mantém `medias` se `updateTask` não retornar
          : { ...task, medias: [] }; // Se `oldData` for `undefined`, inicializa `medias`
      });

      setOpen(false);
      setTaskId(null);
    },
  });

  const restore = useMutation({
    mutationFn: TasksService.restoreTask,
    onSuccess: () => {
      setOpen(false);
      setTaskId(null);
    },
  });

  const deleteTask = useMutation({
    mutationFn: TasksService.deleteTask,
    onSuccess: async () => {
      toast.warning("Tarefa Arquivada 📂", {
        description: task?.title,
        action: {
          label: "Restaurar",
          onClick: () => restore.mutate({ taskId: taskId! }),
        },
      });

      setOpen(false);
      setTaskId(null);
    },
  });

  const removeFile = (fileId: number) => {
    setFilesToRemove((prev) => [...prev, fileId]); // Adiciona à lista de arquivos a serem excluídos
    form.setValue(
      "file",
      form.getValues("file").filter((f) => {
        if ("id" in f) return f.id !== fileId;
        return true;
      }),
      { shouldDirty: true }, // Marca como alterado
    );
    form.trigger(); // Atualiza o estado do formulário
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      // Exclui os arquivos marcados antes de atualizar a tarefa
      await Promise.all(filesToRemove.map((fileId) => TasksService.deleteFile({ fileId })));

      const requestBody = {
        ...data,
        expected_date: data.expected_date ? data.expected_date.toISOString() : undefined,
        tags: data.tags.map((tag) => tag.text),
      };

      if (taskId) {
        update.mutate({ taskId: Number(taskId), requestBody });
      } else {
        create.mutate({ requestBody });
      }
    } catch (error) {
      toast.error("Erro ao processar arquivos.");
    }
  };

  const isPending = create.isPending || update.isPending || deleteTask.isPending || isLoading;

  return (
    <Drawer
      open={open || !!taskId}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open && !!taskId) {
          setTaskId(null);
        }
        if (open && !taskId) {
          form.reset({
            title: "",
            status: TaskStatus.PENDING,
            description: "",
          });
        }
      }}
      shouldScaleBackground={false}
    >
      <DrawerTrigger asChild>
        <Button variant="brand" size="sm">
          <PlusIcon className="size-4" strokeWidth={2.5} /> Tarefa
        </Button>
      </DrawerTrigger>

      <Form {...form}>
        <DrawerContent aria-describedby="" className="p-4">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-loading={isLoading}
            className="flex h-full flex-col gap-2 data-[loading=true]:hidden"
          >
            <DrawerHeader className="p-0">
              <DrawerTitle className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormLabel className="sr-only">Título</FormLabel>
                      <FormControl>
                        <Textarea
                          autoFocus
                          placeholder="Título"
                          className="min-h-[none] resize-none border-2 border-transparent bg-transparent px-2 py-1 font-semibold leading-none tracking-tight shadow-none hover:border-border md:text-lg"
                          rows={1}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="size-8 md:mt-2">
                      <AvatarImage src={task?.created_by?.image ?? session?.user?.image ?? ""} />
                      <AvatarFallback className="text-xs">
                        {(task?.created_by?.name ?? session?.user?.name)?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent align="end">
                    <p className="font-medium">{task?.created_by?.name ?? session?.user?.name}</p>
                    <p className="text-right text-muted-foreground">{formatDatetime(task?.created_at)}</p>
                  </TooltipContent>
                </Tooltip>
              </DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col gap-2 md:flex-row">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={TaskStatus.PENDING}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                        {STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <StatusDot variant={status.value} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expected_date"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormLabel>Data para execução</FormLabel>
                    <FormControl>
                      <DateTimePicker value={field.value ?? undefined} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="sr-only">Tags</FormLabel>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <TagIcon className="size-4 text-muted-foreground" />
                    <FormControl>
                      <TagInput
                        {...field}
                        tags={field.value ?? []}
                        setTags={field.onChange}
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                        placeholder="Adicionar tag"
                        styleClasses={{
                          inlineTagsContainer: "border-none min-h-12",
                          tag: {
                            body: "pl-3",
                          },
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isLoading && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1 overflow-hidden">
                    <FormLabel className="sr-only">Descrição</FormLabel>
                    <FormControl>
                      <MinimalTiptapEditor
                        output="html"
                        placeholder="Adicione uma descrição para a tarefa"
                        editorClassName="focus:outline-none "
                        editorContentClassName="p-4 max-h-[200px] md:max-h-[300px] overflow-y-auto"
                        immediatelyRender={false}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!isLoading && (
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => {
                  const [preview, setPreview] = useState<string | null>(null);
                  const [fileName, setFileName] = useState<string | null>(null);

                  useEffect(() => {
                    if (task && Array.isArray(task.medias) && task.medias.length > 0) {
                      setPreview(task.medias[0].file);
                      setFileName(task.medias[0].name ?? null);
                    }
                  }, [task]);

                  const deleteFileMutation = useMutation({
                    mutationFn: async (fileId: number) => {
                      console.log("Excluindo arquivo do backend. ID:", fileId);
                      return await TasksService.deleteFile({ fileId });
                    },
                    onSuccess: () => {
                      toast.success("Arquivo removido com sucesso!");
                      queryClient.invalidateQueries({ queryKey: ["tasks", Number(taskId)] }); // ✅ Atualiza a task no cache
                    },
                    onError: () => {
                      toast.error("Erro ao remover arquivo.");
                    },
                  });

                  // Callback para processar o arquivo quando ele for dropado
                  const onDrop = async (acceptedFiles: File[]) => {
                    if (acceptedFiles.length === 0) return;

                    const taskIdValue = taskId || (task ? task.id : undefined);
                    if (!taskIdValue) {
                      toast.error("Erro: Tarefa precisa ser criada antes do upload.");
                      return;
                    }

                    try {
                      toast.info("Enviando arquivos...");

                      const uploadedFiles = await Promise.all(
                        acceptedFiles.map(async (file) => {
                          const formData = new FormData();
                          formData.append("files", file);
                          return await TaskServiceWrapper.uploadFile({
                            formData: { files: [file] },
                            taskId: taskIdValue !== 0 ? taskIdValue : undefined, // Se for 0, não enviar
                          });
                        }),
                      );

                      form.setValue(
                        "file",
                        [
                          ...form.getValues("file"),
                          ...uploadedFiles.flat().map((file) => ({ id: file.id, src: file.file })),
                        ],
                        { shouldDirty: true }, // Marca o formulário como modificado
                      );

                      toast.success("Arquivos enviados com sucesso!");
                    } catch (error) {
                      console.error("Erro ao enviar arquivos:", error);
                      toast.error("Falha no upload dos arquivos.");
                    }
                  };

                  // Configuração do Dropzone
                  const { getRootProps, getInputProps, isDragActive } = useDropzone({
                    onDrop,
                    multiple: false,
                    accept: {
                      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc", ".docx"],
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xls", ".xlsx"],
                      "text/plain": [".txt"],
                    },
                  });

                  return (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Carregar Arquivo</FormLabel>

                      {!preview && !fileName && (
                        <FormControl>
                          <div
                            {...getRootProps()}
                            className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center ${
                              isDragActive ? "border-gray-500 bg-gray-100" : "border-gray-300"
                            }`}
                          >
                            <input {...getInputProps()} />
                            <UploadCloudIcon className="mx-auto h-10 w-10 text-gray-400" />
                            <p className="text-gray-600">
                              Arraste e solte um arquivo aqui ou clique para selecionar
                            </p>
                          </div>
                        </FormControl>
                      )}

                      {/* Exibir o preview da imagem com link para tela cheia */}
                      {preview && (
                        <div className="group relative flex h-full min-h-[100px] w-full flex-row items-start justify-center overflow-hidden rounded-md md:min-h-[200px]">
                          <a>
                            <img
                              src={preview}
                              alt="Pré-visualização"
                              className="h-32 w-auto cursor-pointer rounded-md shadow"
                            />
                          </a>
                          <Button
                            className="absolute top-0 right-0"
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (Array.isArray(field.value)) {
                                const fileToDelete = field.value.find(
                                  (f) => typeof f === "object" && "id" in f,
                                );
                                if (fileToDelete && fileToDelete.id) {
                                  deleteFileMutation.mutate(fileToDelete.id); // ✅ Agora chamamos o backend para excluir o arquivo real
                                }
                              }

                              setPreview(null);
                              setFileName(null);
                              field.onChange(
                                (field.value ?? []).filter((f) => {
                                  if (f instanceof File) {
                                    return f.name !== fileName; // ✅ Compara arquivos temporários pelo nome
                                  }
                                  if (typeof f === "object" && "src" in f) {
                                    return f.src !== preview; // ✅ Compara arquivos salvos pela URL
                                  }
                                  return true;
                                }),
                              );
                            }}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      )}

                      {/* Exibir o nome do arquivo com link para tela cheia para arquivos não visuais */}
                      {fileName && !preview && (
                        <div className="flex items-center justify-between rounded-md border p-2">
                          <a
                            href={
                              field.value && typeof field.value === "object" && "src" in field.value
                                ? (field.value as { src: string }).src
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            {fileName}
                          </a>
                          <Button
                            className="absolute top-0 right-0"
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (Array.isArray(field.value)) {
                                const fileToDelete = field.value.find(
                                  (f) => typeof f === "object" && "id" in f,
                                );
                                if (fileToDelete && fileToDelete.id) {
                                  deleteFileMutation.mutate(fileToDelete.id); // ✅ Agora chamamos o backend para excluir o arquivo real
                                }
                              }

                              setPreview(null);
                              setFileName(null);
                              field.onChange(
                                (field.value ?? []).filter((f) => {
                                  if (f instanceof File) {
                                    return f.name !== fileName; // ✅ Compara arquivos temporários pelo nome
                                  }
                                  if (typeof f === "object" && "src" in f) {
                                    return f.src !== preview; // ✅ Compara arquivos salvos pela URL
                                  }
                                  return true;
                                }),
                              );
                            }}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            <DrawerFooter className="flex-row p-0">
              {!!taskId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask.mutate({ taskId })}
                  disabled={isPending}
                >
                  <ArchiveIcon className="size-4" />
                </Button>
              )}
              <Button
                className="ml-auto"
                variant="brand"
                disabled={isPending || (!form.formState.isDirty && !taskId)}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : taskId ? "Salvar" : "Criar"}
              </Button>
            </DrawerFooter>
          </form>
          {isLoading && <TaskSkeleton />}
        </DrawerContent>
      </Form>
    </Drawer>
  );
}

function TaskSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Skeleton className="h-12" />
      <Skeleton className="h-[300px]" />
      <div className="mt-auto flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="ml-auto h-10 w-[75px]" />
      </div>
    </div>
  );
}
function customUseEffect(
  arg0: () => void,
  arg1: (
    | number
    | import("@/services").DetailTaskSchema
    | import("react-hook-form").UseFormReturn<
        {
          title: string;
          status: "PENDING" | "IN_PROGRESS" | "DONE";
          description: string;
          tags: { id: string; text: string }[];
          expected_date?: Date | null | undefined;
          file?: File | { id: number; src: string } | null | undefined;
        },
        any,
        undefined
      >
    | null
    | undefined
  )[],
) {
  throw new Error("Function not implemented.");
}