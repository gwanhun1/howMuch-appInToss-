import { appLogin } from "@apps-in-toss/web-framework";

/**
 * Cloudtype에 배포할 프록시 서버 주소입니다.
 * 배포 후 실제 URL로 교체해야 합니다.
 */
const PROXY_URL =
  "https://port-0-howmuch-be-mkwj1vpb202f6031.sel3.cloudtype.app"; // 배포된 Cloudtype URL로 변경 완료

export interface TossLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface TossUserMeResponse {
  userKey: number;
  scope: string;
  agreedTerms: string[];
  name?: string;
  phone?: string;
  birthday?: string;
  ci?: string;
  gender?: string;
  nationality?: string;
  email?: string;
}

export const tossAuthService = {
  /**
   * 1. 인가 코드 받기 (appLogin)
   */
  async login(): Promise<{ authorizationCode: string; referrer: string }> {
    try {
      const response = await appLogin();
      return response;
    } catch (error) {
      console.error("appLogin failed:", error);
      throw error;
    }
  },

  /**
   * 2. AccessToken 받기 (Proxy 사용)
   */
  async generateToken(
    authorizationCode: string,
    referrer: string,
  ): Promise<TossLoginResponse> {
    try {
      const response = await fetch(`${PROXY_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorizationCode,
          referrer,
        }),
      });

      const data = await response.json();

      if (data.resultType === "SUCCESS") {
        return data.success;
      } else {
        const errorMsg =
          data.error?.reason ||
          data.error?.errorCode ||
          "Failed to generate token";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(
        "[TossAuth] generateToken failed:",
        error instanceof Error ? error.message : "unknown",
      );
      throw error;
    }
  },

  /**
   * 4. 사용자 정보 받기 (Proxy 사용)
   */
  async getUserMe(accessToken: string): Promise<TossUserMeResponse> {
    try {
      const response = await fetch(`${PROXY_URL}/auth/user-me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.resultType === "SUCCESS") {
        return data.success;
      } else {
        const errorMsg =
          data.error?.reason ||
          data.error?.errorCode ||
          "Failed to get user info";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(
        "[TossAuth] getUserMe failed:",
        error instanceof Error ? error.message : "unknown",
      );
      throw error;
    }
  },

  /**
   * 전체 로그인 프로세스 실행
   */
  async executeFullLogin(): Promise<TossUserMeResponse> {
    const { authorizationCode, referrer } = await this.login();
    const tokenData = await this.generateToken(authorizationCode, referrer);
    return await this.getUserMe(tokenData.accessToken);
  },
};
