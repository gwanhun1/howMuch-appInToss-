import { useState } from "react";
import { Text, Spacing, BottomSheet, Button } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

export function ServiceFooter() {
  const [activePolicy, setActivePolicy] = useState<"terms" | "privacy" | null>(
    null,
  );

  return (
    <>
      <div
        style={{
          padding: "48px 24px 64px",
          textAlign: "center",
          backgroundColor: "#F8F9FA",
          borderTop: "1px solid rgba(49, 130, 246, 0.05)",
        }}
      >
        <Text typography="t6" color={adaptive.blue600} fontWeight="medium">
          본 서비스는 얼마냈지요 팀에서 제공합니다.
        </Text>
        <Spacing size={6} />
        <Text
          typography="t7"
          color={adaptive.grey500}
          style={{ fontSize: "12px", lineHeight: "1.6" }}
        >
          사용자가 입력한 정보는 안전하게 보관되며,
          <br />
          서비스 운영 외의 다른 용도로 사용되지 않습니다.
        </Text>
        <Spacing size={16} />
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Text
            typography="t7"
            color={adaptive.grey400}
            style={{
              fontSize: "11px",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => setActivePolicy("terms")}
          >
            서비스 이용약관
          </Text>
          <Text
            typography="t7"
            color={adaptive.grey400}
            style={{
              fontSize: "11px",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setActivePolicy("privacy")}
          >
            개인정보처리방침
          </Text>
        </div>
      </div>

      {/* 이용약관 바텀시트 */}
      <BottomSheet
        open={activePolicy === "terms"}
        onClose={() => setActivePolicy(null)}
        header="이용약관"
        style={{ padding: "0 20px 20px" }}
      >
        <div>
          <Text typography="t6" fontWeight="bold">
            제 1조 (목적)
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            본 약관은 '얼마냈지요' 팀이 제공하는 서비스를 이용함에 있어 이용자와
            회사 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Text>
          <Spacing size={16} />
          <Text typography="t6" fontWeight="bold">
            제 2조 (서비스의 내용)
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            본 서비스는 개인 간의 경조사 비용을 기록하고 관리할 수 있는 도구를
            제공합니다. 기록된 데이터는 서비스 개선 및 운영을 위해 사용될 수
            있습니다.
          </Text>
          <Spacing size={16} />
          <Text typography="t6" fontWeight="bold">
            제 3조 (면책조항)
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            서비스에서 제공하는 기록 및 통계 데이터는 참고용이며, 이를 통한
            직접적 금융 거래나 법적 효력에 대해서는 책임을 지지 않습니다.
          </Text>
          <Spacing size={24} />
          <Button
            size="medium"
            style={{ width: "100%" }}
            onClick={() => setActivePolicy(null)}
          >
            확인
          </Button>
        </div>
      </BottomSheet>

      {/* 개인정보처리방침 바텀시트 */}
      <BottomSheet
        open={activePolicy === "privacy"}
        onClose={() => setActivePolicy(null)}
        header="개인정보처리방침"
        style={{ padding: "0 20px 20px" }}
      >
        <div>
          <Text typography="t6" fontWeight="bold">
            1. 수집하는 개인정보 항목
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            기록 대상의 이름, 경조사 금액, 날짜, 관계 및 기기 정보(OS, 모델명)를
            수집합니다.
          </Text>
          <Spacing size={16} />
          <Text typography="t6" fontWeight="bold">
            2. 수집 및 이용 목적
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            경조사 내역 관리 기능 제공, 서비스 통계 분석 및 품질 개선을 위해
            사용됩니다.
          </Text>
          <Spacing size={16} />
          <Text typography="t6" fontWeight="bold">
            3. 개인정보의 보유 및 파기
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            데이터는 서비스 이용 종료 시까지 보유하며, 사용자가 데이터 삭제를
            요청하거나 서비스 운영 종료 시 즉시 파기합니다.
          </Text>
          <Spacing size={16} />
          <Text typography="t6" fontWeight="bold">
            4. 정보주체의 권리
          </Text>
          <Spacing size={8} />
          <Text typography="t7" color={adaptive.grey700}>
            이용자는 언제든지 본인의 데이터를 삭제하거나 수집 중단을 요청할 수
            있습니다.
          </Text>
          <Spacing size={24} />
          <Button
            size="medium"
            style={{ width: "100%" }}
            onClick={() => setActivePolicy(null)}
          >
            확인
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
