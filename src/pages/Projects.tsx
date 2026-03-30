import { useState, useMemo, type FormEvent } from 'react';
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

type StatusFilter = 'all' | 'ongoing' | 'completed';

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm());
  };

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
    closeModal();
  };

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [projects]
  );

  const filteredProjects = useMemo(
    () =>
      statusFilter === 'all'
        ? sortedProjects
        : sortedProjects.filter((p) => p.status === statusFilter),
    [sortedProjects, statusFilter]
  );

  const ongoingCount = useMemo(() => projects.filter((p) => p.status === 'ongoing').length, [projects]);
  const completedCount = useMemo(() => projects.filter((p) => p.status === 'completed').length, [projects]);

  const filterOptions: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'All', value: 'all', count: projects.length },
    { label: 'Ongoing', value: 'ongoing', count: ongoingCount },
    { label: 'Completed', value: 'completed', count: completedCount },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      <PageHeader
        title="Projects"
        subtitle="Keep the projects list focused, readable, and easy to update from any device."
        actionLabel="New Project"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Project' : 'New Project'}
        description="Add a concise summary so project cards stay useful at a glance."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="project-form">
              {editingId ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        }
      >
        <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Personal Website, ML Model..."
            hint="Short titles make the project grid easier to scan."
          />

          <Textarea
            label="Description"
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What did you build and what technologies did you use?"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                statusFilter === opt.value
                  ? 'gt-panel text-[var(--text-primary)]'
                  : 'bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {opt.label}
              <span className={cn(
                'rounded-full px-2 py-0.5 font-mono text-[11px]',
                statusFilter === opt.value
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                  : 'text-[var(--text-soft)]'
              )}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="gt-panel flex h-full flex-col rounded-[1.75rem] p-5"
            >
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{project.title}</h3>
                    <p className="mt-1 text-xs font-mono text-[var(--text-soft)]">
                      {format(new Date(project.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(project.id)}
                      className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                      aria-label={`Edit ${project.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(project.id)}
                      className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--danger)]"
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
                      'flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors',
                      project.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/16'
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/16'
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

              <div className="flex flex-1 flex-col gap-4">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{project.description}</p>
                <div className="mt-auto rounded-[1.5rem] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  {project.status === 'completed'
                    ? 'Marked as completed. Tap the badge if the project becomes active again.'
                    : 'Active project. Tap the badge when you want to mark it completed.'}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                message="No projects added yet. Start building!"
                actionLabel="Create your first project"
                onAction={openAdd}
              />
            ) : (
              <div className="py-16 text-center text-sm text-[var(--text-muted)]">
                No {statusFilter} projects found.
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
