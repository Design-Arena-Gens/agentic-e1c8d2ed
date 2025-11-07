import { useCallback, useEffect, useMemo, useReducer } from 'react';
import {
  addDays,
  differenceInCalendarDays,
  differenceInDays,
  parseISO,
  subDays,
} from 'date-fns';
import { defaultState, loadState, persistState } from '@/lib/storage';
import type {
  Regimen,
  StatsSnapshot,
  TestosteroneEntry,
  TestosteroneState,
  UpcomingDose,
} from '@/lib/types';

type CreateEntryPayload = Omit<TestosteroneEntry, 'id'>;
type CreateRegimenPayload = Omit<Regimen, 'id'>;

type Action =
  | { type: 'initialize'; payload: TestosteroneState }
  | { type: 'add-entry'; payload: TestosteroneEntry }
  | { type: 'delete-entry'; id: string }
  | { type: 'add-regimen'; payload: Regimen }
  | {
      type: 'update-regimen';
      id: string;
      updates: Partial<CreateRegimenPayload>;
    }
  | { type: 'delete-regimen'; id: string }
  | { type: 'reset' };

function reducer(state: TestosteroneState, action: Action): TestosteroneState {
  switch (action.type) {
    case 'initialize':
      return {
        entries: action.payload.entries,
        regimens: action.payload.regimens,
      };
    case 'add-entry':
      return {
        ...state,
        entries: [action.payload, ...state.entries],
      };
    case 'delete-entry':
      return {
        ...state,
        entries: state.entries.filter((entry) => entry.id !== action.id),
      };
    case 'add-regimen':
      return {
        ...state,
        regimens: [...state.regimens, action.payload],
      };
    case 'update-regimen':
      return {
        ...state,
        regimens: state.regimens.map((regimen) =>
          regimen.id === action.id
            ? {
                ...regimen,
                ...action.updates,
              }
            : regimen,
        ),
      };
    case 'delete-regimen':
      return {
        ...state,
        regimens: state.regimens.filter((regimen) => regimen.id !== action.id),
        entries: state.entries.filter((entry) => entry.regimenId !== action.id),
      };
    case 'reset':
      return defaultState;
    default:
      return state;
  }
}

function sortByDateDesc(entries: TestosteroneEntry[]) {
  return [...entries].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
  );
}

function computeUpcomingDoses(
  regimens: Regimen[],
  entries: TestosteroneEntry[],
  occurrencesPerRegimen = 3,
): UpcomingDose[] {
  const doseEntries = entries.filter((entry) => entry.eventType === 'dose');

  return regimens
    .flatMap((regimen) => {
      const relatedDoses = doseEntries
        .filter((entry) => entry.regimenId === regimen.id)
        .sort(
          (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
        );

      const lastDoseDate = relatedDoses.length
        ? parseISO(relatedDoses[0].date)
        : parseISO(regimen.startDate);

      const occurrences: UpcomingDose[] = [];
      let anchor = lastDoseDate;

      for (let i = 0; i < occurrencesPerRegimen; i += 1) {
        anchor = addDays(anchor, regimen.intervalDays);
        const now = new Date();
        const daysUntil = differenceInDays(anchor, now);
        occurrences.push({
          id: `${regimen.id}-${i}`,
          regimenId: regimen.id,
          regimenName: regimen.name,
          date: anchor.toISOString(),
          overdue: anchor.getTime() < now.getTime(),
          daysUntil,
        });
      }

      return occurrences;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
}

function computeStats(
  regimens: Regimen[],
  entries: TestosteroneEntry[],
  upcoming: UpcomingDose[],
): StatsSnapshot {
  const sortedEntries = sortByDateDesc(entries);
  const lastDose = sortedEntries.find(
    (entry) => entry.eventType === 'dose' && !!entry.date,
  );

  const labs30d = entries
    .filter(
      (entry) =>
        entry.eventType === 'lab' &&
        entry.levelNgDl &&
        parseISO(entry.date) >= subDays(new Date(), 30),
    )
    .sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    );

  const averageLevel30d =
    labs30d.length > 0
      ? labs30d.reduce((sum, entry) => sum + (entry.levelNgDl ?? 0), 0) /
        labs30d.length
      : undefined;

  let levelTrendDelta: number | undefined;
  if (labs30d.length >= 2) {
    const last = labs30d[labs30d.length - 1];
    const prev = labs30d[labs30d.length - 2];
    levelTrendDelta = (last.levelNgDl ?? 0) - (prev.levelNgDl ?? 0);
  }

  const observationWindowDays = 90;
  const dosesInWindow = entries.filter(
    (entry) =>
      entry.eventType === 'dose' &&
      parseISO(entry.date) >= subDays(new Date(), observationWindowDays),
  );

  const expectedDoses = regimens.reduce((total, regimen) => {
    const days =
      observationWindowDays -
      differenceInCalendarDays(new Date(), parseISO(regimen.startDate));
    if (days <= 0) {
      return total;
    }
    const predicted = Math.floor(days / regimen.intervalDays);
    return total + Math.max(predicted, 0);
  }, 0);

  const adherenceRate =
    expectedDoses > 0 ? Math.min(dosesInWindow.length / expectedDoses, 1) : 1;

  const nextDose = upcoming.find((dose) => !dose.overdue) ?? upcoming[0];

  return {
    lastDoseDate: lastDose?.date,
    nextDoseDate: nextDose?.date,
    averageLevel30d,
    labsCount30d: labs30d.length,
    levelTrendDelta,
    adherenceRate,
  };
}

export function useTestosteroneData() {
  const [state, dispatch] = useReducer(
    reducer,
    defaultState,
    () => (typeof window === 'undefined' ? defaultState : loadState()),
  );

  useEffect(() => {
    persistState(state);
  }, [state]);

  const addEntry = useCallback((payload: CreateEntryPayload) => {
    dispatch({
      type: 'add-entry',
      payload: {
        ...payload,
        id: crypto.randomUUID(),
      },
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    dispatch({ type: 'delete-entry', id });
  }, []);

  const addRegimen = useCallback((payload: CreateRegimenPayload) => {
    dispatch({
      type: 'add-regimen',
      payload: {
        ...payload,
        id: crypto.randomUUID(),
      },
    });
  }, []);

  const updateRegimen = useCallback(
    (id: string, updates: Partial<CreateRegimenPayload>) => {
      dispatch({ type: 'update-regimen', id, updates });
    },
    [],
  );

  const deleteRegimen = useCallback((id: string) => {
    dispatch({ type: 'delete-regimen', id });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  const upcomingDoses = useMemo(
    () => computeUpcomingDoses(state.regimens, state.entries),
    [state.regimens, state.entries],
  );

  const stats = useMemo(
    () => computeStats(state.regimens, state.entries, upcomingDoses),
    [state.regimens, state.entries, upcomingDoses],
  );

  const sortedEntries = useMemo(
    () => sortByDateDesc(state.entries),
    [state.entries],
  );

  return {
    entries: sortedEntries,
    regimens: state.regimens,
    upcomingDoses,
    stats,
    addEntry,
    deleteEntry,
    addRegimen,
    updateRegimen,
    deleteRegimen,
    resetState,
  };
}
