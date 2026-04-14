import fs from 'fs'

const CS571_SECRET = fs.readFileSync("cs571.secret").toString().trim();
const EMAILS = fs.readFileSync("emails.secret").toString().split(/\r?\n/);

const body = {
    sendEmails: false,
    bids: EMAILS.map((es) => {
        const email = es.split(",")[0];
        return {
            "nickname": "CS272 Forward",
            "email": email
        }
    })
};

console.log(JSON.stringify(body, null, 2));

fetch("https://cs571api.cs.wisc.edu/rest/auth/generate-bids", {
    method: "POST",
    headers: {
        "X-CS571-SECRET": CS571_SECRET,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
})
.then(res => console.log("Sent BIDs; received HTTP Status " + res.status));

// SELECT *  FROM BadgerIds WHERE createdAt >= NOW() - INTERVAL 10 MINUTE;

