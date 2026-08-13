import { DOMAIN_PATTERN, IPV4_PATTERN, IPV6_PATTERN, URL_PATTERN } from "./iocPatterns";

export const URL_REGEX = new RegExp(URL_PATTERN, "gi");
export const DOMAIN_REGEX = new RegExp(DOMAIN_PATTERN, "gi");
const IPV4_REGEX = new RegExp(IPV4_PATTERN, "g");
const IPV6_REGEX = new RegExp(IPV6_PATTERN, "gi");


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
    let retval = defangIp(text, method);
    retval = defangURL(retval, method);
    return retval;
}

export function defangIp(text: string, method: DefangMethod = DefangMethods.SquareBrackets): string {
    text = text.replace(IPV4_REGEX, x => {
        return x.replace(/\./g, method.dot);
    });
    text = text.replace(IPV6_REGEX, x => {
        x = x.replace(/::/g, method.doubleColon ?? method.colon ?? ':');
        x = x.replace(/(?<!\[)(?<!]):(?!])/g, method.colon ?? ':');
        return x;
    });

    return text;
}



function defangURL(text: string, method: DefangMethod): string {
    text = text.replace(URL_REGEX, x => {
        x = x.replace(/\./g, method.dot);
        x = x.replace(/http/gi, method.http);
        x = x.replace(/:\/\//g, method.protocolDelimiter ?? '://');
        return x;
    });
    text = text.replace(DOMAIN_REGEX, x => {
        x = x.replace(/\./g, method.dot);
        return x;
    });

    return text;
}
