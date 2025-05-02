import { useAuth } from '../presentation/auth/AuthContext'
 // AuthContext: src/pages/presentation/auth/AuthContext.tsx => useAuth()

 const AdminPanel: React.FC = () => {
    const {user, hasRole } = useAuth();

    return (<div className="admin-panel">
        <h1>Admin panel</h1>
        <p>Welcome, {user?.username}</p>
    

    {hasRole('superAdmin') && (
        <section className="super-admin-section">
        <h2>Super Super Admin Tools</h2>
        <button className="danger-button">Delete organization</button>
        </section>
    )}

        <section className="super-admin-section">
        <h2>Admin Tools</h2>
        <button className="danger-button">Manage user</button>
        <button className="danger-button">Configure settings</button>
        </section>

    </div>

    );
 };

 export default AdminPanel;