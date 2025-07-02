<<<<<<< HEAD
import type { Project, ProjectsResponse, ProjectType, ProjectStatus } from '../types/project';
=======
import type { Project, ProjectsResponse, ProjectType, ProjectStatus, ProjectBankAccount } from '../types/project';
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
import { baseApi } from './api';

type ProjectsQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  status?: string;
  from?: string;
<<<<<<< HEAD
=======
  filter?:string;
  sort?:string;
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
};

type ProjectOptions = {
  types: ProjectType[];
  statuses: ProjectStatus[];
};

export const projectsApi = baseApi.enhanceEndpoints({
<<<<<<< HEAD
  addTagTypes: ['Projects']
=======
  addTagTypes: ['Projects', 'ProjectTypes', 'ProjectStatuses', 'ProjectBankAccounts']
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
}).injectEndpoints({
  endpoints: (builder) => ({
    getProjectFormOptions: builder.query<any, void>({
      query: () => '/projects/create',
    }),
    addProject: builder.mutation<any, any>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
    }),
    getProjects: builder.query<ProjectsResponse, ProjectsQueryParams>({
      query: (params) => ({
        url: '/projects',
        params,
      }),
      providesTags: ['Projects'],
    }),
<<<<<<< HEAD
    getProject: builder.query<Project, string>({
=======
    getProject: builder.query<Project, number>({
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
      query: (id) => `/projects/${id}`,
    }),
    getProjectOptions: builder.query<ProjectOptions, void>({
      query: () => '/projects/options',
    }),
    updateProject: builder.mutation<Project, Partial<Project> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/projects/${Number(id)}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: '/projects/bulk-delete',
        method: 'DELETE',
        body: { project_ids: [id] },
      }),
      invalidatesTags: ['Projects'],
    }),
    bulkDeleteProjects: builder.mutation<{ message: string }, number[]>({
      query: (ids) => ({
        url: '/projects/bulk-delete',
        method: 'DELETE',
        body: { project_ids: ids },
      }),
      invalidatesTags: ['Projects'],
    }),
<<<<<<< HEAD
=======
    getProjectTypes: builder.query<ProjectType[], void>({
      query: () => '/project-types',
      providesTags: ['ProjectTypes'],
    }),
    getProjectType: builder.query<ProjectType, number>({
      query: (id) => `/project-types/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProjectTypes', id }],
    }),
    createProjectType: builder.mutation<ProjectType, Partial<ProjectType>>({
      query: (body) => ({
        url: '/project-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProjectTypes'],
    }),
    updateProjectType: builder.mutation<ProjectType, { id: number; body: Partial<ProjectType> }>({
      query: ({ id, body }) => ({
        url: `/project-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ProjectTypes'],
    }),
    deleteProjectType: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/project-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectTypes'],
    }),
    getProjectStatuses: builder.query<ProjectStatus[], void>({
      query: () => '/project-statuses',
      providesTags: ['ProjectStatuses'],
    }),
    getProjectStatus: builder.query<ProjectStatus, number>({
      query: (id) => `/project-statuses/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProjectStatuses', id }],
    }),
    createProjectStatus: builder.mutation<ProjectStatus, Partial<ProjectStatus>>({
      query: (body) => ({
        url: '/project-statuses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProjectStatuses'],
    }),
    updateProjectStatus: builder.mutation<ProjectStatus, { id: number; body: Partial<ProjectStatus> }>({
      query: ({ id, body }) => ({
        url: `/project-statuses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ProjectStatuses'],
    }),
    deleteProjectStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/project-statuses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectStatuses'],
    }),
    getProjectBankAccounts: builder.query<ProjectBankAccount[], void>({
      query: () => '/project-bank-accounts',
      providesTags: ['ProjectBankAccounts'],
    }),
    getProjectBankAccount: builder.query<ProjectBankAccount, number>({
      query: (id) => `/project-bank-accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProjectBankAccounts', id }],
    }),
    createProjectBankAccount: builder.mutation<ProjectBankAccount, Partial<ProjectBankAccount>>({
      query: (body) => ({
        url: '/project-bank-accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProjectBankAccounts'],
    }),
    updateProjectBankAccount: builder.mutation<ProjectBankAccount, { id: number; body: Partial<ProjectBankAccount> }>({
      query: ({ id, body }) => ({
        url: `/project-bank-accounts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ProjectBankAccounts'],
    }),
    deleteProjectBankAccount: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/project-bank-accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectBankAccounts'],
    }),
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
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
<<<<<<< HEAD
  useGetProjectQuery 
=======
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
  useDeleteProjectBankAccountMutation
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
} = projectsApi;