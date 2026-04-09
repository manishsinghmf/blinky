import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export async function GET() {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/api/actions/send-sol",
        apiPath: "/api/actions/send-sol",
      },
    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export const OPTIONS = GET;

