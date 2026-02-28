import { useState, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getMoodEmoji } from '../lib/constants';
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
  const addLog = useStore((s) => s.addLog);
  const updateLog = useStore((s) => s.updateLog);
  const deleteLog = useStore((s) => s.deleteLog);

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
    setIsModalOpen(false);
    setFormData(defaultForm());
    setEditingId(null);
  };

  const sortedLogs = [...logs].sort(
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
        title="Learning Logs"
        subtitle="Record your weekly or monthly progress."
        actionLabel="New Entry"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Log Entry' : 'New Log Entry'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
            <label className="block text-sm font-medium text-zinc-400 mb-4">
              How did you feel? (Energy/Mood)
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: level })}
                  className={cn(
                    'flex-1 py-3 rounded-xl border transition-all text-center font-medium',
                    formData.mood === level
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  )}
                >
                  {getMoodEmoji(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update Entry' : 'Save Entry'}
            </Button>
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
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 md:p-8 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="font-mono text-sm text-zinc-500 tracking-wider">
                  {format(new Date(log.date), 'MMMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(log.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      aria-label="Edit log entry"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(log.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mood</span>
                    <span className="text-lg">{getMoodEmoji(log.mood)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 [.light_&]:text-emerald-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 [.light_&]:bg-emerald-600" />
                    Learned
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-sm">{log.learned}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-400 [.light_&]:text-blue-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 [.light_&]:bg-blue-600" />
                    Built
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-sm">{log.built}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-400 [.light_&]:text-amber-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 [.light_&]:bg-amber-600" />
                    Challenges
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-sm">{log.challenges}</p>
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
