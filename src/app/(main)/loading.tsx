
import RoleBasedPreloader from '@/components/layout/RoleBasedPreloader';

export default function Loading() {
  // This component will be shown by Next.js during page navigations
  // within the (main) layout, while Server Components are loading.
  return <RoleBasedPreloader />;
}
