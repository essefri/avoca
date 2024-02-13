import { Text } from "../../modules/utils/Text";

describe("Text.toRegex", () => {
  test("returns a regex with correct source and flags", () => {
    // Arrange
    const inputString = "hello world";
    const globalFlag = "g";

    // Act
    const regex = Text.toRegex(inputString, globalFlag);

    // Assert
    expect(regex.source).toBe(inputString);
    expect(regex.flags).toBe(globalFlag);
  });

  test('matches correctly with the pattern "o*"', () => {
    // Arrange
    const inputString = "hello world";

    // Act
    const matchResult = inputString.match(Text.toRegex("o*"));

    // Assert
    expect(matchResult).not.toBeNull();
    expect(matchResult[0]).toBe("o world");
  });

  test('matches correctly with the pattern "*o"', () => {
    // Arrange
    const inputString = "hello world";

    // Act
    const matchResult = inputString.match(Text.toRegex("*o"));

    // Assert
    expect(matchResult).not.toBeNull();
    expect(matchResult[0]).toBe("hello wo");
  });
});

describe("Text.has", () => {
  test("returns true when substring is present in the text", () => {
    // Arrange
    const text = "hello world";
    const substring = "hello";

    // Act & Assert
    expect(Text.has(text, substring)).toBeTruthy();
  });

  test("returns true when full text matches", () => {
    // Arrange
    const text = "hello world";

    // Act & Assert
    expect(Text.has(text, text)).toBeTruthy();
  });

  test("returns true when regex pattern matches", () => {
    // Arrange
    const text = "hello world";
    const regexPattern = /^hello/;

    // Act & Assert
    expect(Text.has(text, regexPattern)).toBeTruthy();
  });

  test("returns false when both text and substring are undefined", () => {
    // Act & Assert
    expect(Text.has(undefined, undefined)).toBeFalsy();
  });

  test("returns false when text is defined and substring is undefined", () => {
    // Arrange
    const text = "hello world";

    // Act & Assert
    expect(Text.has(text, undefined)).toBeFalsy();
  });
});

describe("Text.toUpperCase", () => {
  test("throws an error if the target is not a string", () => {
    // Assert
    expect(() => Text.toUpperCase(undefined as any)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error with invalid start argument", () => {
    // Assert
    expect(() => Text.toUpperCase("hello", 55)).toThrow(
      `Invalid 'start' argument.`
    );
  });

  test("throws an error with invalid end argument", () => {
    // Assert
    expect(() => Text.toUpperCase("hello", 0, 55)).toThrow(
      `Invalid 'end' argument.`
    );
  });

  test("converts characters within the specified range to uppercase", () => {
    // Act & Assert
    expect(Text.toUpperCase("hello world", 0, 1)).toBe("Hello world");
    expect(Text.toUpperCase("hello world", 0, 4)).toBe("HELLo world");
  });

  test("converts entire string to uppercase when start and end are not provided", () => {
    // Act & Assert
    expect(Text.toUpperCase("hello world", 0)).toBe("HELLO WORLD");
  });
});

describe("Text.toUpperCaseWhen", () => {
  test("throws an error if the target is not a string", () => {
    // Assert
    expect(() =>
      Text.toUpperCaseWhen(undefined as any, undefined as any)
    ).toThrow(`The 'target' argument must be a string`);
  });

  test("throws an error if the test is not a string or RegExp", () => {
    // Assert
    expect(() => Text.toUpperCaseWhen("hello", undefined as any)).toThrow(
      `The 'test' argument must be a string or RegExp`
    );
  });

  test("converts characters matching the test to uppercase", () => {
    // Act & Assert
    expect(Text.toUpperCaseWhen("hello world", "world")).toBe("hello WORLD");
    expect(Text.toUpperCaseWhen("hi hi hello hi", "hi")).toBe("HI HI hello HI");
  });

  test("converts characters matching the test (string with wildcards) to uppercase", () => {
    // Act & Assert
    expect(Text.toUpperCaseWhen("hello world", "llo*")).toBe("heLLO WORLD");
  });

  test('converts entire string to uppercase when test is "*"', () => {
    // Act & Assert
    expect(Text.toUpperCaseWhen("hello world", "*")).toBe("HELLO WORLD");
  });

  test("converts characters matching the test (RegExp) to uppercase", () => {
    // Act & Assert
    expect(Text.toUpperCaseWhen("hello world", /o/)).toBe("hellO world");
    expect(Text.toUpperCaseWhen("hello world", /o/g)).toBe("hellO wOrld");
  });

  test('converts entire string to uppercase when test is ".*" (RegExp)', () => {
    // Act & Assert
    expect(Text.toUpperCaseWhen("hello world", /.*/)).toBe("HELLO WORLD");
  });
});

describe("Text.toLowerCase", () => {
  test("throws an error if the target is not a string", () => {
    // Assert
    expect(() => Text.toLowerCase(undefined as any)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error if the start argument is invalid", () => {
    // Assert
    expect(() => Text.toLowerCase("hello", 55)).toThrow(
      `Invalid 'start' argument.`
    );
  });

  test("throws an error if the end argument is invalid", () => {
    // Assert
    expect(() => Text.toLowerCase("hello", 0, 55)).toThrow(
      `Invalid 'end' argument.`
    );
  });

  test("converts characters within the specified range to lowercase", () => {
    // Act & Assert
    expect(Text.toLowerCase("HELLO WORLD", 0, 1)).toBe("hELLO WORLD");
    expect(Text.toLowerCase("HELLO WORLD", 0, 4)).toBe("hellO WORLD");
    expect(Text.toLowerCase("HELLO WORLD", 4)).toBe("HELLo world");
  });

  test("converts entire string to lowercase if no range is specified", () => {
    // Act & Assert
    expect(Text.toLowerCase("HELLO WORLD")).toBe("hello world");
  });
});

describe("Text.toLowerCaseWhen", () => {
  test("throws an error if the target is not a string", () => {
    // Assert
    expect(() =>
      Text.toLowerCaseWhen(undefined as any, undefined as any)
    ).toThrow(`The 'target' argument must be a string`);
  });

  test("throws an error if the test argument is invalid", () => {
    // Assert
    expect(() => Text.toLowerCaseWhen("hello", undefined as any)).toThrow(
      `The 'test' argument must be a string or RegExp`
    );
  });

  test("converts characters based on the provided string test", () => {
    // Act & Assert
    expect(Text.toLowerCaseWhen("HELLO WORLD", "WORLD")).toBe("HELLO world");
    expect(Text.toLowerCaseWhen("HI HI HELLO HI", "HI")).toBe("hi hi HELLO hi");
    expect(Text.toLowerCaseWhen("HELLO WORLD", "LLO*")).toBe("HEllo world");
  });

  test('converts entire string to lowercase if the test is "*", ignoring RegExp', () => {
    // Act & Assert
    expect(Text.toLowerCaseWhen("HELLO WORLD", "*")).toBe("hello world");
  });

  test("converts characters based on the provided RegExp test", () => {
    // Act & Assert
    expect(Text.toLowerCaseWhen("HELLO WORLD", /O/)).toBe("HELLo WORLD");
    expect(Text.toLowerCaseWhen("HELLO WORLD", /O/g)).toBe("HELLo WoRLD");
    expect(Text.toLowerCaseWhen("HELLO WORLD", /.*/)).toBe("hello world");
  });
});

describe("Text.toPlural", () => {
  test("throws an error if the singular argument is not a string", () => {
    expect(() => Text.toPlural(undefined as any)).toThrow(
      `The 'singular' argument must be a string`
    );
  });

  test("throws an error if the count argument is not an integer", () => {
    expect(() => Text.toPlural("job", true as any)).toThrow(
      `The 'count' argument must be an integer`
    );
  });

  test("throws an error if the dictionary argument is not an array", () => {
    expect(() => Text.toPlural("job", 1, [] as any)).toThrow(
      `The 'dictionary' argument must be an object`
    );
  });

  test("does not throw if count or dictionary arguments are undefined", () => {
    expect(() => Text.toPlural("job", undefined)).not.toThrow();
    expect(() => Text.toPlural("job", 1, undefined)).not.toThrow();
  });

  test("returns the singular form for count = 1", () => {
    expect(Text.toPlural("job", 1)).toBe("job");
  });

  test("handles irregular plurals with a provided dictionary", () => {
    const dictionary = { man: "men", woman: "women" };

    expect(Text.toPlural("man", 2, dictionary)).toBe("men");
    expect(Text.toPlural("woman", 2, dictionary)).toBe("women");
    expect(Text.toPlural("man", 1, dictionary)).toBe("man");
  });

  test("handles compounded nouns", () => {
    expect(Text.toPlural("mother-in-law")).toBe("mothers-in-law");
    expect(Text.toPlural("Father-in-law")).toBe("fathers-in-law");
    expect(Text.toPlural("PARENT-IN-LAW")).toBe("parents-in-law");
  });

  test("pluralizes nouns ending in s, x, sh, ch, z to es", () => {
    expect(Text.toPlural("box")).toBe("boxes");
    expect(Text.toPlural("BOX")).toBe("boxes");
    expect(Text.toPlural("brush")).toBe("brushes");
  });

  test("pluralizes nouns ending in y to ies", () => {
    expect(Text.toPlural("baby")).toBe("babies");
    expect(Text.toPlural("BABY")).toBe("babies");
    expect(Text.toPlural("city")).toBe("cities");
  });

  test("pluralizes nouns ending in y to s if preceded by a vowel", () => {
    expect(Text.toPlural("toy")).toBe("toys");
    expect(Text.toPlural("Toy")).toBe("toys");
    expect(Text.toPlural("day")).toBe("days");
  });

  test("pluralizes nouns ending in o to es", () => {
    expect(Text.toPlural("hero")).toBe("heroes");
    expect(Text.toPlural("HERO")).toBe("heroes");
  });

  test("pluralizes nouns ending in o to s if preceded by a vowel", () => {
    expect(Text.toPlural("radio")).toBe("radios");
    expect(Text.toPlural("RADIO")).toBe("radios");
    expect(Text.toPlural("studio")).toBe("studios");
  });

  test("pluralizes nouns ending in f or fe to ves", () => {
    expect(Text.toPlural("knife")).toBe("knives");
    expect(Text.toPlural("KNIFE")).toBe("knives");
    expect(Text.toPlural("wife")).toBe("wives");
  });

  test("pluralizes other nouns to s", () => {
    expect(Text.toPlural("friend")).toBe("friends");
    expect(Text.toPlural("FRIEND")).toBe("friends");
    expect(Text.toPlural("cat")).toBe("cats");
    expect(Text.toPlural("CAT")).toBe("cats");
  });
});

describe("Text.toSingular", () => {
  test("throws an error for an undefined plural argument", () => {
    expect(() => Text.toSingular(undefined)).toThrow(
      `The 'plural' argument must be a string`
    );
  });

  test("throws an error for an invalid dictionary argument", () => {
    expect(() => Text.toSingular("job", [] as any)).toThrow(
      `The 'dictionary' argument must be an object`
    );
  });

  test("throws an error for an invalid count argument", () => {
    expect(() => Text.toSingular("job", undefined, true as any)).toThrow(
      `The 'count' argument must be an integer`
    );
  });

  test("does not throw an error for valid arguments", () => {
    expect(() => Text.toSingular("jobs", undefined)).not.toThrow();
    expect(() => Text.toSingular("jobs", undefined, undefined)).not.toThrow();
  });

  test("returns the original plural if count is not specified", () => {
    expect(Text.toSingular("jobs", undefined, 4)).toBe("jobs");
  });

  test("converts known irregular plurals to singular using a provided dictionary", () => {
    const dictionary = { men: "man", women: "woman" };

    expect(Text.toSingular("men", dictionary)).toBe("man");
    expect(Text.toSingular("women", dictionary)).toBe("woman");
  });

  test("converts compounded nouns to singular form", () => {
    expect(Text.toSingular("mothers-in-law")).toBe("mother-in-law");
    expect(Text.toSingular("Fathers-in-law")).toBe("father-in-law");
    expect(Text.toSingular("PARENTs-IN-LAW")).toBe("parent-in-law");
  });

  describe("regular plurals", () => {
    test('removes "ies" and replaces with "y"', () => {
      expect(Text.toSingular("babies")).toBe("baby");
      expect(Text.toSingular("BABIES")).toBe("baby");
    });

    test('removes "es" from the end', () => {
      expect(Text.toSingular("boxes")).toBe("box");
      expect(Text.toSingular("BOXES")).toBe("box");
    });

    test('removes "s" from the end', () => {
      expect(Text.toSingular("cats")).toBe("cat");
      expect(Text.toSingular("CATS")).toBe("cat");
    });
  });
});

describe("Text.toKamelCase", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toKamelCase(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("converts a sentence to camelCase", () => {
    expect(Text.toKamelCase("hello world")).toBe("helloWorld");
  });

  test("converts an all-uppercase sentence to camelCase", () => {
    expect(Text.toKamelCase("HELLOWORLD")).toBe("helloworld");
  });

  test("converts a mixed case sentence to camelCase", () => {
    expect(Text.toKamelCase("Hello 66 -- __ WOrld")).toBe("hello66World");
  });

  test("handles numbers in the sentence", () => {
    expect(Text.toKamelCase("66 Hello 66 World")).toBe("hello66World");
  });

  test("returns an empty string for an empty input", () => {
    expect(Text.toKamelCase("")).toBe("");
  });

  test("ignores non-alphanumeric characters", () => {
    expect(Text.toKamelCase('(ç=éàé"_è 7777')).toBe("");
  });
});

describe("Text.toSnakeCase", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toSnakeCase(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("converts a sentence to snake_case", () => {
    expect(Text.toSnakeCase("hello world")).toBe("hello_world");
  });

  test("converts an all-uppercase sentence to snake_case", () => {
    expect(Text.toSnakeCase("HELLOWORLD")).toBe("helloworld");
  });

  test("converts a mixed case sentence to snake_case", () => {
    expect(Text.toSnakeCase("Hello 66 -- __ WOrld")).toBe("hello_66_world");
  });

  test("handles numbers in the sentence", () => {
    expect(Text.toSnakeCase("66 Hello 66 World")).toBe("hello_66_world");
  });

  test("returns an empty string for an empty input", () => {
    expect(Text.toSnakeCase("")).toBe("");
  });

  test("ignores non-alphanumeric characters", () => {
    expect(Text.toSnakeCase('(ç=éàé"_è 7777')).toBe("");
  });
});

describe("Text.toPascalCase", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toPascalCase(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("converts a sentence to PascalCase", () => {
    expect(Text.toPascalCase("hello world")).toBe("HelloWorld");
  });

  test("converts an all-uppercase sentence to PascalCase", () => {
    expect(Text.toPascalCase("HELLOWORLD")).toBe("Helloworld");
  });

  test("converts a mixed case sentence to PascalCase", () => {
    expect(Text.toPascalCase("Hello 66 -- __ WOrld")).toBe("Hello66World");
  });

  test("handles numbers in the sentence", () => {
    expect(Text.toPascalCase("66 Hello 66 World")).toBe("Hello66World");
  });

  test("returns an empty string for an empty input", () => {
    expect(Text.toPascalCase("")).toBe("");
  });

  test("ignores non-alphanumeric characters", () => {
    expect(Text.toPascalCase('(ç=éàé"_è 7777')).toBe("");
  });
});

describe("Text.toKababCase", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toKababCase(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("converts a sentence to kebab-case", () => {
    expect(Text.toKababCase("hello world")).toBe("hello-world");
  });

  test("converts an all-uppercase sentence to kebab-case", () => {
    expect(Text.toKababCase("HELLOWORLD")).toBe("helloworld");
  });

  test("converts a mixed case sentence to kebab-case", () => {
    expect(Text.toKababCase("Hello 66 -- __ WOrld")).toBe("hello-66-world");
  });

  test("handles numbers in the sentence", () => {
    expect(Text.toKababCase("66 Hello 66 World")).toBe("hello-66-world");
  });

  test("returns an empty string for an empty input", () => {
    expect(Text.toKababCase("")).toBe("");
  });

  test("ignores non-alphanumeric characters", () => {
    expect(Text.toKababCase('(ç=éàé"_è 7777')).toBe("");
  });
});

describe("Text.toTitle", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toTitle(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("converts an all-uppercase sentence to title case", () => {
    expect(Text.toTitle("HELLO WORLD MY fREINDS")).toBe(
      "Hello world my freinds"
    );
  });
});

describe("Text.toSlug", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toSlug(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("converts a sentence with numbers and special characters to a slug", () => {
    expect(Text.toSlug("THe top 5 posts eveR ?")).toBe("the-top-5-posts-ever");
  });

  test('converts a sentence with numbers and special characters to a slug without initial "the"', () => {
    expect(Text.toSlug("5 posts ever ?")).toBe("5-posts-ever");
  });
});

describe("Text.toEllipsis", () => {
  test("throws an error for an undefined target argument", () => {
    expect(() => Text.toEllipsis(undefined, undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an undefined length argument", () => {
    expect(() => Text.toEllipsis("undefined", undefined)).toThrow(
      `The 'length' argument must be an integer`
    );
  });

  test("shortens a string with an ellipsis within the specified length", () => {
    expect(Text.toEllipsis("hello world", 6)).toBe("hello ...");
  });

  test("does not shorten a string if the specified length is greater than or equal to the string length", () => {
    expect(Text.toEllipsis("hello world", 11)).toBe("hello world");
  });
});

describe("Text.id", () => {
  test("throws an error for an invalid prefix argument", () => {
    expect(() => Text.id(55 as any)).toThrow(
      `The 'prefix' argument must be a string`
    );
  });

  test("throws an error for an invalid sep argument", () => {
    expect(() => Text.id("prefix", 77 as any)).toThrow(
      `The 'sep' argument must be a string`
    );
  });

  test("generates a unique identifier without any arguments", () => {
    const id = Text.id();
    expect(Text.id()).not.toBe(id);
    expect(Text.id()).toMatch(/[a-z0-9]+/i);
  });

  test("generates a unique identifier with a custom prefix", () => {
    const id = Text.id("prefix");
    expect(Text.id("prefix")).not.toBe(id);
    expect(Text.id("prefix")).toMatch(/prefix : [a-z0-9-]+/i);
  });

  test("generates a unique identifier with a custom prefix and separator", () => {
    const id = Text.id("prefix", " => ");
    expect(Text.id("prefix", " => ")).not.toBe(id);
    expect(Text.id("prefix", " => ")).toMatch(/prefix => [a-z0-9-]+/i);
  });
});

describe("Text.prefix", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.prefix(55 as any, "portion")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid portion argument", () => {
    expect(() => Text.prefix("target", 77 as any)).toThrow(
      `The 'portion' argument must be a string`
    );
  });

  test("does not throw an error with valid arguments", () => {
    expect(() => Text.prefix("target", "portion")).not.toThrow();
  });

  test("adds the portion as a prefix to the target", () => {
    expect(Text.prefix("guys", "hello")).toBe("helloguys");
    expect(Text.prefix("guys", "hello ")).toBe("hello guys");
  });
});

describe("Text.suffix", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.suffix(55 as any, "portion")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid portion argument", () => {
    expect(() => Text.suffix("target", 77 as any)).toThrow(
      `The 'portion' argument must be a string`
    );
  });

  test("does not throw an error with valid arguments", () => {
    expect(() => Text.suffix("target", "portion")).not.toThrow();
  });

  test("adds the portion as a suffix to the target", () => {
    expect(Text.suffix("guys", "hello")).toBe("guyshello");
    expect(Text.suffix("guys", " hello")).toBe("guys hello");
  });
});

describe("Text.infix", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.infix(55 as any, "portion", 0)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid portion argument", () => {
    expect(() => Text.infix("target", 77 as any, 0)).toThrow(
      `The 'portion' argument must be a string`
    );
  });

  test("throws an error for an invalid index argument", () => {
    expect(() => Text.infix("target", "portion", "index" as any)).toThrow(
      `The 'index' argument must be an integer or Infinity`
    );
  });

  test("inserts the portion at the specified index", () => {
    expect(Text.infix("guys", " hello", Infinity)).toBe("guys hello");
    expect(Text.infix("guys", "hello ", 0)).toBe("hello guys");
    expect(Text.infix("guys", " hello", 9999)).toBe("guys hello");
    expect(Text.infix("guys", "hello", 2)).toBe("guhelloys");
    expect(Text.infix("guys", "hello", -1)).toBe("guys");
  });
});

describe("Text.prefixed", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.prefixed(55 as any, "portion")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid portion argument", () => {
    expect(() => Text.prefixed("target", 77 as any)).toThrow(
      `The 'portion' argument must be a string`
    );
  });

  test("does not throw an error for valid arguments", () => {
    expect(() => Text.prefixed("target", "portion")).not.toThrow();
  });

  test("returns true if the target is prefixed with the specified portion", () => {
    expect(Text.prefixed("hello guys", "hello")).toBe(true);
  });

  test("returns false if the target is not prefixed with the specified portion", () => {
    expect(Text.prefixed("hello guys", "hi")).toBe(false);
  });
});

describe("Text.suffixed", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.suffixed(55 as any, "portion")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid portion argument", () => {
    expect(() => Text.suffixed("target", 77 as any)).toThrow(
      `The 'portion' argument must be a string`
    );
  });

  test("does not throw an error for valid arguments", () => {
    expect(() => Text.suffixed("target", "portion")).not.toThrow();
  });

  test("returns true if the target is suffixed with the specified portion", () => {
    expect(Text.suffixed("hello guys", "guys")).toBe(true);
  });

  test("returns false if the target is not suffixed with the specified portion", () => {
    expect(Text.suffixed("hello guys", "hello")).toBe(false);
  });
});

describe("Text.infixed", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.infixed(55 as any, "portion", 0)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid portion argument", () => {
    expect(() => Text.infixed("target", 77 as any, 0)).toThrow(
      `The 'portion' argument must be a string`
    );
  });

  test("throws an error for an invalid index argument", () => {
    expect(() => Text.infixed("target", "portion", "index" as any)).toThrow(
      `The 'index' argument must be an integer or Infinity`
    );
  });

  test("returns false if the index is invalid", () => {
    expect(Text.infixed("hello guys", "hello", Infinity)).toBe(false);
  });

  test("returns true if the portion is infixed at the specified index", () => {
    expect(Text.infixed("hello guys", "hello ", 0)).toBe(true);
  });

  test("returns true if the portion is infixed at the specified negative index", () => {
    expect(Text.infixed("hello guys", "guys", 6)).toBe(true);
  });

  test("returns false if the portion is not infixed at the specified index", () => {
    expect(Text.infixed("hello guys", "guys", -1)).toBe(false);
  });
});

describe("Text.exclude", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.exclude(undefined, "regex")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid regex argument", () => {
    expect(() => Text.exclude("target", undefined)).toThrow(
      `The 'regex' argument must be RegExp or string`
    );
  });

  test("returns the target string excluding the specified substring", () => {
    expect(Text.exclude("hello world", "hello ")).toBe("world");
  });

  test("returns the target string excluding characters not matching the regex", () => {
    expect(Text.exclude("1,2,3,4,5", /[^0-9]/g)).toBe("12345");
  });

  test("returns the target string excluding characters matching the specified pattern", () => {
    expect(Text.exclude("hello world", "o*")).toBe("hell");
  });
});

describe("Text.extract", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.extract(undefined, 0)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid start argument", () => {
    expect(() => Text.extract("target", undefined)).toThrow(
      `The 'start' argument must be an integer`
    );
  });

  test("throws an error for an invalid end argument", () => {
    expect(() => Text.extract("target", 0, "end" as any)).toThrow(
      `The 'end' argument must be an integer`
    );
  });

  test("returns a substring starting from the specified index to the end", () => {
    expect(Text.extract("hello", 1, Infinity)).toBe("ello");
  });

  test("returns a substring starting from the specified index to the end (no end specified)", () => {
    expect(Text.extract("hello", 1)).toBe("ello");
  });

  test("returns a substring between the specified start and end indices", () => {
    expect(Text.extract("every-one", 6)).toBe("one");
  });

  test("returns a substring between the specified start and end indices", () => {
    expect(Text.extract("every-one", 0, 5)).toBe("every");
  });
});

describe("Text.expand", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.expand(undefined, 10)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid length argument", () => {
    expect(() => Text.expand("target", undefined)).toThrow(
      `The 'length' argument must be an integer`
    );
  });

  test("throws an error for an invalid fill argument", () => {
    expect(() => Text.expand("target", 10, 10 as any)).toThrow(
      `The 'fill' argument must be a string`
    );
  });

  test("returns a string with expanded padding on both sides", () => {
    expect(Text.expand("hi", 10)).toBe("    hi    ");
  });

  test("returns the original string if length is less than the target length", () => {
    expect(Text.expand("hi", 1, "-")).toBe("hi");
  });

  test("returns a string with expanded padding using the specified fill character", () => {
    expect(Text.expand("hi", 10, "-")).toBe("----hi----");
  });
});

describe("Text.expandLeft", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.expandLeft(undefined, 66)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid length argument", () => {
    expect(() => Text.expandLeft("target", undefined)).toThrow(
      `The 'length' argument must be an integer`
    );
  });

  test("throws an error for an invalid fill argument", () => {
    expect(() => Text.expandLeft("target", 10, 10 as any)).toThrow(
      `The 'fill' argument must be a string`
    );
  });

  test("returns a string with expanded padding on the left side", () => {
    expect(Text.expandLeft("hi", 10)).toBe("        hi");
  });

  test("returns the original string if length is less than the target length", () => {
    expect(Text.expandLeft("hi", 1, "-")).toBe("hi");
  });

  test("returns a string with expanded padding using the specified fill character on the left side", () => {
    expect(Text.expandLeft("hi", 10, "-")).toBe("--------hi");
  });
});

describe("Text.expandRight", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.expandRight(undefined, 66)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid length argument", () => {
    expect(() => Text.expandRight("target", undefined)).toThrow(
      `The 'length' argument must be an integer`
    );
  });

  test("throws an error for an invalid fill argument", () => {
    expect(() => Text.expandRight("target", 10, 10 as any)).toThrow(
      `The 'fill' argument must be a string`
    );
  });

  test("returns a string with expanded padding on the right side", () => {
    expect(Text.expandRight("hi", 10)).toBe("hi        ");
  });

  test("returns the original string if length is less than the target length", () => {
    expect(Text.expandRight("hi", 1, "-")).toBe("hi");
  });

  test("returns a string with expanded padding using the specified fill character on the right side", () => {
    expect(Text.expandRight("hi", 10, "-")).toBe("hi--------");
  });
});

describe("Text.trim", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.trim(undefined, "chars")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid chars argument", () => {
    expect(() => Text.trim("target", 55 as any)).toThrow(
      `The 'chars' argument must be a string`
    );
  });

  test("removes leading and trailing whitespace by default", () => {
    expect(Text.trim("   hi   ")).toBe("hi");
  });

  test("removes specified characters from both ends of the string", () => {
    expect(Text.trim(" zzzz  hi zzzzz  ", "z ")).toBe("hi");
  });
});

describe("Text.trimLeft", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.trimLeft(undefined, "chars")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid chars argument", () => {
    expect(() => Text.trimLeft("target", 55 as any)).toThrow(
      `The 'chars' argument must be a string`
    );
  });

  test("removes leading whitespace by default", () => {
    expect(Text.trimLeft("   hi   ")).toBe("hi   ");
  });

  test("removes specified characters from the beginning of the string", () => {
    expect(Text.trimLeft(" zzzz  hi zzzzz  ", "z ")).toBe("hi zzzzz  ");
  });
});

describe("Text.trimRight", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.trimRight(undefined, "chars")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid chars argument", () => {
    expect(() => Text.trimRight("target", 55 as any)).toThrow(
      `The 'chars' argument must be a string`
    );
  });

  test("removes trailing whitespace by default", () => {
    expect(Text.trimRight("   hi   ")).toBe("   hi");
  });

  test("removes specified characters from the end of the string", () => {
    expect(Text.trimRight(" zzzz  hi zzzzz  ", "z ")).toBe(" zzzz  hi");
  });
});

describe("Text.replaceFirst", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.replaceFirst(undefined, "search", "replace")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid search argument", () => {
    expect(() => Text.replaceFirst("target", undefined, "replace")).toThrow(
      `The 'search' argument must be a string or RegExp`
    );
  });

  test("throws an error for an invalid replace argument", () => {
    expect(() => Text.replaceFirst("target", "search", undefined)).toThrow(
      `The 'replace' argument must be a string`
    );
  });

  test("replaces the first occurrence of a string or pattern in the target string", () => {
    expect(Text.replaceFirst("hello world", "hello", "hi")).toBe("hi world");
    expect(Text.replaceFirst("hi hi hi", "hi", "hola")).toBe("hola hi hi");
    expect(Text.replaceFirst("hi 1 hi 2 hi 3", /[0-9]+/g, "hi")).toBe(
      "hi hi hi 2 hi 3"
    );
  });

  test("returns the original string if the search string or pattern is not found", () => {
    expect(Text.replaceFirst("hello world", "hola", "hi")).toBe("hello world");
  });
});

describe("Text.replaceLast", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.replaceLast(undefined, "search", "replace")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid search argument", () => {
    expect(() => Text.replaceLast("target", undefined, "replace")).toThrow(
      `The 'search' argument must be a string or RegExp`
    );
  });

  test("throws an error for an invalid replace argument", () => {
    expect(() => Text.replaceLast("target", "search", undefined)).toThrow(
      `The 'replace' argument must be a string`
    );
  });

  test("replaces the last occurrence of a string or pattern in the target string", () => {
    expect(Text.replaceLast("hello hello", "hello", "hi")).toBe("hello hi");
    expect(Text.replaceLast("hi hi hi", "hi", "hola")).toBe("hi hi hola");
    expect(Text.replaceLast("hi 1 hi 2 hi 3", /[0-9]+/g, "hi")).toBe(
      "hi 1 hi 2 hi hi"
    );
  });

  test("returns the original string if the search string or pattern is not found", () => {
    expect(Text.replaceLast("hello world", "hola", "hi")).toBe("hello world");
  });
});

describe("Text.replaceNth", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.replaceNth(undefined, "search", "replace", 4)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid search argument", () => {
    expect(() => Text.replaceNth("target", undefined, "replace", 4)).toThrow(
      `The 'search' argument must be a string or RegExp`
    );
  });

  test("throws an error for an invalid replace argument", () => {
    expect(() => Text.replaceNth("target", "search", undefined, 4)).toThrow(
      `The 'replace' argument must be a string`
    );
  });

  test("throws an error for an invalid nth argument", () => {
    expect(() =>
      Text.replaceNth("target", "search", "replace", undefined)
    ).toThrow(`The 'nth' argument must be an integer`);
  });

  test("replaces the nth occurrence of a string or pattern in the target string", () => {
    expect(Text.replaceNth("hello hello", "hola", "hi", 1)).toBe("hello hello");
    expect(Text.replaceNth("hello hello", "hello", "hi", 2)).toBe("hello hi");
    expect(Text.replaceNth("hi hi hi", "hi", "hola", 1)).toBe("hola hi hi");
    expect(Text.replaceNth("hi 1 hi 2 hi 3", /[0-9]+/g, "hi", 3)).toBe(
      "hi 1 hi 2 hi hi"
    );
    expect(Text.replaceNth("hi 1 hi 2 hi 3", /[0-9]+/, "hi", 3)).toBe(
      "hi 1 hi 2 hi hi"
    );
  });

  test("returns the original string if the search string or pattern is not found", () => {
    expect(Text.replaceNth("hello world", "hola", "hi", 1)).toBe("hello world");
  });
});

describe("Text.replaceAll", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.replaceAll(undefined, "search", "replace")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid search argument", () => {
    expect(() => Text.replaceAll("target", undefined, "replace")).toThrow(
      `The 'search' argument must be a string or RegExp`
    );
  });

  test("throws an error for an invalid replace argument", () => {
    expect(() => Text.replaceAll("target", "search", undefined)).toThrow(
      `The 'replace' argument must be a string`
    );
  });

  test("replaces all occurrences of a string or pattern in the target string", () => {
    expect(Text.replaceAll("hello hello", "hola", "hi")).toBe("hello hello");
    expect(Text.replaceAll("hello hello", "hello", "hi")).toBe("hi hi");
    expect(Text.replaceAll("hi hi hi", "hi", "hola")).toBe("hola hola hola");
    expect(Text.replaceAll("hi 1 hi 2 hi 3", /[0-9]+/g, "hi")).toBe(
      "hi hi hi hi hi hi"
    );
    expect(Text.replaceAll("hi 1 hi 2 hi 3", /[0-9]+/, "hi")).toBe(
      "hi hi hi hi hi hi"
    );
  });

  test("returns the original string if the search string or pattern is not found", () => {
    expect(Text.replaceAll("hello world", "hola", "hi")).toBe("hello world");
  });
});

describe("Text.countOf", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.countOf(undefined, "regex")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid regex argument", () => {
    expect(() => Text.countOf("target", undefined)).toThrow(
      `The 'regex' argument must be a string or RegExp`
    );
  });

  test("counts the occurrences of a string or pattern in the target string", () => {
    expect(Text.countOf("hello hello", "hola")).toBe(0);
    expect(Text.countOf("1 2 3 4 5 6 6 6 6", "6")).toBe(4);
    expect(Text.countOf("1-2-3-4-5-6", /[0-9]+/)).toBe(6);
    expect(Text.countOf("1-2-3-4-5-6", /[0-9]+/g)).toBe(6);
  });
});

describe("Text.indexOf", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.indexOf(undefined, "regex")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid regex argument", () => {
    expect(() => Text.indexOf("target", undefined)).toThrow(
      `The 'regex' argument must be a string or RegExp`
    );
  });

  test("throws an error for an invalid pos argument", () => {
    expect(() => Text.indexOf("target", "regex", "pos" as any)).toThrow(
      `The 'pos' argument must be an integer`
    );
  });

  test("finds the index of a string or pattern in the target string", () => {
    expect(Text.indexOf("012345678", "h")).toBe(undefined);
    expect(Text.indexOf("012345678", "4")).toBe(4);
    expect(Text.indexOf("122212221", "1")).toBe(0);
    expect(Text.indexOf("122212221", "1", 1)).toBe(4);
    expect(Text.indexOf("122212221", /2+/g)).toBe(1);
    expect(Text.indexOf("122212221", /2+/, 4)).toBe(5);
  });

  test("returns undefined if the string or pattern is not found", () => {
    expect(Text.indexOf("122212221", /a+/)).toBe(undefined);
    expect(Text.indexOf("122212221", "a")).toBe(undefined);
    expect(Text.indexOf("122212221", /a+/, 3)).toBe(undefined);
  });
});

describe("Text.indexesOf", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.indexesOf(undefined, "regex")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid regex argument", () => {
    expect(() => Text.indexesOf("target", undefined)).toThrow(
      `The 'regex' argument must be a string or RegExp`
    );
  });

  test("returns an array of start and end indexes of matches in the target string", () => {
    expect(Text.indexesOf("123-123-123", "1")).toEqual([
      { start: 0, end: 1 },
      { start: 4, end: 5 },
      { start: 8, end: 9 },
    ]);

    expect(Text.indexesOf("123-123-123", /[0-9]+/)).toEqual([
      { start: 0, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 11 },
    ]);

    const slicedString = Text.indexesOf("123-123-123", /[0-9]+/)
      .map((item) => "123-123-123".slice(item.start, item.end))
      .join("-");

    expect(slicedString).toBe("123-123-123");
  });
});

describe("Text.lastIndexOf", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.lastIndexOf(undefined, "regex")).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid regex argument", () => {
    expect(() => Text.lastIndexOf("target", undefined)).toThrow(
      `The 'regex' argument must be a string or RegExp`
    );
  });

  test("returns the last index of a string or pattern in the target string", () => {
    expect(Text.lastIndexOf("123-123-123", "1")).toBe(8);
    expect(Text.lastIndexOf("123-123-123", "hello")).toBe(undefined);
    expect(Text.lastIndexOf("123-123-123", /[0-9]+/)).toBe(8);
  });
});

describe("Text.splitAt", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.splitAt(undefined, undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid index argument", () => {
    expect(() => Text.splitAt("index", undefined)).toThrow(
      `The 'index' argument must be an integer`
    );
  });

  test("throws an error for an invalid cut argument", () => {
    expect(() => Text.splitAt("cut", 0, "cut" as any)).toThrow(
      `The 'cut' argument must be boolean`
    );
  });

  test("splits the target string at the specified index", () => {
    expect(Text.splitAt("123-123", 3)).toEqual(["123", "123"]);
    expect(Text.splitAt("123-123", 3, false)).toEqual(["123", "-123"]);
  });
});

describe("Text.chars", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.chars(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("returns an array of individual characters in the target string", () => {
    expect(Text.chars("abcd")).toEqual(["a", "b", "c", "d"]);
  });
});

describe("Text.words", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.words(undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("returns an array of words in the target string", () => {
    expect(Text.words("hello world")).toEqual(["hello", "world"]);
  });
});

describe("Text.matches", () => {
  test("throws an error for an invalid target argument", () => {
    expect(() => Text.matches(undefined, undefined)).toThrow(
      `The 'target' argument must be a string`
    );
  });

  test("throws an error for an invalid regex argument", () => {
    expect(() => Text.matches("taget", undefined)).toThrow(
      `The 'regex' argument must be a string or RegExp`
    );
  });

  test("returns an array of matches with index, match, and groups", () => {
    expect(Text.matches("123-123-123", "123")).toEqual([
      { index: 0, match: "123", groups: undefined },
      { index: 4, match: "123", groups: undefined },
      { index: 8, match: "123", groups: undefined },
    ]);

    expect(Text.matches("123-123-123", /[0-9]+/g)).toEqual([
      { index: 0, match: "123", groups: undefined },
      { index: 4, match: "123", groups: undefined },
      { index: 8, match: "123", groups: undefined },
    ]);

    expect(Text.matches("123-123-123", /[0-9]+/)).toEqual([
      { index: 0, match: "123", groups: undefined },
      { index: 4, match: "123", groups: undefined },
      { index: 8, match: "123", groups: undefined },
    ]);
  });
});
