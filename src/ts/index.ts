import { Nostrlytics } from './lib/nostrlytics.ts';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
if (document.nostrlyticsConfig) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Nostrlytics.init(document.nostrlyticsConfig);
}
