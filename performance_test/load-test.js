import http from 'k6/http'

import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    duration: '10s',
    thresholds: {
        http_req_duration: ["p(95) < 1000"]
    }
}

export default function () {
    const res = http.get("http://localhost:8000/signup")
    console.log(`Response status: ${res.status} `);
    check(res, { "status was 200": (r) => r.status === 200 });
    
    sleep(1)
}