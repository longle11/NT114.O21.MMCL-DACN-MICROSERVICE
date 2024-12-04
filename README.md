
<div align="center"><h3>Kiến trúc tổng quát của hệ thống microservies</h3>
  <img src="https://github.com/user-attachments/assets/73ce64a2-6c72-43cb-a363-2a3829f80738" alt="Pipeline Devsecops" />
</div>

<h3>Kiến trúc hệ thống Microservices</h3>

<div align="center">
  <img src="https://github.com/user-attachments/assets/69ba9210-ba51-4230-b9ca-4672fa5d6120" alt="microservices architecture" />
</div>

<h3>Các công cụ triển khai</h3>

<div align="center">
  <img src="https://github.com/user-attachments/assets/73d672f0-4aed-4aea-b116-ddb5b2f5f3d7" alt="tools" />
</div>

<h3>Chiến lược triển khai từ development sang staging</h3>

<div align="center">
  <img src="https://github.com/user-attachments/assets/afefb764-53f3-4f4c-9d3c-333b4d5fe22e" alt="database models"/>
</div>

<h3>Chiến lược triển khai từ staging sang production</h3>

<div align="center">
  <img src="https://github.com/user-attachments/assets/5996e395-730a-4f23-a783-7640a5298aad" alt="database models"/>
</div>



CÁC YÊU CẦU CẦN THIẾT ĐỂ CÀI ĐẶT HỆ THỐNG
**1 Yêu cầu về phần mềm**
-	Phải có môi trường để chạy được Docker và Kubernetes (có thể sử dụng Docker Desktop) hoặc tự xây dựng môi trường kubernetes riêng biệt.
-	Yêu cầu về phần mềm: phải cài NodeJS từ phiên bản 18 để đảm bảo tính ổn định.
-	Phải hỗ trợ để cài đặt các gói NPM.
**2 Yêu cầu về phần cứng**
Môi trường để tạo các máy ảo với các cấu hình tối thiểu:
-	Cài đặt Gitlab EE Server: Ram 2GB, Disk 20GB, IP: tuỳ chỉnh, Giả lập Domain: gitlab.taskscheduler.com
-	Cài đặt Server Artifact Jfrog: Ram 2GB, Disk 15GB, IP: tuỳ chỉnh, Giả lập Domain: jfrog.taskscheduler.com
-	Cài đặt Server chạy Gitlab-Runner: Ram 1GB, Disk: 10GB, IP: tuỳ chỉnh
-	Cài đặt Server quản trị Persistent Volume: Ram 1.5GB, Disk: 15GB, IP: tuỳ chỉnh
-	Cài đặt Server cho SonarQube cũng như Minio: Ram 2GB, Disk 20GB, IP: tuỳ chỉnh, Giả lập Domain cho SonarQube: sonarqube.taskscheduler.com

**3 Hướng dẫn triển khai Gitlab EE Server**
**Bước 1:** Cần cấu hình địa chỉ IP tĩnh cho server
-	Sử dụng lệnh và chỉnh sửa cấu hình: sudo nano /etc/netplan/00-network-manager.yml (có thể khác tên với hệ điều hành khác)
-	Áp dụng cấu hình bên dưới (phần địa chỉ ip và gateway tuỳ chỉnh phụ thuộc vào ip gateway của máy)


<div align="center">
  <img src="https://github.com/user-attachments/assets/050eda1d-48af-4e06-817a-b848d9bbee44" alt="database models"/>
</div>


-	Sử dụng sudo netplan apply để áp dụng cấu hình đã cài

**Bước 2:** Tiến hành cài đặt Gitlab ee
-	Truy cập trang web https://packages.gitlab.com/gitlab/gitlab-ee và lựa chọn phiên bản phù hợp cần cài đặt
-	Sử dụng lệnh để cài các repository: curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash
-	Sử dụng lệnh sudo apt install gitlab-ee-17.3.7-ee.0.el8.x86_64 để cài đặt gitlab ee
-	Chỉnh sửa file cấu hình trong /etc/gitlab/gitlab.rb và chỉnh sửa trường external_url với value http://gitlab.taskscheduler.com.
-	Sau đó áp dụng cấu hình đã chỉnh sửa sử dụng lệnh sudo gitlab-ctl reconfigure 
-	Add domain trong /etc/hosts để có thể phân giải tên miền với nội dung: 192.168.73.100 gitlab.taskscheduler.com
-	Lấy password lưu trữ mặc định lần đầu tiên trong /etc/gitlab/initial_root_password
-	Trên máy thật cũng tiến hành add hosts để có thể giả lập domain (192.168.73.100 gitlab.taskscheduler.com) sau đó truy cập trên trình duyệt với http://gitlab.taskscheduler.com và tiến hành đổi mật khẩu mới

**4 Hướng dẫn triển khai Gitlab Runner trên server gitlab**
**Bước 1:** Tiến hành cài đặt gitlab runner
Sử dụng sudo apt update -y && sudo apt upgrade -y để cập nhật các package
Cài đặt curl: sudo apt install curl -y
Thêm kho gitlab vào danh sách gói apt:
curl -L --output /etc/apt/trusted.gpg.d/gitlab.asc https://packages.gitlab.com/gpg.key echo "deb https://packages.gitlab.com/runner/gitlab-runner/debian/ stretch main" | sudo tee /etc/apt/sources.list.d/gitlab_gitlab-runner.list
Tiến hành cập nhật lại kho lưu trữ sudo apt update -y
Tiến hành cài đặt gitlab runner: sudo apt install gitlab-runner
Tiến hành cài đặt docker nếu muốn chạy các dự án liên quan tới docker: sudo apt install docker.io docker-compose -y
**Bước 2:** Cấu hình người dùng gitlab runner có quyền chạy dự án thì phải thêm quyền sudo
Sử dụng lệnh visduo và thêm dòng gitlab-runner ALL=(ALL:ALL) NOPASSWD: ALL
Để gitlab runner có thể chạy và xoá các dự án liên quan tới docker thì phải thêm user đó vào nhóm docker: usermod -aG docker gitlab-runner
**Bước 3:** Tiến hành đăng ký Gitlab Runner lên server
-	Để có thể truy cập qua gitlab bằng domain đã giả lập thì phải add host như trên (192.168.73.100 gitlab.taskscheduler.com)
-	Sử dụng gitlab-runner register và nhập các thông tin phù hợp (domain là http:// gitlab.taskscheduler.com) và chọn trình khởi tạo là shell
-	Nếu muốn chỉnh sửa cho phép số runner có thể chạy đồng thời thì chỉnh sửa trường concurrent trong file nano /etc/gitlab-runner/config.toml

**5 Hướng dẫn cài server SonarQube**
**Bước 1:** Tiến hành cấu hình domain tĩnh tương tự như cấu hình gitlab server
**Bước 2:** Tiến hành cài đặt các packgage
Cập nhật sudo apt update -y && sudo apt upgrade -y
Cài đặt docker và docker compose: sudo apt install docker.io docker-compose -y
Cài đặt nginx: sudo apt install nginx
**Bước 3:** Chuẩn bị file Docker compose có tên docker-compose.sonarqube.yml với nội dung như sau

<div align="center">
  <img src="https://github.com/user-attachments/assets/e063f195-0aac-4650-8891-ddc743da63ca" alt="database models"/>
</div>

**Bước 4:** Sử dụng docker-compose -f docker-compose.sonarqube.yml up -d để chạy nền và sử dụng docker ps -a để xem các container đã chạy hay chưa lúc này ta có thể truy cập qua địa chỉ ip:9001

<div align="center">
  <img src="https://github.com/user-attachments/assets/67c08d1e-4ad6-4a30-977a-acd1e1c0a00e" alt="database models"/>
</div>

**Bước 5:** Chỉnh sửa cấu hình nginx để cho phép giả lập domain truy cập
Chỉnh sửa thông tin trong file /etc/nginx/sites-available/default phần listen chỉnh port qua 9999 (hoặc bất kì port nào)
Tiến hành tạo file /etc/nginx/conf.d/sonarqube.taskscheduler.com.conf với nội dung và sử dụng sudo systemctl restart nginx để áp dụng cấu hình

<div align="center">
  <img src="https://github.com/user-attachments/assets/b9d828cd-a4ca-42af-8af5-403efa21a6fa" alt="database models"/>
</div>



**Bước 6:** Tiến hành add host trên máy thật để có thể truy cập qua server như bước làm ở gitlab và truy cập qua http://sonarqube.taskscheduler.com để truy cập web

<div align="center">
  <img src="https://github.com/user-attachments/assets/2f023b25-8216-4e7f-89b5-e512cf1d1305" alt="database models"/>
</div>


**Bước 7:** Tiến hành tạo token sonar và import vào variable trong gitlab nếu muốn liên kết sonar với gitlab

**6 Hướng dẫn triển khai Artifactory Jfrog**
**Bước 1:** Tiến hành cài đặt server có địa chỉ IP tĩnh như các bước trên
**Bước 2:** Tạo ra thư mục làm việc để lưu trữ dữ liệu tránh trường hợp dữ liệu bị mất khi container bị lỗi hoặc bị xoá mkdir -p /tools/jfrog/data
**Bước 3:** Cài docker sử dụng sudo apt install docker.io và sử dụng lệnh để tiến hành khởi tạo Jfrog bằng docker docker run --name artifactory-jfrog --restart unless-stopped -v /tools/jfrog/data/:/var/opt/jfrog/artifactory -d -p 8081:8081 -p 8082:8082 releases-docker.jfrog.io/jfrog/artifactory-oss:7.77.5
**Bước 4:** Nếu có lỗi xảy ra khiến container không thể khởi chạy và sử dụng docker logs -f <container_name> và thấy lỗi liên quan đến user 1030 thì sử dụng lệnh chown -R 1030:1030 /tools/jfrogs => sử dụng lệnh docker restart <container_name> để khởi động lại docker.
**Bước 5:** Tiến hành truy cập website qua http://IP:8002 với username là admin và password là password
**Bước 6:** Nếu muốn truy cập website thông qua domain ảo thì tiến hành tương tự với cài sonarqube => Cài nginx và tạo file conf trong conf.d
**Bước 7:** Tiến hành add host trên các máy muốn truy cập thông qua domain http://jfrog.taskscheduler.com

<div align="center">
  <img src="https://github.com/user-attachments/assets/66e0bfa3-77aa-4cbe-8ab5-c0ded838d84a" alt="database models"/>
</div>

**7 Hướng dẫn triển khai Portus truy cập thông qua xác thực SSL**
**Bước 1:** Tạo máy ảo EC2 trên Cloud (trong phần hướng dẫn này sẽ sử dụng AWS)

<div align="center">
  <img src="https://github.com/user-attachments/assets/728b73b0-84f3-42c6-a56f-23f70fefec46" alt="database models"/>
</div>

**Bước 2:** Chuẩn bị 1 domain (trong phần hướng dẫn sử dụng domain của tenten)

<div align="center">
  <img src="https://github.com/user-attachments/assets/a8fab482-0b68-4ef0-810a-45f69fc34834" alt="database models"/>
</div>

**Bước 3:** Cấu hình tạo một sub-domain với Record A, trước tiên tạo domain đã đăng ký lên Route53 và ánh xạ các Namep
servers từ Route53 vào Namepservers trong tenten

<div align="center">
  <img src="https://github.com/user-attachments/assets/86640007-3990-4649-9304-6217f57dff67" alt="database models"/>
</div>


<div align="center">
  <img src="https://github.com/user-attachments/assets/dbf60e55-8979-4ef7-9f76-b2480d9ecd81" alt="database models"/>
</div>

**Bước 4:** Chèn địa chỉ public IP của instance đã tạo vào create record có sub-domain là portus.nt533uitjiradev.click

<div align="center">
  <img src="https://github.com/user-attachments/assets/f71a4e8b-46d3-4e28-a44c-a6c92c7d9fcf" alt="database models"/>
</div>

**Bước 5:** Tiến hành cập nhật lại các package và cài đặt các gói sử dụng lệnh sudo -i, sudo apt update -y, sudo apt install docker.io docker-compose certbot net-tools -y
**Bước 6:** Tạo thư mục làm việc mkdir -p /tools/portus, sau đó tiến hành clone source code trên git sử dụng lệnh git clone https://github.com/SUSE/Portus.git
**Bước 7:** Di chuyển các file trong thư mục compose ra thư mục làm việc hiện tại “mv Portus/examples/compose/ .” và xoá thư mục làm việc portus sử dụng lệnh “rm -rf Portus/”
**Bước 8:** Tiến hành cd vào thư mục compose và sử dụng lệnh để xác thực ssl cho domain name sử dụng lệnh “certbot cer
tonly --standalone -d portus.nt533uitjiradev.click  --preferred-challenges http --agree-tos -m ltphilong2001@gmail.com --keep-until-expiring --non-interactive”

<div align="center">
  <img src="https://github.com/user-attachments/assets/f71a4e8b-46d3-4e28-a44c-a6c92c7d9fcf" alt="database models"/>
</div>

**Bước 9:** Comment dòng ssl on ở file nginx/nginx.conf sử dụng lệnh “sed -i 's/^[ \t]*ssl on;/#ssl on;/' nginx/nginx.conf”
**Bước 10**: Tiến hành đặt lại tên của đường dẫn /etc/letsencrypt/live/ portuserver.nt533uitjiradev.click/fullchain.pem và /etc/letsencrypt/live/ portuserver.nt533uitjiradev.click/privkey.pem cho đúng với tên trong file nginx.conf
•	cp /etc/letsencrypt/live/portuserver.nt533uitjiradev.click/fullchain.pem secrets/portus.crt
•	cp /etc/letsencrypt/live/ portuserver.nt533uitjiradev.click/privkey.pem secrets/portus.key
**Bước 11**: Sử dụng lệnh sed -i 's/^MACHINE_FQDN=.*/MACHINE_FQDN=portusserver.nt533uitjiradev.click/' .env để thay đổi biến từ localhost sang domain đã cấu hình.
**Bước 12**: Sử dụng lệnh docker-compose -f docker-compose.clair-ssl.yml up -d để khởi tạo container và Nếu có lỗi xảy ra: Nếu có lỗi xảy ra: docker-compose -f docker-compose.clair-ssl.yml restart.


<div align="center">
  <img src="https://github.com/user-attachments/assets/8b643e83-3dd3-4123-9aaf-3a8181ec8851" alt="database models"/>
</div>


<div align="center">
  <img src="https://github.com/user-attachments/assets/b3794eaa-b170-49d3-bf2c-1969cf6e50b9" alt="database models"/>
</div>


**Bước 12**: Truy cập vào domain: https://portus.nt533uitjiradev.click/users/sign_up
•	username: admin
•	password: 12341234

<div align="center">
  <img src="https://github.com/user-attachments/assets/ca7d4add-e574-48e7-aa2f-41172497bf8c" alt="database models"/>
</div>

**8 Hướng dẫn triển khai NFS và mount vào container trong kubernetes**
**Bước 1:** Tạo 1 server và cấu hình ip tĩnh như các server trên
**Bước 2:** Tiến hành cài nfs server: apt install nfs-server
**Bước 3:** Tạo thư mục mà dữ liệu muốn mount vào: mkdir /data
**Bước 4:** Thay đổi quyền để bên ngoài có thể tác động vào: chown -R nobody:nogroup /data && chmod 777 /data/
**Bước 5:** Chỉnh sửa cấu hình trong file: nano /etc/exports với cấu hình /data *(rw,sync,no_subtree_check) (* là tất cả ip có thể truy cập)
Sử dụng lệnh exportfs -rav để áp dụng cấu hình
**Bước 6:**  Restart lại server: systemctl restart nfs-kernel-server
**Bước 7:** Trên server k8s phải cài nfs-common thì mới kết nối được nfs server: apt install nfs-common trên các server k8s
**Bước 8:** Trên server k8s tạo ra 1 storage class để quản lý các persistent volume trên nfs

<div align="center">
  <img src="https://github.com/user-attachments/assets/8418978c-aae8-479d-b37f-3ff85d6489f3" alt="database models"/>
</div>

**Bước 9:** Tạo Persistent Volume và tiến hành kết nối tới NFS Server với địa chỉ ip là server cấu hình nfs

<div align="center">
  <img src="https://github.com/user-attachments/assets/f183342b-e4a0-46c8-b161-f3c96939a952" alt="database models"/>
</div>


**9 Hướng dẫn triển khai Mino server dành cho việc lưu trữ**
**Bước 1:** Đầu tiên tiến hành cài docker compose
**Bước 2:** Tạo file docker-compose.minio.yml

<div align="center">
  <img src="https://github.com/user-attachments/assets/d9da3c05-1a49-4659-aa0a-25357b3907a8" alt="database models"/>
</div>


**Bước 3:** Tạo thư mục làm việc data bằng cách sử dụng lệnh mkdir /data
**Bước 4:** Tiến hành chạy file docker-compose -f docker-compose.minio.yml up -d
**Bước 5:** Tiến hành truy cập website thông qua port 9001 và đăng nhập với username, password đã cấu hình trong file docker-compose


<div align="center">
  <img src="https://github.com/user-attachments/assets/180018ab-aab2-480e-83c7-86d737b988a9" alt="database models"/>
</div>


**Bước 6:** Sau khi login vào server minio thì tiến hành tạo bucket với tên <taskscheduler-files-storage> và lưu lại access_key và secret_key
**Bước 7:** Tiến hành tạo resource là type là secret để lưu trữ access_key và secret_key để sử dụng cho việc kết nối t

<div align="center">ới server mino từ service file
  <img src="https://github.com/user-attachments/assets/593c4fed-e65f-4b4f-94eb-91d89063fe33" alt="database models"/>
</div>


**Bước 8:** Sử dụng lệnh kubectl apply -f <tên file secret>.yml
**Bước 9:** Để pod thuộc deployment file-depl có thể kết nối tới server minio thì phải tiến hành add host aliases, trong file yml ở thư mục /infras/k8s_test/test/file_depl.yml tiến hành chỉnh sửa host aliases thành địa chỉ ip của server triển khai minio.


<div align="center">
  <img src="https://github.com/user-attachments/assets/d63fcb28-7a46-40ae-9cff-e4126cdef4af" alt="database models"/>
</div>


**10 Hướng dẫn triển khai cài server Rancher để quản lý tập trung cụm K8S**
**Bước 1:** Thay vì mount dữ liệu trực tiếp vào ổ cứng của server thì có thể chọn cách tạo ra một ổ đĩa và tiến hành mount dữ liệu vào ổ đĩa đã tạo
**Bước 2:** Sau khi tạo ổ đĩa thì sử dụng lệnh lsblk để kiểm tra thông tin về các ổ đĩa đã tạo
**Bước 3:** Tiến hành format lại ổ đĩa đã tạo mkfs.ext4 -m 0 /dev/<têm ổ đĩa>
**Bước 4:** Tạo thư mục muốn mount ổ đĩa: mkdir /data
**Bước 5:** Thêm ổ cứng map vào mountpoint (data): echo “/dev/<têm ổ đĩa> /data ext4 defaults 0 0”  | tee -a /etc/fstab
cat /etc/fstab kiểm tra thông tin có nằm ở dòng cuối cùng hay không.
**Bước 6:** mount -a và dùng df -h để kiểm tra
Lưu ý: lỗi khi cài rancher xong Kubernetes cluster không thể kết nối vào do rancher không hỗ trợ cho version k8s đó nên sẽ không thể kết nối, đảm bảo kết nối được thì phải kiểm tra version tại: https://www.suse.com/suse-rancher/support-matrix/all-supported-versions/rancher-v2-6-8/
**Bước 7:** Tiến hành tạo file docker-compose.rancher.yml để triển khai cấu hình tạo container

<div align="center">
  <img src="https://github.com/user-attachments/assets/976ea0ea-2968-4544-b0e4-265abae22f3b" alt="database models"/>
</div>

**Bước 8:** Để lấy password để cập vào rancher sử dụng lệnh docker logs rancher-server 2>&1 | grep "Bootstrap Password:"
**Bước 9:** Nếu muốn truy cập thông qua domain thì giả lập domain tương tự với cài đặt các server khác và truy cập thông qua https


<div align="center">
  <img src="https://github.com/user-attachments/assets/f7f9a92e-4d08-4172-903b-190c9e0887ac" alt="database models"/>
</div>


**Bước 10**: Sau khi login thành công tiến hành đổi password và chọn vào loại cluster muốn import (Kubernetes On-Primese) sau đó copy link và dán vào trong node master của cluster và đợi kết nối.

**11 Cài đặt Kong Ingress Controller sử dụng helm**
**Bước 1:** Tiến hành add repo kong vào danh sách helm helm repo add kong https://charts.konghq.com
**Bước 2:** Sử dụng helm repo update để cập nhật các package lên phiên bản mới nhất
**Bước 3:** Tạo namespace kong và tiến hành cài kong sử dụng lệnh helm install kong kong/kong -n kong
**Bước 4:** Sử dụng helm update để cập nhật lại values cho kong với cấu hình lưu trong file /infras/k8s_test/kong/values.yml Sử dụng helm upgrade kong -n kong -f path/values.yml
**Bước 5:** Truy cập dashboard thông qua port 8002


<div align="center">
  <img src="https://github.com/user-attachments/assets/89c5debb-12c7-438e-8d70-4a71bc99e847" alt="database models"/>
</div>


**Bước 6:** Áp dụng file cấu hình ingress để có thể triển khai traffic vào từng loại service tương ứng sử dụng kubectl apply -f path/ingress.yml
**12 Cài đặt Metrics server sử dụng helm**
**Bước 1:** Áp dụng các file cấu hình yml: helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
**Bước 2:** Sử dụng lệnh để cài đặt metrics server: helm upgrade --install metrics-server metrics-server/metrics-server -n kube-system
**Bước 3:** Trong trường hợp metric server không thể chạy với lỗi x509: cannot validate certificate for 192.168.65.3 because it doesn't contain any IP SANs" node="docker-desktop" thì tiến hành chỉnh sửa file cấu hình KUBE_EDITOR=nano kubectl edit deployment metrics-server -n kube-system với cấu hình
 spec:
      containers:
      - args:
        - --secure-port=4443
        - --kubelet-insecure-tls
        - --cert-dir=/tmp
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
Và thay các port 10250 thành port 4443

<div align="center">
  <img src="https://github.com/user-attachments/assets/4bf9f32d-7763-4e1b-995b-79277f54cbb2" alt="database models"/>
</div>

**Bước 4:** Sử dụng kubectl top pods hoặc kubectl get hpa để kiểm tra thông tin theo dõi tài nguyên từ metric server

<div align="center">
  <img src="https://github.com/user-attachments/assets/f2948f8f-d135-4c83-a492-9418fe48ed0c" alt="database models"/>
</div>

**13 Cài đặt ArgoCD sử dụng helm chart**
**Bước 1:** Tạo namespace: kubectl create namespace argocd
**Bước 2:** Áp dụng các file cấu hình yml: kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
**Bước 3:** Sử dụng lệnh để lấy secret trong argocd: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
Bài 4: Tiến hành chỉnh sửa argocd-server từ cluster ip sang nodeport sau đó truy cập web thông qua https://localhost:<port>


<div align="center">
  <img src="https://github.com/user-attachments/assets/07652494-0240-494d-b0f4-889a4f03c5d9" alt="database models"/>
</div>


**14 Cài đặt Prometheus + Grafana sử dụng helm**
**Bước 1:** Đầu tiên trên server NFS tiến hành tạo thư mục để mount data với Prometheus làm tương tự như việc triển khai mount volume cài ở phần 6.1.1.7 với thư mục tên /monitoring-data
**Bước 2:** Tiến hành clone chart về repo sử dụng lệnh helm repo add prometheus-community https://prometheus-community.github.io/helm-charts và sử dụng lệnh helm repo update để cập nhật các charts.
**Bước 3:** Tạo namespace tên monitoring sử dụng lệnh kubectl create ns monitoring và chạy lệnh để cài đặt prometheus và grafana để mount dữ liệu từ prometheus vào /monitoring-data


<div align="center">
  <img src="https://github.com/user-attachments/assets/c1c65097-8d2c-4de0-a5de-04f105bc059b" alt="database models"/>
</div>

**Bước 3:** Để có thể truy cập thông qua domain từ prometheus và grafana thì tạo file ingress cho prometheus và grafana sau đó sử dụng kubectl apply -f <file>.yml để áp dụng cấu hình.


<div align="center">
  <img src="https://github.com/user-attachments/assets/7e098fff-5c15-446d-b1aa-a66eea521d24" alt="database models"/>
</div>


<div align="center">
  <img src="https://github.com/user-attachments/assets/a53c2a42-8e0c-4603-88d9-708b43a3c31b" alt="database models"/>
</div>


**Bước 4:** Tiến hành add host ở máy thật để có thể phân giải được domain ảo của prometheus và grafana với cấu hình

<div align="center">
  <img src="https://github.com/user-attachments/assets/f4df142d-da92-4196-a042-08a20d7034f4" alt="database models"/>
</div>

**Bước 5:** Trên giao diện grafana tiến hành login với username là admin và password là prom-operator
•	Truy cập Grafana thông qua domain https://grafana.taskscheduler.com


<div align="center">
  <img src="https://github.com/user-attachments/assets/c234f648-0140-4355-bf71-cf6a7f37f8fc" alt="database models"/>
</div>


•	Truy cập Prometheus thông qua domain  https://prometheus.taskscheduler.com

<div align="center">
  <img src="https://github.com/user-attachments/assets/2fd502bd-9f45-4344-bc3e-ddddb1a2e98e" alt="database models"/>
</div>


**15 Cài đặt Uptime Kuma sử dụng helm**

**Bước 1:** Tiến hành add repo vào kho lưu trữ: helm repo add uptime-kuma https://helm.irsigler.cloud
**Bước 2:** Cài đặt updatime kuma: helm install uptimekuma uptime-kuma/uptime-kuma --namespace monitoring.
**Bước 3:** Tiến hành tạo thư mục /uptime-kuma để mount dữ liệu từ uptime kuma vào server nfs sau khi mount thành công thì dữ liệu sẽ hiển thị như bên dưới.

<div align="center"> 
  <img src="https://github.com/user-attachments/assets/54da2268-6e92-4c79-b8c0-404a8ca1f9b8" alt="database models"/>
</div>

**Bước 4:** Tạo PV kết nối tới nfs thư mục uptime kuma và PVC để kết nối tới PV


<div align="center">
  <img src="https://github.com/user-attachments/assets/66a29b71-f251-4183-b867-11a7dd9ccc62" alt="database models"/>
</div>


**Bước 5:** Sử dụng lệnh helm show values uptime-kuma/uptime-kuma > values.yml để clone file cấu hình về máy local, ở phần volume chọn existingClaim và điền tên PVC muốn kết nối tới (uptime-kuma-pvc) sau đó sử dụng lệnh helm upgrade -n monitoring uptimekuma uptime-kuma/ uptime-kuma -f custom-values.yml

**16 Hướng dẫn backup dữ liệu k8s sử dụng velero**
**Bước 1:** Truy cập vào trang web để lấy link repo https://github.com/vmware-tanzu/velero/releases/tag/v1.15.0.
**Bước 2:** Sử dụng curl để tiến hành tải source về máy curl -LO https://github.com/vmware-tanzu/velero/releases/download/v1.15.0/velero-v1.15.0-darwin-arm64.tar.gz.
**Bước 3:** Tiến hành giải nén và di chuyển file cấu hình vào /usr/local/bin sử dụng lệnh tar -xvf velero-v1.15.0-darwin-arm64.tar.gz && sudo mv velero-v1.15.0-linux-arm64/velero /usr/local/bin.
**Bước 4:** Sử dụng velero version để kiểm tra nếu có lỗi <error getting server version: no matches for kind "ServerStatusRequest" in version "velero.io/v1"> thì phải cài velero lên cụm k8s.

**Bước 5:** Tiến hành export các variables để kết nối tới minio server, trên minio server tạo bucket tên k8s-desktop-backup.
-	export MINIO_URL=“<minio-ip>:9000”
-	export MINIO_ACCESS_KEY_ID="<Your-access-key> "
-	export MINIO_SECRET_KEY_ID="<Your-secret-key> "
-	export MINIO_BUCKET=”k8s-desktop-backup”

**Bước 6:** Tạo namespace velero và tiến hành áp dụng cấu hình bên dưới:

<div align="center">
  <img src="https://github.com/user-attachments/assets/4b4fb5b0-9f96-4f32-83ae-59af47a13111" alt="database models"/>
</div>

**Bước 7:** Có thể backup dữ liệu theo từng namespace hoặc backup cả cụm sử dụng lệnh velero backup create <tên-file> --include-namespace=”*” (có thể chỉ định tên namespace nếu muốn backup từng namespace) và velero backup get để lấy danh sách backup.
**Bước 8:** Nếu muốn backup dữ liệu thì sử dụng lệnh velero restore create <tên backup> --from-backup <tên backup>  --
include-namespaces “*” và muốn backup định kỳ theo ngày tự động thì velero schedule create daily-cluster-backup --scheduler"0 0 * * *"  --include-namespace '*'. Sau khi kiểm tra thì trên minio server sẽ có toàn bộ thông tin file backup

<div align="center">
  <img src="https://github.com/user-attachments/assets/a480bd18-ea3f-4849-9b9e-78221982eb99" alt="database models"/>
</div>
