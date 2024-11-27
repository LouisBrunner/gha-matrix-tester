import { type ChangeEvent, useCallback, useEffect, useMemo } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

const LSYamlKey = "yaml";

export const initialCode = window.localStorage.getItem(LSYamlKey) ?? "";

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
				value={value}
				placeholder="# paste your code here"
				onChange={codeChanged}
				language="yaml"
				padding={10}
			/>
		</div>
	);
};
