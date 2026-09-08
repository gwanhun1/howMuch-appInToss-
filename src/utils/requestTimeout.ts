export const REQUEST_TIMEOUT_MS = 15_000;

export class RequestTimeoutError extends Error {
  readonly code = "app/request-timeout";

  constructor(readonly operation: string) {
    super(`${operation} 시간이 초과되었어요. 연결 상태를 확인하고 다시 시도해 주세요.`);
    this.name = "RequestTimeoutError";
  }
}

/** 읽기/인증의 대기 시간을 제한합니다. 쓰기 요청의 취소 수단으로 사용하지 않습니다. */
export async function withRequestTimeout<T>(
  promise: Promise<T>,
  operation: string,
  ms = REQUEST_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new RequestTimeoutError(operation)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
