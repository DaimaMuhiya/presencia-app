import { ApiClientError } from "@/lib/api/errors";
import { handleRouteError } from "@/lib/api/route";
import {
  callApiWithAccessToken,
  requireSuperAdminSession,
} from "@/lib/api/session-api";
import {
  buildSuperAdminScanLogsApiPath,
  parseScanLogListQueryFromSearchParams,
  ScanLogQueryParseError,
} from "@/lib/attendance/parse-scan-log-query";
import {
  normalizeScanLogListData,
  ScanLogListDataError,
} from "@/lib/attendance/parse-scan-log-response";

export async function GET(request: Request) {
  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  const { searchParams } = new URL(request.url);

  let query;
  try {
    query = parseScanLogListQueryFromSearchParams(searchParams);
  } catch (error) {
    if (error instanceof ScanLogQueryParseError) {
      return error.response;
    }
    throw error;
  }

  try {
    const apiPath = buildSuperAdminScanLogsApiPath(query);
    const { envelope } = await callApiWithAccessToken<unknown>(
      session.accessToken,
      apiPath,
      { method: "GET", skipJsonBody: true }
    );

    let scanLogs;
    try {
      scanLogs = normalizeScanLogListData(envelope.data);
    } catch (parseError) {
      if (parseError instanceof ScanLogListDataError) {
        throw new ApiClientError(502, {
          success: false,
          message: "Réponse scan logs incomplète ou invalide.",
        });
      }
      throw parseError;
    }

    return Response.json({
      success: true,
      message: envelope.message,
      data: { scan_logs: scanLogs },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}