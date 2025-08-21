import CodeEditor from "@uiw/react-textarea-code-editor";
import { type ChangeEvent, useCallback, useEffect, useMemo } from "react";

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

export type EditorProps = {
	value: string;
	onChange: (value: string) => void;
};

export const Editor = ({ value, onChange }: EditorProps) => {
	const onChangeDebounced = useMemo(() => {
		return debounce(onChange, 500);
	}, [onChange]);

	const codeChanged = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			onChangeDebounced(e.target.value);
		},
		[onChangeDebounced],
	);

	useEffect(() => {
		window.localStorage.setItem(LSYamlKey, value);
	}, [value]);

	return (
		<div className="h-full overflow-y-scroll text-2xl/1 font-mono">
			<CodeEditor
				className="min-h-full overflow-y-scroll"
				value={value}
				placeholder="# paste your code here"
				data-color-mode="dark"
				onChange={codeChanged}
				language="yaml"
				padding={10}
			/>
		</div>
	);
};
