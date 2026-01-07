import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import NotFound from '@/pages/not-found';
import { queryClient } from './lib/queryClient';

/**
 * Get base path for router from Vite's BASE_URL.
 * - Development: BASE_URL = '/' (default)
 * - GitHub Pages: BASE_URL = '/Beppo-Laughs/' (from VITE_BASE_PATH env var in build)
 * This allows the router to correctly handle subpath deployments.
 */
const basePath = import.meta.env.BASE_URL || '/';

function Router() {
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
