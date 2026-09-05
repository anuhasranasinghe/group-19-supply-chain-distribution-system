import { Bell } from 'lucide-react';

export function NotificationsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Your notification center</p>
      </div>
      <div className="card">
        <div className="empty-state">
          <Bell className="empty-state-icon" />
          <p className="empty-state-title">No notifications</p>
          <p>System notifications will appear here once the notification triggers are implemented</p>
        </div>
      </div>
    </div>
  );
}
