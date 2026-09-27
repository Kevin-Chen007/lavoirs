import { AccessToken } from 'livekit-server-sdk';
import { DEV_MATCH } from '../../packages/shared/src/dev-match.js';
import type { LiveKitTokenRequest, LiveKitTokenResponse } from '../../packages/shared/src/livekit.js';

interface TokenRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface TokenResponseWriter {
  status(code: number): TokenResponseWriter;
  json(payload: unknown): unknown;
  setHeader?(name: string, value: string): void;
}

function readBody(body: unknown): LiveKitTokenRequest | null {
  if (!body || typeof body !== 'object' || !('groupId' in body)) return null;
  const groupId = (body as { groupId?: unknown }).groupId;
  return typeof groupId === 'string' && groupId.length > 0 && groupId.length <= 100
    ? { groupId }
    : null;
}

export default async function handler(req: TokenRequest, res: TokenResponseWriter) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST to request room access.' });
  }

  // This fake identity path must never be enabled in a deployed environment.
  // Replace it with the app session + Supabase group-membership lookup.
  const hostHeader = req.headers.host;
  const localHost = typeof hostHeader === 'string' && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(hostHeader);
  if (process.env.NODE_ENV !== 'development' || process.env.DEV_FAKE_USER_AUTH !== 'true' || !localHost) {
    return res.status(503).json({ error: 'Room authentication is not configured.' });
  }

  const userHeader = req.headers['x-dev-user-id'];
  const userId = typeof userHeader === 'string' ? userHeader : '';
  const request = readBody(req.body);
  if (!userId || !request) {
    return res.status(400).json({ error: 'A demo user and groupId are required.' });
  }

  const group = request.groupId === DEV_MATCH.groupId ? DEV_MATCH : null;
  const member = group?.members.find((candidate) => candidate.id === userId);
  if (!group || !member || group.members.length !== 4) {
    return res.status(403).json({ error: 'This user is not a member of that group.' });
  }

  const { LIVEKIT_URL: serverUrl, LIVEKIT_API_KEY: apiKey, LIVEKIT_API_SECRET: apiSecret } = process.env;
  if (!serverUrl || !apiKey || !apiSecret) {
    return res.status(503).json({ error: 'Add LiveKit credentials to .env.local, then restart the dev server.' });
  }

  try {
    // The room name and participant identity come from the server-side match,
    // not from caller-controlled token claims.
    const roomName = `gather_${group.groupId}`;
    const accessToken = new AccessToken(apiKey, apiSecret, {
      identity: member.id,
      name: member.name,
      ttl: '10m',
    });
    accessToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    });

    const response: LiveKitTokenResponse = {
      serverUrl,
      participantToken: await accessToken.toJwt(),
      roomName,
      participantName: member.name,
    };
    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ error: 'Could not create room access.' });
  }
}
