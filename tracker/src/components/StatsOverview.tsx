import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { StatsSnapshot, UpcomingDose } from '@/lib/types';

type Props = {
  stats: StatsSnapshot;
  upcomingDoses: UpcomingDose[];
};

export function StatsOverview({ stats, upcomingDoses }: Props) {
  const next = stats.nextDoseDate ? parseISO(stats.nextDoseDate) : undefined;
  const last = stats.lastDoseDate ? parseISO(stats.lastDoseDate) : undefined;
  const adherence = stats.adherenceRate ?? 0;
  const adherencePercent = Math.round(adherence * 100);
  const upcomingSoon = upcomingDoses.slice(0, 3);
  const nextUpcoming = stats.nextDoseDate
    ? upcomingDoses.find((dose) => dose.date === stats.nextDoseDate)
    : undefined;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
        <header className="text-sm font-medium text-white/70">
          Следующая инъекция
        </header>
        <div className="mt-3 text-2xl font-semibold text-white">
          {next ? format(next, 'd MMMM yyyy, HH:mm', { locale: ru }) : '—'}
        </div>
        {next && (
          <p className="mt-2 text-xs text-white/60">
            {nextUpcoming?.overdue
              ? `Просрочено: ${formatDistanceToNow(next, {
                  locale: ru,
                  addSuffix: true,
                })}`
              : `Через ${formatDistanceToNow(next, {
                  locale: ru,
                })}`}
          </p>
        )}
      </article>

      <article className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
        <header className="text-sm font-medium text-white/70">
          Средний тестостерон (30 дней)
        </header>
        <div className="mt-3 text-2xl font-semibold text-white">
          {stats.averageLevel30d
            ? `${Math.round(stats.averageLevel30d)} нг/дл`
            : 'нет данных'}
        </div>
        <p className="mt-2 text-xs text-white/60">
          {stats.labsCount30d > 0
            ? `Анализов: ${stats.labsCount30d}`
            : 'Добавьте результаты лабораторных анализов, чтобы отслеживать динамику.'}
        </p>
        {typeof stats.levelTrendDelta === 'number' && (
          <p
            className={`mt-1 text-xs font-medium ${
              stats.levelTrendDelta >= 0 ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {stats.levelTrendDelta >= 0 ? '+' : ''}
            {Math.round(stats.levelTrendDelta)} за последние измерения
          </p>
        )}
      </article>

      <article className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
        <header className="text-sm font-medium text-white/70">
          Придержанность терапии
        </header>
        <div className="mt-3 text-2xl font-semibold text-white">
          {`${adherencePercent}%`}
        </div>
        <p className="mt-2 text-xs text-white/60">
          {last
            ? `Последняя доза: ${format(last, 'd MMMM yyyy, HH:mm', {
                locale: ru,
              })}`
            : 'Нет данных об инъекциях'}
        </p>
      </article>

      <div className="md:col-span-3">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Ближайшие события
          </h2>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {upcomingSoon.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Заполните график терапии, чтобы видеть будущие инъекции.
            </div>
          ) : (
            upcomingSoon.map((dose) => {
              const doseDate = parseISO(dose.date);
              return (
                <div
                  key={dose.id}
                  className="rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4"
                >
                  <div className="text-xs uppercase tracking-wide text-white/50">
                    {dose.regimenName}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {format(doseDate, 'd MMMM, HH:mm', { locale: ru })}
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      dose.overdue ? 'text-red-300' : 'text-white/60'
                    }`}
                  >
                    {dose.overdue
                      ? `Просрочено на ${formatDistanceToNow(doseDate, {
                          locale: ru,
                        })}`
                      : `Через ${formatDistanceToNow(doseDate, {
                          locale: ru,
                        })}`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
