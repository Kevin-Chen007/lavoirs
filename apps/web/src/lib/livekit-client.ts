import type { LiveKitTokenResponse } from '../../../../packages/shared/src/livekit.js';

export async function requestRoomToken(groupId: string): Promise<LiveKitTokenResponse> {
  const response = await fetch('/api/livekit/token', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ groupId }),
  });

  const payload = await response.json() as LiveKitTokenResponse | { error?: string };
  if (!response.ok) {
    throw new Error('error' in payload && payload.error ? payload.error : 'Room access was denied.');
  }
  if (!('participantToken' in payload) || !payload.serverUrl || !payload.participantToken) {
    throw new Error('The token endpoint returned an incomplete response.');
  }
  return payload;
}
