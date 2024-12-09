export interface DefangMethod {
    dot: string;
    at?: string;
    colon?: string;
    doubleColon?: string;
    protocolDelimiter?: string;
    http: string;
    description: string;
}

export const DefangMethods: Record<string, DefangMethod> = {
    SquareBrackets: {
        dot: "[.]",
        at: "[at]",
        colon: "[:]",
        doubleColon: "[::]",
        protocolDelimiter: "[://]",
        http: "hxxp",
        description: ". -> [.]"
    },
    Parentheses: {
        dot: "(.)",
        at: "(at)",
        colon: "(:)",
        protocolDelimiter: "(://)",
        http: "hxxp",
        description: ". -> (.)"
    },
    Word: {
        dot: " dot ",
        at: " at ",
        colon: " colon ",
        http: "hxxp",
        description: ". -> dot"
    },
    Backslash: {
        dot: String.raw`\.`,
        http: "hxxp",
        description: String.raw`. -> \.`
    }
}

export function defangText(text: string, method: DefangMethod = DefangMethods.SquareBrackets): string {
    let retval = text.replaceAll(".", method.dot);
    retval = retval.replaceAll("@", method.at ?? "@");
    retval = retval.replaceAll("::", method.doubleColon ?? "::");
    retval = retval.replaceAll(/[^\[:]:[^\]:]/g, method.colon ?? ":");
    retval = retval.replaceAll("://", method.protocolDelimiter ?? "[://]");
    retval = retval.replaceAll("http", "hxxp");
    return retval;
}