import { MatrixDetails } from "@/components/MatrixDetails";
import { useYAMLParser } from "@/hooks/useYAMLParser";

export type ResultsProps = {
	yaml: string;
};

export const Results = ({ yaml }: ResultsProps) => {
	const parsed = useYAMLParser({ yaml });

	if (parsed === undefined) {
		return null;
	}
	if (parsed === "loading") {
		return <div className="px-3 pb-2">Loading...</div>;
	}
	if (parsed instanceof Error) {
		return (
			<div className="text-red-800 dark:text-red-600 font-mono px-3 pb-2 whitespace-pre-wrap">
				{parsed.toString()}
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-scroll flex flex-col gap-3 px-3 pb-2">
			{parsed.map((entry, i) => {
				return (
					<details
						open
						key={entry.id}
						className="flex bg-sky-100 dark:bg-gray-900 p-3 transition-[max-height] rounded-lg"
					>
						<summary className="cursor-pointer font-semibold">
							Matrix {i + 1}
						</summary>
						<div className="mt-3">
							<MatrixDetails matrix={entry} />
						</div>
					</details>
				);
			})}
		</div>
	);
};
