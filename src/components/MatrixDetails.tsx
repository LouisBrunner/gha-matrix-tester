import { CircleX, Pencil, Plus } from "lucide-react";
// biome-ignore lint/correctness/noUnresolvedImports: Biome can't see react's CJS-exported Fragment
import { Fragment, memo, useMemo } from "react";
import type { Matrix } from "@/hooks/useYAMLParser.ts";
import { objectEntries } from "@/utils.ts";

const hasNoConflict = (
	include: Record<string, string>,
	entry: Record<string, string>,
	original: Record<string, string[]>,
): boolean => {
	const originalEntries = objectEntries(original);
	if (originalEntries.length === 0) {
		return false;
	}

	for (const [key, allowed] of originalEntries) {
		const includeValue = include[key];
		const entryValue = entry[key];
		if (includeValue === undefined || entryValue === undefined) {
			continue;
		}
		if (includeValue !== entryValue || !allowed.includes(includeValue)) {
			return false;
		}
	}
	return true;
};

const formatObject = (rec: Record<string, string>) => (
	<>
		{Object.keys(rec)
			.toSorted((a, b) => a.localeCompare(b))
			.map((key, i) => {
				const value = rec[key];
				return (
					<Fragment key={key}>
						{i > 0 ? ", " : null}
						<span className="font-mono">{key}</span>:{" "}
						<span className="font-mono">{value}</span>
					</Fragment>
				);
			})}
	</>
);

export type MatrixDetailsProps = {
	matrix: Matrix;
};

type MatrixAction = {
	type: "add" | "edit" | "remove";
	details: (Record<string, string> | string)[];
};

export const MatrixDetails = memo(({ matrix }: MatrixDetailsProps) => {
	const { include, exclude, entries } = matrix;

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: how?
	const allKeys = useMemo(() => {
		const keys = new Set<string>();
		for (const key of Object.keys(entries)) {
			keys.add(key);
		}
		if (include !== undefined) {
			for (const entry of include) {
				for (const key of Object.keys(entry)) {
					keys.add(key);
				}
			}
		}
		if (exclude !== undefined) {
			for (const entry of exclude) {
				for (const key of Object.keys(entry)) {
					keys.add(key);
				}
			}
		}
		return keys;
	}, [include, exclude, entries]);

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: nope
	const [actions, finalState] = useMemo(() => {
		let state: Record<string, string>[] = [];
		const factions: MatrixAction[] = [];

		for (const [key, values] of objectEntries(entries).toSorted(([a], [b]) =>
			a.localeCompare(b),
		)) {
			if (state.length === 0) {
				for (const value of values) {
					state.push({ [key]: value });
				}
				continue;
			}

			const newState: Record<string, string>[] = [];
			for (const entry of state) {
				for (const value of values) {
					newState.push({ ...entry, [key]: value });
				}
			}
			state = newState;
		}

		if (exclude !== undefined) {
			for (const entry of exclude) {
				state = state.filter((stateEntry) => {
					const allPropertiesMatch = Object.entries(entry).every(
						([key, value]) => stateEntry[key] === value,
					);
					if (allPropertiesMatch) {
						factions.push({
							details: [
								"removed",
								{ ...stateEntry },
								"because it matched",
								entry,
							],
							type: "remove",
						});
					}
					return !allPropertiesMatch;
				});
			}
		}

		if (include !== undefined) {
			for (const entry of include) {
				let matched = false;
				for (const stateEntry of state) {
					if (!hasNoConflict(entry, stateEntry, entries)) {
						continue;
					}

					const orig = { ...stateEntry };
					const newValues: Record<string, string> = {};
					for (const [key, values] of objectEntries(entry)) {
						if (stateEntry[key] !== values) {
							newValues[key] = values;
						}
						stateEntry[key] = values;
					}
					factions.push({
						details: [
							"changed",
							newValues,
							"in",
							orig,
							"because it matched",
							entry,
						],
						type: "edit",
					});
					matched = true;
				}
				if (!matched) {
					state.push(entry);
					factions.push({
						details: [
							"added",
							entry,
							"because it was not part of the original values",
						],
						type: "add",
					});
				}
			}
		}

		return [factions, state];
	}, [include, exclude, entries]);

	return (
		<div className="flex flex-col gap-2">
			<div>
				<table className="w-full table-auto">
					<thead className="border-b-gray-700 dark:border-b-gray-500 border-b-2">
						<tr>
							{Array.from(allKeys).map((key) => (
								<th
									className="font-mono border-x-gray-700 dark:border-x-gray-500 border-x-2 first:border-x-0 last:border-x-0 p-1"
									key={key}
								>
									{key}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{finalState.map((entry, i) => {
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: is OK
								<tr key={i}>
									{Array.from(allKeys).map((key) => (
										<td
											className="font-mono border-x-gray-700 dark:border-x-gray-500 border-x-2 first:border-x-0 last:border-x-0 p-1"
											key={key}
										>
											{entry[key]}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<details className="p-2 pb-0">
				<summary>Details</summary>
				<div className="flex flex-col gap-2 pb-2">
					<div>
						<h6>Initial sets:</h6>
						<div className="ml-2">
							{objectEntries(entries)
								.toSorted(([a], [b]) => a.localeCompare(b))
								.map(([key, values]) => (
									<div key={key}>
										<span className="font-mono">{key}</span>:{" "}
										{values.map((value, i) => (
											<Fragment key={value}>
												{i > 0 ? ", " : null}
												<span className="font-mono">{value}</span>
											</Fragment>
										))}
									</div>
								))}
						</div>
					</div>
					{include === undefined ? null : (
						<div>
							<h6>Includes:</h6>
							<ul className="ml-2">
								{include.map((entry, i) => {
									// biome-ignore lint/suspicious/noArrayIndexKey: eh
									return <li key={i}>{formatObject(entry)}</li>;
								})}
							</ul>
						</div>
					)}
					{exclude === undefined ? null : (
						<div>
							<h6>Excludes:</h6>
							<ul className="ml-2">
								{exclude.map((entry, i) => {
									// biome-ignore lint/suspicious/noArrayIndexKey: eh
									return <li key={i}>{formatObject(entry)}</li>;
								})}
							</ul>
						</div>
					)}
					<div>
						<h6>Actions:</h6>
						<ul className="ml-2">
							{actions.map((action, i) => {
								return (
									// biome-ignore lint/suspicious/noArrayIndexKey: is OK
									<li key={i}>
										{action.type === "add" ? (
											<Plus className="inline" size="1em" />
										) : action.type === "edit" ? (
											<Pencil className="inline" size="1em" />
										) : (
											<CircleX className="inline" size="1em" />
										)}
										{action.details.map((piece, j) => {
											return (
												// biome-ignore lint/suspicious/noArrayIndexKey: eh
												<Fragment key={j}>
													{" "}
													{typeof piece === "string"
														? piece
														: formatObject(piece)}
												</Fragment>
											);
										})}
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</details>
		</div>
	);
});
