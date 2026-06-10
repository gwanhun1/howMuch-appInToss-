/**
 * 기록 카드/리스트 행에서 공유하는 표시 로직.
 * RecordCard와 RecordListItem이 동일한 D-day 계산을 재사용한다.
 */

export interface RecordDday {
  /** 오늘 이후(오늘 포함)의 예정 기록 여부 */
  isUpcoming: boolean;
  /** "D-Day" | "D-{n}" | null (지난 기록·날짜 없음이면 null) */
  ddayText: string | null;
}

/** 기록 날짜(YYYY-MM-DD)로 D-day 표시 정보를 계산한다. */
export function getRecordDday(date: string | undefined | null): RecordDday {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const upcoming = !!date && date >= todayStr;

  if (!date || !upcoming) {
    return { isUpcoming: upcoming, ddayText: null };
  }

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    isUpcoming: upcoming,
    ddayText: diffDays === 0 ? "D-Day" : `D-${diffDays}`,
  };
}
