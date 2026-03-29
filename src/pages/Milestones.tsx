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
  const addMilestone = useStore((s) => s.addMilestone);
  const updateMilestone = useStore((s) => s.updateMilestone);
  const deleteMilestone = useStore((s) => s.deleteMilestone);

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
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm());
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
        subtitle="Celebrate your big achievements."
        actionLabel="Add Milestone"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Milestone' : 'New Milestone'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Milestone Title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Completed first ML course, Built first app..."
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

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update Milestone' : 'Save Milestone'}
            </Button>
          </div>
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
          <div className="relative pl-8 before:absolute before:left-3 before:top-4 before:bottom-0 before:w-px before:bg-zinc-800">
            {sortedMilestones.map((milestone, i) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative mb-8 last:mb-0 group"
              >
                <div className="absolute -left-8 top-1.5 w-8 h-8 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center z-10">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-medium text-zinc-100">{milestone.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(milestone.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                          aria-label={`Edit ${milestone.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(milestone.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`Delete ${milestone.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                        {format(new Date(milestone.date), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  {milestone.description && (
                    <p className="text-zinc-400 text-sm leading-relaxed mt-4">{milestone.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
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
