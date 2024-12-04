import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
export const options = {
    vus: 100,
    duration: '1s',
    thresholds: {
        http_req_duration: ['avg < 500', "p(95) < 1000"],
        http_req_failed: ['rate < 0.05'],
    },
};

const getTitle = (res) => {
    const regex = /<title>(.*?)<\/title>/;
    const match = res.body.match(regex);

    if (match && match[1]) {
        console.log("Page title: " + match[1]);
    } else {
        console.log("Title not found");
    }
}

let canaryCounter = new Counter('canary_requests');
let stableCounter = new Counter('stable_requests');

export default function () {
    const res = http.get('http://localhost:8000');
    check(res, {
        'status is 200': (r) => r.status === 200,
    })
    getTitle(res)
    if (res.status === 200 && res.body.includes('stable')) {
        stableCounter.add(1);
    }
    if(res.status === 200 && res.body.includes('canary')) {
        canaryCounter.add(1);
    }

    sleep(1)
}

// Hàm handleSummary() được gọi sau khi thử nghiệm kết thúc để xuất kết quả
export function handleSummary(data) {
    console.log(`Total requests to Canary version: ${JSON.stringify(data.metrics.canary_requests)}`);
    console.log(`Total requests to Stable version: ${JSON.stringify(data.metrics.stable_requests)}`);

    return {
        "summary-argocd-rollout-3.html": htmlReport(data),
    };
}