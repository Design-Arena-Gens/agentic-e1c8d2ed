import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Regimen, TestosteroneEntry } from '@/lib/types';

type Props = {
  entries: TestosteroneEntry[];
  regimens: Regimen[];
  onDelete: (id: string) => void;
};

const EVENT_LABELS: Record<TestosteroneEntry['eventType'], string> = {
  dose: 'Инъекция/приём',
  lab: 'Анализ',
  symptom: 'Самочувствие',
};

export function EntriesTable({ entries, regimens, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
        Добавьте хотя бы одну запись, чтобы увидеть динамику.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-sm backdrop-blur">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
          <tr>
            <th className="px-4 py-3 text-left">Дата</th>
            <th className="px-4 py-3 text-left">Тип</th>
            <th className="px-4 py-3 text-left">Схема</th>
            <th className="px-4 py-3 text-left">Детали</th>
            <th className="px-4 py-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/80">
          {entries.map((entry) => {
            const date = parseISO(entry.date);
            const regimen = entry.regimenId
              ? regimens.find((item) => item.id === entry.regimenId)
              : undefined;

            return (
              <tr
                key={entry.id}
                className="transition hover:bg-white/5 hover:text-white"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                  {format(date, 'd MMM yyyy, HH:mm', { locale: ru })}
                </td>
                <td className="px-4 py-3">{EVENT_LABELS[entry.eventType]}</td>
                <td className="px-4 py-3">
                  {regimen?.name ?? entry.product ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {entry.eventType === 'dose' && entry.dosageMg && (
                    <span className="rounded bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-100">
                      {entry.dosageMg} мг
                    </span>
                  )}
                  {entry.eventType === 'lab' && entry.levelNgDl && (
                    <span className="rounded bg-sky-400/20 px-2 py-1 text-xs font-semibold text-sky-100">
                      {entry.levelNgDl} нг/дл
                    </span>
                  )}
                  {entry.eventType === 'symptom' && entry.wellbeingScore && (
                    <span className="rounded bg-amber-400/20 px-2 py-1 text-xs font-semibold text-amber-100">
                      Самочувствие: {entry.wellbeingScore}/10
                    </span>
                  )}
                  {entry.notes && (
                    <span className="ml-2 text-xs text-white/60">
                      {entry.notes}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="rounded-md border border-white/20 px-3 py-1 text-xs font-medium text-white/60 transition hover:border-red-300/60 hover:text-red-200"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
