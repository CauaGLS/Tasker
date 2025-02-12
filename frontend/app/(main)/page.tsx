"use client";

import { TasksService } from "@/services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TagInput } from "emblor";
import { Filter, FilterX, KanbanIcon, SheetIcon } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { AddTask } from "@/components/add-task";
import { Kanban } from "@/components/kanban";
import { List } from "@/components/list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusDot } from "@/components/ui/status-dot";

import { STATUS } from "@/lib/labels";

export default function Home() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [view, setView] = useQueryState("v", parseAsString.withDefault("kanban"));
  const [status, setStatus] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [tags, setTags] = useQueryState("tags", parseAsArrayOf(parseAsString));

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: TasksService.getTasks,
  });

  const mutation = useMutation({
    mutationFn: TasksService.updateTask,
  });

  const filteredTasks = useMemo(() => {
    return (
      tasks
        ?.filter((task) => task.title.toLowerCase().includes(search?.toLowerCase()))
        ?.filter((task) => task.tags?.some((tag) => tags?.includes(tag)) || !tags?.length)
        ?.filter((task) => status?.includes(task.status) || !status?.length) ?? []
    );
  }, [tasks, search, tags, status]);

  // 🔹 Estado inicial dos filtros agora começa como **fechado**
  const [filtersVisible, setFiltersVisible] = useState(false);

  // 🔹 Função para alternar os filtros e limpar os campos ao fechar
  const toggleFilters = () => {
    if (filtersVisible) {
      setSearch(""); // 🔹 Limpa a pesquisa
      setTags([]); // 🔹 Limpa as tags
      setStatus([]); // 🔹 Limpa os status
    }
    setFiltersVisible(!filtersVisible);
  };

  return (
    <>
      <h1 className="flex items-center gap-1 text-2xl font-bold">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <span className="mr-auto">Tarefas</span>
      </h1>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 rounded-md bg-input/50 p-0.5">
            <RadioGroup
              value={view}
              onValueChange={setView}
              className="group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-background after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full"
              data-state={view === "list" ? "on" : "off"}
            >
              <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=on]:text-muted-foreground/70">
                <KanbanIcon className="size-4" />
                <RadioGroupItem value="kanban" className="sr-only" />
              </label>
              <label className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=off]:text-muted-foreground/70">
                <SheetIcon className="size-4" />
                <RadioGroupItem value="list" className="sr-only" />
              </label>
            </RadioGroup>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="transition-transform"
            onClick={toggleFilters}
          >
            {filtersVisible ? <FilterX className="size-5" /> : <Filter className="size-5" />}
          </Button>

          <div
            className={`flex gap-2 transition-all duration-300 ${
              filtersVisible ? "opacity-100 translate-x-0 flex" : "opacity-0 translate-x-10 hidden"
            }`}
          >
            <Input
              className="min-w-[150px] md:max-w-[200px]"
              placeholder="Pesquisar"
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="w-full md:w-fit">
              <TagInput
                tags={tags?.map((tag) => ({ id: tag, text: tag })) ?? []} // @ts-ignore
                setTags={(t) => setTags(t.map((tag) => tag.text))}
                placeholder="Filtrar tags"
                styleClasses={{
                  inlineTagsContainer: "h-10 flex-nowrap ",
                  tag: {
                    body: "pl-3 h-6",
                  },
                }}
                size="sm"
                activeTagIndex={0}
                setActiveTagIndex={() => {}}
              />
            </div>
            <MultiSelect
              className="w-full min-w-[150px] md:max-w-[200px]"
              placeholder="Status"
              options={STATUS.map((e) => ({
                value: e.value,
                label: <StatusDot variant={e.value} className="[&>svg]:!size-3" />,
              }))}
              selectedValues={status ?? []}
              onSelectChange={setStatus}
            />
          </div>
        </div>

        <AddTask />
      </div>

      {view === "kanban" ? (
        <Kanban
          tasks={filteredTasks ?? []}
          isLoading={isLoading}
          onValueChange={(taskId, status, order) => {
            const task = tasks?.find((task) => task.id === taskId);
            if (!task) return;

            mutation.mutate({ taskId, requestBody: { status, order } });
          }}
        />
      ) : (
        <List tasks={filteredTasks ?? []} isLoading={isLoading} />
      )}
    </>
  );
}
