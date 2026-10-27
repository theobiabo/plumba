interface PageHeadingProps {
  title: string;
  description: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="max-w-[75ch] text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  );
}
