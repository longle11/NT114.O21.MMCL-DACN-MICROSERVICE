import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
    vus: 100,
    duration: '1m',
    thresholds: {
        http_req_duration: ['avg < 500', "p(95) < 1000"],
        http_req_failed: ['rate < 0.01'],
    },
};

export default function () {
    const res = http.get("http://localhost:8000");

    // Kiểm tra mã trạng thái HTTP
    check(res, { "status was 200": (r) => r.status === 200 });

    // const regex = /<title>(.*?)<\/title>/;
    // const match = res.body.match(regex);
    
    // if (match && match[1]) {
    //     console.log("Page title: " + match[1]);
    // } else {
    //     console.log("Title not found");
    // }

    sleep(1);
}
