'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Regimen } from '@/lib/types';

type Props = {
  regimens: Regimen[];
  onSubmit: (payload: {
    date: string;
    eventType: 'dose' | 'lab' | 'symptom';
    regimenId?: string;
    product?: string;
    dosageMg?: number;
    levelNgDl?: number;
    wellbeingScore?: number;
    notes?: string;
  }) => void;
};

type FormState = {
  eventType: 'dose' | 'lab' | 'symptom';
  date: string;
  regimenId: string;
  product: string;
  dosageMg: string;
  levelNgDl: string;
  wellbeingScore: number;
  notes: string;
};

const nowISO = () => new Date().toISOString().slice(0, 16);

export function EntryForm({ regimens, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>({
    eventType: 'dose',
    date: nowISO(),
    regimenId: '',
    product: '',
    dosageMg: '',
    levelNgDl: '',
    wellbeingScore: 5,
    notes: '',
  });

  const resetForm = () => {
    setForm({
      eventType: 'dose',
      date: nowISO(),
      regimenId: regimens[0]?.id ?? '',
      product: regimens[0]?.preparation ?? '',
      dosageMg: regimens[0] ? String(regimens[0].dosageMg) : '',
      levelNgDl: '',
      wellbeingScore: 5,
      notes: '',
    });
  };

  const canSubmit = useMemo(() => {
    if (!form.date) return false;
    if (form.eventType === 'dose') {
      return !!form.dosageMg;
    }
    if (form.eventType === 'lab') {
      return !!form.levelNgDl;
    }
    return true;
  }, [form.date, form.dosageMg, form.eventType, form.levelNgDl]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      date: new Date(form.date).toISOString(),
      eventType: form.eventType,
      regimenId:
        form.eventType === 'dose' && form.regimenId
          ? form.regimenId
          : undefined,
      product:
        form.eventType === 'dose' && form.product ? form.product : undefined,
      dosageMg:
        form.eventType === 'dose' && form.dosageMg
          ? Number(form.dosageMg)
          : undefined,
      levelNgDl:
        form.eventType === 'lab' && form.levelNgDl
          ? Number(form.levelNgDl)
          : undefined,
      wellbeingScore:
        form.eventType === 'symptom' ? Number(form.wellbeingScore) : undefined,
      notes: form.notes ? form.notes.trim() : undefined,
    });

    resetForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur"
    >
      <header>
        <h2 className="text-lg font-semibold text-white">
          Добавить запись
        </h2>
        <p className="text-sm text-white/60">
          Фиксируйте инъекции, лабораторные анализы и субъективное самочувствие.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Тип события
          <select
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
            value={form.eventType}
            onChange={(event) => {
              const nextType = event.target.value as FormState['eventType'];
              setForm((prev) => {
                if (nextType === 'dose') {
                  const defaultRegimen = regimens[0];
                  return {
                    ...prev,
                    eventType: nextType,
                    regimenId: prev.regimenId || defaultRegimen?.id || '',
                    product:
                      prev.product || defaultRegimen?.preparation || '',
                    dosageMg:
                      prev.dosageMg ||
                      (defaultRegimen
                        ? String(defaultRegimen.dosageMg)
                        : ''),
                  };
                }
                if (nextType === 'lab') {
                  return {
                    ...prev,
                    eventType: nextType,
                    regimenId: '',
                    dosageMg: '',
                  };
                }
                return {
                  ...prev,
                  eventType: nextType,
                  regimenId: '',
                  dosageMg: '',
                };
              });
            }}
          >
            <option value="dose">Инъекция/приём</option>
            <option value="lab">Анализ крови</option>
            <option value="symptom">Самочувствие</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Дата и время
          <input
            type="datetime-local"
            value={form.date}
            max={nowISO()}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, date: event.target.value }))
            }
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>
      </div>

      {form.eventType === 'dose' && (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Схема терапии
            <select
              value={form.regimenId}
              onChange={(event) => {
                const regimenId = event.target.value;
                const regimen = regimens.find((item) => item.id === regimenId);
                setForm((prev) => ({
                  ...prev,
                  regimenId,
                  product: regimen ? regimen.preparation : prev.product,
                  dosageMg: regimen
                    ? String(regimen.dosageMg)
                    : prev.dosageMg,
                }));
              }}
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
            >
              <option value="">Без схемы</option>
              {regimens.map((regimen) => (
                <option key={regimen.id} value={regimen.id}>
                  {regimen.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-white/70">
            Препарат
            <input
              type="text"
              value={form.product}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, product: event.target.value }))
              }
              placeholder="Например, Сустанон 250"
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-white/70">
            Дозировка (мг)
            <input
              type="number"
              min={0}
              step={5}
              value={form.dosageMg}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dosageMg: event.target.value }))
              }
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
            />
          </label>
        </div>
      )}

      {form.eventType === 'lab' && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Уровень тестостерона (нг/дл)
            <input
              type="number"
              min={0}
              step={5}
              value={form.levelNgDl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, levelNgDl: event.target.value }))
              }
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-white/70">
            Препарат/примечание
            <input
              type="text"
              value={form.product}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, product: event.target.value }))
              }
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
              placeholder="Лаборатория или препарат"
            />
          </label>
        </div>
      )}

      {form.eventType === 'symptom' && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Самочувствие
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={form.wellbeingScore}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    wellbeingScore: Number(event.target.value),
                  }))
                }
                className="w-full accent-emerald-400"
              />
              <span className="w-10 text-right text-sm text-white">
                {form.wellbeingScore}
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm text-white/70">
            Ситуация
            <input
              type="text"
              value={form.product}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, product: event.target.value }))
              }
              placeholder="Например, тренировка, стресс"
              className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
            />
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Заметки
        <textarea
          rows={3}
          value={form.notes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, notes: event.target.value }))
          }
          placeholder="Кратко опишите любые детали"
          className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          Очистить
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
        >
          Сохранить событие
        </button>
      </div>
    </form>
  );
}
