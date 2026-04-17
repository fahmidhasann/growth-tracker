import { useState, useMemo, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getMoodEmoji, getMoodLabel } from '../lib/constants';
import { motion } from 'motion/react';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

const defaultForm = () => ({
  date: new Date().toISOString().split('T')[0],
  learned: '',
  built: '',
  challenges: '',
  mood: 3,
});

export function Logs() {
  const logs = useStore((s) => s.logs);
  const mutating = useStore((s) => s.mutating);
  const addLog = useStore((s) => s.addLog);
  const updateLog = useStore((s) => s.updateLog);
  const deleteLog = useStore((s) => s.deleteLog);

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
    const log = logs.find((l) => l.id === id);
    if (!log) return;
    setEditingId(id);
    setFormData({
      date: new Date(log.date).toISOString().split('T')[0],
      learned: log.learned,
      built: log.built,
      challenges: log.challenges,
      mood: log.mood,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...formData, date: new Date(formData.date).toISOString() };
    if (editingId) {
      updateLog(editingId, payload);
    } else {
      addLog(payload);
    }
    closeModal();
  };

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [logs]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      <PageHeader
        title="Learning Logs"
        subtitle="Capture what you learned, built, and struggled with in one place."
        actionLabel="New Entry"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Log Entry' : 'New Log Entry'}
        maxWidth="max-w-2xl"
        description="Use this entry to capture what moved forward and how the work felt."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="log-form" loading={mutating}>
              {editingId ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        }
      >
        <form id="log-form" onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            hint="Entries are sorted by this date on your timeline."
          />

          <Textarea
            label="What did you learn?"
            required
            rows={3}
            value={formData.learned}
            onChange={(e) => setFormData({ ...formData, learned: e.target.value })}
            placeholder="e.g. Learned about neural networks and backpropagation..."
          />

          <Textarea
            label="What did you build?"
            required
            rows={3}
            value={formData.built}
            onChange={(e) => setFormData({ ...formData, built: e.target.value })}
            placeholder="e.g. Built a simple linear regression model in PyTorch..."
          />

          <Textarea
            label="What challenges did you face?"
            required
            rows={3}
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            placeholder="e.g. Struggled with understanding tensor shapes..."
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4">
              How did you feel? (Energy/Mood)
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: level })}
                  className={cn(
                    'gt-panel-soft flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl px-3 py-3 text-center transition-all',
                    formData.mood === level
                      ? 'border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'
                  )}
                  aria-pressed={formData.mood === level}
                >
                  <span className="text-xl">{getMoodEmoji(level)}</span>
                  <span className="text-xs font-medium">{getMoodLabel(level)}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteLog(deleteId);
          setDeleteId(null);
        }}
        title="Delete Log Entry"
        message="Are you sure you want to delete this log entry? This action cannot be undone."
      />

      <div className="space-y-6">
        {sortedLogs.length > 0 ? (
          sortedLogs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="gt-panel rounded-[1.75rem] p-5 sm:p-6"
            >
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Entry</p>
                  <div className="font-mono text-sm tracking-wider text-[var(--text-muted)]">
                  {format(new Date(log.date), 'MMMM dd, yyyy')}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(log.id)}
                      className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                      aria-label="Edit log entry"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(log.id)}
                      className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--danger)]"
                      aria-label="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
                        Mood
                      </span>
                      <span className="text-lg">{getMoodEmoji(log.mood)}</span>
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {getMoodLabel(log.mood)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Learned
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{log.learned}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Built
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{log.built}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Challenges
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{log.challenges}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={BookOpen}
            message="No logs yet. Start tracking your journey!"
            actionLabel="Create your first log"
            onAction={openAdd}
          />
        )}
      </div>
    </motion.div>
  );
}
