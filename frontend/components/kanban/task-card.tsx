"use client";

import { TaskSchema } from "@/services";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryState } from "nuqs";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TaskCardProps = {
  task: TaskSchema;
  isOverlay?: boolean;
};

export const TaskCard = memo(({ task, isOverlay }: TaskCardProps) => {
  const [_, setTaskId] = useQueryState("t");

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  // 🔹 Função para limpar HTML da descrição e limitar caracteres
  const cleanDescription = (desc: string) => {
    if (!desc) return "Sem descrição";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = desc;
    const cleanText = tempDiv.textContent || tempDiv.innerText || "Sem descrição";
    return cleanText.length > 15 ? `${cleanText.slice(0, 15)}...` : cleanText;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col overflow-hidden rounded-lg border transition-colors 
        bg-card text-card-foreground border-border hover:bg-muted 
        ${isOverlay ? "ring-2 ring-primary" : isDragging ? "opacity-30 ring-2" : ""}`}
      onClick={() => setTaskId(task.id.toString())}
    >
      <CardContent className="p-0 relative">
        {/* 🔹 Barra de arrasto sempre visível e sobreposta */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 h-full w-2 cursor-grab bg-muted/60 hover:bg-muted/80 z-[5]"
        />

        <div className="flex">
          {/* 🔹 Avatar do usuário - Quadrado e maior */}
          <div className="flex-shrink-0 w-20 h-20 bg-muted border-r border-border flex items-center justify-center">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={task.created_by.image ?? ""} />
              <AvatarFallback className="text-sm">{task.created_by.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>

          {/* 🔹 Título, Descrição e Data de Conclusão */}
          <div className="flex flex-col flex-grow p-3 border-b border-border">
            <span className="text-sm font-medium">{task.title}</span>
            <p className="text-xs text-muted-foreground">{cleanDescription(task.description)}</p>
            {task.expected_date && (
              <span className="text-xs text-gray-400">
                Concluir até: {new Date(task.expected_date).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
        </div>

        {/* 🔹 Data e Tags */}
        <div className="flex flex-col p-3 border-t border-border z-[1]">
          {!!task.tags?.length && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} className="rounded-md text-xs bg-orange-600 text-white px-2 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground mt-2">
            Criado em: {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

TaskCard.displayName = "TaskCard";
