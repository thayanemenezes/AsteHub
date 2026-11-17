import {
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

interface RateLimitWindow {
  count: number;
  resetsAt: number;
}

@Injectable()
export class PublicLeadRateLimiter {
  private readonly windows = new Map<string, RateLimitWindow>();
  private readonly limit = 5;
  private readonly windowMilliseconds = 10 * 60 * 1000;

  assertAllowed(ipAddress: string, tenant: string, now = Date.now()): void {
    for (const [key, window] of this.windows) {
      if (window.resetsAt <= now) {
        this.windows.delete(key);
      }
    }

    const key = JSON.stringify([ipAddress, tenant]);
    const current = this.windows.get(key);
    if (!current || current.resetsAt <= now) {
      this.windows.set(key, {
        count: 1,
        resetsAt: now + this.windowMilliseconds,
      });
      return;
    }

    if (current.count >= this.limit) {
      throw new HttpException(
        "Too many quote requests. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
  }
}
