import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
      // Run queryFn even when offline so each hook's catch-block can serve device-cached data
      // instead of leaving the UI in an infinite loading state.
      networkMode: 'offlineFirst',
    },
  },
});

export { QueryClientProvider, queryClient };
