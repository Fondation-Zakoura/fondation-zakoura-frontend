import type { Project, ProjectsResponse, ProjectType, ProjectStatus } from '../types/project';
import { baseApi } from './api';

type ProjectsQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  status?: string;
  from?: string;
};

type ProjectOptions = {
  types: ProjectType[];
  statuses: ProjectStatus[];
};

export const projectsApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Projects']
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
    getProject: builder.query<Project, string>({
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
  useGetProjectQuery 
} = projectsApi;