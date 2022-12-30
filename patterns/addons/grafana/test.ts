import { load } from "js-yaml";
import * as fs from "fs";

function yamlFileToJson(filePath: string): any {
  const yamlString = fs.readFileSync(filePath, "utf8");
  return load(yamlString);
}

function deepCopy<T>(instance: T): T {
  if (instance == null) {
    return instance;
  }

  // handle Dates
  if (instance instanceof Date) {
    return new Date(instance.getTime()) as any;
  }

  // handle Array types
  if (instance instanceof Array) {
    var cloneArr = [] as any[];
    (instance as any[]).forEach((value) => {
      cloneArr.push(value);
    });
    // for nested objects
    return cloneArr.map((value: any) => deepCopy<any>(value)) as any;
  }
  // handle objects
  if (instance instanceof Object) {
    var copyInstance = { ...(instance as { [key: string]: any }) } as {
      [key: string]: any;
    };
    for (var attr in instance) {
      if ((instance as Object).hasOwnProperty(attr))
        copyInstance[attr] = deepCopy<any>(instance[attr]);
    }
    return copyInstance as T;
  }
  // handling primitive data types
  return instance;
}

type datasource = {
  datasources: {
    "datasources.yaml": {
      apiVersion: number;
      datasources: [
        {
          name: string;
          type: string;
          url: string;
          access: string;
          isDefault: boolean;
        }
      ];
    };
  };
};

const yamlJson = JSON.stringify(yamlFileToJson("./grafana.yaml"));
const jsonObj = deepCopy<datasource>(JSON.parse(yamlJson));
const originalJson = {
  name: "John",
  age: 30,
};

const mergedJson = { ...originalJson, ...jsonObj };
console.log(mergedJson);
