export interface DefangMethod {
    dot: string;
    at?: string;
    colon?: string;
    protocolDelimiter?: string;
    description: string;
}

export const DefangMethods: Record<string, DefangMethod> = {
    SquareBrackets: {
        dot: "[.]",
        at: "[at]",
        colon: "[:]",
        protocolDelimiter: "[://]",
        description: ". -> [.]"
    },
    Parentheses: {
        dot: "(.)",
        at: "(at)",
        colon: "(:)",
        protocolDelimiter: "(://)",
        description: ". -> (.)"
    },
    Word: {
        dot: " dot ",
        at: " at ",
        colon: " colon ",
        description: ". -> dot"
    },
    Backslash: {
        dot: String.raw`\.`,
        description: String.raw`. -> \.`
    }
}

export function defangText(text: string, method: DefangMethod): string {
    let retval = text.replace(".", method.dot);
    retval = text.replace("@", method.at ?? "@");
    retval = text.replace(":", method.colon ?? ":");
    retval = text.replace("://", method.protocolDelimiter ?? "[://]");
    retval = text.replace("http", "hxxp");
    return retval;
}