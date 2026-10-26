interface PageHeadingProps {
  title: string;
  description: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
