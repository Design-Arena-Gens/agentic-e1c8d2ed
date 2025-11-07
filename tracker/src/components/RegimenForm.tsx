'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

type Props = {
  onSubmit: (payload: {
    name: string;
    preparation: string;
    dosageMg: number;
    intervalDays: number;
    startDate: string;
    route: string;
    targetLevel?: number;
    notes?: string;
  }) => void;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export function RegimenForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [preparation, setPreparation] = useState('');
  const [dosageMg, setDosageMg] = useState('125');
  const [intervalDays, setIntervalDays] = useState('7');
  const [startDate, setStartDate] = useState(todayISO());
  const [route, setRoute] = useState('IM');
  const [targetLevel, setTargetLevel] = useState('');
  const [notes, setNotes] = useState('');

  const canSubmit =
    name.trim().length > 0 &&
    preparation.trim().length > 0 &&
    Number(intervalDays) > 0 &&
    Number(dosageMg) > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      name: name.trim(),
      preparation: preparation.trim(),
      dosageMg: Number(dosageMg),
      intervalDays: Number(intervalDays),
      startDate: new Date(startDate).toISOString(),
      route,
      targetLevel: targetLevel ? Number(targetLevel) : undefined,
      notes: notes ? notes.trim() : undefined,
    });

    setName('');
    setPreparation('');
    setDosageMg('125');
    setIntervalDays('7');
    setStartDate(todayISO());
    setRoute('IM');
    setTargetLevel('');
    setNotes('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur"
    >
      <header>
        <h2 className="text-lg font-semibold text-white">Добавить схему</h2>
        <p className="text-sm text-white/60">
          Настройте базовую терапию, чтобы отслеживать будущие инъекции и
          анализы.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Название
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например, Сустанон еженедельно"
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Препарат и форма
          <input
            type="text"
            value={preparation}
            onChange={(event) => setPreparation(event.target.value)}
            placeholder="Сустанон 250 мг, внутримышечно"
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Дозировка (мг)
          <input
            type="number"
            min={1}
            step={5}
            value={dosageMg}
            onChange={(event) => setDosageMg(event.target.value)}
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Интервал (дней)
          <input
            type="number"
            min={1}
            value={intervalDays}
            onChange={(event) => setIntervalDays(event.target.value)}
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Старт терапии
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Путь введения
          <select
            value={route}
            onChange={(event) => setRoute(event.target.value)}
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          >
            <option value="IM">Внутримышечно (IM)</option>
            <option value="SC">Подкожно (SC)</option>
            <option value="Transdermal">Трансдермально</option>
            <option value="Oral">Перорально</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Целевой уровень (нг/дл)
          <input
            type="number"
            min={10}
            step={10}
            value={targetLevel}
            onChange={(event) => setTargetLevel(event.target.value)}
            placeholder="Опционально"
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Заметки
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Особенности введения, рекомендации врача"
            className="rounded-md border border-white/10 bg-white/10 p-2 text-white placeholder:text-white/30 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-sky-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/60"
        >
          Сохранить схему
        </button>
      </div>
    </form>
  );
}
