import React, { useEffect } from 'react';
import { LiveKitRoom, useLocalParticipant, RoomAudioRenderer } from '@livekit/components-react';

function PushToTalkController({ isTalking }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (localParticipant) {
      if (isTalking) {
        localParticipant.setMicrophoneEnabled(true).catch(console.error);
      } else {
        localParticipant.setMicrophoneEnabled(false).catch(console.error);
      }
    }
  }, [isTalking, localParticipant]);

  return null;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://localhost:3001'
);

export default function VoiceChatManager({ roomName, username, isTalking }) {
  const [token, setToken] = React.useState('');

  useEffect(() => {
    if (!roomName || !username) return;

    // Fetch token from our backend
    fetch(`${BACKEND_URL}/api/livekit-token-async?room=${roomName}&username=${username}`)
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(console.error);
  }, [roomName, username]);

  if (!token) return null;

  // Assuming you have a free tier or local LiveKit server URL in environment
  const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL || (
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'ws://localhost:7880'
      : `ws://${window.location.hostname}:7880`
  );

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={liveKitUrl}
      connect={true}
    >
      <RoomAudioRenderer />
      <PushToTalkController isTalking={isTalking} />
    </LiveKitRoom>
  );
}
