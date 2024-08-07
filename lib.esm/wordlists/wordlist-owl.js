// Use the encode-latin.js script to create the necessary
// data files to be consumed by this class
import { id } from "../hash/index.js";
import { assertArgument } from "../utils/index.js";
import { decodeOwl } from "./decode-owl.js";
import { Wordlist } from "./wordlist.js";
/**
 *  An OWL format Wordlist is an encoding method that exploits
 *  the general locality of alphabetically sorted words to
 *  achieve a simple but effective means of compression.
 *
 *  This class is generally not useful to most developers as
 *  it is used mainly internally to keep Wordlists for languages
 *  based on ASCII-7 small.
 *
 *  If necessary, there are tools within the ``generation/`` folder
 *  to create these necessary data.
 */
export class WordlistOwl extends Wordlist {
    #data;
    #checksum;
    /**
     *  Creates a new Wordlist for %%locale%% using the OWL %%data%%
     *  and validated against the %%checksum%%.
     */
    constructor(locale, data, checksum) {
        super(locale);
        this.#data = data;
        this.#checksum = checksum;
        this.#words = null;
    }
    get _data() { return this.#data; }
    _decodeWords() {
        return decodeOwl(this.#data);
    }
    #words;
    #loadWords() {
        if (this.#words == null) {
            const words = this._decodeWords();
            // Verify the computed list matches the official list
            const checksum = id(words.join("\n") + "\n");
            /* c8 ignore start */
            if (checksum !== this.#checksum) {
                throw new Error(`BIP39 Wordlist for ${this.locale} FAILED`);
            }
            /* c8 ignore stop */
            this.#words = words;
        }
        return this.#words;
    }
    getWord(index) {
        const words = this.#loadWords();
        assertArgument(index >= 0 && index < words.length, `invalid word index: ${index}`, "index", index);
        return words[index];
    }
    getWordIndex(word) {
        return this.#loadWords().indexOf(word);
    }
}
//# sourceMappingURL=wordlist-owl.js.map