import type { Matrix } from "@/hooks/useYAMLParser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, memo, useMemo } from "react";
import {
	faPlus,
	faPencil,
	faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

const hasNoConflict = (
	include: Record<string, string>,
	entry: Record<string, string>,
	original: Record<string, string[]>,
): boolean => {
	for (const [key, allowed] of Object.entries(original)) {
		if (!(key in include) || !(key in entry)) {
			continue;
		}
		if (include[key] !== entry[key] || !allowed.includes(include[key])) {
			return false;
		}
	}
	return true;
};

const formatObject = (rec: Record<string, string>) => {
	return (
		<>
			{Object.keys(rec)
				.toSorted()
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
};

export type MatrixDetailsProps = {
	matrix: Matrix;
};

type MatrixAction = {
	type: "add" | "edit" | "remove";
	details: (Record<string, string> | string)[];
};

export const MatrixDetails = memo(({ matrix }: MatrixDetailsProps) => {
	const { include, exclude, entries } = matrix;

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

	const [actions, finalState] = useMemo(() => {
		let state: Record<string, string>[] = [];
		const actions: MatrixAction[] = [];

		for (const key of Object.keys(entries).toSorted()) {
			const values = entries[key];
			if (state.length === 0) {
				for (const value of values) {
					state.push({ [key]: value });
				}
				continue;
			}

			const newState = [];
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
						([key, value]) => {
							return stateEntry[key] === value;
						},
					);
					if (allPropertiesMatch) {
						actions.push({
							type: "remove",
							details: [
								"removed",
								{ ...stateEntry },
								"because it matched",
								entry,
							],
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
					for (const key of Object.keys(entry)) {
						if (stateEntry[key] !== entry[key]) {
							newValues[key] = entry[key];
						}
						stateEntry[key] = entry[key];
					}
					actions.push({
						type: "edit",
						details: [
							"changed",
							newValues,
							"in",
							orig,
							"because it matched",
							entry,
						],
					});
					matched = true;
				}
				if (!matched) {
					state.push(entry);
					actions.push({
						type: "add",
						details: [
							"added",
							entry,
							"because it was not part of the original values",
						],
					});
				}
			}
		}

		return [actions, state];
	}, [include, exclude, entries]);

	return (
		<div className="flex flex-col gap-2">
			<div>
				<table className="w-full table-auto">
					<thead className="border-b-gray-700 dark:border-b-gray-500 border-b-2">
						<tr>
							{Array.from(allKeys).map((key) => {
								return (
									<th
										key={key}
										className="font-mono border-x-gray-700 dark:border-x-gray-500 border-x-2 first:border-x-0 last:border-x-0 p-1"
									>
										{key}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{finalState.map((entry, i) => {
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: is OK
								<tr key={i}>
									{Array.from(allKeys).map((key) => {
										return (
											<td
												key={key}
												className="font-mono border-x-gray-700 dark:border-x-gray-500 border-x-2 first:border-x-0 last:border-x-0 p-1"
											>
												{entry[key]}
											</td>
										);
									})}
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
							{Object.keys(entries)
								.toSorted()
								.map((key) => {
									return (
										<div key={key}>
											<span className="font-mono">{key}</span>:{" "}
											{entries[key].map((value, i) => {
												return (
													<Fragment key={value}>
														{i > 0 ? ", " : null}
														<span className="font-mono">{value}</span>
													</Fragment>
												);
											})}
										</div>
									);
								})}
						</div>
					</div>
					{include !== undefined ? (
						<div>
							<h6>Includes:</h6>
							<ul className="ml-2">
								{include.map((entry, i) => {
									// biome-ignore lint/suspicious/noArrayIndexKey: eh
									return <li key={i}>{formatObject(entry)}</li>;
								})}
							</ul>
						</div>
					) : null}
					{exclude !== undefined ? (
						<div>
							<h6>Excludes:</h6>
							<ul className="ml-2">
								{exclude.map((entry, i) => {
									// biome-ignore lint/suspicious/noArrayIndexKey: eh
									return <li key={i}>{formatObject(entry)}</li>;
								})}
							</ul>
						</div>
					) : null}
					<div>
						<h6>Actions:</h6>
						<ul className="ml-2">
							{actions.map((action, i) => {
								return (
									// biome-ignore lint/suspicious/noArrayIndexKey: is OK
									<li key={i}>
										{action.type === "add" ? (
											<FontAwesomeIcon icon={faPlus} />
										) : action.type === "edit" ? (
											<FontAwesomeIcon icon={faPencil} />
										) : (
											<FontAwesomeIcon icon={faCircleXmark} />
										)}
										{action.details.map((piece, i) => {
											return (
												// biome-ignore lint/suspicious/noArrayIndexKey: eh
												<Fragment key={i}>
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
