const targetDomain = "lic1.sowa";

export function capiDateFromString(s) {
    const date = s.substring(0,10);
    const hours = s.substring(11, 13);
    const minutes = s.substring(14, 16);
    const secs = s.substring(17,19);

    let x = new Date(date);
    x.setUTCHours(hours, minutes, secs);
    return x;
}

/*

 Klient API.
 
 Tworzymy podając URLa.
 
 Przykład:
 
    const client = new CapiClient("https://rekrutacja.sandbox-m.sowa.pl/api/v1")

*/
export class CapiClient {
    constructor(url, { auth, mode, lang, log }={ mode: 1 }) {
        this.url = url;
        this.auth = auth;
        this.mode = mode;
        this.lang = lang;
        this.log = log;
    }

    /** Wykonanie zapytania z podanymi jako argumenty komendami */
    async execute(...commands) {
        const url = this.url;
        const auth = this.auth;
        const lang = this.lang;
        const mode = this.mode;
        const logConf = this.log;

        const payload = { auth: auth, lang: lang, mode: mode, log: logConf,
                          exec: commands.map(command => command.exec) };

        const response = await fetch(url, { method: "POST",
                                            mode: "cors",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(payload) });
        
        const results = await response.json();

        if (!Array.isArray(results) || results.length !== commands.length) {
            throw new Error("Malformed CAPI response");
        }

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const result  = results[i];
            console.info(`${command.exec[0]} -> ${result.status} ${result.reason || result.message || ""}`, result.data)
            command.setResult(result);
        }
        
        return commands;
    }

    /** Wykonanie zapytania z jedną podaną komendą */
    executeSingle(command) {
        return this.execute(command).then(commands => commands[0].result);
    }

    copyWith(obj={}) {
        return Object.assign(new CapiClient(this.url), this, obj);
    }

    withAuth(...auth) {
        if (this.auth === auth)
            return this;
        else if (Array.isArray(auth[0]))
            return this.copyWith({ auth: auth[0] });
        else
            return this.copyWith({ auth })
    }
    
    withLogin(identifier, password) {
        return this.withAuth(100, identifier, targetDomain, password);
    }
    
    withSession(ssid, sskey) {
        return this.withAuth(102, ssid, sskey);
    }
}

export class CapiCommand {
    constructor(exec) {
        this.exec = exec;
        this.result = null;
        this.status = 0;
        this.retries = 0;
    }

    retry(n) {
        this.retries = n;
        return this;
    }

    setResult(response) {
        const result = this.parseResult(response);
        this.result = result
        result && (this.status = result.status)
    }

    parseResult(response) {
        let failure = null;

        if (response.status !== undefined)
            response.status = parseInt(response.status, 10);
        else
            failure = "status is undefined";

        // Sprawdzamy czy status, message oraz reason się zgadzają
        if (typeof response.status !== "number")
            failure = "status is not a number or is undefined";

        else if (response.message !== undefined && typeof response.message !== "string")
            failure = "message is not a string or is undefined";

        else if (response.reason !== undefined && typeof response.reason !== "string")
            failure = "reason is not a string or is undefined";

        else if (response.data !== undefined) {
            const data = response.status !== "204" ? this.parseData(response.status, response.data) : response.data;
            return Object.assign({}, response, { data: data });
        } else
            return response;

        return { status: 500, data: response, reason: "parse_failure: " + failure };
    }

    /** Rzuca wyjątek jeśli komenda nie zakończyła się z jednym z podanych statusów */
    ensure() {
        const args = Array.prototype.slice.call(arguments);
        if (this.result === null)
            throw new Error("Command hasn't completed yet.");

        if (args.indexOf(this.result.status) === -1) {
            const err = new Error("Command failed with: " + this.result.status + ", " + this.result.reason);
            err.capiStatus = this.result.status;
            err.capiReason = this.result.reason;
            err.enduserMessage = this.result.message;
            err.log = this.result.log;
            throw err;
        }
    }

    parseData(status, data) {
        return data;
    }
}

function checkValue(val, name, ...types) {
    let t = typeof val

    if (t === "object") {
        if (val === null)
            t = "null";
        else if (Array.isArray(val))
            t = "array";
    }

    if (types.indexOf(t) < 0)
        throw new Error(`Expected ${types.join("|")} for "${name}", got: ${t}`)

    return val
}

function checkField(obj, field, ...types) {
    let val = obj[field]
    checkValue(obj[field], field, ...types)
    return val
}

/*
 
 Utworzenie sesji
 
 Wymaga uwierzytelnienia zapytania poprzez logowanie użytkownika.
 
 Ze zwracanych informacji interesuje nas:
 
   - session_id - podawany potem przy autentykacji sesyjnej
   - session_key - podawany potem przy autentykacji sesyjnej
   - expires_at - data i czas wygasnięcia sesji
 
 Przykład:
 
    client
        .withLogin("email lub id użytkownika", "hasło użytkownika")
        .executeSingle(new SessionCreate())
        .then(response => {
            if (response.status === 200) {
                console.log(`id sesji = ${response.data.session_id}`);
                console.log(`klucz sesji = ${response.data.session_key}`);
                console.log(`wygasa = ${response.data.expires_at}`);
            }
            else {
                console.log(`błąd: ${response.status} ${response.message}`);
            }
        });
 
*/
export class SessionCreate extends CapiCommand {
    constructor() {
        super(["folksSessionCreate", [targetDomain]]);
    }

    parseData(status, data) {
        if (status !== 200) return data;

        checkField(data, "session_id", "string") 
        checkField(data, "session_key", "string") 
        checkField(data, "timeout", "number")
        checkField(data, "expires_at", "string")

        return { ...data, expires_at: capiDateFromString(data.expires_at) };
    }
}

/*

 Pobranie informacji o aktualnej sesji.
 
 Wymaga uwierzytelnienia zapytania identyfikatorem i kluczem sesji.
 
 Zwraca m.in:
 
   - user - dane użytkownika
   - expires_at - datę i czas wygasnięcia sesji
 
 Przykład:
 
    client
        .withSession("id sesji", "klucz sesji")
        .executeSingle(new SessionInfo())
        .then(response => {
            if (response.status === 200) {
                console.log(`wygasa = ${response.data.expires_at}`);
                console.log(`id użytkownika = ${response.data.user.user_id}`);
                console.log(`etykieta użytkownika = ${response.data.user.label}`);
            }
            else {
                console.log(`błąd: ${response.status} ${response.message}`);
            }
        });
   
*/
export class SessionInfo extends CapiCommand {
    constructor(session_id) {
        super(["folksSessionInfo", [], {session_id}]);

        checkValue(session_id, "session_id", "string", "undefined")
    }

    parseData(status, data) {
        if(status !== 200) return data;

        checkValue(data, "data", "object")
        checkField(data, "session_id", "string")
        checkField(data, "domain", "string")
        checkField(data, "created_at", "string")
        checkField(data, "active_at", "string")
        checkField(data, "expires_at", "string")

        if (data.user)      data = parseUserData(data, "user")
        if (data.real_user) data = parseUserData(data, "real_user")

        return { ...data, created_at: capiDateFromString(data.created_at), active_at: capiDateFromString(data.active_at), expires_at: capiDateFromString(data.expires_at) }
    }
}

function parseUserData(data, key) {
    let user = checkField(data, key, "object")

    checkField(user, "user_id", "string")
    checkField(user, "label", "string")

    return data
}

/*

 Utworzenie nowego konta.
 
 Bez uwierzytelniania.
 
 Zwraca:
 
   - user_id - id użytkownika
 
 Przykład:
 
    client
        .executeSingle(new UserSignup("email", "hasło"))
        .then(response => {
            if (response.status === 200) {
                console.log(`id użytkownika = ${response.data.user_id}`);
            }
            else {
                console.log(`błąd: ${response.status} ${response.message}`);
            }
        });
   
*/
export class UserSignup extends CapiCommand {
    constructor(email, password) {
        super(["folksUserSignup", [targetDomain, email], {password}]);
        
        checkValue(email, "email", "string");
        checkValue(password, "password", "string");
    }

    parseData(status, data) {
        if(status !== 200) return data;
        
        checkValue(data, "data", "object");
        
        checkField(data, "user_id", "string");
        
        return data;
    }
}

/*

 Wylistowanie notatek w kolejności od ostatnio zmienionej.
 
 Argumenty opcjonalne:
  
  - after - pozycja paginacji (zaczynamy od null lub undefined)
  - volume - liczba wyników na stronę
 
 Zwraca: stronę wyników
 
     { "at": <aktualna pozycja w paginacji>,
       "prev": <pozycja poprzedniej strony>,
       "next": <pozycja następnej strony>,
       "volume": <liczba wyników na stronę>,
       "total": <liczba wyników w sumie>,
       "results": [ wynik, ... ] }
 
 Jeden wynik to:
 
    { "name": "nazwa notatki",
      "text": "tekst notatki",
      "modified_at": "data i czas ostatniej zmiany" }
 
 Aby pobrać kolejną stronę podajemy wartość `next` jako `after`.
 Aby pobrać poprzednią stronę podajemy wartość `prev` jako `after`.
 `null` oznacza brak kolejnej/poprzedniej strony.
 
 Przykład:
 
    client
        .withSession("id sesji", "klucz sesji")
        .executeSingle(new NoteList())
        .then(response => {
            if (response.status === 200) {
                const results = response.data.results;
                for (let i = 0, L = results.length; i < L; i++) {
                    const result = results[i];
                    console.log(`notatka "${result.name}":`);
                    console.log(result.text);
                    console.log(`(napisana: ${result.modified_at})`);
                }
            }
            else {
                console.log(`błąd: ${response.status} ${response.message}`);
            }
        });
        
*/
export class NoteList extends CapiCommand {
    constructor({ after, volume }={}) {
        super(["testNoteList", [], { after, volume }]);
    }

    parseData(status, data) {
        if(status !== 200) return data;
        
        checkValue(data, "data", "object");
        
        checkField(data, "p8n", "string");
        checkField(data, "results", "array");
        checkField(data, "total", "number");
        checkField(data, "volume", "number");

        return { ...data, results: data.results.map(result => ({ ...result, modified_at: capiDateFromString(result.modified_at) })) };
    }
}

/*

 Utworzenie lub zmiana notatki.
 
 Argumenty pozycyjne:
  
  - name - nazwa/tytuł notatki
  - test - tekst notatki
 
 Przykład:
 
    client
        .withSession("id sesji", "klucz sesji")
        .executeSingle(new NoteTake("lorem ipsum", "Lorem ipsum dolor sit amet..."))
        .then(response => {
            if (response.status !== 204) {
                console.log(`błąd: ${response.status} ${response.message}`);
            }
        });
        
*/
export class NoteTake extends CapiCommand {
    constructor(name, text) {
        super(["testNoteTake", [name, text]]);
    }
}

