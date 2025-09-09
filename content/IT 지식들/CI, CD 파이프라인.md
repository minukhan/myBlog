
관련 개념: [[무중단 배포 (Zero-Downtime Deployment)]], [[Gradle]], [[테스트 격리]], [[도커 (Docker)]], [[쿠버네티스 (Kubernetes, K8s)]]

- 코드를 빠르고 안정적으로 배포하기 위한 자동화된 파이프라인
- 코드 작성부터, 테스트, 빌드, 배포까지 전 과정을 자동화해서 품질을 높이고 속도를 올림.
- CI : Continuous Integration
- CD : Continuous Deployment

## CI / CD 전체 흐름

1. 개발자가 GitHub에 Push
			↓
2. CI 트리거 (GitHub Actions 등)
			↓
3. 코드 빌드 + 테스트 자동 실행
			↓
4. 테스트 성공 시 Docker 이미지 생성
			↓
5. (옵션) 아티팩트 저장 (e.g. Docker Hub, S3)
			↓
6. CD 트리거
   - Continuous Delivery: 수동 승인 후 배포
   - Continuous Deployment: 자동 배포
			↓
서버에 자동 배포 (e.g. AWS EC2, ECS, Kubernetes)