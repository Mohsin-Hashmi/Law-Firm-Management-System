# Backend Deployment (AWS ECS Fargate)

This repo includes:
- `server/Dockerfile` and `.dockerignore`
- CI: `.github/workflows/backend-ci.yml`
- CD: `.github/workflows/backend-ecs-deploy.yml`
- ECS task definition template: `server/ecs-task-def.json`

## Prerequisites
- AWS Account with ECR, ECS Fargate, CloudWatch Logs, and SSM Parameter Store
- An ECS Cluster and Service created (Fargate, awsvpc networking)
- ECR repository matching `ECR_REPOSITORY`
- IAM Roles:
  - Execution role for ECS tasks (pull from ECR, write logs)
  - Task role if the app needs AWS access (SSM read for secrets)
- VPC Subnets and Security Group for the service

## GitHub Secrets
Set these in the repository Settings → Secrets and variables → Actions:
- `AWS_ROLE_ARN`: OIDC role to assume for GitHub Actions
- Optional if not using OIDC: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `EXECUTION_ROLE_ARN`: ECS Execution role ARN (used in task def)
- `TASK_ROLE_ARN`: ECS Task role ARN (used in task def)
- `SSM_DB_URL`: SSM parameter name holding your DB URL (or configure individual DB_* envs)
- `SSM_JWT_SECRET`: SSM parameter for JWT secret
- `SSM_SUPER_ADMIN_EMAIL`: SSM parameter
- `SSM_SUPER_ADMIN_PASSWORD`: SSM parameter

## Workflow variables
Update `.github/workflows/backend-ecs-deploy.yml` env block:
- `AWS_REGION`
- `ECR_REPOSITORY`
- `SERVICE_NAME`
- `CLUSTER_NAME`
- `CONTAINER_NAME`

## Task definition
Update `server/ecs-task-def.json` as needed:
- container name must equal `CONTAINER_NAME`
- logs group/region
- secrets mapping to SSM parameters

## Local build
```bash
cd server
docker build -t law-firm-server:local .
docker run --rm -p 4000:4000 \
  -e PORT=4000 \
  law-firm-server:local
```

