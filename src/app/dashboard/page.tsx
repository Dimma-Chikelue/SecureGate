import { requireVerified } from "@/lib/auth-helpers";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const session = await requireVerified();

  const deliveries = [
    { id: "1", title: "Abstract Composition No. 4", artist: "M. Chen", status: "Delivered", date: "May 12, 2026" },
    { id: "2", title: "Urban Reflections", artist: "A. Rivera", status: "In Transit", date: "May 8, 2026" },
    { id: "3", title: "Silent Horizon", artist: "K. Patel", status: "Ready", date: "Apr 30, 2026" },
    { id: "4", title: "Chromatic Study", artist: "L. Svensson", status: "Delivered", date: "Apr 22, 2026" },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="logo">SecureGate</div>
          <span className="dashboard-badge">Client Vault</span>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-email">{session.user?.email}</span>
          <div className="verified-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Verified
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-card">
          <h1>Welcome, {session.user?.name || "Client"}</h1>
          <p>Your vault contains {deliveries.length} delivery records. All secure and accessible.</p>
        </section>

        <section className="deliveries-section">
          <h2>Recent Deliveries</h2>
          <div className="deliveries-grid">
            {deliveries.map((d) => (
              <div key={d.id} className="delivery-card">
                <div className="delivery-status">
                  <span className={`status-dot status-${d.status.toLowerCase().replace(/\s+/g, "-")}`} />
                  {d.status}
                </div>
                <h3>{d.title}</h3>
                <p className="delivery-artist">{d.artist}</p>
                <p className="delivery-date">{d.date}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
