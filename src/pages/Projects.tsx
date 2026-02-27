import { useState, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { FolderGit2, CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';

const defaultForm = () => ({
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  status: 'ongoing' as 'ongoing' | 'completed',
});

export function Projects() {
  const projects = useStore((s) => s.projects);
  const addProject = useStore((s) => s.addProject);
  const updateProject = useStore((s) => s.updateProject);
  const updateProjectStatus = useStore((s) => s.updateProjectStatus);
  const deleteProject = useStore((s) => s.deleteProject);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm());

  const openAdd = () => {
    setEditingId(null);
    setFormData(defaultForm());
    setIsModalOpen(true);
  };

  const openEdit = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setEditingId(id);
    setFormData({
      title: project.title,
      description: project.description,
      date: new Date(project.date).toISOString().split('T')[0],
      status: project.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const payload = { ...formData, date: new Date(formData.date).toISOString() };
    if (editingId) {
      updateProject(editingId, payload);
    } else {
      addProject(payload);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm());
  };

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      <PageHeader
        title="Projects"
        subtitle="Showcase what you've built."
        actionLabel="New Project"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Personal Website, ML Model..."
          />

          <Textarea
            label="Description"
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What did you build and what technologies did you use?"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ongoing' | 'completed' })}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteProject(deleteId);
          setDeleteId(null);
        }}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedProjects.length > 0 ? (
          sortedProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-zinc-100">{project.title}</h3>
                    <p className="text-xs font-mono text-zinc-500 mt-1">
                      {format(new Date(project.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(project.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      aria-label={`Edit ${project.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(project.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      updateProjectStatus(project.id, project.status === 'ongoing' ? 'completed' : 'ongoing')
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors',
                      project.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    )}
                  >
                    {project.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {project.status}
                  </button>
                </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed flex-1">{project.description}</p>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={FolderGit2}
              message="No projects added yet. Start building!"
              actionLabel="Create your first project"
              onAction={openAdd}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
