import type { Partner } from "../types/partners";
import type {
  Project,
  ProjectBankAccount,
  ProjectsResponse,
  ProjectStatus,
  ProjectType,
  User,
} from "../types/project";
import { baseApi } from "./api";

type ProjectsQueryParams = {
  page?: number;
  perPage?: number;
  project_name?: string;
  project_type_id?: string;
  project_status_id?: string;
  project_nature?: string;
  is_active?: string;
  partner_name?: string;
  [key: string]: any;
};

type ProjectOptions = {
  types: ProjectType[];
  statuses: ProjectStatus[];
  partners: Partner[];
  partner_roles: [];
  users: User[];
  project_nature_options: [];
};

export const projectsApi = baseApi
  .enhanceEndpoints({
    addTagTypes: [
      "Projects",
      "ProjectTypes",
      "ProjectStatuses",
      "ProjectBankAccounts",
    ],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getProjectFormOptions: builder.query<any, void>({
        query: () => "/projects/options",
      }),
      addProject: builder.mutation<any, any>({
        query: (body) => ({
          url: "/projects",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Projects"],
      }),
      getProjects: builder.query<ProjectsResponse, ProjectsQueryParams>({
        query: (params = {}) => {
          const { page = 1, perPage = 10, ...filters } = params;
          const searchParams = new URLSearchParams({
            page: String(page),
            per_page: String(perPage),
            ...Object.fromEntries(
              Object.entries(filters)
                .filter(([_, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : String(v)])
            )
          });
          return `/projects?${searchParams.toString()}`;
        },
        providesTags: ["Projects"],
      }),
      getProject: builder.query<Project, number>({
        query: (id) => `/projects/${id}`,
      }),
      getProjectOptions: builder.query<ProjectOptions, void>({
        query: () => "/projects/create",
      }),
      updateProject: builder.mutation<
        Project,
        Partial<Project> & { id: number }
      >({
        query: ({ id, ...patch }) => ({
          url: `/projects/${Number(id)}`,
          method: "PUT",
          body: patch,
        }),
        invalidatesTags: ["Projects"],
      }),
      deleteProject: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: "/projects/bulk-delete",
          method: "DELETE",
          body: { project_ids: [id] },
        }),
        invalidatesTags: ["Projects"],
      }),
      bulkDeleteProjects: builder.mutation<{ message: string }, number[]>({
        query: (ids) => ({
          url: "/projects/bulk-delete",
          method: "DELETE",
          body: { project_ids: ids },
        }),
        invalidatesTags: ["Projects"],
      }),
      restoreProject: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: `/projects/${id}/restore`,
          method: "PUT",
        }),
        invalidatesTags: ["Projects"],
      }),
      getProjectTypes: builder.query<ProjectType[], void>({
        query: () => "/project-types",
        providesTags: ["ProjectTypes"],
      }),
      getProjectType: builder.query<ProjectType, number>({
        query: (id) => `/project-types/${id}`,
        providesTags: (_result, _error, id) => [{ type: "ProjectTypes", id }],
      }),
      createProjectType: builder.mutation<ProjectType, Partial<ProjectType>>({
        query: (body) => ({
          url: "/project-types",
          method: "POST",
          body,
        }),
        invalidatesTags: ["ProjectTypes"],
      }),
      updateProjectType: builder.mutation<
        ProjectType,
        { id: number; body: Partial<ProjectType> }
      >({
        query: ({ id, body }) => ({
          url: `/project-types/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["ProjectTypes"],
      }),
      deleteProjectType: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: `/project-types/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ProjectTypes"],
      }),
      getProjectStatuses: builder.query<ProjectStatus[], void>({
        query: () => "/project-statuses",
        providesTags: ["ProjectStatuses"],
      }),
      getProjectStatus: builder.query<ProjectStatus, number>({
        query: (id) => `/project-statuses/${id}`,
        providesTags: (_result, _error, id) => [{ type: "ProjectStatuses", id }],
      }),
      createProjectStatus: builder.mutation<
        ProjectStatus,
        Partial<ProjectStatus>
      >({
        query: (body) => ({
          url: "/project-statuses",
          method: "POST",
          body,
        }),
        invalidatesTags: ["ProjectStatuses"],
      }),
      updateProjectStatus: builder.mutation<
        ProjectStatus,
        { id: number; body: Partial<ProjectStatus> }
      >({
        query: ({ id, body }) => ({
          url: `/project-statuses/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["ProjectStatuses"],
      }),
      deleteProjectStatus: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: `/project-statuses/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ProjectStatuses"],
      }),
      getProjectBankAccounts: builder.query<
        | { data: ProjectBankAccount[]; total: number; per_page: number; current_page: number }
        | ProjectBankAccount[],
        { filters?: Record<string, string | undefined> }
      >({
        query: (args = {}) => {
          const params: Record<string, string> = {};
          if (args.filters) {
            Object.entries(args.filters).forEach(([key, value]) => {
              if (value !== undefined && value !== "") {
                params[key] = value;
              }
            });
          }
          
          // Debug: Log the parameters being sent to the backend
          console.log('Backend API Parameters:', params);
          
          return {
            url: "/project-bank-accounts",
            params,
          };
        },
        transformResponse: (response: any) => {
          // If response is an array, wrap it in a paginated object
          if (Array.isArray(response)) {
            return {
              data: response,
              total: response.length,
              per_page: response.length,
              current_page: 1,
            };
          }
          return response;
        },
        providesTags: ["ProjectBankAccounts"],
      }),
      getProjectBankAccount: builder.query<ProjectBankAccount, number>({
        query: (id) => `/project-bank-accounts/${id}`,
        providesTags: (_result, _error, id) => [
          { type: "ProjectBankAccounts", id },
        ],
      }),
      createProjectBankAccount: builder.mutation<
        ProjectBankAccount,
        Partial<ProjectBankAccount>
      >({
        query: (body) => ({
          url: "/project-bank-accounts",
          method: "POST",
          body,
        }),
        invalidatesTags: ["ProjectBankAccounts"],
      }),
      updateProjectBankAccount: builder.mutation<
        ProjectBankAccount,
        { id: number; body: Partial<ProjectBankAccount> }
      >({
        query: ({ id, body }) => ({
          url: `/project-bank-accounts/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["ProjectBankAccounts"],
      }),
      deleteProjectBankAccount: builder.mutation<{ message: string }, number>({
        query: (id) => ({
          url: `/project-bank-accounts/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ProjectBankAccounts"],
      }),
      updateBankAccountSupportingDocument: builder.mutation<
        ProjectBankAccount,
        { id: number; formData: FormData }
      >({
        query: ({ id, formData }) => ({
          url: `/bank-accounts/${id}/supporting-document`,
          method: "POST",
          body: formData,
        }),
        invalidatesTags: ["ProjectBankAccounts"],
      }),
      bulkDeleteProjectBankAccounts: builder.mutation<{ message: string }, number[]>({
        query: (ids) => ({
          url: "/project-bank-accounts/bulk-delete",
          method: "POST",
          body: { ids },
        }),
        invalidatesTags: ["ProjectBankAccounts"],
      }),
      restoreProjectBankAccount: builder.mutation<ProjectBankAccount, number>({
        query: (id) => ({
          url: `/project-bank-accounts/${id}/restore`,
          method: "PUT",
        }),
        invalidatesTags: ["ProjectBankAccounts"],
      }),
      downloadBankAccountFile: builder.query<Blob, string>({
        query: (filename) => ({
          url: `/download-file/${filename}`,
          responseHandler: (response) => response.blob(),
        }),
      }),
    }),
    overrideExisting: false,
  });

export const {
  useGetProjectFormOptionsQuery,
  useAddProjectMutation,
  useGetProjectsQuery,
  useGetProjectOptionsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useBulkDeleteProjectsMutation,
  useRestoreProjectMutation,
  useGetProjectQuery,
  useGetProjectTypesQuery,
  useGetProjectTypeQuery,
  useCreateProjectTypeMutation,
  useUpdateProjectTypeMutation,
  useDeleteProjectTypeMutation,
  useGetProjectStatusesQuery,
  useGetProjectStatusQuery,
  useCreateProjectStatusMutation,
  useUpdateProjectStatusMutation,
  useDeleteProjectStatusMutation,
  useGetProjectBankAccountsQuery,
  useGetProjectBankAccountQuery,
  useCreateProjectBankAccountMutation,
  useUpdateProjectBankAccountMutation,
  useDeleteProjectBankAccountMutation,
  useUpdateBankAccountSupportingDocumentMutation,
  useBulkDeleteProjectBankAccountsMutation,
  useRestoreProjectBankAccountMutation,
  useDownloadBankAccountFileQuery,
} = projectsApi;
