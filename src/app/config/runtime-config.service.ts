import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { FARO_CONFIG, FaroConfig } from '../faro-config';
import { environment } from '../../environments/environment';

interface SiteConfigActiveEnvelope {
  success: boolean;
  message: string;
  data?: {
    config?: Partial<FaroConfig>;
    item?: {
      config?: Partial<FaroConfig>;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class RuntimeConfigService {
  private cfg: FaroConfig = FARO_CONFIG;

  constructor(
    private readonly http: HttpClient
  ) {}

  get config(): FaroConfig {
    return this.cfg;
  }

  async loadConfig(): Promise<void> {
    const remote = await this.fetchRemoteConfig();

    if (!remote) {
      return;
    }

    this.cfg = deepMerge(
      FARO_CONFIG,
      remote
    );
  }

  private async fetchRemoteConfig(): Promise<Partial<FaroConfig> | null> {
    const apiBaseUrl =
      environment.apiBaseUrl
        .replace(/\/$/, '');

    const urls = [
      `${apiBaseUrl}/site-config/active`,
      '/data/site-config.json'
    ];

    for (const url of urls) {
      try {
        const response = await firstValueFrom(
          this.http.get<unknown>(url)
        );

        const normalized =
          this.normalizeResponse(response);

        if (normalized) {
          return normalized;
        }
      } catch {
        // Intentamos siguiente origen sin romper el arranque.
      }
    }

    return null;
  }

  private normalizeResponse(payload: unknown): Partial<FaroConfig> | null {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }

    const envelope = payload as SiteConfigActiveEnvelope;
    if (typeof envelope.success === 'boolean') {
      if (!envelope.success) {
        return null;
      }

      const fromData = envelope.data?.config;
      if (fromData && typeof fromData === 'object' && !Array.isArray(fromData)) {
        return fromData;
      }

      const fromItem = envelope.data?.item?.config;
      if (fromItem && typeof fromItem === 'object' && !Array.isArray(fromItem)) {
        return fromItem;
      }

      return null;
    }

    return payload as Partial<FaroConfig>;
  }
}

function deepMerge<T>(
  base: T,
  patch: unknown
): T {
  if (Array.isArray(base)) {
    if (Array.isArray(patch)) {
      return patch as T;
    }

    return base;
  }

  if (!isObject(base) || !isObject(patch)) {
    return (patch ?? base) as T;
  }

  const result: Record<string, unknown> = {
    ...(base as Record<string, unknown>)
  };

  Object.keys(patch).forEach(key => {
    const patchValue = (patch as Record<string, unknown>)[key];

    if (patchValue === undefined) {
      return;
    }

    const baseValue = (base as Record<string, unknown>)[key];

    result[key] = deepMerge(baseValue, patchValue);
  });

  return result as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
