import { useState } from 'react';
import { DEV_MATCH, DEV_USERS } from '../../../../../packages/shared/src/dev-match.js';
import { LiveKitRoom } from './LiveKitRoom.js';

export function RoomPage() {
  const [userId, setUserId] = useState(DEV_USERS[0].id);
  const user = DEV_USERS.find((candidate) => candidate.id === userId)!;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Gather home"><span className="brand-mark">✳</span> gather</a>
        <span className="dev-badge"><i /> Local LiveKit check</span>
      </header>

      <section className="intro">
        <p className="eyebrow">A quick room check</p>
        <h1>Four people.<br /><em>One shared room.</em></h1>
        <p className="intro-copy">This temporary page connects seeded members to one LiveKit room so you can verify entry, media, and leaving before the app features are integrated.</p>
      </section>

      <section className="room-columns">
        <aside className="group-card">
          <div className="group-topline"><span className="section-label">MATCHED GROUP</span><span className="member-count">{DEV_MATCH.members.length} / 4</span></div>
          <h2>Your group</h2>
          <p className="group-subtitle">Shared interests · Portland, OR</p>
          <div className="member-list">
            {DEV_MATCH.members.map((member, index) => (
              <div className="member-row" key={member.id}>
                <span className={`member-avatar avatar-${index}`}>{member.name.split(' ').map((part) => part[0]).join('')}</span>
                <span className="member-name">{member.name}{member.id === user.id ? <small>YOU</small> : null}<span>{member.interests.join(' · ')}</span></span>
                <span className="member-dot" title="In test group" />
              </div>
            ))}
          </div>
          <div className="demo-login">
            <label htmlFor="test-user">Local test identity</label>
            <select id="test-user" value={userId} onChange={(event) => setUserId(event.target.value)}>
              {DEV_USERS.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}
            </select>
            <p>Open this page in another browser or private window and choose a different person to test a second client.</p>
          </div>
        </aside>

        <LiveKitRoom groupId={DEV_MATCH.groupId} user={user} />
      </section>

      <footer className="safety-note"><span>🔒</span><p><strong>Development-only identities.</strong> The token endpoint accepts this fake login only in local development. Production requests are denied until real session and group membership checks are connected.</p></footer>
    </main>
  );
}
