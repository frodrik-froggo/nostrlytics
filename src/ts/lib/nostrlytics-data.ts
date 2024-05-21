export type NostrlyticsData = {
  kind: 'nstrly-event';
  type: 'page-impression' | 'click-out';
  userAgent: string;
  language: string;
  location: string;
};

export type NostrlyticsClickOutData = NostrlyticsData & {
  clickOutUrl: string;
};

export type NostrlyticsImpressionData = NostrlyticsData & {
  referrer: string;
};
