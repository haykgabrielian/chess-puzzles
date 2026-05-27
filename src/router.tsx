import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import Home from '@/pages/Home';
import { formatDateForUrl, getToday, isFutureDate, parseDateFromUrl } from '@/helpers/date';

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});

const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/$date',
      params: { date: formatDateForUrl(getToday()) },
    });
  },
});

export const dateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$date',
  component: Home,
  beforeLoad: ({ params }) => {
    const date = parseDateFromUrl(params.date);

    if (!date || isFutureDate(date)) {
      throw redirect({
        to: '/$date',
        params: { date: formatDateForUrl(getToday()) },
      });
    }
  },
});

const routeTree = rootRoute.addChildren([IndexRoute, dateRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
