export type BrandIconProps = {
	icon: { path: string; title: string };
	className?: string;
};

export const BrandIcon = ({ icon, className }: BrandIconProps) => (
	<svg
		className={className}
		fill="currentColor"
		height="1em"
		role="img"
		viewBox="0 0 24 24"
		width="1em"
	>
		<title>{icon.title}</title>
		<path d={icon.path} />
	</svg>
);
