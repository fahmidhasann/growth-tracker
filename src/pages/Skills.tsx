import { useState, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { PenTool, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { SKILL_LEVELS } from '../lib/constants';
import { motion } from 'motion/react';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const LEVEL_BAR_COLORS = [
  'bg-[var(--text-soft)]',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
];

export function Skills() {
  const skills = useStore((s) => s.skills);
  const mutating = useStore((s) => s.mutating);
  const addSkill = useStore((s) => s.addSkill);
  const updateSkillLevel = useStore((s) => s.updateSkillLevel);
  const updateSkillName = useStore((s) => s.updateSkillName);
  const deleteSkill = useStore((s) => s.deleteSkill);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', level: 1 });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', level: 1 });
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', level: 1 });
    setIsModalOpen(true);
  };

  const openEdit = (id: string) => {
    const skill = skills.find((s) => s.id === id);
    if (!skill) return;
    setEditingId(id);
    setFormData({ name: skill.name, level: skill.level });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingId) {
      updateSkillName(editingId, formData.name);
      updateSkillLevel(editingId, formData.level);
    } else {
      addSkill(formData);
    }
    closeModal();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8"
    >
      <PageHeader
        title="Skills"
        subtitle="Track how your proficiency changes over time and keep level updates easy to maintain."
        actionLabel="Add Skill"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Skill' : 'New Skill'}
        maxWidth="max-w-md"
        description="Add a skill once, then keep the level control current as your confidence changes."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="skill-form" loading={mutating}>
              {editingId ? 'Update Skill' : 'Add Skill'}
            </Button>
          </div>
        }
      >
        <form id="skill-form" onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Skill Name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Python, PyTorch, SQL..."
            hint="Keep names short so cards and charts stay readable."
          />

          <div>
            <label className="mb-4 block text-sm font-medium text-[var(--text-secondary)]">Current Level</label>
            <div className="space-y-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, level: level.value })}
                  className={cn(
                    'gt-panel-soft flex w-full items-center justify-between rounded-2xl px-4 py-3 transition-all',
                    formData.level === level.value
                      ? 'border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'
                  )}
                >
                  <span className="font-medium">{level.label}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          i < level.value ? 'bg-current' : 'bg-[var(--border-subtle)]'
                        )}
                      />
                    ))}
                  </div>
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
          if (deleteId) deleteSkill(deleteId);
          setDeleteId(null);
        }}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? All level history will be lost."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.length > 0 ? (
          skills.map((skill, i) => {
            const currentLevel = SKILL_LEVELS.find((l) => l.value === skill.level);
            const barColor = LEVEL_BAR_COLORS[skill.level - 1] ?? 'bg-blue-500';
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="gt-panel flex flex-col gap-5 rounded-[1.75rem] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Skill</p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{skill.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(skill.id)}
                        className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                        aria-label={`Edit ${skill.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(skill.id)}
                        className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--danger)]"
                        aria-label={`Delete ${skill.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.18em]',
                        currentLevel?.color
                      )}
                    >
                      {currentLevel?.label}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
                  <div className="mb-3 flex justify-between text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    <span>Level</span>
                    <span>{skill.level} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateSkillLevel(skill.id, idx + 1)}
                        className={cn(
                          'flex min-h-12 items-center justify-center rounded-2xl text-sm font-semibold transition-all',
                          idx < skill.level
                            ? `${barColor} text-white shadow-[var(--shadow-soft)]`
                            : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:bg-[var(--surface-panel)]'
                        )}
                        aria-label={`Set ${skill.name} to level ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {skill.history.length > 1 && (
                  <div className="mt-auto flex items-center gap-2 border-t gt-hairline pt-4 text-xs text-[var(--text-muted)]">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      Started at level {skill.history[0].level} • {skill.history.length} recorded updates
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={PenTool}
              message="No skills added yet. Start tracking what you learn!"
              actionLabel="Add your first skill"
              onAction={openAdd}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
