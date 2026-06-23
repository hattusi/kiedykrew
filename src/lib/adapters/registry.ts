import type { AdapterType } from "@prisma/client";
import { BaseAdapter } from "./base";
import { MockAdapter } from "./mock";
import { StaticAdapter } from "./static";
import { ManualAdapter } from "./manual";
import { HtmlAdapter } from "./html";
import { JsonAdapter } from "./json-adapter";
import { BloodDemandAdapter } from "./blood-demand";

const REGISTRY: Record<AdapterType, () => BaseAdapter> = {
  MOCK: () => new MockAdapter(),
  STATIC: () => new StaticAdapter(),
  MANUAL: () => new ManualAdapter(),
  HTML: () => new HtmlAdapter(),
  JSON: () => new JsonAdapter(),
  BLOOD_DEMAND: () => new BloodDemandAdapter(),
};

export function getAdapter(type: AdapterType): BaseAdapter {
  const factory = REGISTRY[type];
  if (!factory) throw new Error(`Unknown adapter type: ${type}`);
  return factory();
}
