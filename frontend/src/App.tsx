import { BrowserRouter } from 'react-router-dom';
import { AppChrome } from './core/components/layout/AppChrome';
import { AppRoutes } from './routes';
import { AuthProvider } from './core/contexts/AuthContext';
import { NavigationProvider } from './core/components/navigation/NavigationContext';
import { I18nProvider } from './core/i18n';
import { NavigationBootstrap } from './features/navigation/components/NavigationBootstrap';

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <NavigationProvider>
          <BrowserRouter>
            <NavigationBootstrap />
            <AppChrome>
              <AppRoutes />
            </AppChrome>
          </BrowserRouter>
        </NavigationProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
