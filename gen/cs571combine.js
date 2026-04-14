import fs from 'fs'

const CODES_MAP = fs.readFileSync("codes_map.secret").toString().split(/\r?\n/);
const BIDS_MAP = fs.readFileSync("bids_map.secret").toString().split(/\r?\n/);

const bids = BIDS_MAP.reduce((acc, b) => {
    const [bid, email] = b.split(",");
    return {
        ...acc,
        [email]: bid
    };
}, {})

const bidsStr = CODES_MAP.reduce((acc, c) => {
    const [email, _] = c.split(",");
    return `${acc},${bids[email]}`
}, "").trim().substring(1);

fs.writeFileSync("bids_string.secret", bidsStr);
