import { ApiClientError } from "@/lib/api/errors";
import { handleRouteError } from "@/lib/api/route";
import {
  callApiWithAccessToken,
  requireSuperAdminSession,
} from "@/lib/api/session-api";
import {
  AttendanceQueryParseError,
  buildSuperAdminAttendancesApiPath,
  parseAttendanceListQueryFromSearchParams,
} from "@/lib/attendance/parse-list-query";
import {
  AttendanceListDataError,
  normalizeAttendanceListData,
} from "@/lib/attendance/parse-list-response";

export async function GET(request: Request) {
  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  const { searchParams } = new URL(request.url);

  let query;
  try {
    query = parseAttendanceListQueryFromSearchParams(searchParams);
  } catch (error) {
    if (error instanceof AttendanceQueryParseError) {
      return error.response;
    }
    throw error;
  }

  try {
    const apiPath = buildSuperAdminAttendancesApiPath(query);
    const { envelope } = await callApiWithAccessToken<unknown>(
      session.accessToken,
      apiPath,
      { method: "GET", skipJsonBody: true }
    );

    let data;
    try {
      data = normalizeAttendanceListData(envelope.data);
    } catch (parseError) {
      if (parseError instanceof AttendanceListDataError) {
        throw new ApiClientError(502, {
          success: false,
          message: "Réponse présences incomplète ou invalide.",
        });
      }
      throw parseError;
    }

    return Response.json({
      success: true,
      message: envelope.message,
      data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}