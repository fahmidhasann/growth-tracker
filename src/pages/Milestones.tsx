import { useState, useMemo, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { Trophy, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

const defaultForm = () => ({
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
});

export function Milestones() {
  const milestones = useStore((s) => s.milestones);
  const mutating = useStore((s) => s.mutating);
  const addMilestone = useStore((s) => s.addMilestone);
  const updateMilestone = useStore((s) => s.updateMilestone);
  const deleteMilestone = useStore((s) => s.deleteMilestone);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm());

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
    const milestone = milestones.find((m) => m.id === id);
    if (!milestone) return;
    setEditingId(id);
    setFormData({
      title: milestone.title,
      description: milestone.description ?? '',
      date: new Date(milestone.date).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      description: formData.description || undefined,
    };
    if (editingId) {
      updateMilestone(editingId, payload);
    } else {
      addMilestone(payload);
    }
    closeModal();
  };

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [milestones]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      <PageHeader
        title="Milestones"
        subtitle="Record major wins and keep them readable in both timeline and card views."
        actionLabel="Add Milestone"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Milestone' : 'New Milestone'}
        description="Use milestones for achievements that deserve to stand out in your history."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="milestone-form" loading={mutating}>
              {editingId ? 'Update Milestone' : 'Save Milestone'}
            </Button>
          </div>
        }
      >
        <form id="milestone-form" onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Milestone Title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Completed first ML course, Built first app..."
            hint="Titles work best when they can stand alone in the timeline."
          />

          <Textarea
            label="Description (Optional)"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add some details about this achievement..."
          />

          <Input
            label="Date Achieved"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMilestone(deleteId);
          setDeleteId(null);
        }}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
      />

      <div className="space-y-6">
        {sortedMilestones.length > 0 ? (
          <>
            <div className="space-y-4 md:hidden">
              {sortedMilestones.map((milestone, i) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="gt-panel rounded-[1.75rem] p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-[var(--warning)]">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{milestone.title}</h3>
                        <p className="mt-1 text-xs font-mono text-[var(--text-soft)]">
                          {format(new Date(milestone.date), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(milestone.id)}
                        className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                        aria-label={`Edit ${milestone.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(milestone.id)}
                        className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--danger)]"
                        aria-label={`Delete ${milestone.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {milestone.description ? (
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{milestone.description}</p>
                  ) : null}
                </motion.div>
              ))}
            </div>

            <div className="relative hidden pl-8 before:absolute before:bottom-0 before:left-3 before:top-4 before:w-px before:bg-[var(--border-subtle)] md:block">
              {sortedMilestones.map((milestone, i) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="relative mb-8 last:mb-0"
                >
                  <div className="absolute -left-8 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--warning)] shadow-[var(--shadow-soft)]">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <div className="gt-panel relative overflow-hidden rounded-[1.75rem] p-6">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)]">{milestone.title}</h3>
                        <p className="mt-2 text-xs font-mono text-[var(--text-soft)]">
                          {format(new Date(milestone.date), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(milestone.id)}
                          className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                          aria-label={`Edit ${milestone.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(milestone.id)}
                          className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--danger)]"
                          aria-label={`Delete ${milestone.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {milestone.description ? (
                      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{milestone.description}</p>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Trophy}
            message="No milestones yet. Keep learning and you'll get there!"
            actionLabel="Add your first milestone"
            onAction={openAdd}
          />
        )}
      </div>
    </motion.div>
  );
}
