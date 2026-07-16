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

export const saveCode = (code: string) => {
	window.localStorage.setItem(LSYamlKey, code);
};
