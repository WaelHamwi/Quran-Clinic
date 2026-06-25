/** Report categories accepted by POST /reports. */
export type ReportType = 'bug' | 'suggestion';

/** Payload for submitting a bug report / improvement suggestion. */
export interface ReportPayload {
  type: ReportType;
  message: string;
  /** Optional name a guest types so admins can identify them in the CMS. */
  name?: string | null;
  /** Local image URI from the picker; uploaded as multipart when present. */
  imageUri?: string | null;
}
