import http from 'k6/http'
import { check, group } from 'k6'
export const options = {
    vus: 4000,
    duration: '2m',
    thresholds: {
        http_req_duration: ['p(95) < 2500'],   //95% yeu cau phai duoi 2500ms
        http_req_failed: ['rate < 0.1']
    }
}

export default function () {
    group('smoke test group', () => {
        let res = http.get('http://localhost:8000/')
        check(res, { 'status is 200 on dashboard': (r) => r.status === 200 })

        // Kiểm tra trang login
        res = http.get('http://localhost:8000/login');
        check(res, { 'status is 200 on login': (r) => r.status === 200 });

        // Kiểm tra trang signup
        res = http.get('http://localhost:8000/signup');
        check(res, { 'status is 200 on signup': (r) => r.status === 200 });
    })
}