import { load } from "js-yaml";
import * as fs from "fs";

function yamlFileToJson(filePath: string): any {
  const yamlString = fs.readFileSync(filePath, "utf8");
  return load(yamlString);
}

const yamlJson = JSON.stringify(yamlFileToJson("./grafana.yaml"));
const originalJson = {
  name: "John",
  age: 30,
};
console.log(typeof yamlJson);

// const mergedJson = { ...originalJson, ...yamlJson };
