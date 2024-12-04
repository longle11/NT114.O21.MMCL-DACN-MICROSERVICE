import http from 'k6/http'
import { check, sleep } from 'k6'
let sessionToken = null;
export default function () {
    const url = "http://localhost:8000/api/users/login"
    const payload = JSON.stringify({
        email: "z45letranphilong@gmail.com",
        password: "1234aA"
    })

    const headers = {
        "Content-Type": "application/json",
    };

    const res = http.post(url, payload, { headers })
    if (res.status === 200) {
        const setCookieHeader = (res.headers['Set-Cookie'] || '').split('; ').find(cookie => cookie.startsWith('session='))?.split('=')[1] || null;
        console.log(`Login successfully with token: ${setCookieHeader}`);
    } else {
        console.log("Login that bai ", res.status)
    }
    sleep(1)
}