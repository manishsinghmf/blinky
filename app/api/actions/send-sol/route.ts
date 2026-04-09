import {
  buildSendSolGetResponse,
  buildSendSolPostResponse,
  createActionJsonResponse,
  createValidationErrorResponse,
} from "@/src/server/actions/send-sol";
import {
  parseSenderAccount,
  parseSendSolParams,
  SendSolValidationError,
} from "@/src/server/validation/send-sol";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const params = parseSendSolParams(requestUrl);
    const payload = buildSendSolGetResponse(requestUrl, params);

    return createActionJsonResponse(payload);
  } catch (error) {
    return createValidationErrorResponse(error);
  }
}

export const OPTIONS = GET;

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const params = parseSendSolParams(requestUrl);
    const sender = await parseSenderAccount(request);

    const payload = await buildSendSolPostResponse(sender, params);
    return createActionJsonResponse(payload);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createValidationErrorResponse(
        new SendSolValidationError("Request body must be valid JSON"),
      );
    }

    return createValidationErrorResponse(error);
  }
}
