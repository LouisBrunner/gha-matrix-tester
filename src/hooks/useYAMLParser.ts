import stringify from "json-stringify-deterministic";
import { useEffect, useState } from "react";
import {
	array,
	objectWithRest,
	optional,
	record,
	string,
	parse as validate,
} from "valibot";
import { parse as parseYAML } from "yaml";

const stringRecord = () => record(string(), string());

const matrixSchema = objectWithRest(
	{
		exclude: optional(array(stringRecord())),
		include: optional(array(stringRecord())),
	},
	array(string()),
);

const eachObject = (
	obj: Record<string, unknown>,
	callback: (key: string, value: unknown) => void,
) => {
	for (const key in obj) {
		if (!Object.hasOwn(obj, key)) {
			continue;
		}
		callback(key, obj[key]);
		if (typeof obj[key] === "object") {
			eachObject(obj[key] as Record<string, unknown>, callback);
		}
	}
};

export type RawMatrix = Record<string, string[]> & {
	include?: Record<string, string>[];
	exclude?: Record<string, string>[];
};

export type Matrix = {
	id: string;
	entries: Record<string, string[]>;
	include?: Record<string, string>[];
	exclude?: Record<string, string>[];
};

export type useYAMLParserProps = {
	yaml: string;
};

export type useYAMLParserResult = Matrix[] | Error | "loading" | undefined;

export const useYAMLParser = ({
	yaml,
}: useYAMLParserProps): useYAMLParserResult => {
	const [status, setStatus] = useState<"loading" | Error>();
	const [result, setResult] = useState<Matrix[]>();

	useEffect(() => {
		setStatus("loading");
		try {
			const parsed = parseYAML(yaml);
			const matrices: Matrix[] = [];
			let count = 0;
			eachObject(parsed, (key, value) => {
				if (key !== "matrix") {
					return;
				}
				const res = validate(matrixSchema, value) as unknown as RawMatrix;
				matrices.push({
					entries: Object.fromEntries(
						Object.entries(res).filter(
							([k]) => k !== "include" && k !== "exclude",
						),
					) as Matrix["entries"],
					exclude: res.exclude,
					id: `${stringify(res)}-${count++}`,
					include: res.include,
				});
			});
			setResult((prev) => {
				if (prev === undefined) {
					return matrices;
				}
				const prevIds = prev.reduce<Record<string, Matrix>>((acc, cur) => {
					acc[cur.id] = cur;
					return acc;
				}, {});
				for (const i in matrices) {
					const prevMatrix = prevIds[matrices[i].id];
					if (prevMatrix === undefined) {
						continue;
					}
					matrices[i] = prevMatrix;
				}
				return matrices;
			});
			setStatus(undefined);
		} catch (e) {
			setStatus(e as Error);
		}
	}, [yaml]);

	if (status !== undefined) {
		return status;
	}
	return result;
};
