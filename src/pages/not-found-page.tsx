import { LinkButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';

export function NotFoundPage() {
  return (
    <div className="container" style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
      <EmptyState
        title="Page not found"
        description="That link does not go anywhere. Your orders are still where you left them."
        action={
          <LinkButton to="/" variant="secondary">
            Back to home
          </LinkButton>
        }
      />
    </div>
  );
}
