export type ApiScanLogPublic = {
  id: string;
  attendance_id: string | null;
  user_id: string;
  qr_token_id: string | null;
  method: string;
  scanned_at: string;
  is_success: boolean;
  failure_reason: string | null;
};

export type ApiScanLogListData = {
  scan_logs: ApiScanLogPublic[];
};

export type AdminScanLog = {
  id: string;
  attendanceId: string | null;
  userId: string;
  qrTokenId: string | null;
  method: string;
  scannedAt: string;
  isSuccess: boolean;
  failureReason: string | null;
};

export type ClassifiedScanLogs = {
  linked: AdminScanLog[];
  sameDayOther: AdminScanLog[];
};