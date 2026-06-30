interface SectionHeadingProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeading({ title, description, icon, action }: SectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        {icon && <div className="text-aegis-teal mt-0.5">{icon}</div>}
        <div>
          <h2 className="font-display text-lg font-semibold text-aegis-silver">{title}</h2>
          {description && (
            <p className="font-body text-sm text-aegis-gray mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}