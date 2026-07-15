import { Icon, type IconName } from "./icons";

/** Placeholder for recruiter screens that have no backend yet, so real users
 *  never see mock data presented as real. */
export function ComingSoon({
  icon,
  title,
}: {
  icon: IconName;
  title: string;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface2 text-dim">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="mt-4 text-[17px] font-semibold text-text">{title}</h2>
      <p className="mt-1.5 text-[13.5px] text-muted">
        Tez orada — ustida ishlayapmiz.
      </p>
    </div>
  );
}
