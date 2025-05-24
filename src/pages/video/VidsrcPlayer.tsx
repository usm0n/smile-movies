import { useEffect, useRef, useState } from 'react';

export default function VidsrcPlayer() {
  const [events, setEvents] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidsrc.cc') return;

      const payload = event.data;
      if (payload?.type === 'PLAYER_EVENT') {
        const {
          event: eventType,
          currentTime,
          duration,
          tmdbId,
          mediaType,
          season,
          episode,
        } = payload.data;

        const log = {
          eventType,
          currentTime,
          duration,
          tmdbId,
          mediaType,
          season,
          episode,
          time: new Date().toISOString(),
        };

        console.log('[🎥 PLAYER EVENT]', log);

        // Store in local state
        setEvents(prev => [...prev, log]);

        // Optional: Store in localStorage
        const stored = JSON.parse(localStorage.getItem('vidsrcEvents') || '[]');
        localStorage.setItem('vidsrcEvents', JSON.stringify([...stored, log]));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <iframe
        ref={iframeRef}
        src="https://vidsrc.cc/v2/embed/movie/278"
        allowFullScreen
        width="100%"
        height="600"
        frameBorder="0"
        className="rounded-2xl shadow-lg"
      />

      <div style={{
        color: 'white',
      }} className="bg-zinc-900 p-4 rounded-xl text-white">
        <h2 className="text-lg font-bold mb-2">📊 Event Log:</h2>
        <ul className="text-sm max-h-64 overflow-y-auto">
          {events.map((e, i) => (
            <li key={i} className="mb-1">
              <strong>{e.eventType}</strong> — {e.currentTime}s / {e.duration}s
              {' '}
              <span className="text-zinc-400">({e.time})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}