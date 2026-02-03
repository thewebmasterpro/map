/**
 * Example of using pagination with React Query for tasks
 *
 * This file demonstrates how to implement server-side pagination
 * with React Query and the pagination components.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerPagination } from "./usePagination";
import { Pagination } from "../components/Pagination";
import { TaskListSkeleton } from "../components/Skeleton";
import { queryKeys } from "../lib/queryClient";

interface Task {
  id: string;
  title: string;
  status: string;
  // ... other fields
}

interface TasksResponse {
  items: Task[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Fetch tasks from API with pagination
 */
async function fetchTasks(page: number, pageSize: number): Promise<TasksResponse> {
  const response = await fetch(
    `/api/tasks?page=${page}&perPage=${pageSize}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

/**
 * Example component using paginated tasks
 */
export function TasksListExample() {
  // Server-side pagination state
  const pagination = useServerPagination(0, {
    initialPage: 1,
    initialPageSize: 20,
  });

  // Fetch tasks with React Query
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.tasks.list({
      page: pagination.currentPage,
      perPage: pagination.pageSize,
    }),
    queryFn: () => fetchTasks(pagination.currentPage, pagination.pageSize),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update pagination with server data
  const totalItems = data?.totalItems ?? 0;
  const tasks = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TaskListSkeleton count={pagination.pageSize} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-medium">Erreur de chargement</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Aucune tâche trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tasks list */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.status}</p>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={Math.ceil(totalItems / pagination.pageSize)}
        onPageChange={pagination.goToPage}
        pageSize={pagination.pageSize}
        totalItems={totalItems}
        onPageSizeChange={pagination.setPageSize}
        showPageSize
        showInfo
        className="mt-6 pt-4 border-t border-gray-200"
      />
    </div>
  );
}

/**
 * Example with client-side pagination (for smaller datasets)
 */
import { usePagination } from "./usePagination";

export function ClientSidePaginationExample({ tasks }: { tasks: Task[] }) {
  const {
    paginatedItems,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    goToPage,
    setPageSize,
  } = usePagination(tasks, {
    initialPageSize: 20,
  });

  return (
    <div className="space-y-4">
      {/* Tasks list */}
      <div className="space-y-3">
        {paginatedItems.map(task => (
          <div
            key={task.id}
            className="p-4 bg-white border border-gray-200 rounded-lg"
          >
            <h3 className="font-medium">{task.title}</h3>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
