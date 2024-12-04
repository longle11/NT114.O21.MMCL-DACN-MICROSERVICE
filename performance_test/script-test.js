import http from 'k6/http'
import { check, group, sleep } from 'k6'
// import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 500 },
        { duration: '15s', target: 6000 },
        { duration: '1m', target: 10000 },
        { duration: '1m', target: 5000 },
        { duration: '10s', target: 500 },
        { duration: '25s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95) < 2500'],
        http_req_failed: ['rate < 0.1']
    }
}


export default function () {
    group('load test group', () => {
        let res = http.get('http://localhost:8000/', { tags: { name: "Home" } })
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time < 2.5s': (r) => r.timings.duration < 2500
        })
        sleep(1)
    })
}

// export function handleSummary(data) {
//     return {
//         "summary-script-test2.html": htmlReport(data),
//     };
// }