'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { EntryForm } from '@/components/EntryForm';
import { LevelChart } from '@/components/LevelChart';
import { RegimenForm } from '@/components/RegimenForm';
import { RegimenList } from '@/components/RegimenList';
import { StatsOverview } from '@/components/StatsOverview';
import { EntriesTable } from '@/components/EntriesTable';
import { useTestosteroneData } from '@/hooks/useTestosteroneData';

export default function HomePage() {
  const {
    entries,
    regimens,
    stats,
    upcomingDoses,
    addEntry,
    deleteEntry,
    addRegimen,
    deleteRegimen,
    resetState,
  } = useTestosteroneData();

  const lastUpdated = useMemo(() => {
    if (entries.length === 0) return undefined;
    return format(new Date(entries[0].date), 'd MMM yyyy, HH:mm', {
      locale: ru,
    });
  }, [entries]);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/15 via-white/10 to-white/5 p-8 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-200/80">
                Персональная панель мониторинга
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
                Управляйте терапией тестостероном уверенно
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/70 md:text-base">
                Планируйте инъекции, фиксируйте лабораторные результаты и
                отслеживайте динамику самочувствия. Все данные хранятся локально
                в браузере и доступны только вам.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <button
                type="button"
                onClick={resetState}
                className="rounded-md border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/60 transition hover:border-red-200/40 hover:text-red-200"
              >
                Сбросить данные
              </button>
              <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/70">
                <div className="text-[11px] uppercase tracking-widest text-white/40">
                  Обновлено
                </div>
                <div className="mt-1 font-semibold text-white">
                  {lastUpdated ?? 'Нет записей'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <StatsOverview stats={stats} upcomingDoses={upcomingDoses} />

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <EntryForm regimens={regimens} onSubmit={addEntry} />
          <RegimenForm onSubmit={addRegimen} />
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Схемы терапии
              </h2>
              <p className="text-sm text-white/60">
                Управляйте актуальными планами введения препаратов.
              </p>
            </div>
          </header>
          <RegimenList
            regimens={regimens}
            upcoming={upcomingDoses}
            onDelete={deleteRegimen}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">График</h2>
          <LevelChart entries={entries} />
        </section>

        <section className="space-y-4 pb-10">
          <h2 className="text-2xl font-semibold text-white">Лента событий</h2>
          <EntriesTable
            entries={entries}
            regimens={regimens}
            onDelete={deleteEntry}
          />
        </section>
      </div>
    </main>
  );
}
