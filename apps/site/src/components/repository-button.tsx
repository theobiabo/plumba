import { Button } from '@plumba/ui/components/button';

interface RepositoryButtonProps {
  href: string;
}

export function RepositoryButton({ href }: RepositoryButtonProps) {
  return (
    <Button
      render={<a href={href} />}
      nativeButton={false}
      size="lg"
      className="mt-8 min-h-[46px] gap-[9px] px-5 text-sm"
    >
      GitHub <span aria-hidden="true">↗</span>
    </Button>
  );
}
