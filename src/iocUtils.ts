// Regex originally from https://github.com/gchq/CyberChef (Apache 2.0 License)
/**
 * URL regular expression
 */
const protocol = "[A-Z]+://",
    hostname = "[-\\w]+(?:\\.\\w[-\\w]*)+",
    port = ":\\d+",
    path = "/[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]*" +
        "(?:[.!,?]+[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]+)*";

export const URL_REGEX = new RegExp(protocol + hostname + "(?:" + port + ")?(?:" + path + ")?", "ig");


/**
 * Domain name regular expression
 */
export const DOMAIN_REGEX = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/ig;

/**
 * IPV4 regular expression
 */
const IPV4_REGEX = new RegExp("(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?", "g");


/**
 * IPV6 regular expression
 */
const IPV6_REGEX = new RegExp("((?=.*::)(?!.*::.+::)(::)?([\\dA-Fa-f]{1,4}:(:|\\b)|){5}|([\\dA-Fa-f]{1,4}:){6})((([\\dA-Fa-f]{1,4}((?!\\3)::|:\\b|(?![\\dA-Fa-f])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})", "g");


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
    let retval = defangIp(text);
    retval = defangURL(retval);
    return retval;
}

export function defangIp(text: string): string {
    text = text.replace(IPV4_REGEX, x => {
        return x.replace(/\./g, "[.]");
    });
    text = text.replace(IPV6_REGEX, x => {
        x = x.replace(/::/g, "[::]");
        x = x.replace(/(?<![\[\]]):(?!\])/g, "[:]");
        return x;
    });

    return text;
}



function defangURL(text: string): string {
    text = text.replace(URL_REGEX, x => {
        x = x.replace(/\./g, "[.]");
        x = x.replace(/http/gi, "hxxp");
        x = x.replace(/:\/\//g, "[://]");
        return x;
    });
    text = text.replace(DOMAIN_REGEX, x => {
        x = x.replace(/\./g, "[.]");
        x = x.replace(/http/gi, "hxxp");
        x = x.replace(/:\/\//g, "[://]");
        return x;
    });

    return text;
}
