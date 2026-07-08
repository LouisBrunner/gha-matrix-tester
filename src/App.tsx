import { useState } from "react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "@/components/BrandIcon";
import { Editor, initialCode } from "@/components/Editor";
import { Results } from "@/components/Results";

export type AppProps = Record<string, never>;

export const App = (_: AppProps) => {
	const [yaml, setYAML] = useState<string>(initialCode);

	return (
		<div className="flex flex-col h-screen">
			<header className="p-5 text-center space-y-2">
				<h1 className="text-3xl font-bold">GitHub Actions Matrix Tester</h1>
				<p>Test your GitHub Actions matrix configurations</p>
				<p className="flex justify-center">
					<a
						href="https://github.com/LouisBrunner/gha-matrix-tester"
						rel="noopener"
						target="_blank"
					>
						<BrandIcon icon={siGithub} />
						<span className="sr-only">GitHub</span>
					</a>
				</p>
			</header>
			<main className="grow min-h-0 flex flex-col md:flex-row gap-2 md:gap-0">
				<section className="h-full md:w-1/2 bg-[rgb(22,27,34)]">
					<Editor onChange={setYAML} />
				</section>
				<output className="h-full md:w-1/2">
					<Results yaml={yaml} />
				</output>
			</main>
		</div>
	);
};
