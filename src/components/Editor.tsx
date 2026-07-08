import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-yaml";
import { useCallback, useEffect, useMemo, useState } from "react";
import CodeEditor from "react-simple-code-editor";

const LSYamlKey = "yaml";

const defaultCode = `strategy:
  matrix:
    fruit: [apple, pear]
    animal: [cat, dog]
    include:
      - color: green
      - color: pink
        animal: cat
      - fruit: apple
        shape: circle
      - fruit: banana
      - fruit: banana
        animal: cat
`;

export const initialCode =
	window.localStorage.getItem(LSYamlKey) ?? defaultCode;

const debounce = <T,>(fn: (...args: T[]) => void, delay: number) => {
	let timer: number;
	return (...args: T[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...args);
		}, delay);
	};
};

const highlightYAML = (code: string) => highlight(code, languages.yaml, "yaml");

export type EditorProps = {
	onChange: (value: string) => void;
};

export const Editor = ({ onChange }: EditorProps) => {
	const [value, setValue] = useState(initialCode);

	const onChangeDebounced = useMemo(() => {
		return debounce(onChange, 500);
	}, [onChange]);

	const codeChanged = useCallback(
		(newValue: string) => {
			setValue(newValue);
			onChangeDebounced(newValue);
		},
		[onChangeDebounced],
	);

	useEffect(() => {
		window.localStorage.setItem(LSYamlKey, value);
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
