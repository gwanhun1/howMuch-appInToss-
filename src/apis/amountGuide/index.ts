import type { AmountGuideResult, GuideSituation } from "./type";

/** 서비스 자체 참고 규칙. 시장 평균이나 의무적인 금액을 의미하지 않습니다. */
export function getAmountGuide(situation: GuideSituation): AmountGuideResult {
  const choices = {
    acquaintance: [50000, 100000],
    regular: [100000, 150000],
    close: [100000, 200000, 300000],
  };
  const amounts = [...choices[situation.closeness]];
  if (situation.type !== "조의금" && !situation.attending && situation.closeness === "regular") {
    amounts.unshift(50000);
  }
  const closenessText = {
    acquaintance: "가끔 연락하는 사이라면 부담이 적은 선택부터 살펴보세요.",
    regular: "꾸준히 연락하는 사이라면 평소 주고받은 마음도 함께 생각해보세요.",
    close: "가까운 사이라면 친밀도와 본인의 예산에 맞춰 선택해보세요.",
  };
  const attendanceText = situation.type === "조의금"
    ? "조문 여부보다 위로를 전하는 마음과 본인의 형편이 우선이에요."
    : situation.attending
      ? "참석 비용도 고려할 수 있지만, 무리해서 금액을 맞출 필요는 없어요."
      : "참석하지 않아도 본인의 형편에 맞게 마음을 전할 수 있어요.";
  return { amounts, explanation: `${closenessText[situation.closeness]} ${attendanceText}` };
}
