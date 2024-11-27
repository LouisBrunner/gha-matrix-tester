import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Editor, initialCode } from "@/components/Editor";
import { Results } from "@/components/Results";

export type AppProps = Record<string, never>;

export const App = (_: AppProps) => {
	const [yaml, setYAML] = useState<string>(initialCode);

	return (
		<div className="flex flex-col h-screen">
			<header className="p-5 text-center">
				<h1 className="text-3xl font-bold">GitHub Actions Matrix Tester</h1>
				<p>Test your GitHub Actions matrix configurations</p>
				<p>
					<a
						href="https://github.com/LouisBrunner/gha-matrix-tester"
						// biome-ignore lint/a11y/noBlankTarget: shush
						target="_blank"
					>
						<FontAwesomeIcon icon={faGithub} />
					</a>
				</p>
			</header>
			<main className="grow min-h-0 flex flex-col md:flex-row gap-2 md:gap-0">
				<section className="h-full grow bg-[rgb(22,27,34)]">
					<Editor value={yaml} onChange={setYAML} />
				</section>
				<output className="h-full md:w-1/2">
					<Results yaml={yaml} />
				</output>
			</main>
		</div>
	);
};
