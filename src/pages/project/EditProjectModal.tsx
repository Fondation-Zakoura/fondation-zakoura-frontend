import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useUpdateProjectMutation, useGetProjectFormOptionsQuery } from '@/features/api/projectsApi';
import type { Project } from '@/features/types/project';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project }) => {
  const { data: formOptions, isLoading: optionsLoading } = useGetProjectFormOptionsQuery();
  const [updateProject, { isLoading }] = useUpdateProjectMutation();
  const [form, setForm] = useState({
    project_name: project.title || '',
    project_type_id: project.type_id ? String(project.type_id) : '',
    project_status_id: project.status_id ? String(project.status_id) : '',
    start_date: project.start_date ? project.start_date.slice(0, 10) : '',
    end_date: project.end_date ? project.end_date.slice(0, 10) : '',
    total_budget: project.budget ? String(project.budget) : '',
    notes: project.description || '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setForm({
        project_name: project.title || '',
        project_type_id: project.type_id ? String(project.type_id) : '',
        project_status_id: project.status_id ? String(project.status_id) : '',
        start_date: project.start_date ? project.start_date.slice(0, 10) : '',
        end_date: project.end_date ? project.end_date.slice(0, 10) : '',
        total_budget: project.budget ? String(project.budget) : '',
        notes: project.description || '',
      });
    }
  }, [project]);

  if (!isOpen) return null;

  const projectTypes = formOptions?.project_types || formOptions?.types || [];
  const projectStatuses = formOptions?.project_statuses || formOptions?.statuses || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        id: project.id,
        project_name: form.project_name,
        project_type_id: form.project_type_id ? Number(form.project_type_id) : undefined,
        project_status_id: form.project_status_id ? Number(form.project_status_id) : undefined,
        start_date: form.start_date,
        end_date: form.end_date,
        total_budget: form.total_budget ? Number(form.total_budget) : undefined,
        notes: form.notes,
      };
      await updateProject(payload).unwrap();
      onClose();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du projet.');
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="relative z-[1001] bg-white shadow-2xl w-full max-w-lg rounded-3xl overflow-y-auto max-h-[95vh] border border-gray-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-blue-900">Modifier le projet <span className="text-blue-600">{form.project_name}</span></h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition"><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        {optionsLoading || !formOptions ? (
          <div className="p-12 text-center text-lg font-semibold text-blue-900">Chargement des options du projet...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-8 py-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="project_name">Nom du projet</label>
                <Input id="project_name" name="project_name" type="text" value={form.project_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="project_type_id">Type de projet</label>
                <Select value={form.project_type_id} onValueChange={value => handleSelectChange('project_type_id', value)} required>
                  <SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="project_status_id">Statut du projet</label>
                <Select value={form.project_status_id} onValueChange={value => handleSelectChange('project_status_id', value)} required>
                  <SelectTrigger><SelectValue placeholder="Sélectionner le statut" /></SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="start_date">Date de lancement</label>
                <Input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="end_date">Date de clôture</label>
                <Input id="end_date" name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="total_budget">Budget total</label>
                <Input id="total_budget" name="total_budget" type="number" value={form.total_budget} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="notes">Notes et/ou observation</label>
                <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={3} />
              </div>
            </div>
            {error && <p className="text-red-500 text-center font-semibold mt-2">{error}</p>}
            <div className="flex flex-col md:flex-row justify-end gap-4 mt-6">
              <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold shadow border border-gray-300 transition">Annuler</button>
              <button type="submit" disabled={isLoading} className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow transition">
                {isLoading ? 'Mise à jour...' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default EditProjectModal; 