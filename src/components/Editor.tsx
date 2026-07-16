import { highlight, languages } from "prismjs/components/prism-core";
import { initialCode, saveCode } from "@/logic/storage.ts";
import "prismjs/components/prism-yaml";
import { useCallback, useEffect, useMemo, useState } from "react";
import CodeEditor from "react-simple-code-editor";

const debounce = <T,>(fn: (...args: T[]) => void, delay: number) => {
	let timer: number;
	return (...args: T[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...args);
		}, delay);
	};
};

const updateDelay = 500;

// biome-ignore lint/complexity/useLiteralKeys: TS wants it
const yamlGrammar = languages["yaml"];
if (yamlGrammar === undefined) {
	throw new Error("yaml grammar not loaded");
}

const highlightYAML = (code: string) => highlight(code, yamlGrammar, "yaml");

export type EditorProps = {
	onChange: (value: string) => void;
};

export const Editor = ({ onChange }: EditorProps) => {
	const [value, setValue] = useState(initialCode);

	const onChangeDebounced = useMemo(
		() => debounce(onChange, updateDelay),
		[onChange],
	);

	const codeChanged = useCallback(
		(newValue: string) => {
			setValue(newValue);
			onChangeDebounced(newValue);
		},
		[onChangeDebounced],
	);

	useEffect(() => {
		saveCode(value);
	}, [value]);

	return (
		<div className="h-full overflow-y-scroll bg-[rgb(22,27,34)] font-mono text-[#c9d1d9] text-xs">
			<CodeEditor
				className="min-h-full overflow-y-scroll"
				highlight={highlightYAML}
				onValueChange={codeChanged}
				padding={10}
				placeholder="# paste your code here"
				value={value}
			/>
		</div>
	);
};
