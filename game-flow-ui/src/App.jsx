import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div style={{ width: '100%', maxWidth: 430 }}>
            <AppRoutes />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
