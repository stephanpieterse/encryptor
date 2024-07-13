# CHANGE THE PASSWORD !!!
const password = "default password";
var crypto = require("crypto");
var fs = require("fs");
var ptype = process.argv[2]

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

let sC = ":";
let enc = new TextEncoder();
let dec = new TextDecoder();
let rSalt = crypto.getRandomValues(new Uint8Array(32));
let rIv = crypto.getRandomValues(new Uint8Array(32));

function seedMe() {
    rSalt = crypto.getRandomValues(new Uint8Array(32));
    rIv = crypto.getRandomValues(new Uint8Array(32));
}

function getKeyMaterial() {
    return crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false, ["deriveBits", "deriveKey"],
    );
}

async function getDerivKey(salt) {
    const keyMaterial = await getKeyMaterial();
    return crypto.subtle.deriveKey({
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial, {
            "name": "AES-GCM",
            "length": 256
        },
        true, ["encrypt", "decrypt"],
    );
}

async function decrypt(ciphertext, salt, iv) {
    const key = await getDerivKey(salt);
    return crypto.subtle.decrypt({
            name: "AES-GCM",
            iv
        },
        key,
        ciphertext
    );
}

async function encrypt(plaintext, salt, iv) {
    const key = await getDerivKey(salt);
    return crypto.subtle.encrypt({
            name: "AES-GCM",
            iv
        },
        key,
        plaintext,
    );
}

function doencrypt(ptext) {
    seedMe();
    //let ptext = enc.encode(document.getElementById("dectext").value);
    encrypt(ptext, rSalt, rIv).then(function(result) {
        //console.log(result);
        let fullval = arrayBufferToBase64(rSalt) + sC + arrayBufferToBase64(rIv) + sC + arrayBufferToBase64(result);
        //document.getElementById("enctext").value = fullval;
        console.log(fullval);
    });
}

function dodecrypt(textval) {
    //let textval = document.getElementById("enctext").value;
    let cursalt = base64ToArrayBuffer(textval.split(sC)[0]);
    let curiv = base64ToArrayBuffer(textval.split(sC)[1]);
    let text = base64ToArrayBuffer(textval.split(sC)[2]);
    decrypt(text, cursalt, curiv).then(function(result) {
        //document.getElementById("dectext").value = dec.decode(result);
        console.log(dec.decode(result));
    });
}

process.stdin.on("data", function(data) {
    if (ptype == "enc") {
        doencrypt(data);
    }
    if (ptype == "dec") {
        dodecrypt(data.toString());
    }
});
