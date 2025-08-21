import stringify from "json-stringify-deterministic";
import { useEffect, useState } from "react";
import { parse } from "yaml";
import { array, lazy, object, string } from "yup";

const dynamicObject = <T, U extends {}>(rule: T, others?: U) => {
	return lazy((obj: Record<string, unknown>) =>
		object({
			...others,
			...Object.keys(obj).reduce<Record<string, T>>((newMap, key) => {
				if (others === undefined || !(key in others)) {
					newMap[key] = rule;
				}
				return newMap;
			}, {}),
		}).required(),
	);
};

const matrixSchema = dynamicObject(array().of(string().required()).required(), {
	include: array().of(dynamicObject(string().required())),
	exclude: array().of(dynamicObject(string().required())),
});

const eachObject = (
	obj: Record<string, unknown>,
	callback: (key: string, value: unknown) => void,
) => {
	for (const key in obj) {
		// biome-ignore lint/suspicious/noPrototypeBuiltins: returned from yaml parser
		if (!obj.hasOwnProperty(key)) {
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
			const parsed = parse(yaml);
			const matrices: Matrix[] = [];
			let count = 0;
			eachObject(parsed, (key, value) => {
				if (key !== "matrix") {
					return;
				}
				const res = matrixSchema.validateSync(value) as unknown as RawMatrix;
				matrices.push({
					id: `${stringify(res)}-${count++}`,
					entries: Object.fromEntries(
						Object.entries(res).filter(
							([k]) => k !== "include" && k !== "exclude",
						),
					) as Matrix["entries"],
					include: res.include,
					exclude: res.exclude,
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
