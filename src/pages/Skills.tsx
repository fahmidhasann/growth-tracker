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

export function Skills() {
  const skills = useStore((s) => s.skills);
  const addSkill = useStore((s) => s.addSkill);
  const updateSkillLevel = useStore((s) => s.updateSkillLevel);
  const updateSkillName = useStore((s) => s.updateSkillName);
  const deleteSkill = useStore((s) => s.deleteSkill);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', level: 1 });

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
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', level: 1 });
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
        subtitle="Track your technical proficiency."
        actionLabel="Add Skill"
        onAction={openAdd}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Skill' : 'New Skill'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Skill Name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Python, PyTorch, SQL..."
          />

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-4">Current Level</label>
            <div className="space-y-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, level: level.value })}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
                    formData.level === level.value
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  )}
                >
                  <span className="font-medium">{level.label}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          i < level.value ? 'bg-current' : 'bg-zinc-800'
                        )}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update Skill' : 'Add Skill'}
            </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.length > 0 ? (
          skills.map((skill, i) => {
            const currentLevel = SKILL_LEVELS.find((l) => l.value === skill.level);
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 flex flex-col gap-6 group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-medium text-zinc-100">{skill.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(skill.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        aria-label={`Edit ${skill.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(skill.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label={`Delete ${skill.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider',
                        currentLevel?.color
                      )}
                    >
                      {currentLevel?.label}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    <span>Level</span>
                    <span>{skill.level} / 5</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateSkillLevel(skill.id, idx + 1)}
                        className={cn(
                          'flex-1 h-2 rounded-full transition-colors',
                          idx < skill.level ? 'bg-blue-500' : 'bg-zinc-800 hover:bg-zinc-700'
                        )}
                        aria-label={`Set ${skill.name} to level ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {skill.history.length > 1 && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
                    <TrendingUp className="w-3 h-3" />
                    <span>Started at level {skill.history[0].level}</span>
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
