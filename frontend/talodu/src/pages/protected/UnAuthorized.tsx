import { useAuth } from '../presentation/auth/AuthContext'
 // AuthContext: src/pages/presentation/auth/AuthContext.tsx => useAuth()

 const UnAuthorized: React.FC = () => {
    const {user, hasRole } = useAuth();

    return (<div className="admin-panel">
        <p>Sorry, {user?.username}</p>
        <p><h1>You don't have sufficient permissions to access the page you requested</h1></p>
        <p><h5>if you believe this to be an error, then contact an admin for assistance</h5></p>
        
        

        <section className="super-admin-section">
        <h2>Admin Tools</h2>
        <button className="danger-button">Contact Admin</button>
        <button className="danger-button">Report an error</button>
        </section>

    </div>

    );
 };

 export default UnAuthorized;