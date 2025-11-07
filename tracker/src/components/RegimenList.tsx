import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Regimen, UpcomingDose } from '@/lib/types';

type Props = {
  regimens: Regimen[];
  upcoming: UpcomingDose[];
  onDelete: (id: string) => void;
};

export function RegimenList({ regimens, upcoming, onDelete }: Props) {
  if (regimens.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
        Добавьте схему терапии, чтобы увидеть расписание и метрики.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {regimens.map((regimen) => {
        const nextDose = upcoming.find(
          (item) =>
            item.regimenId === regimen.id &&
            parseISO(item.date).getTime() >= Date.now(),
        );
        const overdue = upcoming
          .filter((item) => item.regimenId === regimen.id)
          .filter((item) => item.overdue);

        return (
          <article
            key={regimen.id}
            className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur"
          >
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {regimen.name}
                </h3>
                <p className="text-sm text-white/60">{regimen.preparation}</p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(regimen.id)}
                className="self-start rounded-md border border-white/20 px-3 py-1 text-xs font-medium text-white/60 transition hover:border-red-300/60 hover:text-red-200"
              >
                Удалить
              </button>
            </header>

            <dl className="mt-4 grid gap-3 text-sm text-white/80 md:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-xs uppercase text-white/50">Дозировка</dt>
                <dd className="mt-1 text-base font-semibold text-white">
                  {regimen.dosageMg} мг
                </dd>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-xs uppercase text-white/50">Интервал</dt>
                <dd className="mt-1 text-base font-semibold text-white">
                  каждые {regimen.intervalDays} дн.
                </dd>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-xs uppercase text-white/50">Путь</dt>
                <dd className="mt-1 text-base font-semibold text-white">
                  {regimen.route}
                </dd>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-xs uppercase text-white/50">Старт</dt>
                <dd className="mt-1 text-base font-semibold text-white">
                  {format(parseISO(regimen.startDate), 'd MMM yyyy', {
                    locale: ru,
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-gradient-to-r from-emerald-400/20 to-emerald-200/10 p-3 text-sm text-white/80">
                <span className="text-xs uppercase text-white/50">
                  Ближайшая доза
                </span>
                <div className="mt-1 font-semibold text-white">
                  {nextDose
                    ? format(parseISO(nextDose.date), 'd MMM yyyy, HH:mm', {
                        locale: ru,
                      })
                    : 'Не запланировано'}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                <span className="text-xs uppercase text-white/50">
                  Просроченные
                </span>
                <div className="mt-1 font-semibold text-white">
                  {overdue.length > 0
                    ? `${overdue.length} запланированных события`
                    : 'Нет просрочек'}
                </div>
              </div>
            </div>

            {regimen.targetLevel && (
              <p className="mt-3 text-xs text-white/60">
                Целевой уровень: {regimen.targetLevel} нг/дл
              </p>
            )}

            {regimen.notes && (
              <p className="mt-2 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                {regimen.notes}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
