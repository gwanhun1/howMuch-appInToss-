import { Result, Asset } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function GlobalErrorView({
  title = "에러가 발생했습니다",
  description = "잠시 후 다시 시도해주세요.",
  onRetry,
}: Props) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: adaptive.greyBackground,
      }}
    >
      <Result
        figure={
          <Asset.Icon
            name="icon-warning-circle-red500"
            color={adaptive.red500}
            size={60}
          />
        }
        title={title}
        description={description}
        button={
          onRetry ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Result.Button onClick={onRetry}>다시 시도하기</Result.Button>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
